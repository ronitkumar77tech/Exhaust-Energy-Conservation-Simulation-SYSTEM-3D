import React from "react";
import { Html, Line } from "@react-three/drei";
import { useAppStore } from "../../store/useAppStore";

export function DimensionCallouts() {
  const isTechnical = useAppStore((state) => state.isTechnicalMode);
  const setSelected = useAppStore((state) => state.setSelectedComponentId);

  if (!isTechnical) return null;

  // Well-spaced callouts pushed FAR away from the model (+Y/-Y and +Z/-Z) to prevent overlap & keep 3D machine 100% clear
  const items = [
    {
      id: "engine",
      num: "01",
      pos: [15.5, 7.2, -3.2],
      anchor: [15.5, 1.8, 0],
      title: "01 ENGINE (3-CYLINDER)",
      desc: "Fuel combustion produces high-pressure, high-temp exhaust gas",
    },
    {
      id: "exhaustPipe",
      num: "02",
      pos: [11.25, 5.8, 3.2],
      anchor: [11.25, 0, 0],
      title: "02 EXHAUST PIPE",
      desc: "Transports exhaust from engine to chamber",
    },
    {
      id: "mufflerChamber",
      num: "03",
      pos: [7.25, 7.5, -3.2],
      anchor: [7.25, 0, 0],
      title: "03 EXHAUST CHAMBER",
      desc: "Expands and conditions exhaust flow before nozzle",
    },
    {
      id: "nozzle",
      num: "04",
      pos: [4.3, 5.8, 3.2],
      anchor: [4.3, 0, 0],
      title: "04 HIGH-VELOCITY NOZZLE",
      desc: "Accelerates exhaust creating high-velocity jet",
    },
    {
      id: "turbine",
      num: "05",
      pos: [-0.25, 8.2, -3.2],
      anchor: [-0.25, 0, 0],
      title: "05 12 TURBINES IN SERIES",
      desc: "Exhaust rotates 12 separate turbine wheels in series along shaft",
    },
    {
      id: "shaft",
      num: "06",
      pos: [-2.5, 6.0, 3.2],
      anchor: [-2.5, 0, 0],
      title: "06 COMMON SHAFT",
      desc: "Transmits rotational energy to generator",
    },
    {
      id: "deflector",
      num: "07",
      pos: [-4.0, 8.2, -3.2],
      anchor: [-4.0, 0, 0],
      title: "07 SLANTED DEFLECTOR",
      desc: "Redirects exhaust flow upward after turbine passage",
    },
    {
      id: "exhaustOutlet",
      num: "12",
      pos: [-4.2, 5.8, 3.8],
      anchor: [-4.2, 2.2, 0],
      title: "12 EXHAUST OUTLET",
      desc: "Vents de-energized exhaust out to atmosphere",
    },
    {
      id: "generator",
      num: "09",
      pos: [-8.5, 7.2, -3.2],
      anchor: [-8.5, 0, 0],
      title: "09 GENERATOR G",
      desc: "Converts rotational mechanical power into electricity",
    },
    {
      id: "bypassValve",
      num: "08",
      pos: [-0.25, -5.8, -2.5],
      anchor: [-0.25, -2.6, 0],
      title: "08 BYPASS VALVE",
      desc: "Controls alternate exhaust path to manage flow",
    },
    {
      id: "batteryPack",
      num: "11",
      pos: [-3.5, -6.8, 3.8],
      anchor: [-3.5, -3.5, 2.5],
      title: "11 BATTERY PACK",
      desc: "Stores electrical energy for vehicle systems",
    },
    {
      id: "powerElectronics",
      num: "10",
      pos: [-8.5, -6.2, 2.8],
      anchor: [-8.5, -3.2, 1.8],
      title: "10 POWER ELECTRONICS",
      desc: "Conditions and regulates electrical output",
    },
  ];

  return (
    <group>
      {/* Central Shaft Centerline Axis */}
      <Line
        points={[
          [16.5, 0, 0],
          [-11.0, 0, 0],
        ]}
        color="#38bdf8"
        lineWidth={2}
        dashed
        dashScale={2}
      />

      {/* Floating Glassmorphism Cards Pushed Far Away From Model */}
      {items.map((item) => (
        <group key={item.id}>
          {/* Cyan Leader Pointer Line */}
          <Line
            points={[item.pos, item.anchor]}
            color="#38bdf8"
            lineWidth={1.5}
          />

          {/* Anchor Sphere Pin on Model */}
          <mesh position={item.anchor}>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#38bdf8"
              emissiveIntensity={0.8}
            />
          </mesh>

          {/* Non-Overlapping Floating Glassmorphism Tag */}
          <group
            position={item.pos}
            onClick={(e) => {
              e.stopPropagation();
              setSelected(item.id);
            }}
          >
            <Html center distanceFactor={28}>
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/50 shadow-2xl text-left backdrop-blur-md pointer-events-auto cursor-pointer hover:border-cyan-400 hover:scale-105 transition-all max-w-[170px]">
                <div className="text-[10px] font-bold font-mono text-cyan-400 uppercase tracking-wider mb-0.5 whitespace-nowrap">
                  {item.title}
                </div>
                <div className="text-[9px] text-slate-300 leading-tight font-sans">
                  {item.desc}
                </div>
              </div>
            </Html>
          </group>
        </group>
      ))}
    </group>
  );
}
