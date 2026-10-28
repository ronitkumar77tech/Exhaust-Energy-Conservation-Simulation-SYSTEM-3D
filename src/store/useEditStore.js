import { create } from "zustand";

export const IDENTITY_TRANSFORM = Object.freeze({
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
});

export const MIN_SCALE = 0.05;
export const MAX_SCALE = 20;
export const MAX_HISTORY = 100;
export const LAYOUT_STORAGE_KEY = "exhaust-energy-recovery-layout-v1";

const ZERO3 = [0, 0, 0];
const ONE3 = [1, 1, 1];

const round6 = (v) => Math.round(v * 1e6) / 1e6;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const cleanNumber = (v, fallback) => (Number.isFinite(v) ? round6(v) : fallback);

const cleanVector = (v, fallback) => {
  if (!Array.isArray(v)) return [...fallback];
  return fallback.map((base, i) => cleanNumber(v[i], base));
};

export const cloneTransform = (t) => ({
  position: [...t.position],
  rotation: [...t.rotation],
  scale: [...t.scale],
});

export const cloneTransforms = (map) => {
  const out = {};
  Object.keys(map).forEach((key) => {
    out[key] = cloneTransform(map[key]);
  });
  return out;
};

export const sanitizeTransform = (t) => {
  if (!t || typeof t !== "object") return null;
  const position = cleanVector(t.position, ZERO3);
  const rotation = cleanVector(t.rotation, ZERO3);
  const scale = cleanVector(t.scale, ONE3).map((v) => round6(clamp(v, MIN_SCALE, MAX_SCALE)));
  return { position, rotation, scale };
};

export const isIdentityTransform = (t) => {
  if (!t) return true;
  return (
    t.position.every((v) => v === 0) &&
    t.rotation.every((v) => v === 0) &&
    t.scale.every((v) => v === 1)
  );
};

export const isTransformModified = (t) => !!t && !isIdentityTransform(t);

const sanitizeLayout = (components) => {
  if (!components || typeof components !== "object") return null;
  const out = {};
  let count = 0;
  Object.keys(components).forEach((id) => {
    const clean = sanitizeTransform(components[id]);
    if (clean && !isIdentityTransform(clean)) {
      out[id] = clean;
      count += 1;
    }
  });
  return count > 0 ? out : null;
};

export const useEditStore = create((set, get) => ({
  editMode: false,
  tool: "move",
  space: "world",
  snapEnabled: false,
  moveSnap: 0.5,
  rotateSnapDeg: 5,
  scaleSnap: 0.1,
  linkScale: true,

  transforms: {},
  past: [],
  future: [],
  batch: null,
  clipboard: null,
  suppressClickUntil: 0,

  targets: {},
  isDragging: false,

  toggleEditMode: () => {
    get().endBatch();
    set((s) => ({ editMode: !s.editMode, isDragging: false }));
  },
  setEditMode: (v) => {
    get().endBatch();
    set({ editMode: !!v, isDragging: false });
  },
  setTool: (tool) => set({ tool }),
  setSpace: (space) => set({ space }),
  setSnapEnabled: (v) => set({ snapEnabled: !!v }),
  setMoveSnap: (v) => set({ moveSnap: v }),
  setRotateSnapDeg: (v) => set({ rotateSnapDeg: v }),
  setScaleSnap: (v) => set({ scaleSnap: v }),
  toggleLinkScale: () => set((s) => ({ linkScale: !s.linkScale })),

  registerTarget: (id, object) =>
    set((s) => ({ targets: { ...s.targets, [id]: object } })),
  unregisterTarget: (id) =>
    set((s) => {
      if (!s.targets[id]) return {};
      const targets = { ...s.targets };
      delete targets[id];
      return { targets };
    }),

  setDragging: (v) => set({ isDragging: !!v }),
  setSuppressClicks: (ms) => set({ suppressClickUntil: Date.now() + ms }),
  isClickSuppressed: () => Date.now() < get().suppressClickUntil,
  isSelectionLocked: () => {
    const state = get();
    return state.isDragging || Date.now() < state.suppressClickUntil;
  },

  beginBatch: (label) => {
    if (get().batch) return;
    set({ batch: { label, transforms: cloneTransforms(get().transforms) }, future: [] });
  },

  endBatch: () => {
    const batch = get().batch;
    if (!batch) return;
    set((s) => ({
      past: [...s.past, batch.transforms].slice(-MAX_HISTORY),
      batch: null,
    }));
  },

  updateTransform: (id, patch) =>
    set((s) => {
      const next = {
        position: cleanVector(patch.position, ZERO3),
        rotation: cleanVector(patch.rotation, ZERO3),
        scale: cleanVector(patch.scale, ONE3).map((v) => round6(clamp(v, MIN_SCALE, MAX_SCALE))),
      };
      const base = s.transforms[id];
      if (base) {
        if (!patch.position) next.position = base.position;
        if (!patch.rotation) next.rotation = base.rotation;
        if (!patch.scale) next.scale = base.scale;
      }
      const transforms = { ...s.transforms };
      if (isIdentityTransform(next)) delete transforms[id];
      else transforms[id] = next;
      return { transforms, future: s.future.length ? [] : s.future };
    }),

  setTransform: (id, transform) => get().updateTransform(id, transform),

  undo: () => {
    get().endBatch();
    const { past, future, transforms } = get();
    if (!past.length) return;
    const target = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      future: [...future, cloneTransforms(transforms)].slice(-MAX_HISTORY),
      transforms: cloneTransforms(target),
    });
  },

  redo: () => {
    const { past, future, transforms } = get();
    if (!future.length) return;
    const target = future[future.length - 1];
    set({
      future: future.slice(0, -1),
      past: [...past, cloneTransforms(transforms)].slice(-MAX_HISTORY),
      transforms: cloneTransforms(target),
    });
  },

  resetComponent: (id) => {
    const store = get();
    store.beginBatch("reset");
    store.updateTransform(id, {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    });
    store.endBatch();
  },

  resetAll: () => {
    const store = get();
    store.beginBatch("reset-all");
    set({ transforms: {} });
    store.endBatch();
  },

  copyComponent: (id) => {
    const current = get().transforms[id];
    set({ clipboard: current ? cloneTransform(current) : cloneTransform(IDENTITY_TRANSFORM) });
  },

  pasteComponent: (id) => {
    const clipboard = get().clipboard;
    if (!clipboard) return;
    const store = get();
    store.beginBatch("paste");
    store.updateTransform(id, cloneTransform(clipboard));
    store.endBatch();
  },

  saveLayout: () => {
    try {
      const components = cloneTransforms(get().transforms);
      const savedAt = new Date().toISOString();
      window.localStorage.setItem(
        LAYOUT_STORAGE_KEY,
        JSON.stringify({ version: 1, savedAt, components })
      );
      return savedAt;
    } catch {
      return null;
    }
  },

  readSavedLayout: () => {
    try {
      const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.version !== 1) return null;
      return { savedAt: data.savedAt || null, count: Object.keys(sanitizeLayout(data.components) || {}).length };
    } catch {
      return null;
    }
  },

  loadSavedLayout: () => {
    try {
      const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || data.version !== 1 || !data.components || typeof data.components !== "object") {
        return false;
      }
      // A valid payload whose entries all sanitize to identity means the original
      // layout was saved — restore that as an empty transform map.
      const layout = sanitizeLayout(data.components) || {};
      const store = get();
      store.beginBatch("load");
      set({ transforms: layout });
      store.endBatch();
      return true;
    } catch {
      return false;
    }
  },

  clearSavedLayout: () => {
    try {
      window.localStorage.removeItem(LAYOUT_STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  },

  restoreOriginal: () => {
    const store = get();
    store.beginBatch("restore");
    set({ transforms: {} });
    store.endBatch();
    store.clearSavedLayout();
  },
}));
