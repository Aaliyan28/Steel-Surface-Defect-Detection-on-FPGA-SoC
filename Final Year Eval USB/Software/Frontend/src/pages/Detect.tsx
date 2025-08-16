// src/pages/Detect.tsx
import React, { useState } from "react";
import { UploadCloud, ImageIcon, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function Detect() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<null | {
    defect: boolean;
    confidence: number;
  }>({ defect: false, confidence: 0 });
  const [loading, setLoading] = useState(false);

  // Simulate detection (replace with real backend call as needed)
  const handleDetect = () => {
    if (!uploadedImage) return;
    setLoading(true);
    setTimeout(() => {
      setResult({ defect: true, confidence: 0.87 }); // Example static result
      setLoading(false);
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadedImage(file || null);
    setResult(null);
    if (file) setPreviewUrl(URL.createObjectURL(file));
    else setPreviewUrl(null);
  };

  return (
    <main className="flex flex-col items-center gap-10 px-4 py-12 min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b]">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-3xl font-bold text-white mt-6 mb-2"
      >
        Detect
      </motion.h2>
      <p className="text-white/80 max-w-2xl text-center mb-8">
        Upload your steel rod or strip image to analyze surface defects using
        FPGA-accelerated AI. Review detection results and detailed performance
        metrics below.
      </p>

      {/* Upload Section */}
      <section className="w-full max-w-2xl flex flex-col gap-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Upload */}
          <div className="flex-1 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center shadow-xl">
            <label className="flex flex-col items-center gap-4 cursor-pointer w-full">
              <UploadCloud className="w-10 h-10 text-blue-400" />
              <span className="text-white">Click or drag to upload image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="preview"
                  className="mt-4 rounded-lg w-full max-h-56 object-contain bg-white"
                />
              )}
            </label>
            <button
              onClick={handleDetect}
              disabled={!uploadedImage || loading}
              className={`mt-6 w-full bg-[#1b2a49] text-white font-semibold px-6 py-3 rounded-lg transition shadow-md hover:bg-[#223456] ${
                (!uploadedImage || loading) && "opacity-60 cursor-not-allowed"
              }`}
            >
              {loading ? "Detecting..." : "Run Defect Detection"}
            </button>
          </div>

          {/* Results */}
          <div className="flex-1 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <ImageIcon className="w-6 h-6" /> Detection Results
            </h3>
            <div className="w-full h-44 flex items-center justify-center bg-white border border-[#cbd5e1] rounded-xl text-[#64748b] shadow-inner">
              {!uploadedImage ? (
                <>
                  <ImageIcon className="w-10 h-10 text-[#1b2a49] mr-2" />
                  <span className="text-[#1b2a49]">No image uploaded yet</span>
                </>
              ) : loading ? (
                <span className="animate-pulse text-lg text-[#1b2a49]">
                  Analyzing image...
                </span>
              ) : result ? (
                result.defect ? (
                  <span className="text-green-700 font-semibold text-lg">
                    Defect Detected! <br />
                    <span className="text-gray-700">
                      Confidence: {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </span>
                ) : (
                  <span className="text-blue-700 font-semibold text-lg">
                    No defect found!
                  </span>
                )
              ) : null}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 flex flex-col gap-6 items-center shadow-xl">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6" /> Performance Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* Static example values */}
            <div className="flex flex-col items-center bg-white/10 rounded-xl p-6">
              <span className="text-2xl font-bold text-blue-400">98.4%</span>
              <span className="text-white mt-1">Accuracy</span>
            </div>
            <div className="flex flex-col items-center bg-white/10 rounded-xl p-6">
              <span className="text-2xl font-bold text-green-400">0.91</span>
              <span className="text-white mt-1">Precision</span>
            </div>
            <div className="flex flex-col items-center bg-white/10 rounded-xl p-6">
              <span className="text-2xl font-bold text-yellow-400">0.89</span>
              <span className="text-white mt-1">Recall</span>
            </div>
          </div>
          {/* <div className="w-full text-center text-white/70 text-sm mt-2">
            <span>
              These metrics are computed on the FPGA test set and updated with each model improvement.
            </span>
          </div> */}
        </div>
      </section>
    </main>
  );
}
