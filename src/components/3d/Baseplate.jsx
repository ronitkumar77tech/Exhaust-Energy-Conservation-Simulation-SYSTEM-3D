import React from "react";
import { SYSTEM_DIMENSIONS } from "../../data/dimensions";

export function Baseplate() {
  const len = SYSTEM_DIMENSIONS.overallLength + 2.0;

  return (
    <group position={[1.5, -2.4, 0]}>
      {/* Dark Metallic Mounting Baseplate */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[len, 0.35, 7.5]} />
        <meshStandardMaterial color="#1e293b" metalness={0.92} roughness={0.2} />
      </mesh>

      {/* Machined Bevel Border Frame */}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[len - 0.2, 0.05, 7.3]} />
        <meshStandardMaterial color="#334155" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Structural Support Legs under Baseplate */}
      {[-len / 2 + 1, 0, len / 2 - 1].map((xOff, i) => (
        <React.Fragment key={i}>
          <mesh position={[xOff, -0.3, -3.2]}>
            <boxGeometry args={[0.8, 0.3, 0.6]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[xOff, -0.3, 3.2]}>
            <boxGeometry args={[0.8, 0.3, 0.6]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} />
          </mesh>
        </React.Fragment>
      ))}
    </group>
  );
}
