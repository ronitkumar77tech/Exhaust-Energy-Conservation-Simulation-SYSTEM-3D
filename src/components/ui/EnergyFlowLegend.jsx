import React from "react";
import { useAppStore } from "../../store/useAppStore";
import { ArrowRight } from "lucide-react";

export function EnergyFlowLegend() {
  const isPresentationMode = useAppStore((state) => state.isPresentationMode);
  const isEnergyFlowVisible = useAppStore((state) => state.isEnergyFlowVisible);

  if (isPresentationMode || !isEnergyFlowVisible) return null;

  return (
    <div className="absolute top-20 right-4 z-20 w-52 rounded-2xl bg-slate-900/90 border border-slate-700/60 p-3 shadow-2xl backdrop-blur-xl pointer-events-auto">
      <div className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 border-b border-slate-800 pb-1">
        ENERGY FLOW
      </div>
      <div className="space-y-1.5 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <ArrowRight className="w-3.5 h-3.5 text-red-500" />
          <span className="text-slate-200">Exhaust Energy</span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-slate-200">Mechanical Energy</span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowRight className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-slate-200">Electrical Energy</span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-slate-200">Stored Energy</span>
        </div>
      </div>
    </div>
  );
}
