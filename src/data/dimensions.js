// Centralized Engineering Dimensions Configuration
// Extended multi-stage series turbine housing for 12 separate turbine wheels in series

// 08 Bypass Valve & Pipe — shared by the "bypass" key (used by the model) and the
// selectable component id "bypassValve" (used by highlight / camera focus).
const BYPASS_VALVE_DIMS = {
  inletPos: [5.8, -1.8, 0],
  outletPos: [-4.8, -1.8, 0],
  valveBodyPos: [-0.25, -2.6, 0],
  pipeRadius: 0.38,
  valveDiscRadius: 0.36,
};

export const SYSTEM_DIMENSIONS = {
  // Overall System Metrics
  overallLength: 26.5,
  overallWidth: 6.0,
  overallHeight: 7.0,

  // 01 Engine / Combustion Source
  engine: {
    position: [15.5, 0, 0],
    width: 3.2,
    height: 3.8,
    depth: 3.2,
    exhaustPortDiameter: 1.2,
  },

  // 02 Main Exhaust Pipe
  exhaustPipe: {
    startX: 13.9,
    endX: 9.0,
    radius: 0.65,
    wallThickness: 0.08,
  },

  // 03 Exhaust / Muffler Chamber
  mufflerChamber: {
    position: [7.25, 0, 0],
    length: 3.5,
    radiusY: 2.2,
    radiusZ: 1.8,
    outerThickness: 0.12,
  },

  // 04 High-Velocity Exhaust Nozzle
  nozzle: {
    startX: 5.5,
    endX: 3.25,
    inletRadius: 1.8,
    outletRadius: 0.85,
    length: 2.25,
  },

  // 05 12-Stage Series Turbine Assembly
  turbine: {
    position: [-0.25, 0, 0],
    bladeCount: 12, // EXACTLY 12 SEPARATE TURBINES IN SERIES
    hubRadius: 0.45,
    bladeLength: 1.25,
    bladeWidth: 0.35,
    bladeThickness: 0.08,
    housingRadius: 1.85,
    housingLength: 7.0, // Extended housing to fit 12 individual turbine wheels in series
  },

  // 06 Common Shaft
  shaft: {
    startX: 6.5,
    endX: -9.8,
    radius: 0.18,
    material: "Machined Steel Alloy",
  },

  // 07 Slanted Exhaust Deflector Sheet
  deflector: {
    position: [-4.0, 0, 0],
    angleDegrees: 52,
    width: 3.4,
    height: 4.2,
    thickness: 0.1,
  },

  // 08 Bypass Valve & Pipe
  bypass: BYPASS_VALVE_DIMS,
  bypassValve: BYPASS_VALVE_DIMS,

  // 09 Electrical Generator
  generator: {
    position: [-8.5, 0, 0],
    length: 3.2,
    radius: 1.75,
    statorFins: 16,
  },

  // 10 Power Electronics Module
  powerElectronics: {
    position: [-8.5, -3.2, 1.8],
    width: 2.2,
    height: 1.4,
    depth: 1.8,
  },

  // 11 Vehicle Battery Pack
  batteryPack: {
    position: [-3.5, -3.5, 2.5],
    width: 4.5,
    height: 1.6,
    depth: 3.0,
    cells: 48,
  },

  // 12 Exhaust Outlet
  exhaustOutlet: {
    position: [-4.2, 2.5, 0],
    radius: 0.85,
    length: 1.8,
  },

  // 13 Mounting Baseplate
  baseplate: {
    position: [1.5, -2.4, 0],
    width: 28.5,
    height: 0.35,
    depth: 7.5,
  },

  // 14 Vehicle Chassis Context
  vehicleChassis: {
    position: [3, -0.5, 0],
    width: 33,
    height: 9.5,
    depth: 6,
  },
};
