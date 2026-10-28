import React from "react";
import { useAppStore } from "../../store/useAppStore";

export function VehicleChassis() {
  const showVehicleContext = useAppStore((state) => state.showVehicleContext);

  if (!showVehicleContext) return null;

  return (
    <group position={[0, -2.5, 0]}>
      {/* Heavy Truck Frame Steel Side Rails */}
      {[-2.2, 2.2].map((zPos, idx) => (
        <mesh key={idx} position={[3, 0.5, zPos]}>
          <boxGeometry args={[32, 0.5, 0.25]} />
          <meshStandardMaterial color="#64748b" wireframe transparent opacity={0.35} />
        </mesh>
      ))}

      {/* Frame Crossmembers */}
      {[-10, -4, 2, 8, 14].map((xPos, idx) => (
        <mesh key={idx} position={[xPos, 0.5, 0]}>
          <boxGeometry args={[0.3, 0.4, 4.6]} />
          <meshStandardMaterial color="#475569" wireframe transparent opacity={0.3} />
        </mesh>
      ))}

      {/* Heavy Truck Dual Rear Wheels */}
      {[-8, -5].map((xPos, i) =>
        [-2.8, 2.8].map((zPos, j) => (
          <mesh key={`${i}-${j}`} position={[xPos, -0.8, zPos]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.5, 1.5, 1.0, 24]} />
            <meshStandardMaterial color="#334155" wireframe transparent opacity={0.25} />
          </mesh>
        ))
      )}

      {/* Heavy Truck Driver Cab Outline Box */}
      <mesh position={[14.5, 3.8, 0]}>
        <boxGeometry args={[5.5, 5.2, 4.8]} />
        <meshStandardMaterial color="#38bdf8" wireframe transparent opacity={0.18} />
      </mesh>
    </group>
  );
}
