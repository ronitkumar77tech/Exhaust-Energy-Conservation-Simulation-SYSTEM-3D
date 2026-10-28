import React, { useEffect } from "react";
import { useAppStore } from "../../store/useAppStore";
import { SIMULATION_PHASES } from "../../data/simulationPhases";
import { Play, Pause, SkipForward, RotateCcw, FastForward } from "lucide-react";

export function SimulationBar() {
  const isSimulating = useAppStore((state) => state.isSimulating);
  const isPaused = useAppStore((state) => state.isPaused);
  const currentPhaseIndex = useAppStore((state) => state.currentPhaseIndex);
  const nextPhase = useAppStore((state) => state.nextPhase);
  const prevPhase = useAppStore((state) => state.prevPhase);
  const pauseSimulation = useAppStore((state) => state.pauseSimulation);
  const resumeSimulation = useAppStore((state) => state.resumeSimulation);
  const startSimulation = useAppStore((state) => state.startSimulation);
  const stopSimulation = useAppStore((state) => state.stopSimulation);
  const jumpToPhase = useAppStore((state) => state.jumpToPhase);
  const isPresentationMode = useAppStore((state) => state.isPresentationMode);
  const simulationSpeed = useAppStore((state) => state.simulationSpeed);
  const setSimulationSpeed = useAppStore((state) => state.setSimulationSpeed);
  const incrementBatteryCharge = useAppStore((state) => state.incrementBatteryCharge);

  const currentPhase = SIMULATION_PHASES.find((p) => p.phaseIndex === currentPhaseIndex) || SIMULATION_PHASES[0];

  // Automatic phase progression timer during active simulation
  useEffect(() => {
    if (!isSimulating || isPaused) return;

    // Increment battery SOC during battery phase
    if (currentPhase.id === "battery_charging") {
      incrementBatteryCharge(0.4);
    }

    const durationMs = (currentPhase.duration * 1000) / simulationSpeed;
    const timer = setTimeout(() => {
      nextPhase();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [isSimulating, isPaused, currentPhaseIndex, simulationSpeed, currentPhase, nextPhase, incrementBatteryCharge]);

  if (!isSimulating && !isPresentationMode) return null;

  return (
    <div className="absolute bottom-4 right-4 z-20 w-[420px] rounded-2xl bg-slate-900/95 border border-slate-700/80 p-4 shadow-2xl backdrop-blur-xl pointer-events-auto">
      {/* Active Phase Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
        <div>
          <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
            {currentPhase.title}
          </span>
          <h3 className="text-xs font-bold text-slate-100 font-sans mt-0.5">
            {currentPhase.subtitle}
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-400">
          {currentPhaseIndex} / {SIMULATION_PHASES.length}
        </span>
      </div>

      {/* Narration Text */}
      <p className="text-xs text-slate-300 font-sans leading-relaxed mb-3 line-clamp-2">
        {currentPhase.narration}
      </p>

      {/* Phase Progress Bar */}
      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mb-3 border border-slate-800">
        <div
          className="bg-cyan-400 h-full transition-all duration-300 shadow-sm shadow-cyan-400"
          style={{ width: `${(currentPhaseIndex / SIMULATION_PHASES.length) * 100}%` }}
        />
      </div>

      {/* Simulation Controls & Speed Options */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={isPaused ? resumeSimulation : pauseSimulation}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold transition-all"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
          </button>
          <button
            onClick={startSimulation}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold transition-all"
            title="Restart Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={nextPhase}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold transition-all"
            title="Next Phase"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-[10px]">
          {[0.5, 1.0, 2.0].map((spd) => (
            <button
              key={spd}
              onClick={() => setSimulationSpeed(spd)}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                simulationSpeed === spd ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
