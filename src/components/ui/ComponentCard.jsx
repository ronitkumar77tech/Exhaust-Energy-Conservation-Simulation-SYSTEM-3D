import React from "react";
import { useAppStore } from "../../store/useAppStore";
import { COMPONENTS_DATA } from "../../data/componentsData";
import { X, Cpu, Info } from "lucide-react";

export function ComponentCard() {
  const selectedId = useAppStore((state) => state.selectedComponentId);
  const setSelected = useAppStore((state) => state.setSelectedComponentId);

  if (!selectedId || !COMPONENTS_DATA[selectedId]) {
    return null;
  }

  const comp = COMPONENTS_DATA[selectedId];

  return (
    <div className="absolute top-20 right-6 z-30 w-80 rounded-2xl bg-slate-900/95 border border-cyan-500/50 p-4 shadow-2xl backdrop-blur-xl pointer-events-auto">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-2.5 mb-2.5">
        <div>
          <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
            {comp.category}
          </span>
          <h2 className="text-xs font-bold text-slate-100 font-sans mt-1 leading-snug">
            {comp.title}
          </h2>
        </div>
        <button
          onClick={() => setSelected(null)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Detailed Narration Description */}
      <p className="text-xs text-slate-200 font-sans leading-relaxed mb-3">
        {comp.description}
      </p>

      {/* Core Engineering Function */}
      <div className="mb-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
        <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1">
          <Cpu className="w-3 h-3" /> CORE FUNCTION
        </div>
        <p className="text-[11px] text-slate-300 font-sans leading-tight">
          {comp.coreFunction}
        </p>
      </div>

      {/* Technical Specifications */}
      {comp.specs && (
        <div>
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400" /> TECHNICAL SPECIFICATIONS
          </div>
          <div className="space-y-1 font-mono text-[10px]">
            {Object.entries(comp.specs).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400">{key}</span>
                <span className="text-cyan-300 font-bold">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
