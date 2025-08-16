// src/pages/Home.tsx
import React, { useState } from "react";
import { UploadCloud, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Camera, Zap, CheckSquare } from "lucide-react";
import BoardViewer from "../components/BoardViewer";

export default function Home() {
  const [imageUploaded, setImageUploaded] = useState(false);

  return (
    <main
      className="flex flex-col items-center gap-8 px-4 min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url('/fyp-poster-bg.png')` }}
    >
      {/* Hero */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pt-28 text-2xl md:text-3xl font-extrabold text-white text-center max-w-3xl"
      >
        Inspect. Detect. Protect. With FPGA-supercharged AI, catch every dent,
        scratch, or pit before they cost you.
      </motion.h1>
      {/* How It Works */}
      <section
        id="how-it-works"
        className="w-full bg-gradient-to-r from-gray-800 to-gray-700 py-16"
      >
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-12">How It Works</h3>
          <div className="flex flex-col md:flex-row items-stretch justify-between gap-8">
            {[
              {
                Icon: Camera,
                title: "Step 1: Upload Your Photo",
                desc: "Drag & drop or click to select your steel-rod image.",
              },
              {
                Icon: Zap,
                title: "Step 2: FPGA + AI Scan",
                desc: "Lightning-fast defect detection in milliseconds.",
              },
              {
                Icon: CheckSquare,
                title: "Step 3: View Results",
                desc: "Get annotated images and confidences.",
              },
            ].map(({ Icon, title, desc }, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="flex-1 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 flex flex-col items-center text-center"
              >
                <Icon className="w-16 h-16 text-blue-400 mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">
                  {title}
                </h4>
                <p className="text-gray-300 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* FPGA Board Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="w-full max-w-5xl mx-auto mt-16 flex flex-col md:flex-row items-center justify-center gap-8 px-6"
      >
        <div className="w-full md:w-1/2 h-64 md:h-96 -mt-8">
          <BoardViewer />
        </div>
        <div className="flex flex-col justify-center text-center md:text-left text-white max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Powered by</h2>
          <motion.img
            src="/avnet_nobg.png"
            alt="AVNET Logo"
            className="w-40 mx-auto md:mx-0 mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
          />
          <p className="text-base leading-relaxed">
            Meet the muscle behind SteelSight — this high-performance FPGA board
            delivers lightning-fast image processing for steel defect detection.
            With dedicated hardware acceleration, it scans every rod with
            precision, speed, and zero lag. Whether it’s a hairline crack or a
            subtle surface flaw, this board ensures nothing escapes detection,
            making your production smarter, faster, and way more reliable.
          </p>
        </div>
      </motion.div>

      <section
        id="inference-showcase"
        className="w-full bg-gray-900 py-16 px-4"
      >
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-10">
            Real-World Detections
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            {[
              {
                src: "/inference3.jpeg",
                conf: 0.78,
                alt: "Inference Example 1",
              },
              {
                src: "/inference4.jpeg",
                conf: [0.9],
                alt: "Inference Example 2",
              },
            ].map(({ src, conf, alt }, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl shadow-2xl bg-gray-800 border-4 border-blue-500 flex flex-col items-center"
                style={{
                  width: "500px",
                  height: "500px",
                  minWidth: "320px",
                  minHeight: "320px",
                }}
              >
                <img
                  src={src}
                  alt={alt}
                  className="w-full h-full object-contain"
                  style={{
                    background: "#222", // for extra contrast
                  }}
                />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-80 text-white text-lg px-4 py-2 rounded-lg shadow-md font-semibold">
                  Confidence: {conf}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
