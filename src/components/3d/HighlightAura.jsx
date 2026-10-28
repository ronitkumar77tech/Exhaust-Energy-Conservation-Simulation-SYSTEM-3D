import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { SYSTEM_DIMENSIONS } from "../../data/dimensions";
import { EDITABLE_IDS } from "../../data/editableComponents";
import { useAppStore } from "../../store/useAppStore";

export function HighlightAura({ id }) {
  const boxRef = useRef();
  const selectedId = useAppStore((state) => state.selectedComponentId);

  const activeId =
    id !== undefined
      ? selectedId === id
        ? id
        : null
      : selectedId && !EDITABLE_IDS.has(selectedId)
        ? selectedId
        : null;

  useFrame((state) => {
    if (boxRef.current && activeId) {
      const pulse = Math.sin(state.clock.elapsedTime * 6) * 0.2 + 0.8;
      boxRef.current.material.opacity = pulse * 0.8;
    }
  });

  if (!activeId || !SYSTEM_DIMENSIONS[activeId]) return null;

  const dim = SYSTEM_DIMENSIONS[activeId];
  let pos = [0, 0, 0];
  let size = [2, 2, 2];

  if (dim.position) {
    pos = dim.position;
    if (dim.width) size = [dim.width + 0.4, dim.height + 0.4, dim.depth + 0.4];
    else if (dim.length && dim.radius) size = [dim.length + 0.4, dim.radius * 2 + 0.4, dim.radius * 2 + 0.4];
    else if (dim.length && dim.radiusY) size = [dim.length + 0.4, dim.radiusY * 2 + 0.4, dim.radiusZ * 2 + 0.4];
    else if (dim.housingLength) size = [dim.housingLength + 0.4, dim.housingRadius * 2 + 0.4, dim.housingRadius * 2 + 0.4];
    else if (dim.angleDegrees) size = [dim.thickness + 0.4, dim.height + 0.4, dim.width + 0.4];
  } else if (dim.startX !== undefined) {
    const len = Math.abs(dim.startX - dim.endX);
    pos = [(dim.startX + dim.endX) / 2, 0, 0];
    size = [len + 0.4, dim.radius * 2 + 0.4, dim.radius * 2 + 0.4];
  } else if (dim.inletPos) {
    // Bypass valve run: span the pipe from inlet to outlet and drop down to the valve body
    const [inX, inY, inZ] = dim.inletPos;
    const [outX, outY, outZ] = dim.outletPos || dim.inletPos;
    pos = [(inX + outX) / 2, (inY + outY) / 2, (inZ + outZ) / 2];
    const margin = 1.2;
    size = [
      Math.abs(inX - outX) + margin,
      Math.max(Math.abs(inY - outY), dim.valveBodyPos ? Math.abs(inY - dim.valveBodyPos[1]) : 0) + margin + 0.6,
      Math.max(Math.abs(inZ - outZ), 2.4),
    ];
  }

  return (
    <group position={pos}>
      {/* Bright Pulsing Cyan 3D Bounding Box Outline */}
      <mesh ref={boxRef} raycast={() => null}>
        <boxGeometry args={size} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
