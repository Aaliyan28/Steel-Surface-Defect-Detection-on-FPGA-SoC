// src/components/BoardViewer.tsx
import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html, useProgress } from "@react-three/drei";

// Kick off the download early
useGLTF.preload("/board.glb");

function BoardModel() {
  const { scene } = useGLTF("/board.glb");
  // Initialize ref as null
  const ref = useRef<any>(null);

  // Continuous rotation
  useFrame((_, delta) => {
    if (ref.current) {
      // rotate on X-axis at 0.5 radians/sec
      ref.current.rotation.y += delta * 0.5;

      // if you want the opposite axis, e.g. Y:
      // ref.current.rotation.y += delta * 0.5;

      // or Z:
      // ref.current.rotation.z += delta * 0.5;
    }
  });

  return (
    <primitive
      ref={ref}
      object={scene}
      position={[0, 0.8, 0]}
      scale={3.5}
      dispose={null}
    />
  );
}

export default function BoardViewer() {
  const { progress } = useProgress();

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <Canvas camera={{ position: [6, 3, 0], fov: 50 }}>
        <ambientLight intensity={2} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        <Suspense
          fallback={
            <Html center>
              <div className="text-white">{progress.toFixed(0)}% loading</div>
            </Html>
          }
        >
          <BoardModel />
        </Suspense>

        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  );
}
