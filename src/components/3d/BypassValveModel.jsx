import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { SYSTEM_DIMENSIONS } from "../../data/dimensions";
import { useAppStore } from "../../store/useAppStore";

export function BypassValveModel() {
  const valveDiscRef = useRef();
  const selectedId = useAppStore((state) => state.selectedComponentId);
  const hoveredId = useAppStore((state) => state.hoveredComponentId);
  const setSelected = useAppStore((state) => state.setSelectedComponentId);
  const setHovered = useAppStore((state) => state.setHoveredComponentId);
  const isTechnical = useAppStore((state) => state.isTechnicalMode);
  const isSimulating = useAppStore((state) => state.isSimulating);

  const isSelected = selectedId === "bypassValve";
  const isHovered = hoveredId === "bypassValve";

  const { inletPos, outletPos, valveBodyPos, pipeRadius, valveDiscRadius } = SYSTEM_DIMENSIONS.bypass;

  useFrame((state) => {
    if (valveDiscRef.current) {
      const angle = isSimulating ? Math.sin(state.clock.elapsedTime * 2) * 0.4 + 0.4 : 0.2;
      valveDiscRef.current.rotation.y = angle;
    }
  });

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        setSelected("bypassValve");
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered("bypassValve");
      }}
      onPointerOut={() => setHovered(null)}
    >
      {/* Polished Metallic Silver Inlet Pipe */}
      <mesh position={[inletPos[0], (inletPos[1] + 0) / 2, 0]} castShadow>
        <cylinderGeometry args={[pipeRadius, pipeRadius, Math.abs(inletPos[1]), 24]} />
        <meshStandardMaterial
          color={isSelected ? "#38bdf8" : isHovered ? "#60a5fa" : "#cbd5e1"}
          metalness={0.92}
          roughness={0.18}
          wireframe={isTechnical}
        />
      </mesh>

      {/* Horizontal Bypass Segment */}
      <mesh
        position={[(inletPos[0] + outletPos[0]) / 2, valveBodyPos[1], 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[pipeRadius, pipeRadius, Math.abs(inletPos[0] - outletPos[0]), 24]} />
        <meshStandardMaterial
          color={isSelected ? "#38bdf8" : isHovered ? "#60a5fa" : "#cbd5e1"}
          metalness={0.92}
          roughness={0.18}
          wireframe={isTechnical}
        />
      </mesh>

      {/* Outlet Pipe */}
      <mesh position={[outletPos[0], (outletPos[1] + 0) / 2, 0]} castShadow>
        <cylinderGeometry args={[pipeRadius, pipeRadius, Math.abs(outletPos[1]), 24]} />
        <meshStandardMaterial
          color={isSelected ? "#38bdf8" : isHovered ? "#60a5fa" : "#cbd5e1"}
          metalness={0.92}
          roughness={0.18}
          wireframe={isTechnical}
        />
      </mesh>

      {/* MECHANICAL VALVE HOUSING BODY & RACING RED ACTUATOR */}
      <group position={valveBodyPos}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[pipeRadius * 1.35, pipeRadius * 1.35, 0.8, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>

        <mesh position={[0, -0.7, 0]} castShadow>
          <boxGeometry args={[0.7, 0.6, 0.7]} />
          <meshStandardMaterial color="#ef4444" metalness={0.7} roughness={0.2} />
        </mesh>

        <mesh ref={valveDiscRef} position={[0, 0, 0]}>
          <cylinderGeometry args={[valveDiscRadius, valveDiscRadius, 0.06, 24]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.15} />
        </mesh>
      </group>
    </group>
  );
}
