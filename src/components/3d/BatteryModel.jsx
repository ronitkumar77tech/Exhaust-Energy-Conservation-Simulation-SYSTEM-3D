import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { SYSTEM_DIMENSIONS } from "../../data/dimensions";
import { useAppStore } from "../../store/useAppStore";

export function BatteryModel() {
  const chargeBarRef = useRef();
  const selectedId = useAppStore((state) => state.selectedComponentId);
  const hoveredId = useAppStore((state) => state.hoveredComponentId);
  const setSelected = useAppStore((state) => state.setSelectedComponentId);
  const setHovered = useAppStore((state) => state.setHoveredComponentId);
  const viewMode = useAppStore((state) => state.viewMode);
  const isTechnical = useAppStore((state) => state.isTechnicalMode);
  const isSimulating = useAppStore((state) => state.isSimulating);
  const batterySOC = useAppStore((state) => state.batteryCharge);

  const isSelected = selectedId === "batteryPack";
  const isHovered = hoveredId === "batteryPack";

  const { position, width, height, depth } = SYSTEM_DIMENSIONS.batteryPack;

  useFrame((state) => {
    if (chargeBarRef.current && isSimulating) {
      chargeBarRef.current.material.emissiveIntensity =
        Math.sin(state.clock.elapsedTime * 6) * 0.4 + 0.8;
    }
  });

  return (
    <group
      position={[position[0], position[1], position[2]]}
      onClick={(e) => {
        e.stopPropagation();
        setSelected("batteryPack");
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered("batteryPack");
      }}
      onPointerOut={() => setHovered(null)}
    >
      {/* Heavy Truck Battery Casing */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={isSelected ? "#38bdf8" : isHovered ? "#60a5fa" : "#0f172a"}
          metalness={0.8}
          roughness={0.3}
          wireframe={isTechnical}
        />
      </mesh>

      {/* Top Protective Lid */}
      <mesh position={[0, height / 2 + 0.15, 0]} castShadow>
        <boxGeometry args={[width * 0.95, 0.3, depth * 0.95]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Dynamic LED Charge Strip */}
      <mesh ref={chargeBarRef} position={[0, height / 2 + 0.32, 0]}>
        <boxGeometry args={[width * 0.7 * (batterySOC / 100), 0.05, 0.25]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={1.0}
        />
      </mesh>

      {/* High Voltage Danger Badge (Geometric 3D Lightning Symbol - 0 network fonts) */}
      <mesh position={[0, 0, depth / 2 + 0.01]}>
        <planeGeometry args={[1.2, 0.8]} />
        <meshStandardMaterial color="#eab308" roughness={0.4} />
      </mesh>
      {/* Lightning bolt geometry */}
      <mesh position={[0, 0, depth / 2 + 0.02]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.15, 0.5, 0.02]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

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
