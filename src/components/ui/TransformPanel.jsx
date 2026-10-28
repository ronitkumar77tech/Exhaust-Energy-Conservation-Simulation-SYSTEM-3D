import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ClipboardPaste,
  Copy,
  FolderOpen,
  Link2,
  Move3d,
  PencilRuler,
  Power,
  Redo2,
  Rotate3d,
  RotateCcw,
  Save,
  Scale3d,
  Search,
  Undo2,
  Unlink2,
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import {
  useEditStore,
  IDENTITY_TRANSFORM,
  MIN_SCALE,
  MAX_SCALE,
  isTransformModified,
} from "../../store/useEditStore";
import {
  COMPONENT_GROUPS,
  EDITABLE_COMPONENTS,
  SUB_COMPONENTS,
  getComponentLabel,
  getEditable,
  getParentComponentId,
  getSubComponent,
} from "../../data/editableComponents";
import { COMPONENTS_DATA } from "../../data/componentsData";

const AXIS_LABELS = ["X", "Y", "Z"];
const AXIS_CLASSES = ["text-rose-400", "text-emerald-400", "text-sky-400"];
const DEG = 180 / Math.PI;
const RAD = Math.PI / 180;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const fmt = (v) => String(Math.round(v * 1000) / 1000);

const inputClass =
  "w-full bg-slate-950/80 border border-slate-700/70 rounded-lg px-1.5 py-1 text-[10px] font-mono text-cyan-100 text-right focus:border-cyan-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

function NumberField({ value, step, min, max, onInput, onCommit }) {
  const [text, setText] = useState(null);
  const shown = text !== null ? text : fmt(value);

  const handleChange = (event) => {
    setText(event.target.value);
    const parsed = parseFloat(event.target.value);
    if (Number.isFinite(parsed)) onInput(clamp(parsed, min, max));
  };

  const handleBlur = () => {
    setText(null);
    onCommit();
  };

  return (
    <input
      type="number"
      value={shown}
      step={step}
      min={min}
      max={max}
      onChange={handleChange}
      onBlur={handleBlur}
      className={inputClass}
    />
  );
}

function AxisRow({ index, children }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 text-[10px] font-bold font-mono ${AXIS_CLASSES[index]}`}>
        {AXIS_LABELS[index]}
      </span>
      {children}
    </div>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[9px] font-bold font-mono text-cyan-400 uppercase tracking-wider">
        {children}
      </span>
      {right}
    </div>
  );
}

function IconButton({ title, disabled, onClick, children, accent }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`p-1.5 rounded-lg border transition-all ${
        disabled
          ? "bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed"
          : accent
            ? "bg-amber-950/70 border-amber-500/50 text-amber-300 hover:bg-amber-900/70"
            : "bg-slate-950/70 border-slate-700/70 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/60"
      }`}
    >
      {children}
    </button>
  );
}

export function TransformPanel() {
  const selectedId = useAppStore((state) => state.selectedComponentId);
  const setSelected = useAppStore((state) => state.setSelectedComponentId);
  const showVehicleContext = useAppStore((state) => state.showVehicleContext);
  const toggleVehicleContext = useAppStore((state) => state.toggleVehicleContext);

  const editMode = useEditStore((state) => state.editMode);
  const toggleEditMode = useEditStore((state) => state.toggleEditMode);
  const tool = useEditStore((state) => state.tool);
  const setTool = useEditStore((state) => state.setTool);
  const space = useEditStore((state) => state.space);
  const setSpace = useEditStore((state) => state.setSpace);
  const transforms = useEditStore((state) => state.transforms);
  const past = useEditStore((state) => state.past);
  const future = useEditStore((state) => state.future);
  const snapEnabled = useEditStore((state) => state.snapEnabled);
  const setSnapEnabled = useEditStore((state) => state.setSnapEnabled);
  const moveSnap = useEditStore((state) => state.moveSnap);
  const setMoveSnap = useEditStore((state) => state.setMoveSnap);
  const rotateSnapDeg = useEditStore((state) => state.rotateSnapDeg);
  const setRotateSnapDeg = useEditStore((state) => state.setRotateSnapDeg);
  const scaleSnap = useEditStore((state) => state.scaleSnap);
  const setScaleSnap = useEditStore((state) => state.setScaleSnap);
  const linkScale = useEditStore((state) => state.linkScale);
  const toggleLinkScale = useEditStore((state) => state.toggleLinkScale);

  const [collapsed, setCollapsed] = useState(true);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(() => new Set());
  const [confirmState, setConfirmState] = useState(null);
  const [flash, setFlash] = useState(null);
  const [savedInfo, setSavedInfo] = useState(null);

  const commitTimer = useRef(null);
  const flashTimer = useRef(null);

  const entry = selectedId ? getEditable(selectedId) : null;
  const sub = selectedId ? getSubComponent(selectedId) : null;
  const parentEntry = sub ? getEditable(sub.parentId) : null;
  const current = (selectedId && transforms[selectedId]) || IDENTITY_TRANSFORM;
  const modified = isTransformModified(transforms[selectedId]);
  const pivot = entry ? entry.pivot : [0, 0, 0];

  const fullName =
    (selectedId && COMPONENTS_DATA[selectedId] && COMPONENTS_DATA[selectedId].title) ||
    (selectedId ? getComponentLabel(selectedId) : null);

  const refreshSaved = () => setSavedInfo(useEditStore.getState().readSavedLayout());

  const showFlash = (message) => {
    setFlash(message);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 1600);
  };

  const commitNow = () => {
    if (commitTimer.current) {
      clearTimeout(commitTimer.current);
      commitTimer.current = null;
    }
    useEditStore.getState().endBatch();
  };

  const scheduleCommit = () => {
    if (commitTimer.current) clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(() => {
      commitTimer.current = null;
      useEditStore.getState().endBatch();
    }, 900);
  };

  const applyPatch = (patch) => {
    const state = useEditStore.getState();
    state.beginBatch("panel");
    state.updateTransform(selectedId, patch);
    scheduleCommit();
  };

  const selectComponent = (id) => {
    commitNow();
    setSelected(id);
    if (id === "vehicleChassis" && !showVehicleContext) toggleVehicleContext();
  };

  useEffect(() => {
    refreshSaved();
    return () => {
      if (commitTimer.current) clearTimeout(commitTimer.current);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      useEditStore.getState().endBatch();
    };
  }, []);

  useEffect(() => {
    commitNow();
  }, [selectedId]);

  useEffect(() => {
    const parentId = selectedId ? getParentComponentId(selectedId) : null;
    if (parentId && parentId !== selectedId) {
      setExpanded((prev) => (prev.has(parentId) ? prev : new Set(prev).add(parentId)));
    }
  }, [selectedId]);

  useEffect(() => {
    const handler = (event) => {
      const target = event.target;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      )
        return;
      const modifier = event.ctrlKey || event.metaKey;
      if (!modifier) {
        // Tool shortcuts: W = move, E = rotate, R = scale (Unity / SketchUp style)
        const shortcut = { w: "move", e: "rotate", r: "scale" }[event.key.toLowerCase()];
        if (shortcut) {
          const state = useEditStore.getState();
          if (state.editMode && state.tool !== shortcut) state.setTool(shortcut);
        }
        return;
      }
      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        useEditStore.getState().undo();
      } else if (key === "y" || (key === "z" && event.shiftKey)) {
        event.preventDefault();
        useEditStore.getState().redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const toggleExpanded = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setPositionAxis = (axis, value) => {
    // Inputs are absolute world coordinates; the stored transform is relative to the pivot
    const next = [...current.position];
    next[axis] = value - pivot[axis];
    applyPatch({ position: next });
  };

  const setRotationAxis = (axis, degrees) => {
    const next = [...current.rotation];
    next[axis] = clamp(degrees, -720, 720) * RAD;
    applyPatch({ rotation: next });
  };

  const setScaleAxis = (axis, value) => {
    const safe = clamp(value, MIN_SCALE, MAX_SCALE);
    const next = [...current.scale];
    if (linkScale) {
      next[0] = safe;
      next[1] = safe;
      next[2] = safe;
    } else {
      next[axis] = safe;
    }
    applyPatch({ scale: next });
  };

  const runResetSelected = () => {
    if (!selectedId) return;
    useEditStore.getState().resetComponent(selectedId);
    showFlash("COMPONENT RESET");
  };

  const runResetAll = () => {
    setConfirmState({
      title: "RESET ALL COMPONENTS",
      message:
        "Reset every component back to its original transform? Your current edits can still be recovered with Undo.",
      confirmLabel: "RESET ALL",
      action: () => {
        useEditStore.getState().resetAll();
        showFlash("ALL COMPONENTS RESET");
      },
    });
  };

  const runRestore = () => {
    setConfirmState({
      title: "RESTORE ORIGINAL LAYOUT",
      message:
        "Restore the original factory layout? This clears all current edits and removes the saved layout.",
      confirmLabel: "RESTORE",
      action: () => {
        useEditStore.getState().restoreOriginal();
        refreshSaved();
        showFlash("ORIGINAL LAYOUT RESTORED");
      },
    });
  };

  const runSave = () => {
    const savedAt = useEditStore.getState().saveLayout();
    if (savedAt) {
      refreshSaved();
      showFlash("LAYOUT SAVED");
    } else {
      showFlash("SAVE FAILED");
    }
  };

  const runLoad = () => {
    const ok = useEditStore.getState().loadSavedLayout();
    if (ok) {
      refreshSaved();
      showFlash("LAYOUT LOADED");
    } else {
      showFlash("NO SAVED LAYOUT");
    }
  };

  const groupedTree = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (label) => !q || label.toLowerCase().includes(q);
    return COMPONENT_GROUPS.map((group) => ({
      group,
      items: EDITABLE_COMPONENTS.filter((item) => item.group === group && matches(item.label)),
    })).filter((section) => section.items.length > 0);
  }, [query]);

  const toolButtons = [
    { id: "move", label: "MOVE", Icon: Move3d, hint: "W" },
    { id: "rotate", label: "ROTATE", Icon: Rotate3d, hint: "E" },
    { id: "scale", label: "SCALE", Icon: Scale3d, hint: "R" },
  ];

  const renderTreeRow = (item) => {
    const children = SUB_COMPONENTS.filter((child) => child.parentId === item.id).filter(
      (child) => !query.trim() || child.label.toLowerCase().includes(query.trim().toLowerCase())
    );
    const isExpanded = expanded.has(item.id) || (!!query.trim() && children.length > 0);
    const isSelected = selectedId === item.id;
    const isItemModified = isTransformModified(transforms[item.id]);

    return (
      <div key={item.id}>
        <div
          className={`group flex items-center gap-1 rounded-lg border px-1.5 py-1 cursor-pointer transition-all ${
            isSelected
              ? "bg-cyan-950/70 border-cyan-500/60 text-cyan-100"
              : "bg-slate-950/50 border-slate-800/80 text-slate-300 hover:border-slate-600 hover:text-slate-100"
          }`}
          onClick={() => selectComponent(item.id)}
        >
          {children.length > 0 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                toggleExpanded(item.id);
              }}
              className="text-slate-500 hover:text-cyan-300"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <span className="w-3" />
          )}
          <span className="flex-1 text-[10px] font-mono truncate">{item.label}</span>
          {isItemModified && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow shadow-amber-400/70" />
          )}
        </div>

        {isExpanded &&
          children.map((child) => {
            const childSelected = selectedId === child.id;
            const childModified = isTransformModified(transforms[child.id]);
            return (
              <div
                key={child.id}
                className={`ml-4 flex items-center gap-1 rounded-lg border px-1.5 py-1 cursor-pointer transition-all ${
                  childSelected
                    ? "bg-cyan-950/70 border-cyan-500/60 text-cyan-100"
                    : "bg-slate-950/30 border-slate-800/60 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                }`}
                onClick={() => selectComponent(child.id)}
              >
                <span className="flex-1 text-[9px] font-mono truncate">{child.label}</span>
                {childModified && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </div>
            );
          })}
      </div>
    );
  };

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="absolute top-20 left-6 max-md:top-auto max-md:bottom-6 max-md:left-4 z-30 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/95 border border-cyan-500/50 text-cyan-300 font-mono text-[10px] font-bold uppercase tracking-wider shadow-xl backdrop-blur-xl hover:bg-slate-800 transition-all pointer-events-auto"
      >
        <PencilRuler className="w-3.5 h-3.5" />
        Components
      </button>
    );
  }

  return (
    <div className="absolute top-20 left-6 max-md:top-auto max-md:bottom-16 max-md:left-3 z-30 w-[300px] max-w-[calc(100vw-1.5rem)] max-h-[calc(100vh-8rem)] flex flex-col rounded-2xl bg-slate-900/95 border border-cyan-500/50 shadow-2xl backdrop-blur-xl pointer-events-auto font-mono">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <PencilRuler className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] font-bold text-slate-100 uppercase tracking-wider">
            Component Editor
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleEditMode}
            title={editMode ? "Exit edit mode" : "Enter edit mode"}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-bold transition-all ${
              editMode
                ? "bg-amber-950/80 border-amber-500/60 text-amber-300"
                : "bg-slate-950/70 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Power className="w-3 h-3" />
            {editMode ? "ON" : "OFF"}
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            title="Collapse panel"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="px-3.5 py-2.5 overflow-y-auto flex-1 min-h-0">
        {/* Search */}
        <div className="relative mb-2">
          <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search components..."
            className="w-full bg-slate-950/80 border border-slate-700/70 rounded-lg pl-6 pr-2 py-1.5 text-[10px] text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* Component Hierarchy */}
        <div className="max-h-[176px] overflow-y-auto pr-0.5 space-y-2 mb-2.5">
          {groupedTree.length > 0 ? (
            groupedTree.map((section) => (
              <div key={section.group}>
                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1 px-0.5">
                  {section.group}
                </div>
                <div className="space-y-1">{section.items.map(renderTreeRow)}</div>
              </div>
            ))
          ) : (
            <div className="text-[10px] text-slate-500 text-center py-3">No components found</div>
          )}
        </div>

        {/* Selected Component */}
        <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-2.5 mb-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[8px] text-slate-500 uppercase tracking-widest mb-0.5">
                Selected
              </div>
              <div className="text-[11px] font-bold text-slate-100 font-sans leading-snug break-words">
                {fullName || "Nothing selected"}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {modified && (
                <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500/50 text-[8px] font-bold text-amber-300 uppercase tracking-wider">
                  Modified
                </span>
              )}
              {sub && (
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                  Sub-part
                </span>
              )}
            </div>
          </div>

          {sub && parentEntry && (
            <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-slate-900/80 border border-slate-800 px-2 py-1.5">
              <span className="text-[9px] text-slate-400 leading-tight">
                Part of {parentEntry.label} — transform the assembly
              </span>
              <button
                type="button"
                onClick={() => selectComponent(parentEntry.id)}
                className="shrink-0 px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/50 text-[8px] font-bold text-cyan-300 hover:bg-cyan-900 transition-all"
              >
                SELECT
              </button>
            </div>
          )}
        </div>

        {/* Transform Tools */}
        {editMode && entry && (
          <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-2.5 mb-2.5">
            <SectionTitle
              right={
                tool !== "scale" ? (
                  <button
                    type="button"
                    onClick={() => setSpace(space === "world" ? "local" : "world")}
                    className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[8px] font-bold text-slate-300 hover:text-cyan-300 transition-all uppercase"
                  >
                    {space}
                  </button>
                ) : null
              }
            >
              Transform
            </SectionTitle>

            <div className="flex items-stretch gap-1.5 mb-2.5">
              {toolButtons.map(({ id, label, Icon, hint }) => (
                <button
                  key={id}
                  type="button"
                  title={`${label} tool (${hint})`}
                  onClick={() => setTool(id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl border text-[8px] font-bold transition-all ${
                    tool === id
                      ? "bg-amber-950/80 border-amber-500/60 text-amber-200 shadow-md"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {tool === "move" && (
              <div className="space-y-1.5">
                {AXIS_LABELS.map((axis, index) => (
                  <AxisRow key={axis} index={index}>
                    <NumberField
                      value={pivot[index] + current.position[index]}
                      step={snapEnabled && moveSnap > 0 ? moveSnap : 0.1}
                      min={-500}
                      max={500}
                      onInput={(value) => setPositionAxis(index, value)}
                      onCommit={commitNow}
                    />
                  </AxisRow>
                ))}
              </div>
            )}

            {tool === "rotate" && (
              <div className="space-y-1.5">
                {AXIS_LABELS.map((axis, index) => (
                  <AxisRow key={axis} index={index}>
                    <NumberField
                      value={current.rotation[index] * DEG}
                      step={snapEnabled && rotateSnapDeg > 0 ? rotateSnapDeg : 1}
                      min={-720}
                      max={720}
                      onInput={(value) => setRotationAxis(index, value)}
                      onCommit={commitNow}
                    />
                  </AxisRow>
                ))}
              </div>
            )}

            {tool === "scale" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest">
                    {linkScale ? "Uniform scale" : "Independent axes"}
                  </span>
                  <button
                    type="button"
                    onClick={toggleLinkScale}
                    title={linkScale ? "Unlink axes" : "Link axes"}
                    className={`p-1 rounded-lg border transition-all ${
                      linkScale
                        ? "bg-amber-950/70 border-amber-500/60 text-amber-300"
                        : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {linkScale ? <Link2 className="w-3 h-3" /> : <Unlink2 className="w-3 h-3" />}
                  </button>
                </div>
                {AXIS_LABELS.map((axis, index) => (
                  <AxisRow key={axis} index={index}>
                    <NumberField
                      value={current.scale[index]}
                      step={snapEnabled && scaleSnap > 0 ? scaleSnap : 0.05}
                      min={MIN_SCALE}
                      max={MAX_SCALE}
                      onInput={(value) => setScaleAxis(index, value)}
                      onCommit={commitNow}
                    />
                  </AxisRow>
                ))}
              </div>
            )}

            {/* Current Transform Readout */}
            <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-1 text-[9px]">
              <div className="flex items-center gap-1.5">
                <span className="w-8 text-slate-500 uppercase">POS</span>
                <span className="flex-1 text-slate-300 text-right">
                  {fmt(pivot[0] + current.position[0])}, {fmt(pivot[1] + current.position[1])},{" "}
                  {fmt(pivot[2] + current.position[2])}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-8 text-slate-500 uppercase">ROT</span>
                <span className="flex-1 text-slate-300 text-right">
                  {fmt(current.rotation[0] * DEG)}°, {fmt(current.rotation[1] * DEG)}°,{" "}
                  {fmt(current.rotation[2] * DEG)}°
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-8 text-slate-500 uppercase">SCL</span>
                <span className="flex-1 text-slate-300 text-right">
                  {fmt(current.scale[0])}, {fmt(current.scale[1])}, {fmt(current.scale[2])}
                </span>
              </div>
            </div>

            {/* Snapping */}
            <div className="mt-2.5 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  Snapping
                </span>
                <label className="flex items-center gap-1 text-[9px] text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={snapEnabled}
                    onChange={(event) => setSnapEnabled(event.target.checked)}
                    className="w-3 h-3 accent-cyan-500"
                  />
                  SNAP
                </label>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <label className="flex flex-col gap-0.5">
                  <span className="text-[8px] text-slate-500">MOVE Δ</span>
                  <select
                    value={moveSnap}
                    onChange={(event) => setMoveSnap(parseFloat(event.target.value))}
                    disabled={!snapEnabled}
                    className="w-full bg-slate-950/80 border border-slate-700/70 rounded-lg px-1 py-1 text-[9px] text-cyan-200 focus:border-cyan-400 focus:outline-none disabled:opacity-40"
                  >
                    {[0.1, 0.25, 0.5, 1].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-0.5">
                  <span className="text-[8px] text-slate-500">ROT °</span>
                  <select
                    value={rotateSnapDeg}
                    onChange={(event) => setRotateSnapDeg(parseFloat(event.target.value))}
                    disabled={!snapEnabled}
                    className="w-full bg-slate-950/80 border border-slate-700/70 rounded-lg px-1 py-1 text-[9px] text-cyan-200 focus:border-cyan-400 focus:outline-none disabled:opacity-40"
                  >
                    {[1, 5, 15, 45].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-0.5">
                  <span className="text-[8px] text-slate-500">SCALE</span>
                  <select
                    value={scaleSnap}
                    onChange={(event) => setScaleSnap(parseFloat(event.target.value))}
                    disabled={!snapEnabled}
                    className="w-full bg-slate-950/80 border border-slate-700/70 rounded-lg px-1 py-1 text-[9px] text-cyan-200 focus:border-cyan-400 focus:outline-none disabled:opacity-40"
                  >
                    {[0.05, 0.1, 0.25].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>
        )}

        {!editMode && (
          <button
            type="button"
            onClick={toggleEditMode}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 mb-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 text-[10px] font-bold uppercase tracking-wider hover:from-amber-400 hover:to-orange-500 transition-all active:scale-95"
          >
            <Power className="w-3.5 h-3.5" />
            Enable Edit Mode
          </button>
        )}

        {editMode && !entry && (
          <div className="mb-2.5 rounded-xl bg-slate-950/70 border border-dashed border-slate-700 p-2.5 text-[9px] text-slate-400 text-center">
            Select a full component to activate the transform tools.
          </div>
        )}

        {/* History & Layout Actions */}
        <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-2.5">
          <SectionTitle>History & Layout</SectionTitle>

          <div className="flex items-center gap-1.5 mb-2">
            <IconButton title="Undo (Ctrl+Z)" disabled={past.length === 0} onClick={() => useEditStore.getState().undo()}>
              <Undo2 className="w-3.5 h-3.5" />
            </IconButton>
            <IconButton title="Redo (Ctrl+Y)" disabled={future.length === 0} onClick={() => useEditStore.getState().redo()}>
              <Redo2 className="w-3.5 h-3.5" />
            </IconButton>
            <IconButton
              title="Copy transform"
              disabled={!selectedId}
              onClick={() => {
                useEditStore.getState().copyComponent(selectedId);
                showFlash("TRANSFORM COPIED");
              }}
            >
              <Copy className="w-3.5 h-3.5" />
            </IconButton>
            <IconButton
              title="Paste transform"
              disabled={!selectedId}
              onClick={() => {
                useEditStore.getState().pasteComponent(selectedId);
                showFlash("TRANSFORM PASTED");
              }}
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
            </IconButton>
            <IconButton
              title="Reset selected component"
              accent
              disabled={!selectedId || !modified}
              onClick={runResetSelected}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </IconButton>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={runSave}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[9px] font-bold text-slate-200 hover:border-cyan-500/60 hover:text-cyan-300 transition-all uppercase"
            >
              <Save className="w-3 h-3" /> Save Layout
            </button>
            <button
              type="button"
              onClick={runLoad}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[9px] font-bold text-slate-200 hover:border-cyan-500/60 hover:text-cyan-300 transition-all uppercase"
            >
              <FolderOpen className="w-3 h-3" /> Load Layout
            </button>
            <button
              type="button"
              onClick={runResetAll}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[9px] font-bold text-slate-200 hover:border-amber-500/60 hover:text-amber-300 transition-all uppercase"
            >
              <RotateCcw className="w-3 h-3" /> Reset All
            </button>
            <button
              type="button"
              onClick={runRestore}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[9px] font-bold text-slate-200 hover:border-rose-500/60 hover:text-rose-300 transition-all uppercase"
            >
              <Power className="w-3 h-3" /> Restore
            </button>
          </div>

          <div className="mt-2 text-[8px] text-slate-500 uppercase tracking-wider text-center h-3">
            {flash
              ? flash
              : savedInfo && savedInfo.savedAt
                ? `Saved layout · ${new Date(savedInfo.savedAt).toLocaleString()}`
                : "No saved layout"}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm px-4">
          <div className="w-full max-w-[340px] rounded-2xl bg-slate-900 border border-amber-500/50 p-4 shadow-2xl">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2 font-sans">
              {confirmState.title}
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-4 font-sans">
              {confirmState.message}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300 hover:bg-slate-700 transition-all uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmState.action();
                  setConfirmState(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 text-[10px] font-bold hover:from-amber-400 hover:to-orange-500 transition-all uppercase active:scale-95"
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
