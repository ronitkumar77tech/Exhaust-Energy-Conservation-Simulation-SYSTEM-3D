import React from "react";
import { useAppStore } from "../../store/useAppStore";
import { MousePointer, HelpCircle, Maximize2 } from "lucide-react";

export function FooterBar() {
  const isPresentationMode = useAppStore((state) => state.isPresentationMode);

  if (isPresentationMode) return null;

  return (
    <footer className="absolute bottom-1 left-0 right-0 z-20 flex items-center justify-between px-6 text-[10px] font-mono text-slate-400 pointer-events-none">
      {/* Interaction Guide */}
      <div className="flex items-center gap-4 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800 backdrop-blur-md pointer-events-auto">
        <span className="flex items-center gap-1"><MousePointer className="w-3 h-3 text-cyan-400" /> Left Drag: Rotate</span>
        <span>Right Drag: Pan</span>
        <span>Scroll: Zoom</span>
        <span>Click Component: Select & Info</span>
        <span>Double Click: Focus</span>
      </div>

      {/* Shortcuts */}
      <div className="flex items-center gap-4 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800 backdrop-blur-md pointer-events-auto">
        <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3 text-cyan-400" /> Press H for Help</span>
        <span className="flex items-center gap-1"><Maximize2 className="w-3 h-3 text-cyan-400" /> Press F for Fullscreen</span>
      </div>
    </footer>
  );
}
