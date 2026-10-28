import React from "react";
import { Canvas } from "@react-three/fiber";
import { MainScene } from "./components/3d/MainScene";
import { Header } from "./components/ui/Header";
import { ComponentCard } from "./components/ui/ComponentCard";
import { LiveDashboard } from "./components/ui/LiveDashboard";
import { TransformPanel } from "./components/ui/TransformPanel";
import { ViewportControls } from "./components/ui/ViewportControls";

export default function App() {
  return (
    <div className="app-shell relative w-screen h-screen bg-slate-950 overflow-hidden select-none font-sans">
      {/* Top Header: Title, SIMULATE button, Technical Mode & Vehicle View Toggles */}
      <Header />

      {/* Right Component Inspection & Narration Card */}
      <ComponentCard />

      {/* Left Searchable Component Hierarchy & Transform Editing Panel */}
      <TransformPanel />

      {/* Floating Simulation Phase Narration Banner & Speed Pace Controls */}
      <LiveDashboard />

      {/* Floating 3D Viewport Navigation & Zoom Controls (+, -, Reset View) */}
      <ViewportControls />

      {/* Main Interactive 3D WebGL Canvas */}
      <Canvas
        shadows
        camera={{ position: [4.0, 7.5, 25.5], fov: 38 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={["#080d1a"]} />
        <MainScene />
      </Canvas>
    </div>
  );
}
