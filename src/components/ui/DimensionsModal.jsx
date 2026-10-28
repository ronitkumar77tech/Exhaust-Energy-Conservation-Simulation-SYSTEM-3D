import React from "react";
import { X, Ruler, CheckCircle } from "lucide-react";
import { SYSTEM_DIMENSIONS } from "../../data/dimensions";
import { useAppStore } from "../../store/useAppStore";

export function DimensionsModal() {
  const isModalOpen = useAppStore((state) => state.isDimensionsModalOpen);
  const setDimensionsModalOpen = useAppStore(
    (state) => state.setDimensionsModalOpen
  );

  if (!isModalOpen) return null;

  const dims = SYSTEM_DIMENSIONS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                SYSTEM MECHANICAL DIMENSIONS
              </h2>
              <p className="text-xs text-slate-400">
                Parametric Normalized CAD Scale • Derived from Authoritative Concept Sketch
              </p>
            </div>
          </div>

          <button
            onClick={() => setDimensionsModalOpen(false)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-6 flex flex-col gap-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 font-medium">Overall System Length:</span>
              <span className="font-mono font-bold text-cyan-400">{dims.overallLength} m (Normalized)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 font-medium">Main Muffler Chamber Length:</span>
              <span className="font-mono font-bold text-slate-200">{dims.mufflerChamber.length} m</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 font-medium">Main Muffler Chamber Diameter:</span>
              <span className="font-mono font-bold text-slate-200">{dims.mufflerChamber.radiusY * 2} m</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 font-medium">Nozzle Inlet / Outlet Diameters:</span>
              <span className="font-mono font-bold text-slate-200">{dims.nozzle.inletRadius * 2}m → {dims.nozzle.outletRadius * 2}m</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 font-medium">Turbine Rotor Diameter:</span>
              <span className="font-mono font-bold text-amber-400">{(dims.turbine.hubRadius + dims.turbine.bladeLength) * 2} m</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center bg-cyan-950/20 border-cyan-800/40">
              <span className="text-cyan-300 font-bold">Number of Turbine Blades:</span>
              <span className="font-mono font-bold text-cyan-400 text-base">EXACTLY 12</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 font-medium">Turbine Blade Thickness / Width:</span>
              <span className="font-mono font-bold text-slate-200">{dims.turbine.bladeThickness}m / {dims.turbine.bladeWidth}m</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 font-medium">Common Shaft Diameter:</span>
              <span className="font-mono font-bold text-slate-200">{dims.shaft.radius * 2} m</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 font-medium">Generator Length / Diameter:</span>
              <span className="font-mono font-bold text-slate-200">{dims.generator.length}m × {dims.generator.radius * 2}m</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 font-medium">Exhaust Outlet Diameter:</span>
              <span className="font-mono font-bold text-slate-200">{dims.exhaustOutlet.radius * 2} m</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-200 block mb-1">
              PARAMETRIC MESH ARCHITECTURE
            </span>
            All 3D geometries in this application are constructed parametrically from <code className="text-cyan-400 font-mono">src/data/dimensions.js</code>. Modifying any dimensions in the config updates the 3D WebGL scene and technical overlays instantly.
          </div>
        </div>
      </div>
    </div>
  );
}
