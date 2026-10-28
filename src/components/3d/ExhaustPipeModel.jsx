import React from "react";
import { SYSTEM_DIMENSIONS } from "../../data/dimensions";
import { useAppStore } from "../../store/useAppStore";

export function ExhaustPipeModel() {
  const selectedId = useAppStore((state) => state.selectedComponentId);
  const hoveredId = useAppStore((state) => state.hoveredComponentId);
  const setSelected = useAppStore((state) => state.setSelectedComponentId);
  const setHovered = useAppStore((state) => state.setHoveredComponentId);
  const viewMode = useAppStore((state) => state.viewMode);
  const isTechnical = useAppStore((state) => state.isTechnicalMode);

  const isSelected = selectedId === "exhaustPipe";
  const isHovered = hoveredId === "exhaustPipe";

  const { startX, endX, radius } = SYSTEM_DIMENSIONS.exhaustPipe;
  const pipeLength = startX - endX;
  const centerX = (startX + endX) / 2;
  const currentX = centerX + (viewMode === "exploded" ? 3.0 : 0);

  return (
    <group
      position={[currentX, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        setSelected("exhaustPipe");
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered("exhaustPipe");
      }}
      onPointerOut={() => setHovered(null)}
    >
      {/* High-Contrast Polished Stainless Steel Exhaust Pipe */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, pipeLength, 32, 1, true]} />
        <meshStandardMaterial
          color={isSelected ? "#38bdf8" : isHovered ? "#60a5fa" : "#f1f5f9"}
          metalness={0.96}
          roughness={0.12}
          side={2}
          transparent={viewMode === "cutaway"}
          opacity={viewMode === "cutaway" ? 0.35 : 1.0}
          wireframe={isTechnical}
        />
      </mesh>

      {/* Flange Couplings */}
      {[-pipeLength / 2, pipeLength / 2].map((xPos, idx) => (
        <mesh key={idx} position={[xPos, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[radius * 1.25, radius * 1.25, 0.15, 24]} />
          <meshStandardMaterial color="#1d4ed8" metalness={0.9} roughness={0.15} />
        </mesh>
      ))}

      {/* Selection outline */}
      {(isSelected || isHovered) && (
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[radius + 0.06, radius + 0.06, pipeLength + 0.1, 24]} />
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
