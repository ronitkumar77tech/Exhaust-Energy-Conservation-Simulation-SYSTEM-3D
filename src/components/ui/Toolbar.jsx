import React from "react";
import { useAppStore } from "../../store/useAppStore";
import { RotateCcw } from "lucide-react";

export function Toolbar() {
  const setPresetView = useAppStore((state) => state.setPresetView);
  const viewMode = useAppStore((state) => state.viewMode);
  const setViewMode = useAppStore((state) => state.setViewMode);

  return (
    <div className="absolute top-20 left-6 z-20 flex flex-col gap-2 pointer-events-auto">
      {/* Render Mode Selector */}
      <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/60 p-1 rounded-2xl backdrop-blur-xl shadow-xl font-mono text-[10px]">
        {["normal", "cutaway", "exploded"].map((m) => (
          <button
            key={m}
            onClick={() => setViewMode(m)}
            className={`px-3 py-1.5 rounded-xl uppercase transition-all ${
              viewMode === m
                ? "bg-cyan-500 text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Camera Views Selector */}
      <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/60 p-1 rounded-2xl backdrop-blur-xl shadow-xl font-mono text-[10px]">
        <button
          onClick={() => setPresetView("isometric")}
          className="p-1.5 rounded-xl bg-slate-800 text-cyan-400 hover:bg-slate-700 transition-all"
          title="Reset Camera"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        {["isometric", "front", "side", "top"].map((c) => (
          <button
            key={c}
            onClick={() => setPresetView(c)}
            className="px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-white capitalize transition-all"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
