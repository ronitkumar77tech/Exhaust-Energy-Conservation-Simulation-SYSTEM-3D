import React from "react";
import { SYSTEM_DIMENSIONS } from "../../data/dimensions";
import { useAppStore } from "../../store/useAppStore";

export function NozzleModel() {
  const selectedId = useAppStore((state) => state.selectedComponentId);
  const hoveredId = useAppStore((state) => state.hoveredComponentId);
  const setSelected = useAppStore((state) => state.setSelectedComponentId);
  const setHovered = useAppStore((state) => state.setHoveredComponentId);
  const viewMode = useAppStore((state) => state.viewMode);
  const isTechnical = useAppStore((state) => state.isTechnicalMode);

  const isSelected = selectedId === "nozzle";
  const isHovered = hoveredId === "nozzle";

  const { startX, endX, inletRadius, outletRadius, length } = SYSTEM_DIMENSIONS.nozzle;
  const centerX = (startX + endX) / 2;
  const currentX = centerX + (viewMode === "exploded" ? 1.0 : 0);

  return (
    <group
      position={[currentX, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        setSelected("nozzle");
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered("nozzle");
      }}
      onPointerOut={() => setHovered(null)}
    >
      {/* Polished Chrome Silver Convergent Cone Nozzle */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[outletRadius, inletRadius, length, 48, 1, false]} />
        <meshStandardMaterial
          color={isSelected ? "#38bdf8" : isHovered ? "#60a5fa" : "#e2e8f0"}
          metalness={0.96}
          roughness={0.1}
          side={2}
          transparent={viewMode === "cutaway"}
          opacity={viewMode === "cutaway" ? 0.35 : 1.0}
          wireframe={isTechnical}
        />
      </mesh>

      {/* Anodized Cobalt Blue Flange Rings */}
      <mesh position={[length / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[inletRadius * 1.08, inletRadius * 1.08, 0.12, 32]} />
        <meshStandardMaterial color="#1d4ed8" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[-length / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[outletRadius * 1.15, outletRadius * 1.15, 0.12, 32]} />
        <meshStandardMaterial color="#1d4ed8" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Selection outline */}
      {(isSelected || isHovered) && (
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[outletRadius + 0.06, inletRadius + 0.06, length + 0.1, 36]} />
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
