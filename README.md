# Machine Vision Pipeline for Steel Surface Defects Detection using FPGA SoC

An end-to-end deep learning pipeline for real-time steel surface defect detection, 
developed in collaboration with Agriauto Industries Ltd. The system deploys a quantized 
YOLOv5n model on an Avnet Ultra96-V2 (Zynq UltraScale+ MPSoC) FPGA, achieving 16 FPS 
at 5.7W with a post-quantization mAP50 of 0.933 — approximately 7x faster than CPU and 
10x more power-efficient than GPU (RTX-3050 at 55W).

## Project Overview

Steel surface defects such as cracks, inclusions, scratches, and pitted surfaces are 
critical quality concerns in automotive, aerospace, and manufacturing industries. This 
project addresses the trilemma of speed, accuracy, and energy efficiency simultaneously 
by combining deep learning with FPGA-based hardware acceleration.

Three datasets were used: NEU-DET, GC10-DET, and a proprietary industrial dataset 
provided by Agriauto Industries Ltd. Multiple lightweight YOLO architectures were 
benchmarked before selecting YOLOv5n (4MB, mAP50: 0.989 on Agriauto dataset) as the 
optimal architecture for FPGA deployment.

## Authorship & Contributions

This repository contains work from a collaborative Final Year Design Project completed 
at NED University of Engineering & Technology.

My primary contributions included:
- Model inspection and optimization for lightweight YOLO architectures
- Quantization of trained models (FP32 → INT8) using Xilinx Vitis AI
- Deployment and inference benchmarking on FPGA (Zynq UltraScale+ MPSoC) via DPU-PYNQ
- Evaluation of accuracy–latency–power trade-offs across datasets
- Analysis of deployment bottlenecks including preprocessing, post-processing, 
  unsupported operators, and memory constraints
- Data preprocessing and annotation of the proprietary Agriauto Industries dataset 
  using Roboflow
- UI development (SteelSight, React) and system integration

Original upstream repository maintained by:
https://github.com/MuhammadBabarAli/Steel-Surface-Defect-Detection-on-FPGA-SoC

## Publication

Fakhra Aftab, Muhammad Babar Ali, Muhammad Maaz Khan, Aaliyan Mansoor, Mohib Ud Din, 
Majida Kazmi. "A Comparative Assessment of YOLO Nano Architectures for High-Speed and 
Accurate Steel Surface Inspection." *Advances in Science and Technology Research 
Journal*, Volume 20, Issue 3, 2026.

https://www.astrj.com/A-comparative-assessment-of-YOLO-nano-architectures-for-high-speed-and-accurate-steel,212538,0,2.html

## Supervisors

- Supervisor: Ms. Fakhra Aftab, Lecturer, NED University
- Co-Supervisor: Dr. Majida Kazmi, Professor & Co-PI NCAI, NED University
