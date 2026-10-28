import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "../../store/useAppStore";

export function ExhaustParticles() {
  const pointsRef = useRef();
  const bypassPointsRef = useRef();

  const isFlowVisible = useAppStore((state) => state.isFlowVisible);
  const isSimulating = useAppStore((state) => state.isSimulating);
  const isPaused = useAppStore((state) => state.isPaused);
  const simulationSpeed = useAppStore((state) => state.simulationSpeed);

  const PARTICLE_COUNT = 350;
  const BYPASS_PARTICLE_COUNT = 100;

  // Extended Main flow path keypoints through all 12 series turbines
  const mainPathCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(15.5, 0, 0), // Engine
      new THREE.Vector3(11.25, 0, 0), // Exhaust Pipe
      new THREE.Vector3(7.25, 0, 0), // Muffler Chamber
      new THREE.Vector3(4.3, 0, 0), // Nozzle entrance
      new THREE.Vector3(0.0, 0, 0), // 12 Series Turbines
      new THREE.Vector3(-4.0, 0, 0), // Deflector plate
      new THREE.Vector3(-4.2, 1.8, 0), // Outlet turn
      new THREE.Vector3(-4.2, 3.5, 0), // Exit top
    ]);
  }, []);

  // Bypass flow path keypoints
  const bypassPathCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(5.8, 0, 0),
      new THREE.Vector3(5.8, -2.6, 0),
      new THREE.Vector3(-0.25, -2.6, 0),
      new THREE.Vector3(-4.8, -2.6, 0),
      new THREE.Vector3(-4.8, 1.8, 0),
      new THREE.Vector3(-4.2, 3.5, 0),
    ]);
  }, []);

  // Initial particle parameters
  const [positions, colors, offsets] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const off = new Float32Array(PARTICLE_COUNT);

    const colorHot = new THREE.Color("#f97316");
    const colorFast = new THREE.Color("#06b6d4");
    const colorExit = new THREE.Color("#64748b");

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      off[i] = Math.random();
      const p = mainPathCurve.getPoint(off[i]) || new THREE.Vector3(0, 0, 0);

      pos[i * 3] = p.x;
      pos[i * 3 + 1] = p.y + (Math.random() - 0.5) * 0.3;
      pos[i * 3 + 2] = p.z + (Math.random() - 0.5) * 0.3;

      const mixCol = off[i] < 0.4 ? colorHot : off[i] < 0.75 ? colorFast : colorExit;
      col[i * 3] = mixCol.r;
      col[i * 3 + 1] = mixCol.g;
      col[i * 3 + 2] = mixCol.b;
    }
    return [pos, col, off];
  }, [mainPathCurve]);

  // Bypass particles setup
  const [bPositions, bColors, bOffsets] = useMemo(() => {
    const pos = new Float32Array(BYPASS_PARTICLE_COUNT * 3);
    const col = new Float32Array(BYPASS_PARTICLE_COUNT * 3);
    const off = new Float32Array(BYPASS_PARTICLE_COUNT);

    const colorBypass = new THREE.Color("#ef4444");

    for (let i = 0; i < BYPASS_PARTICLE_COUNT; i++) {
      off[i] = Math.random();
      const p = bypassPathCurve.getPoint(off[i]) || new THREE.Vector3(0, 0, 0);
      pos[i * 3] = p.x;
      pos[i * 3 + 1] = p.y + (Math.random() - 0.5) * 0.2;
      pos[i * 3 + 2] = p.z + (Math.random() - 0.5) * 0.2;

      col[i * 3] = colorBypass.r;
      col[i * 3 + 1] = colorBypass.g;
      col[i * 3 + 2] = colorBypass.b;
    }
    return [pos, col, off];
  }, [bypassPathCurve]);

  useFrame((state, delta) => {
    if (!isFlowVisible) return;
    const speedMult = (isSimulating && !isPaused ? 0.35 : 0.12) * simulationSpeed;

    // Update Main Path Particles
    if (pointsRef.current) {
      const posAttr = pointsRef.current.geometry.attributes.position;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        let t = offsets[i];
        if (isNaN(t) || t < 0) t = 0;
        const accel = t > 0.35 && t < 0.65 ? 2.2 : 1.0;
        t = (t + delta * speedMult * accel) % 1.0;
        offsets[i] = t;

        const safeT = Math.max(0, Math.min(1, t));
        const p = mainPathCurve.getPoint(safeT);

        if (p) {
          const radiusNoise = safeT > 0.35 && safeT < 0.7 ? 0.18 : 0.35;
          posAttr.array[i * 3] = p.x;
          posAttr.array[i * 3 + 1] = p.y + Math.sin(safeT * 24 + i) * radiusNoise;
          posAttr.array[i * 3 + 2] = p.z + Math.cos(safeT * 24 + i) * radiusNoise;
        }
      }
      posAttr.needsUpdate = true;
    }

    // Update Bypass Path Particles
    if (bypassPointsRef.current) {
      const bPosAttr = bypassPointsRef.current.geometry.attributes.position;
      const bSpeed = speedMult * 0.8;
      for (let i = 0; i < BYPASS_PARTICLE_COUNT; i++) {
        let bt = bOffsets[i];
        if (isNaN(bt) || bt < 0) bt = 0;
        bt = (bt + delta * bSpeed) % 1.0;
        bOffsets[i] = bt;

        const safeBT = Math.max(0, Math.min(1, bt));
        const p = bypassPathCurve.getPoint(safeBT);

        if (p) {
          bPosAttr.array[i * 3] = p.x;
          bPosAttr.array[i * 3 + 1] = p.y + Math.sin(safeBT * 15 + i) * 0.1;
          bPosAttr.array[i * 3 + 2] = p.z + Math.cos(safeBT * 15 + i) * 0.1;
        }
      }
      bPosAttr.needsUpdate = true;
    }
  });

  if (!isFlowVisible) return null;

  return (
    <group>
      {/* Main Flow Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={PARTICLE_COUNT}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={PARTICLE_COUNT}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.22}
          vertexColors
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
