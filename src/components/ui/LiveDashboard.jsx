import React, { useEffect } from "react";
import { useAppStore } from "../../store/useAppStore";
import { SIMULATION_PHASES } from "../../data/simulationPhases";
import { Play, Pause, RotateCcw, SkipForward, FastForward, Square } from "lucide-react";

export function LiveDashboard() {
  const isSimulating = useAppStore((state) => state.isSimulating);
  const isPaused = useAppStore((state) => state.isPaused);
  const currentPhaseIndex = useAppStore((state) => state.currentPhaseIndex);
  const nextPhase = useAppStore((state) => state.nextPhase);
  const pauseSimulation = useAppStore((state) => state.pauseSimulation);
  const resumeSimulation = useAppStore((state) => state.resumeSimulation);
  const startSimulation = useAppStore((state) => state.startSimulation);
  const stopSimulation = useAppStore((state) => state.stopSimulation);
  const simulationSpeed = useAppStore((state) => state.simulationSpeed);
  const setSimulationSpeed = useAppStore((state) => state.setSimulationSpeed);
  const incrementBatteryCharge = useAppStore((state) => state.incrementBatteryCharge);

  const currentPhase = SIMULATION_PHASES.find((p) => p.phaseIndex === currentPhaseIndex) || SIMULATION_PHASES[0];

  useEffect(() => {
    if (!isSimulating || isPaused) return;

    if (currentPhase.id === "battery_charging") {
      incrementBatteryCharge(0.5);
    }

    const durationMs = (currentPhase.duration * 1000) / simulationSpeed;
    const timer = setTimeout(() => {
      nextPhase();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [isSimulating, isPaused, currentPhaseIndex, simulationSpeed, currentPhase, nextPhase, incrementBatteryCharge]);

  if (!isSimulating) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[520px] max-w-[92vw] rounded-2xl bg-slate-900/95 border border-cyan-500/60 p-4 shadow-2xl backdrop-blur-xl pointer-events-auto">
      {/* Active Phase Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        <div>
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
            {currentPhase.title}
          </span>
          <div className="text-[11px] font-semibold font-sans text-slate-100">
            {currentPhase.subtitle}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-[9px] font-mono font-bold text-cyan-400">
            PHASE {currentPhaseIndex} OF {SIMULATION_PHASES.length}
          </span>
          <button
            onClick={stopSimulation}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
            title="Exit Simulation"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Component Narration Description Box */}
      <p className="text-xs text-slate-200 font-sans leading-relaxed mb-3">
        {currentPhase.narration}
      </p>

      {/* Phase Progress Bar */}
      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mb-3 border border-slate-800">
        <div
          className="bg-cyan-400 h-full transition-all duration-300 shadow-sm shadow-cyan-400"
          style={{ width: `${(currentPhaseIndex / SIMULATION_PHASES.length) * 100}%` }}
        />
      </div>

      {/* Simulation Controls & Speed Switcher */}
      <div className="flex items-center justify-between">
        {/* Playback Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={isPaused ? resumeSimulation : pauseSimulation}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold flex items-center gap-1.5 hover:bg-cyan-400 transition-all shadow-md active:scale-95"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            {isPaused ? "RESUME" : "PAUSE"}
          </button>
          <button
            onClick={startSimulation}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all active:scale-95"
            title="Restart Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={nextPhase}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all active:scale-95"
            title="Skip to Next Phase"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Simulation Speed Control Selector (Low / Normal / Fast / Ultra) */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-[10px]">
          <span className="text-slate-400 text-[9px] px-1 font-semibold flex items-center gap-1">
            <FastForward className="w-3 h-3 text-cyan-400" /> SPEED:
          </span>
          {[
            { spd: 0.5, label: "0.5x Low" },
            { spd: 1.0, label: "1x Normal" },
            { spd: 2.0, label: "2x Fast" },
            { spd: 3.0, label: "3x High" },
          ].map((item) => (
            <button
              key={item.spd}
              onClick={() => setSimulationSpeed(item.spd)}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                simulationSpeed === item.spd
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
