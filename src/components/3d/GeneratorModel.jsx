import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SYSTEM_DIMENSIONS } from "../../data/dimensions";
import { useAppStore } from "../../store/useAppStore";

export function GeneratorModel() {
  const rotorRef = useRef();
  const fluxArcRef = useRef();
  const commutatorRef = useRef();
  const selectedId = useAppStore((state) => state.selectedComponentId);
  const hoveredId = useAppStore((state) => state.hoveredComponentId);
  const setSelected = useAppStore((state) => state.setSelectedComponentId);
  const setHovered = useAppStore((state) => state.setHoveredComponentId);
  const viewMode = useAppStore((state) => state.viewMode);
  const isTechnical = useAppStore((state) => state.isTechnicalMode);
  const isSimulating = useAppStore((state) => state.isSimulating);
  const isPaused = useAppStore((state) => state.isPaused);
  const simulationSpeed = useAppStore((state) => state.simulationSpeed);

  const isSelected = selectedId === "generator";
  const isHovered = hoveredId === "generator";

  const { position, length, radius, statorFins } = SYSTEM_DIMENSIONS.generator;
  const currentX = position[0] + (viewMode === "exploded" ? -2.5 : 0);

  const rotationSpeed = (isSimulating && !isPaused ? 8.5 : isSelected ? 2.5 : 0.8) * simulationSpeed;

  // 6 Internal Electromagnetic Stator Poles around circumference
  const statorPoles = Array.from({ length: 6 }, (_, i) => (i * Math.PI) / 3);

  useFrame((state, delta) => {
    if (rotorRef.current) {
      rotorRef.current.rotation.x += delta * rotationSpeed;
    }
    if (commutatorRef.current) {
      commutatorRef.current.rotation.x += delta * rotationSpeed;
    }
    if (fluxArcRef.current) {
      const pulse = isSimulating
        ? Math.sin(state.clock.elapsedTime * 14) * 0.25 + 0.65
        : 0.2;
      fluxArcRef.current.material.opacity = pulse;
    }
  });

  return (
    <group
      position={[currentX, position[1], position[2]]}
      onClick={(e) => {
        e.stopPropagation();
        setSelected("generator");
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered("generator");
      }}
      onPointerOut={() => setHovered(null)}
    >
      {/* Metallic Cobalt Blue Cutaway Stator Housing matching Reference Image 2 */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, length, 48, 1, false]} />
        <meshStandardMaterial
          color={isSelected ? "#38bdf8" : isHovered ? "#60a5fa" : "#2563eb"}
          metalness={0.9}
          roughness={0.15}
          side={THREE.DoubleSide}
          transparent={true}
          opacity={viewMode === "cutaway" || isSelected || isHovered ? 0.35 : 0.92}
          wireframe={isTechnical}
        />
      </mesh>

      {/* Bright Silver Cooling Fins */}
      {Array.from({ length: statorFins }).map((_, i) => {
        const finAngle = (i * 2 * Math.PI) / statorFins;
        return (
          <mesh
            key={i}
            rotation={[finAngle, 0, Math.PI / 2]}
            position={[0, Math.sin(finAngle) * (radius + 0.08), Math.cos(finAngle) * (radius + 0.08)]}
          >
            <boxGeometry args={[length * 0.9, 0.12, 0.06]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.95} roughness={0.1} />
          </mesh>
        );
      })}

      {/* STATOR MAGNETIC POLE TEETH & COPPER FIELD COILS */}
      {statorPoles.map((angle, i) => (
        <group key={i} rotation={[angle, 0, 0]}>
          {/* Iron Pole Shoe */}
          <mesh position={[0, radius * 0.72, 0]}>
            <boxGeometry args={[length * 0.75, 0.25, 0.4]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Copper Field Winding Coil */}
          <mesh position={[0, radius * 0.82, 0]}>
            <boxGeometry args={[length * 0.7, 0.18, 0.55]} />
            <meshStandardMaterial color="#f97316" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* SPINNING MULTI-POLE ROTOR & ARMATURE ASSEMBLY (MOUNTED ON COMMON SHAFT) */}
      <group ref={rotorRef}>
        {/* Laminated Steel Rotor Core Axis */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[radius * 0.55, radius * 0.55, length * 0.75, 32]} />
          <meshStandardMaterial color="#475569" metalness={0.92} roughness={0.15} />
        </mesh>

        {/* 6 Copper Armature Winding Bundles */}
        {statorPoles.map((angle, i) => (
          <group key={i} rotation={[angle, 0, 0]}>
            <mesh position={[0, radius * 0.42, 0]}>
              <boxGeometry args={[length * 0.72, 0.15, 0.25]} />
              <meshStandardMaterial color="#ea580c" metalness={0.88} roughness={0.15} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Commutator Ring & Carbon Brushes */}
      <group ref={commutatorRef} position={[length / 2 - 0.4, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[radius * 0.35, radius * 0.35, 0.3, 24]} />
          <meshStandardMaterial color="#b45309" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* DYNAMIC ELECTROMAGNETIC FLUX ARCS PULSING IN GENERATOR */}
      <mesh ref={fluxArcRef} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius * 0.65, radius * 0.65, length * 0.7, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} wireframe />
      </mesh>

      {/* Junction Box */}
      <mesh position={[0, radius + 0.35, 0]} castShadow>
        <boxGeometry args={[0.9, 0.5, 0.8]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Pure White 3D Geometric 'G' Emblem on End Cap matching sketch */}
      <group position={[-length / 2 - 0.05, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <torusGeometry args={[0.7, 0.12, 16, 32, Math.PI * 1.5]} />
          <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
        </mesh>
        <mesh position={[0.2, 0, 0]}>
          <boxGeometry args={[0.5, 0.12, 0.12]} />
          <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* Selection outline */}
      {(isSelected || isHovered) && (
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[radius + 0.08, radius + 0.08, length + 0.1, 36]} />
          <meshBasicMaterial
            color={isSelected ? "#38bdf8" : "#f59e0b"}
            wireframe
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}
