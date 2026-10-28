import React from "react";
import { SYSTEM_DIMENSIONS } from "../../data/dimensions";
import { useAppStore } from "../../store/useAppStore";

export function MufflerChamberModel() {
  const selectedId = useAppStore((state) => state.selectedComponentId);
  const hoveredId = useAppStore((state) => state.hoveredComponentId);
  const setSelected = useAppStore((state) => state.setSelectedComponentId);
  const setHovered = useAppStore((state) => state.setHoveredComponentId);
  const viewMode = useAppStore((state) => state.viewMode);
  const isTechnical = useAppStore((state) => state.isTechnicalMode);

  const isSelected = selectedId === "mufflerChamber";
  const isHovered = hoveredId === "mufflerChamber";

  const { position, length, radiusY, radiusZ } = SYSTEM_DIMENSIONS.mufflerChamber;
  const currentX = position[0] + (viewMode === "exploded" ? 2.0 : 0);

  return (
    <group
      position={[currentX, position[1], position[2]]}
      onClick={(e) => {
        e.stopPropagation();
        setSelected("mufflerChamber");
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered("mufflerChamber");
      }}
      onPointerOut={() => setHovered(null)}
    >
      {/* Bright Machined Metallic Silver Muffler Body */}
      <mesh rotation={[0, 0, Math.PI / 2]} scale={[radiusY, 1, radiusZ]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, length, 48, 1, false]} />
        <meshStandardMaterial
          color={isSelected ? "#38bdf8" : isHovered ? "#60a5fa" : "#f1f5f9"}
          metalness={0.95}
          roughness={0.12}
          side={2}
          transparent={viewMode === "cutaway"}
          opacity={viewMode === "cutaway" ? 0.35 : 1.0}
          wireframe={isTechnical}
        />
      </mesh>

      {/* Internal Perforated Baffle Tube (Visible in cutaway mode) */}
      <mesh rotation={[0, 0, Math.PI / 2]} scale={[radiusY * 0.45, 1, radiusZ * 0.45]}>
        <cylinderGeometry args={[1, 1, length * 0.9, 24, 1, true]} />
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.9}
          roughness={0.15}
          wireframe
          transparent
          opacity={viewMode === "cutaway" ? 0.75 : 0.2}
        />
      </mesh>

      {/* Heavy Anodized Cobalt Blue Clamp Bands */}
      {[-length * 0.3, 0, length * 0.3].map((xOffset, i) => (
        <mesh
          key={i}
          position={[xOffset, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          scale={[radiusY * 1.03, 1, radiusZ * 1.03]}
          castShadow
        >
          <cylinderGeometry args={[1, 1, 0.12, 32]} />
          <meshStandardMaterial color="#1d4ed8" metalness={0.9} roughness={0.15} />
        </mesh>
      ))}

      {/* Polished Aluminum End Caps */}
      {[-length / 2, length / 2].map((xPos, idx) => (
        <mesh
          key={idx}
          position={[xPos, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          scale={[radiusY * 1.01, 1, radiusZ * 1.01]}
          castShadow
        >
          <cylinderGeometry args={[1, 1, 0.15, 36]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
        </mesh>
      ))}

      {/* Selection outline */}
      {(isSelected || isHovered) && (
        <mesh rotation={[0, 0, Math.PI / 2]} scale={[radiusY * 1.05, 1, radiusZ * 1.05]}>
          <cylinderGeometry args={[1, 1, length + 0.15, 36]} />
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
