import React from "react";
import { Play, X, Zap } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

export function PresentationOverlay() {
  const isPresenting = useAppStore((state) => state.isPresenting);
  const setPresenting = useAppStore((state) => state.setPresenting);
  const isSimulating = useAppStore((state) => state.isSimulating);
  const startSimulation = useAppStore((state) => state.startSimulation);

  if (!isPresenting) return null;

  return (
    <div className="absolute inset-0 z-40 pointer-events-none flex flex-col justify-between p-8">
      {/* Top Presentation Header Banner */}
      <div className="pointer-events-auto flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-cyan-500/30 text-white max-w-3xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
            <Zap className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-white">
              EXHAUST ENERGY RECOVERY CONCEPT
            </h1>
            <p className="text-xs text-cyan-400 font-medium">
              Heavy-Duty Vehicle Waste Energy Recovery • Interactive Presentation Prototype
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isSimulating && (
            <button
              onClick={startSimulation}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START PRESENTATION</span>
            </button>
          )}

          <button
            onClick={() => setPresenting(false)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            title="Exit Presentation Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Subtle Watermark */}
      <div className="text-right text-xs font-semibold text-slate-400/80 tracking-wider uppercase">
        12-BLADE TURBINE • SHAFT DRIVE • GENERATOR G • BYPASS SYSTEM
      </div>
    </div>
  );
}
