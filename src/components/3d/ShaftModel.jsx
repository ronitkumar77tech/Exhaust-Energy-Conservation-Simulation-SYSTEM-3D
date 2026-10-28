import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { SYSTEM_DIMENSIONS } from "../../data/dimensions";
import { useAppStore } from "../../store/useAppStore";

export function ShaftModel() {
  const shaftRef = useRef();
  const selectedId = useAppStore((state) => state.selectedComponentId);
  const hoveredId = useAppStore((state) => state.hoveredComponentId);
  const setSelected = useAppStore((state) => state.setSelectedComponentId);
  const setHovered = useAppStore((state) => state.setHoveredComponentId);
  const viewMode = useAppStore((state) => state.viewMode);
  const isTechnical = useAppStore((state) => state.isTechnicalMode);
  const isSimulating = useAppStore((state) => state.isSimulating);
  const isPaused = useAppStore((state) => state.isPaused);
  const simulationSpeed = useAppStore((state) => state.simulationSpeed);

  const isSelected = selectedId === "shaft";
  const isHovered = hoveredId === "shaft";

  const { startX, endX, radius } = SYSTEM_DIMENSIONS.shaft;
  const length = startX - endX;
  const centerX = (startX + endX) / 2;

  const rotationSpeed = (isSimulating && !isPaused ? 8.0 : isSelected ? 1.5 : 0.3) * simulationSpeed;

  useFrame((state, delta) => {
    if (shaftRef.current && (isSimulating || isSelected || isHovered)) {
      shaftRef.current.rotation.x += delta * rotationSpeed;
    }
  });

  return (
    <group
      position={[centerX, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        setSelected("shaft");
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered("shaft");
      }}
      onPointerOut={() => setHovered(null)}
    >
      {/* Polished Chrome Common Shaft */}
      <mesh ref={shaftRef} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, length, 32]} />
        <meshStandardMaterial
          color={isSelected ? "#38bdf8" : isHovered ? "#60a5fa" : "#f1f5f9"}
          metalness={0.96}
          roughness={0.08}
          wireframe={isTechnical}
        />
      </mesh>

      {/* Shaft Keyway Spline Detail Rings */}
      {[-length * 0.25, 0, length * 0.25].map((xOff, i) => (
        <mesh key={i} position={[xOff, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[radius + 0.02, radius + 0.02, 0.4, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
        </mesh>
      ))}

      {/* Selection outline */}
      {(isSelected || isHovered) && (
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[radius + 0.05, radius + 0.05, length + 0.1, 32]} />
          <meshBasicMaterial
            color={isSelected ? "#38bdf8" : "#f59e0b"}
            wireframe
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* Show 3D Label ONLY in Technical Mode */}
      {isTechnical && (
        <Text
          position={[0, radius + 0.6, 0]}
          fontSize={0.4}
          color={isSelected ? "#38bdf8" : "#94a3b8"}
          anchorX="center"
          anchorY="bottom"
        >
          06. COMMON SHAFT
        </Text>
      )}
    </group>
  );
}
