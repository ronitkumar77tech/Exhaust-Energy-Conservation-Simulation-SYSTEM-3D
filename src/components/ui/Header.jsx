import React from "react";
import { useAppStore } from "../../store/useAppStore";
import { useEditStore } from "../../store/useEditStore";
import { Play, Pause, Compass, Truck, PencilRuler } from "lucide-react";

export function Header() {
  const isSimulating = useAppStore((state) => state.isSimulating);
  const isPaused = useAppStore((state) => state.isPaused);
  const startSimulation = useAppStore((state) => state.startSimulation);
  const pauseSimulation = useAppStore((state) => state.pauseSimulation);
  const resumeSimulation = useAppStore((state) => state.resumeSimulation);

  const isTechnicalMode = useAppStore((state) => state.isTechnicalMode);
  const toggleTechnicalMode = useAppStore((state) => state.toggleTechnicalMode);
  const showVehicleContext = useAppStore((state) => state.showVehicleContext);
  const toggleVehicleContext = useAppStore((state) => state.toggleVehicleContext);

  const editMode = useEditStore((state) => state.editMode);
  const toggleEditMode = useEditStore((state) => state.toggleEditMode);

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-b from-slate-950/85 via-slate-950/40 to-transparent backdrop-blur-md pointer-events-none gap-2">
      {/* App Title */}
      <div className="pointer-events-auto shrink-0">
        <h1 className="font-sans text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-slate-100 uppercase">
          EXHAUST ENERGY RECOVERY
        </h1>
        <p className="hidden md:block text-[11px] font-mono text-slate-400">
          Interactive 3D Heavy-Duty Vehicle Concept
        </p>
      </div>

      {/* SIMULATE PROCESS Button */}
      <div className="pointer-events-auto shrink-0">
        {!isSimulating ? (
          <button
            onClick={startSimulation}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-sans font-bold text-[10px] sm:text-xs tracking-wider uppercase shadow-xl shadow-cyan-500/30 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
            <span className="hidden sm:inline">SIMULATE PROCESS</span>
            <span className="sm:hidden">SIMULATE</span>
          </button>
        ) : (
          <button
            onClick={isPaused ? resumeSimulation : pauseSimulation}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans font-bold text-[10px] sm:text-xs tracking-wider uppercase shadow-xl shadow-amber-500/30 transition-all active:scale-95"
          >
            <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
            {isPaused ? "RESUME" : "PAUSE"}
          </button>
        )}
      </div>

      {/* Toggles: TECHNICAL MODE, VEHICLE VIEW, EDIT MODE */}
      <div className="flex items-center gap-1 sm:gap-2 pointer-events-auto font-mono text-[10px] sm:text-xs shrink-0">
        <button
          onClick={toggleTechnicalMode}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border transition-all ${
            isTechnicalMode
              ? "bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-md"
              : "bg-slate-900/80 border-slate-700/60 text-slate-300 hover:bg-slate-800"
          }`}
          title="Toggle Technical Mode"
        >
          <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
          <span className="hidden md:inline">TECHNICAL MODE</span>
          <span className="md:hidden">TECH</span>
        </button>

        <button
          onClick={toggleVehicleContext}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border transition-all ${
            showVehicleContext
              ? "bg-indigo-950/80 border-indigo-500/50 text-indigo-300 shadow-md"
              : "bg-slate-900/80 border-slate-700/60 text-slate-300 hover:bg-slate-800"
          }`}
          title="Toggle Vehicle View"
        >
          <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400" />
          <span className="hidden md:inline">VEHICLE VIEW</span>
          <span className="md:hidden">VEHICLE</span>
        </button>

        <button
          onClick={toggleEditMode}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border transition-all ${
            editMode
              ? "bg-amber-950/80 border-amber-500/50 text-amber-300 shadow-md"
              : "bg-slate-900/80 border-slate-700/60 text-slate-300 hover:bg-slate-800"
          }`}
          title="Toggle component editing tools"
        >
          <PencilRuler className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
          <span className="hidden md:inline">EDIT MODE</span>
          <span className="md:hidden">EDIT</span>
        </button>
      </div>
    </header>
  );
}
