import React from "react";
import { SYSTEM_DIMENSIONS } from "../../data/dimensions";
import { useAppStore } from "../../store/useAppStore";

export function DeflectorModel() {
  const selectedId = useAppStore((state) => state.selectedComponentId);
  const hoveredId = useAppStore((state) => state.hoveredComponentId);
  const setSelected = useAppStore((state) => state.setSelectedComponentId);
  const setHovered = useAppStore((state) => state.setHoveredComponentId);
  const viewMode = useAppStore((state) => state.viewMode);
  const isTechnical = useAppStore((state) => state.isTechnicalMode);

  const isSelected = selectedId === "deflector";
  const isHovered = hoveredId === "deflector";

  const { position, angleDegrees, width, height, thickness } = SYSTEM_DIMENSIONS.deflector;
  const currentX = position[0] + (viewMode === "exploded" ? -1.0 : 0);
  const radAngle = (angleDegrees * Math.PI) / 180;

  return (
    <group
      position={[currentX, position[1], position[2]]}
      onClick={(e) => {
        e.stopPropagation();
        setSelected("deflector");
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered("deflector");
      }}
      onPointerOut={() => setHovered(null)}
    >
      {/* High-Contrast Bright Stainless Steel Deflector Plate */}
      <mesh rotation={[0, 0, radAngle]} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, width]} />
        <meshStandardMaterial
          color={isSelected ? "#38bdf8" : isHovered ? "#60a5fa" : "#f1f5f9"}
          metalness={0.96}
          roughness={0.12}
          wireframe={isTechnical}
        />
      </mesh>

      {/* Shaft Clearance Collar */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, thickness * 1.5, 24]} />
        <meshStandardMaterial color="#1d4ed8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Selection outline */}
      {(isSelected || isHovered) && (
        <mesh rotation={[0, 0, radAngle]}>
          <boxGeometry args={[thickness + 0.06, height + 0.08, width + 0.08]} />
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
