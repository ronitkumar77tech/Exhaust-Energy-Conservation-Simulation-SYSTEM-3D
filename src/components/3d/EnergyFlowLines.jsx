import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SYSTEM_DIMENSIONS } from "../../data/dimensions";
import { useAppStore } from "../../store/useAppStore";

export function EnergyFlowLines() {
  const pulsesRef = useRef();

  const isEnergyFlowVisible = useAppStore((state) => state.isEnergyFlowVisible);
  const isSimulating = useAppStore((state) => state.isSimulating);
  const isPaused = useAppStore((state) => state.isPaused);
  const simulationSpeed = useAppStore((state) => state.simulationSpeed);

  const PULSE_COUNT = 40;

  // Electrical Cable Route: Generator -> Power Electronics -> Battery Pack
  const electricalCableCurve = useMemo(() => {
    const genPos = SYSTEM_DIMENSIONS.generator.position;
    const pePos = SYSTEM_DIMENSIONS.powerElectronics.position;
    const batPos = SYSTEM_DIMENSIONS.batteryPack.position;

    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(genPos[0], genPos[1] - 1.2, 0),
      new THREE.Vector3(pePos[0], pePos[1] + 0.5, pePos[2]),
      new THREE.Vector3((pePos[0] + batPos[0]) / 2, batPos[1] - 0.5, (pePos[2] + batPos[2]) / 2),
      new THREE.Vector3(batPos[0], batPos[1] + 0.8, batPos[2]),
    ]);
  }, []);

  const [positions, offsets] = useMemo(() => {
    const pos = new Float32Array(PULSE_COUNT * 3);
    const off = new Float32Array(PULSE_COUNT);

    for (let i = 0; i < PULSE_COUNT; i++) {
      off[i] = i / PULSE_COUNT;
      const p = electricalCableCurve.getPoint(off[i]);
      pos[i * 3] = p.x;
      pos[i * 3 + 1] = p.y;
      pos[i * 3 + 2] = p.z;
    }
    return [pos, off];
  }, [electricalCableCurve]);

  useFrame((state, delta) => {
    if (!isEnergyFlowVisible) return;
    if (pulsesRef.current) {
      const posAttr = pulsesRef.current.geometry.attributes.position;
      const speedMult = (isSimulating && !isPaused ? 0.6 : 0.25) * simulationSpeed;

      for (let i = 0; i < PULSE_COUNT; i++) {
        offsets[i] = (offsets[i] + delta * speedMult) % 1.0;
        const p = electricalCableCurve.getPoint(offsets[i]);
        posAttr.array[i * 3] = p.x;
        posAttr.array[i * 3 + 1] = p.y;
        posAttr.array[i * 3 + 2] = p.z;
      }
      posAttr.needsUpdate = true;
    }
  });

  if (!isEnergyFlowVisible) return null;

  return (
    <group>
      {/* Heavy High-Voltage Electric Conduit Tube */}
      <mesh>
        <tubeGeometry args={[electricalCableCurve, 64, 0.1, 12, false]} />
        <meshStandardMaterial color="#ea580c" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Glowing Energy Pulses */}
      <points ref={pulsesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={PULSE_COUNT}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.35}
          color="#38bdf8"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
