#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Multiprocessing YOLOv5-n inference on PYNQ DPU with overlapping DPU and CPU work.
Uses multiprocessing.Queue & Process to bypass GIL and maximize throughput.
Input size 416×416, Python + PYNQ on Ultra96-V2 under Linux.
"""

import os
import time
import numpy as np
import cv2
import random
import colorsys
from multiprocessing import Process, Queue
from pynq_dpu import DpuOverlay

# ---------------------- Config ----------------------
MODEL_PATH      = './model_dir/aa416_multiscale/aa416_multiscale.xmodel'
CLASSES_PATH    = './img/voc_classes.txt'
IMAGE_FOLDER    = './img/agriauto_data/'
OUTPUT_FOLDER   = './output/agriauto_output/'
INPUT_SIZE      = (416, 416)
SCORE_THRESHOLD = 0.50
IOU_THRESHOLD   = 0.15

# Anchors scaled for 416x416 input (orig anchors * 416/640)
anchor_list = [10,13, 16,30, 33,23, 30,61, 62,45, 59,119, 116,90, 156,198, 373,326]
anchors = np.array(anchor_list, dtype=np.float32).reshape(-1, 2)
masks = [[0,1,2], [3,4,5], [6,7,8]]

# ---------------------- Utils ----------------------
def load_classes(path):
    with open(path) as f:
        return [l.strip() for l in f]

class_names = load_classes(CLASSES_PATH)
num_classes = len(class_names)
hsv_tuples  = [(i/num_classes,1.,1.) for i in range(num_classes)]
colors      = [tuple(int(c*255) for c in colorsys.hsv_to_rgb(*h)) for h in hsv_tuples]
random.seed(0); random.shuffle(colors); random.seed(None)


def letterbox(img, size):
    h0, w0 = img.shape[:2]
    w, h = size
    r = min(w/w0, h/h0)
    new_shape = (int(w0*r), int(h0*r))
    resized = cv2.resize(img, new_shape, interpolation=cv2.INTER_LINEAR)
    canvas = np.full((h, w, 3), 128, dtype=np.uint8)
    dx, dy = (w - new_shape[0]) // 2, (h - new_shape[1]) // 2
    canvas[dy:dy + new_shape[1], dx:dx + new_shape[0]] = resized
    return canvas, r, dx, dy


def preprocess(img, size):
    img_rgb = img[..., ::-1]
    lb, r, dx, dy = letterbox(img_rgb, size)
    data = lb.astype(np.float32)
    data = (data - 128.0) / 128.0
    return np.expand_dims(data, 0), r, dx, dy


def sigmoid(x): return 1. / (1. + np.exp(-x))

def decode_feats(feats, anchors_mask, input_shape):
    _, gh, gw, _ = feats.shape
    pred = feats.reshape(1, gh, gw, len(anchors_mask), 5 + num_classes)
    yv, xv = np.arange(gh), np.arange(gw)
    grid = np.stack(np.meshgrid(xv, yv), axis=-1).reshape(1, gh, gw, 1, 2)
    xy = (sigmoid(pred[..., :2]) + grid) / np.array([gw, gh], np.float32)
    wh = np.exp(pred[..., 2:4]) * anchors_mask / np.array(input_shape, np.float32)
    obj = sigmoid(pred[..., 4:5])
    cls = sigmoid(pred[..., 5:])
    return xy, wh, obj, cls


def nms_boxes(boxes, scores, iou_thresh):
    x1, y1, x2, y2 = boxes.T
    areas = (x2 - x1) * (y2 - y1)
    order = scores.argsort()[::-1]
    keep = []
    while order.size:
        i = order[0]
        keep.append(i)
        xx1 = np.maximum(x1[i], x1[order[1:]])
        yy1 = np.maximum(y1[i], y1[order[1:]])
        xx2 = np.minimum(x2[i], x2[order[1:]])
        yy2 = np.minimum(y2[i], y2[order[1:]])
        w = np.clip(xx2 - xx1, 0, None)
        h = np.clip(yy2 - yy1, 0, None)
        inter = w * h
        ovr = inter / (areas[i] + areas[order[1:]] - inter)
        inds = np.where(ovr <= iou_thresh)[0]
        order = order[inds + 1]
    return keep


def unletterbox(boxes, r, dx, dy, orig_shape):
    H, W = orig_shape
    boxes[:, [0,2]] *= INPUT_SIZE[0]
    boxes[:, [1,3]] *= INPUT_SIZE[1]
    boxes[:, [0,2]] -= dx
    boxes[:, [1,3]] -= dy
    boxes[:, [0,2]] /= r
    boxes[:, [1,3]] /= r
    np.clip(boxes[:, 0], 0, W, out=boxes[:,0])
    np.clip(boxes[:, 2], 0, W, out=boxes[:,2])
    np.clip(boxes[:, 1], 0, H, out=boxes[:,1])
    np.clip(boxes[:, 3], 0, H, out=boxes[:,3])
    return boxes.astype(int)


def postprocess(feats, orig_shape, r, dx, dy):
    all_b, all_s, all_c = [], [], []
    for i, f in enumerate(feats):
        am = anchors[masks[i]].reshape(-1, 2)
        xy, wh, obj, prob = decode_feats(f, am, INPUT_SIZE)
        boxes = np.concatenate((xy - wh/2, xy + wh/2), axis=-1).reshape(-1, 4)
        scores = (obj * prob).reshape(-1, num_classes)
        for cls in range(num_classes):
            idx = np.where(scores[:, cls] > SCORE_THRESHOLD)[0]
            if idx.size:
                all_b.append(boxes[idx])
                all_s.append(scores[idx, cls])
                all_c += [cls] * len(idx)

    if not all_b:
        return [], [], []

    B = np.vstack(all_b)
    S = np.hstack(all_s)
    C = np.array(all_c)

    B = unletterbox(B, r, dx, dy, orig_shape)

    keep = []
    for cls in np.unique(C):
        ids = np.where(C == cls)[0]
        k = nms_boxes(B[ids], S[ids], IOU_THRESHOLD)
        keep += list(ids[k])

    return B[keep], S[keep], C[keep]


def draw_and_save(img, boxes, scores, classes, out_file):
    for (x1, y1, x2, y2), s, cls in zip(boxes, scores, classes):
        color = colors[cls]
        thickness = max(2, int(round(0.002 * sum(img.shape[:2]))))
        label = f"{class_names[cls]} {s:.2f}"
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.5
        (tw, th), baseline = cv2.getTextSize(label, font, font_scale, thickness)
        y1_label = max(y1 - th - 5, 0)

        # Draw bounding box
        cv2.rectangle(img, (x1, y1), (x2, y2), color, thickness)

        # Draw filled rectangle for label background
        cv2.rectangle(img, (x1, y1_label), (x1 + tw, y1_label + th + baseline), color, -1)

        # Draw text (white over color background)
        cv2.putText(img, label, (x1, y1_label + th), font, font_scale, (255, 255, 255), thickness=1, lineType=cv2.LINE_AA)

    cv2.imwrite(out_file, img)


# ---------------------- Worker Functions ----------------------
def dpu_worker(img_paths, runner, inp_buf, out_bufs, out_shapes, result_q):
    for img_path in img_paths:
        orig = cv2.imread(img_path)
        data, r, dx, dy = preprocess(orig, INPUT_SIZE)
        inp_buf[0][0] = data
        job_id = runner.execute_async(inp_buf, out_bufs)
        runner.wait(job_id)
        feats_copy = [buf.copy() for buf in out_bufs]
        result_q.put((os.path.basename(img_path), orig, feats_copy, r, dx, dy))
    result_q.put(None)


def cpu_worker(result_q, out_shapes):
    while True:
        item = result_q.get()
        if item is None:
            break

        img_name, orig, feats_bufs, r, dx, dy = item
        feats = [buf.reshape(shape) for buf, shape in zip(feats_bufs, out_shapes)]
        boxes, scores, classes = postprocess(feats, orig.shape[:2], r, dx, dy)

        if len(boxes) == 0:
            continue  # Skip saving if no detections

        draw_and_save(orig, boxes, scores, classes, os.path.join(OUTPUT_FOLDER, img_name))
        print(f"{img_name}: {len(boxes)} boxes")


# ---------------------- Main ----------------------
if __name__ == '__main__':
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    imgs = [os.path.join(IMAGE_FOLDER, f) for f in os.listdir(IMAGE_FOLDER)
            if f.lower().endswith(('.jpg', '.png', '.jpeg'))]
    if not imgs:
        print("No images found. Exiting.")
        exit(0)

    overlay = DpuOverlay('dpu.bit')
    overlay.load_model(MODEL_PATH)
    runner = overlay.runner

    in_t = runner.get_input_tensors()[0]
    out_ts = runner.get_output_tensors()
    in_shape = tuple(in_t.dims)
    out_shapes = [tuple(t.dims) for t in out_ts]
    inp_buf = [np.empty(in_shape, dtype=np.float32, order='C')]
    out_bufs = [np.empty(s, dtype=np.float32, order='C') for s in out_shapes]

    result_q = Queue(maxsize=8)
    p_dpu = Process(target=dpu_worker, args=(imgs, runner, inp_buf, out_bufs, out_shapes, result_q), name='DPU-Process')
    p_cpu = Process(target=cpu_worker, args=(result_q, out_shapes), name='CPU-Process')

    start_all = time.time()
    p_dpu.start()
    p_cpu.start()
    p_dpu.join()
    result_q.put(None)
    p_cpu.join()
    total_time = time.time() - start_all

    total_images = len(imgs)
    print(f"\n{' Results ':=^40}")
    print(f"Total images:  {total_images}")
    print(f"Total time:    {total_time:.2f}s")
    print(f"Overall FPS:   {total_images/total_time:.2f}")
    print(f"{'':=^40}")

    del runner
    del overlay