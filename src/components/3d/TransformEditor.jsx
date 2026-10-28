import React, { useEffect } from "react";
import { TransformControls } from "@react-three/drei";
import { useAppStore } from "../../store/useAppStore";
import { useEditStore } from "../../store/useEditStore";
import { getEditable } from "../../data/editableComponents";

const MODE_BY_TOOL = { move: "translate", rotate: "rotate", scale: "scale" };

export function TransformEditor() {
  const editMode = useEditStore((state) => state.editMode);
  const tool = useEditStore((state) => state.tool);
  const space = useEditStore((state) => state.space);
  const snapEnabled = useEditStore((state) => state.snapEnabled);
  const moveSnap = useEditStore((state) => state.moveSnap);
  const rotateSnapDeg = useEditStore((state) => state.rotateSnapDeg);
  const scaleSnap = useEditStore((state) => state.scaleSnap);
  const targets = useEditStore((state) => state.targets);
  const selectedId = useAppStore((state) => state.selectedComponentId);

  const target = selectedId ? targets[selectedId] : null;

  useEffect(() => {
    return () => {
      const state = useEditStore.getState();
      state.endBatch();
      state.setDragging(false);
    };
  }, [target]);

  if (!editMode || !target) return null;

  const entry = getEditable(selectedId);
  const pivot = entry ? entry.pivot : [0, 0, 0];

  const syncFromObject = () => {
    useEditStore.getState().updateTransform(selectedId, {
      position: [
        target.position.x - pivot[0],
        target.position.y - pivot[1],
        target.position.z - pivot[2],
      ],
      rotation: [target.rotation.x, target.rotation.y, target.rotation.z],
      scale: [target.scale.x, target.scale.y, target.scale.z],
    });
  };

  const handleMouseDown = () => {
    const state = useEditStore.getState();
    state.beginBatch("gizmo");
    state.setDragging(true);
  };

  const handleMouseUp = () => {
    const state = useEditStore.getState();
    state.endBatch();
    state.setDragging(false);
    state.setSuppressClicks(150);
  };

  return (
    <TransformControls
      object={target}
      mode={MODE_BY_TOOL[tool] || "translate"}
      space={space}
      translationSnap={snapEnabled && moveSnap > 0 ? moveSnap : null}
      rotationSnap={snapEnabled && rotateSnapDeg > 0 ? (rotateSnapDeg * Math.PI) / 180 : null}
      scaleSnap={snapEnabled && scaleSnap > 0 ? scaleSnap : null}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onObjectChange={syncFromObject}
    />
  );
}
