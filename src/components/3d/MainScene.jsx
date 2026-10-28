import React, { useRef } from "react";
import * as THREE from "three";
import { ContactShadows } from "@react-three/drei";
import { FreeOrbitControls } from "./FreeOrbitControls";
import { Baseplate } from "./Baseplate";
import { EngineModel } from "./EngineModel";
import { ExhaustPipeModel } from "./ExhaustPipeModel";
import { MufflerChamberModel } from "./MufflerChamberModel";
import { NozzleModel } from "./NozzleModel";
import { TurbineModel } from "./TurbineModel";
import { ShaftModel } from "./ShaftModel";
import { DeflectorModel } from "./DeflectorModel";
import { BypassValveModel } from "./BypassValveModel";
import { GeneratorModel } from "./GeneratorModel";
import { PowerElectronicsModel } from "./PowerElectronicsModel";
import { BatteryModel } from "./BatteryModel";
import { ExhaustOutletModel } from "./ExhaustOutletModel";
import { ExhaustParticles } from "./ExhaustParticles";
import { EnergyFlowLines } from "./EnergyFlowLines";
import { VehicleChassis } from "./VehicleChassis";
import { DimensionCallouts } from "./DimensionCallouts";
import { HighlightAura } from "./HighlightAura";
import { CameraController } from "./CameraController";
import { EditableComponent } from "./EditableComponent";
import { TransformEditor } from "./TransformEditor";
import { TelemetryDashboard } from "./TelemetryDashboard";
import { useAppStore } from "../../store/useAppStore";
import { useEditStore } from "../../store/useEditStore";

export function MainScene() {
  const controlsRef = useRef();
  const setSelected = useAppStore((state) => state.setSelectedComponentId);
  const isTechnical = useAppStore((state) => state.isTechnicalMode);
  const showVehicleContext = useAppStore((state) => state.showVehicleContext);

  const handleBackgroundClick = () => {
    if (useAppStore.getState().isOrbiting) return;
    if (useEditStore.getState().isSelectionLocked()) return;
    setSelected(null);
  };

  return (
    <>
      <FreeOrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.07}
        minDistance={5}
        maxDistance={55}
        rotateSpeed={0.85}
        zoomSpeed={1.2}
        panSpeed={0.8}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
        onStart={() => {
          useAppStore.getState().setIsOrbiting(true);
        }}
        onEnd={() => {
          setTimeout(() => {
            useAppStore.getState().setIsOrbiting(false);
          }, 100);
        }}
      />

      <CameraController controlsRef={controlsRef} />

      <hemisphereLight skyColor="#38bdf8" groundColor="#020617" intensity={0.9} />
      <ambientLight intensity={isTechnical ? 0.6 : 0.85} />

      <directionalLight
        position={[25, 30, 25]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-25, -15, -20]} intensity={1.4} color="#94a3b8" />
      <directionalLight position={[0, 20, -25]} intensity={1.8} color="#38bdf8" />

      <pointLight position={[15.5, 3, 2]} intensity={2.5} color="#ea580c" />
      <pointLight position={[-0.25, 3, 2]} intensity={2.2} color="#00f0ff" />
      <pointLight position={[-8.5, 3, 2]} intensity={2.0} color="#2563eb" />
      <pointLight position={[-3.5, -2, 2.5]} intensity={2.0} color="#22c55e" />

      <ContactShadows
        position={[1.5, -2.6, 0]}
        opacity={0.8}
        scale={60}
        blur={2.0}
        far={15}
        color="#020617"
      />

      {/* Shared vehicle assembly parent: vehicle parts, telemetry board, and leads inherit the same transform. */}
      <group onClick={handleBackgroundClick} onPointerMissed={handleBackgroundClick}>
        <EditableComponent id="baseplate">
          <Baseplate />
        </EditableComponent>
        <EditableComponent id="engine">
          <EngineModel />
        </EditableComponent>
        <EditableComponent id="exhaustPipe">
          <ExhaustPipeModel />
        </EditableComponent>
        <EditableComponent id="mufflerChamber">
          <MufflerChamberModel />
        </EditableComponent>
        <EditableComponent id="nozzle">
          <NozzleModel />
        </EditableComponent>
        <EditableComponent id="turbine">
          <TurbineModel />
        </EditableComponent>
        <EditableComponent id="shaft">
          <ShaftModel />
        </EditableComponent>
        <EditableComponent id="deflector">
          <DeflectorModel />
        </EditableComponent>
        <EditableComponent id="bypassValve">
          <BypassValveModel />
        </EditableComponent>
        <EditableComponent id="generator">
          <GeneratorModel />
        </EditableComponent>
        <EditableComponent id="powerElectronics">
          <PowerElectronicsModel />
        </EditableComponent>
        <EditableComponent id="batteryPack">
          <BatteryModel />
        </EditableComponent>
        <EditableComponent id="exhaustOutlet">
          <ExhaustOutletModel />
        </EditableComponent>

        <ExhaustParticles />
        <EnergyFlowLines />
        <EditableComponent id="vehicleChassis" measureKey={showVehicleContext ? "on" : "off"}>
          <VehicleChassis />
        </EditableComponent>
        <DimensionCallouts />
        <HighlightAura />
        <TelemetryDashboard />
      </group>

      <TransformEditor />
    </>
  );
}
