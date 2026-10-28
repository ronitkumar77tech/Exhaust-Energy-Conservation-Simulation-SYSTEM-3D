import React from "react";
import { SYSTEM_DIMENSIONS } from "../../data/dimensions";
import { useAppStore } from "../../store/useAppStore";

export function PowerElectronicsModel() {
  const selectedId = useAppStore((state) => state.selectedComponentId);
  const hoveredId = useAppStore((state) => state.hoveredComponentId);
  const setSelected = useAppStore((state) => state.setSelectedComponentId);
  const setHovered = useAppStore((state) => state.setHoveredComponentId);
  const viewMode = useAppStore((state) => state.viewMode);
  const isTechnical = useAppStore((state) => state.isTechnicalMode);

  const isSelected = selectedId === "powerElectronics";
  const isHovered = hoveredId === "powerElectronics";

  const { position, width, height, depth } = SYSTEM_DIMENSIONS.powerElectronics;
  const explodedOffset = viewMode === "exploded" ? -2.0 : 0;
  const currentX = position[0] + explodedOffset;

  return (
    <group
      position={[currentX, position[1], position[2]]}
      onClick={(e) => {
        e.stopPropagation();
        setSelected("powerElectronics");
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered("powerElectronics");
      }}
      onPointerOut={() => setHovered(null)}
    >
      {/* Inverter Box Enclosure */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={isSelected ? "#38bdf8" : isHovered ? "#60a5fa" : "#334155"}
          metalness={0.85}
          roughness={0.25}
          wireframe={isTechnical}
        />
      </mesh>

      {/* Heat Sink Fins */}
      {[-0.6, -0.2, 0.2, 0.6].map((xOff, i) => (
        <mesh key={i} position={[xOff, height / 2 + 0.15, 0]}>
          <boxGeometry args={[0.08, 0.3, depth * 0.85]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* High-Voltage Orange Connection Ports */}
      {[-0.5, 0.5].map((zOff, i) => (
        <mesh key={i} position={[width / 2 + 0.1, 0, zOff]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.2, 16]} />
          <meshStandardMaterial color="#ea580c" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}

      {/* Selection outline */}
      {(isSelected || isHovered) && (
        <mesh>
          <boxGeometry args={[width + 0.1, height + 0.1, depth + 0.1]} />
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
