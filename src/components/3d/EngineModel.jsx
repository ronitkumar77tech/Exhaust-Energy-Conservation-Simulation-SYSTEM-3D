import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SYSTEM_DIMENSIONS } from "../../data/dimensions";
import { useAppStore } from "../../store/useAppStore";
const ENGINE_SCALE = 2.0; // 1.0 = original size, 1.2 = 20% bigger

export function EngineModel() {
  const meshRef = useRef();
  const pistonRefs = useRef([]);
  const rodRefs = useRef([]);
  const crankRefs = useRef([]);
  const combustionRefs = useRef([]);
  const valveRefs = useRef([]);

  const selectedId = useAppStore((state) => state.selectedComponentId);
  const hoveredId = useAppStore((state) => state.hoveredComponentId);
  const setSelected = useAppStore((state) => state.setSelectedComponentId);
  const setHovered = useAppStore((state) => state.setHoveredComponentId);
  const viewMode = useAppStore((state) => state.viewMode);
  const isTechnical = useAppStore((state) => state.isTechnicalMode);
  const isSimulating = useAppStore((state) => state.isSimulating);
  const isPaused = useAppStore((state) => state.isPaused);
  const simulationSpeed = useAppStore((state) => state.simulationSpeed);
  const engineLoad = useAppStore((state) => state.engineLoad);

  const isEngineSelected = selectedId === "engine";
  const isEngineHovered = hoveredId === "engine";

  const { position, width, height, depth } = SYSTEM_DIMENSIONS.engine;
  // Scaling grows the engine in every direction. Shift it right by the extra half-width
  // so its pipe-side face stays where it was and the pipe stays connected.
  const currentX = position[0] + (width / 2) * (ENGINE_SCALE - 1) + (viewMode === "exploded" ? 4.0 : 0);
    // 6 cylinders in two rows of 3: C1-C3 back row, C4-C6 front row
  const FIRING_ORDER = [1, 5, 3, 6, 2, 4];
  const cylinderLayout = [
    { x: -0.95, z: -0.75 }, // C1
    { x: 0.0, z: -0.75 },   // C2
    { x: 0.95, z: -0.75 },  // C3
    { x: -0.95, z: 0.75 },  // C4
    { x: 0.0, z: 0.75 },    // C5
    { x: 0.95, z: 0.75 },   // C6
  ];
  // each cylinder's phase = its place in the firing order, spread evenly
  const phaseOffsets = cylinderLayout.map(
    (_, i) => (FIRING_ORDER.indexOf(i + 1) * 2 * Math.PI) / 6
  );

  // Engine speed scales dynamically with engineLoad slider (0-100%)
  const speedFactor = (engineLoad / 75) * simulationSpeed;

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime * (isSimulating && !isPaused ? 9.0 : 3.5) * speedFactor;

    cylinderLayout.forEach((_, i) => {
      const cycle = Math.sin(time + phaseOffsets[i]);
      const pistonY = cycle * 0.45;

      if (pistonRefs.current[i]) {
        pistonRefs.current[i].position.y = pistonY + 0.1;
      }
      if (rodRefs.current[i]) {
        rodRefs.current[i].position.y = (pistonY - 0.45) / 2 + 0.1;
        rodRefs.current[i].rotation.z = Math.cos(time + phaseOffsets[i]) * 0.28;
      }
      if (crankRefs.current[i]) {
        crankRefs.current[i].rotation.z = time + phaseOffsets[i];
      }
      if (valveRefs.current[i]) {
        valveRefs.current[i].position.y = 1.1 - Math.max(0, -cycle) * 0.15;
      }
      if (combustionRefs.current[i]) {
        const isTDC = cycle > 0.65;
        const flashIntensity = isTDC ? (cycle - 0.65) * 2.85 : 0.0;
        combustionRefs.current[i].material.emissiveIntensity = flashIntensity * (3.5 * (engineLoad / 75));
        combustionRefs.current[i].scale.setScalar(1.0 + flashIntensity * 0.4);
      }
    });
  });

  return (
    <group position={[currentX, position[1], position[2]]} scale={ENGINE_SCALE}>      {/* Engine Block Enclosure (Transparent in Cutaway mode) */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          setSelected("engine");
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered("engine");
        }}
        onPointerOut={() => setHovered(null)}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={isEngineSelected ? "#38bdf8" : isEngineHovered ? "#60a5fa" : "#334155"}
          metalness={0.88}
          roughness={0.18}
          transparent={true}
          opacity={viewMode === "cutaway" || isEngineSelected || isEngineHovered ? 0.35 : 0.85}
          wireframe={isTechnical}
        />
      </mesh>

      {/* Wireframe Edge Frame */}
      <mesh>
        <boxGeometry args={[width + 0.02, height + 0.02, depth + 0.02]} />
        <meshBasicMaterial color="#cbd5e1" wireframe transparent opacity={0.5} />
      </mesh>

      {/* OVERHEAD VALVE SPRINGS COVER */}
      <mesh position={[0, height / 2 + 0.25, 0]} castShadow>
        <boxGeometry args={[width * 0.9, 0.5, depth * 0.85]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.12} />
      </mesh>

      {/* 6 INDIVIDUAL CYLINDER BORE ASSEMBLIES (C1 to C6) */}
      {cylinderLayout.map((pos, i) => {
        const cylId = `cylinder_${i + 1}`;
        const isCylSelected = selectedId === cylId;
        const isCylHovered = hoveredId === cylId;

        return (
          <group
            key={i}
            position={[pos.x, 0, pos.z]}
            onClick={(e) => {
              e.stopPropagation();
              setSelected(cylId);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(cylId);
            }}
            onPointerOut={() => setHovered(null)}
          >
            {/* Cylinder Sleeve Bore */}
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.38, 0.38, 1.35, 24, 1, true]} />
              <meshStandardMaterial
                color={isCylSelected ? "#38bdf8" : isCylHovered ? "#fbbf24" : "#94a3b8"}
                metalness={0.9}
                roughness={0.2}
                side={THREE.DoubleSide}
                transparent
                opacity={0.7}
              />
            </mesh>

            {/* Overhead Valve Assemblies */}
            <group ref={(el) => (valveRefs.current[i] = el)}>
              {[-0.15, 0.15].map((zV, vIdx) => (
                <group key={vIdx} position={[0, 0, zV]}>
                  <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.04, 0.12, 0.45, 16]} />
                    <meshStandardMaterial color="#f1f5f9" metalness={0.95} roughness={0.1} />
                  </mesh>
                  <mesh position={[0, 0.15, 0]}>
                    <cylinderGeometry args={[0.09, 0.09, 0.25, 12]} />
                    <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} wireframe />
                  </mesh>
                </group>
              ))}
            </group>

            {/* Reciprocating Piston Head */}
            <group ref={(el) => (pistonRefs.current[i] = el)}>
              <mesh castShadow>
                <cylinderGeometry args={[0.36, 0.36, 0.38, 24]} />
                <meshStandardMaterial
                  color={isCylSelected ? "#38bdf8" : "#f8fafc"}
                  metalness={0.96}
                  roughness={0.08}
                />
              </mesh>
              {/* Piston Compression Rings */}
              {[-0.09, 0.0, 0.09].map((yR, idx) => (
                <mesh key={idx} position={[0, yR, 0]}>
                  <torusGeometry args={[0.362, 0.015, 8, 24]} />
                  <meshStandardMaterial color="#0f172a" metalness={0.95} roughness={0.1} />
                </mesh>
              ))}
            </group>

            {/* Connecting Rod */}
            <group ref={(el) => (rodRefs.current[i] = el)}>
              <mesh castShadow>
                <boxGeometry args={[0.09, 0.72, 0.12]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
              </mesh>
            </group>

            {/* Crankshaft Counterweight */}
            <group position={[0, -0.65, 0]} ref={(el) => (crankRefs.current[i] = el)}>
              <mesh position={[0, -0.2, 0]}>
                <boxGeometry args={[0.15, 0.35, 0.35]} />
                <meshStandardMaterial color="#475569" metalness={0.92} roughness={0.15} />
              </mesh>
            </group>

            {/* HD COMBUSTION FLAME BURST AT TOP DEAD CENTER */}
            <mesh
              ref={(el) => (combustionRefs.current[i] = el)}
              position={[0, 0.75, 0]}
            >
              <sphereGeometry args={[0.34, 24, 24]} />
              <meshStandardMaterial
                color="#f97316"
                emissive="#ea580c"
                emissiveIntensity={0.0}
                transparent
                opacity={0.9}
              />
            </mesh>
          </group>
        );
      })}

      {/* Crankshaft Journal Axis, one under each row */}
      {[-0.75, 0.75].map((z) => (
        <mesh key={z} position={[0, -0.65, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, width * 0.85, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.95} roughness={0.1} />
        </mesh>
      ))}

      {/* Exhaust Header Pipe Outlets */}
      {cylinderLayout.map((pos, i) => {
        const side = pos.z < 0 ? -1 : 1; // back row exits at the back, front row at the front
        return (
          <mesh key={i} position={[pos.x, 0.4, side * (depth / 2 + 0.25)]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.2, 0.5, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
          </mesh>
        );
      })}

      {/* Selection outline */}
      {(isEngineSelected || isEngineHovered) && (
        <mesh>
          <boxGeometry args={[width + 0.15, height + 0.15, depth + 0.15]} />
          <meshBasicMaterial
            color={isEngineSelected ? "#38bdf8" : "#f59e0b"}
            wireframe
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}
