import React from "react";
import { Plus, Minus, RotateCcw } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

export function ViewportControls() {
  const triggerZoomIn = useAppStore((state) => state.triggerZoomIn);
  const triggerZoomOut = useAppStore((state) => state.triggerZoomOut);
  const resetCameraView = useAppStore((state) => state.resetCameraView);

  return (
    <div
      className="viewport-controls-dock absolute bottom-6 right-6 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl pointer-events-auto font-mono text-xs select-none"
      role="toolbar"
      aria-label="3D Viewport Navigation Controls"
    >
      {/* Zoom In Button */}
      <button
        type="button"
        onClick={triggerZoomIn}
        className="viewport-btn group relative flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all duration-200 active:scale-90 shadow-md"
        title="Zoom In"
        aria-label="Zoom In"
      >
        <Plus className="w-4 h-4 transition-transform group-hover:scale-110" strokeWidth={2.5} />
        <span className="control-tooltip pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/95 border border-cyan-500/50 text-[10px] text-cyan-200 font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
          Zoom In
        </span>
      </button>

      {/* Zoom Out Button */}
      <button
        type="button"
        onClick={triggerZoomOut}
        className="viewport-btn group relative flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all duration-200 active:scale-90 shadow-md"
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <Minus className="w-4 h-4 transition-transform group-hover:scale-110" strokeWidth={2.5} />
        <span className="control-tooltip pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/95 border border-cyan-500/50 text-[10px] text-cyan-200 font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
          Zoom Out
        </span>
      </button>

      <div className="w-[1px] h-5 bg-slate-700/60 mx-0.5" aria-hidden="true" />

      {/* Reset View Button */}
      <button
        type="button"
        onClick={resetCameraView}
        className="viewport-btn group relative flex items-center gap-1.5 px-2.5 h-8 rounded-xl bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 font-bold text-[10px] tracking-wider transition-all duration-200 active:scale-90 shadow-md"
        title="Reset View"
        aria-label="Reset View"
      >
        <RotateCcw className="w-3.5 h-3.5 transition-transform group-hover:-rotate-90 duration-300" strokeWidth={2.2} />
        <span>RESET VIEW</span>
        <span className="control-tooltip pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/95 border border-cyan-500/50 text-[10px] text-cyan-200 font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
          Reset View
        </span>
      </button>
    </div>
  );
}
