// Registry of scene components that can be selected and transformed.
// pivot = the point a component rotates / scales about (its own mount centre).

export const COMPONENT_GROUPS = [
  "THERMAL SOURCE",
  "EXHAUST TRAIN",
  "TURBINE & SHAFT",
  "ELECTRICAL",
  "STRUCTURE",
];

export const EDITABLE_COMPONENTS = [
  { id: "engine", label: "01 Engine", group: "THERMAL SOURCE", pivot: [17.1, 0, 0] },
  { id: "exhaustPipe", label: "02 Exhaust Pipe", group: "EXHAUST TRAIN", pivot: [11.45, 0, 0] },
  { id: "mufflerChamber", label: "03 Muffler Chamber", group: "EXHAUST TRAIN", pivot: [7.25, 0, 0] },
  { id: "nozzle", label: "04 Nozzle", group: "EXHAUST TRAIN", pivot: [4.375, 0, 0] },
  { id: "deflector", label: "07 Deflector Plate", group: "EXHAUST TRAIN", pivot: [-4.0, 0, 0] },
  { id: "bypassValve", label: "08 Bypass Valve", group: "EXHAUST TRAIN", pivot: [0.5, -1.7, 0] },
  { id: "exhaustOutlet", label: "12 Exhaust Outlet", group: "EXHAUST TRAIN", pivot: [-4.2, 2.5, 0] },
  { id: "turbine", label: "05 Turbine Assembly", group: "TURBINE & SHAFT", pivot: [-0.25, 0, 0] },
  { id: "shaft", label: "06 Common Shaft", group: "TURBINE & SHAFT", pivot: [-1.65, 0, 0] },
  { id: "generator", label: "09 Generator", group: "ELECTRICAL", pivot: [-8.5, 0, 0] },
  { id: "powerElectronics", label: "10 Power Electronics", group: "ELECTRICAL", pivot: [-8.5, -3.2, 1.8] },
  { id: "batteryPack", label: "11 Battery Pack", group: "ELECTRICAL", pivot: [-3.5, -3.5, 2.5] },
  { id: "baseplate", label: "13 Baseplate", group: "STRUCTURE", pivot: [1.5, -2.4, 0] },
  { id: "vehicleChassis", label: "14 Vehicle Chassis", group: "STRUCTURE", pivot: [0, -2.5, 0] },
];

// Sub assemblies: selectable, but transformed through their parent component.
export const SUB_COMPONENTS = [
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `cylinder_${i + 1}`,
    label: `Cylinder C${i + 1}`,
    parentId: "engine",
  })),
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `turbine_t${i + 1}`,
    label: `Turbine Stage T${i + 1}`,
    parentId: "turbine",
  })),
];

const EDITABLE_MAP = new Map(EDITABLE_COMPONENTS.map((c) => [c.id, c]));
const SUB_MAP = new Map(SUB_COMPONENTS.map((c) => [c.id, c]));

export const EDITABLE_IDS = new Set(EDITABLE_MAP.keys());

export function getEditable(id) {
  return EDITABLE_MAP.get(id) || null;
}

export function getSubComponent(id) {
  return SUB_MAP.get(id) || null;
}

export function getParentComponentId(id) {
  const sub = SUB_MAP.get(id);
  return sub ? sub.parentId : EDITABLE_MAP.has(id) ? id : null;
}

export function getComponentLabel(id) {
  const edit = EDITABLE_MAP.get(id);
  if (edit) return edit.label;
  const sub = SUB_MAP.get(id);
  if (sub) return sub.label;
  return id;
}
