import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SYSTEM_DIMENSIONS } from "../../data/dimensions";
import { useAppStore } from "../../store/useAppStore";
const SMALLEST_SCALE = 0.35; // size of wheel T1 (50%)
const LARGEST_SCALE = 1.0;  // size of wheel T12 (100%)

export function TurbineModel() {
  const rotorRef = useRef();
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

  const isMainTurbineSelected = selectedId === "turbine";
  const isMainTurbineHovered = hoveredId === "turbine";

  const { position, bladeCount, hubRadius, bladeLength, bladeWidth, bladeThickness, housingRadius, housingLength } = SYSTEM_DIMENSIONS.turbine;

  const currentX = position[0];
  const speedFactor = (engineLoad / 75) * simulationSpeed;
  const rotationSpeed = (isSimulating && !isPaused ? 9.5 : isMainTurbineSelected ? 2.5 : 0.8) * speedFactor;

  useFrame((state, delta) => {
    if (rotorRef.current) {
      rotorRef.current.rotation.x += delta * rotationSpeed;
    }
  });

  // 12 SEPARATE TURBINES IN SERIES ALONG SHAFT LENGTH
  const seriesSpacing = (housingLength * 0.85) / (bladeCount - 1);
  const startX = (housingLength * 0.85) / 2;

  const seriesTurbines = Array.from({ length: bladeCount }, (_, index) => {
    const stageNum = index + 1;
    const tKey = `turbine_t${stageNum}`;
    const xPos = startX - index * seriesSpacing;
    const stagePitch = (index * Math.PI) / 8; // Multi-stage progressive pitch down series
    const scale = SMALLEST_SCALE + ((LARGEST_SCALE - SMALLEST_SCALE) * index) / (bladeCount - 1);

    return {
      id: tKey,
      stageNum,
      xPos,
      stagePitch,
      scale,
    };
  });

  return (
    <group
      position={[currentX, position[1], position[2]]}
      onClick={(e) => {
        e.stopPropagation();
        setSelected("turbine");
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered("turbine");
      }}
      onPointerOut={() => setHovered(null)}
    >
      {/* Extended Frosted Casing */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[housingRadius, housingRadius, housingLength, 48, 1, false]} />
        <meshStandardMaterial
          color={isMainTurbineSelected ? "#38bdf8" : isMainTurbineHovered ? "#60a5fa" : "#e2e8f0"}
          metalness={0.9}
          roughness={0.1}
          side={THREE.DoubleSide}
          transparent={true}
          opacity={viewMode === "cutaway" || isMainTurbineSelected || isMainTurbineHovered ? 0.22 : 0.32}
          wireframe={isTechnical}
        />
      </mesh>

      {/* Flange Mounting Rings */}
      {[-housingLength / 2, housingLength / 2].map((xOff, i) => (
        <mesh key={i} position={[xOff, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[housingRadius * 1.08, housingRadius * 1.08, 0.16, 36]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.92} roughness={0.15} />
        </mesh>
      ))}

      {/* ROTATING 12 SEPARATE TURBINES IN SERIES (T1 THROUGH T12) */}
      <group ref={rotorRef}>
        {seriesTurbines.map((tWheel) => {
          const isTSelected = selectedId === tWheel.id;
          const isTHovered = hoveredId === tWheel.id;

          return (
            <group
              key={tWheel.id}
              position={[tWheel.xPos, 0, 0]}
              scale={tWheel.scale}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(tWheel.id);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(tWheel.id);
              }}
              onPointerOut={() => setHovered(null)}
            >
              {/* Central Hub for Stage */}
              <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[hubRadius, hubRadius, 0.16, 24]} />
                <meshStandardMaterial
                  color={isTSelected ? "#38bdf8" : isTHovered ? "#fbbf24" : "#f59e0b"}
                  metalness={0.95}
                  roughness={0.08}
                />
              </mesh>

              {/* 6 Aerodynamic Blades for this Stage */}
              {Array.from({ length: 6 }).map((_, bIdx) => {
                const bAngle = (bIdx * Math.PI) / 3 + tWheel.stagePitch;
                const rad = hubRadius + bladeLength / 2;
                return (
                  <group
                    key={bIdx}
                    position={[0, Math.cos(bAngle) * rad, Math.sin(bAngle) * rad]}
                    rotation={[bAngle + 0.5, 0, 0]}
                  >
                    <mesh castShadow receiveShadow>
                      <boxGeometry args={[bladeWidth, bladeLength, bladeThickness * 1.5]} />
                      <meshStandardMaterial
                        color={isTSelected ? "#38bdf8" : "#00f0ff"}
                        metalness={0.96}
                        roughness={0.08}
                        emissive={isTSelected ? "#38bdf8" : "#0284c7"}
                        emissiveIntensity={0.4}
                      />
                    </mesh>
                    <mesh position={[0, bladeLength / 2 + 0.04, 0]}>
                      <boxGeometry args={[bladeWidth * 1.1, 0.08, bladeThickness * 2.0]} />
                      <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.1} />
                    </mesh>
                  </group>
                );
              })}

              {/* Outer Shroud Ring for Stage */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[hubRadius + bladeLength, 0.035, 12, 36]} />
                <meshStandardMaterial color="#0284c7" metalness={0.92} roughness={0.1} />
              </mesh>
            </group>
          );
        })}

        {/* Front Bullet Nose Cone */}
        <mesh position={[startX + 0.35, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <coneGeometry args={[hubRadius * 0.95 * SMALLEST_SCALE, 0.6, 32]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
        </mesh>
      </group>

      {/* Selection outline */}
      {(isMainTurbineSelected || isMainTurbineHovered) && (
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[housingRadius + 0.08, housingRadius + 0.08, housingLength + 0.1, 36]} />
          <meshBasicMaterial
            color={isMainTurbineSelected ? "#38bdf8" : "#f59e0b"}
            wireframe
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}
