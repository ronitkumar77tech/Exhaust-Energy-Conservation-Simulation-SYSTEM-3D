import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SIMULATION_PHASES } from "../../data/simulationPhases";
import { SYSTEM_DIMENSIONS } from "../../data/dimensions";
import { useAppStore } from "../../store/useAppStore";
import { useEditStore } from "../../store/useEditStore";

export const DEFAULT_CAM_POS = new THREE.Vector3(4.0, 7.5, 25.5);
export const DEFAULT_LOOK_AT = new THREE.Vector3(1.5, -0.4, 0);

export function CameraController({ controlsRef }) {
  const { camera } = useThree();
  const targetCamPos = useRef(DEFAULT_CAM_POS.clone());
  const targetLookAt = useRef(DEFAULT_LOOK_AT.clone());
  const isTransitioning = useRef(false);
  const transitionTimer = useRef(0);

  const isSimulating = useAppStore((state) => state.isSimulating);
  const currentPhaseIndex = useAppStore((state) => state.currentPhaseIndex);
  const selectedId = useAppStore((state) => state.selectedComponentId);
  const setSelected = useAppStore((state) => state.setSelectedComponentId);
  const presetView = useAppStore((state) => state.presetView);
  const cameraAction = useAppStore((state) => state.cameraAction);
  const isGizmoDragging = useEditStore((state) => state.isDragging);

  // Never fly the camera while a transform gizmo drag is in progress
  useEffect(() => {
    if (isGizmoDragging) {
      isTransitioning.current = false;
    }
  }, [isGizmoDragging]);

  // Handle Zoom In, Zoom Out, and Reset View camera actions from Viewport Controls
  useEffect(() => {
    if (!cameraAction) return;
    const controls = controlsRef.current;
    if (!controls) return;

    if (cameraAction.type === "ZOOM_IN") {
      const dir = new THREE.Vector3().subVectors(controls.target, camera.position);
      const currentDist = dir.length();
      const minDist = controls.minDistance || 5.0;
      if (currentDist > minDist + 0.4) {
        const step = Math.min(currentDist - minDist, Math.max(2.5, currentDist * 0.22));
        targetCamPos.current.copy(camera.position).addScaledVector(dir.normalize(), step);
        targetLookAt.current.copy(controls.target);
        isTransitioning.current = true;
        transitionTimer.current = 0.4;
      }
    } else if (cameraAction.type === "ZOOM_OUT") {
      const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
      const currentDist = dir.length();
      const maxDist = controls.maxDistance || 55.0;
      if (currentDist < maxDist - 0.4) {
        const step = Math.min(maxDist - currentDist, Math.max(3.0, currentDist * 0.25));
        targetCamPos.current.copy(camera.position).addScaledVector(dir.normalize(), step);
        targetLookAt.current.copy(controls.target);
        isTransitioning.current = true;
        transitionTimer.current = 0.4;
      }
    } else if (cameraAction.type === "RESET") {
      targetCamPos.current.copy(DEFAULT_CAM_POS);
      targetLookAt.current.copy(DEFAULT_LOOK_AT);
      isTransitioning.current = true;
      transitionTimer.current = 1.0;
    }
  }, [cameraAction, controlsRef, camera]);

  // Stop camera transition when user manually interacts with mouse/touch
  useEffect(() => {
    const handleStart = () => {
      isTransitioning.current = false;
    };

    let controls = controlsRef.current;
    if (controls) {
      controls.addEventListener("start", handleStart);
      return () => controls.removeEventListener("start", handleStart);
    }

    // If controlsRef was not ready on first mount, attach as soon as available
    const checkInterval = setInterval(() => {
      if (controlsRef.current) {
        controls = controlsRef.current;
        controls.addEventListener("start", handleStart);
        clearInterval(checkInterval);
      }
    }, 50);

    return () => {
      clearInterval(checkInterval);
      if (controls) controls.removeEventListener("start", handleStart);
    };
  }, [controlsRef]);

  // Preset Views Smooth Camera Transition
  useEffect(() => {
    if (presetView === "isometric") {
      targetCamPos.current.copy(DEFAULT_CAM_POS);
      targetLookAt.current.copy(DEFAULT_LOOK_AT);
    } else if (presetView === "front") {
      targetCamPos.current.set(1.5, 0, 24);
      targetLookAt.current.copy(DEFAULT_LOOK_AT);
    } else if (presetView === "side") {
      targetCamPos.current.set(28, 0, 0);
      targetLookAt.current.copy(DEFAULT_LOOK_AT);
    } else if (presetView === "top") {
      targetCamPos.current.set(1.5, 28, 0.01);
      targetLookAt.current.copy(DEFAULT_LOOK_AT);
    }
    isTransitioning.current = true;
    transitionTimer.current = 1.2;
  }, [presetView]);

  // Component Selection Focus Camera Transition
  useEffect(() => {
    if (
      !isSimulating &&
      !useEditStore.getState().editMode &&
      selectedId &&
      SYSTEM_DIMENSIONS[selectedId]
    ) {
      const dim = SYSTEM_DIMENSIONS[selectedId];
      let pos = [0, 0, 0];

      if (dim.position) pos = dim.position;
      else if (dim.startX !== undefined) pos = [(dim.startX + dim.endX) / 2, 0, 0];
      else if (dim.inletPos) pos = dim.valveBodyPos;

      targetCamPos.current.set(pos[0] + 4.5, pos[1] + 3.0, pos[2] + 8.0);
      targetLookAt.current.set(pos[0], pos[1], pos[2]);
      isTransitioning.current = true;
      transitionTimer.current = 1.2;
    }
  }, [selectedId, isSimulating]);

  // Simulation Phase Camera Zoom & Active Component Highlight Transition
  useEffect(() => {
    if (isSimulating) {
      const phase = SIMULATION_PHASES.find((p) => p.phaseIndex === currentPhaseIndex);
      if (phase) {
        targetCamPos.current.set(...phase.cameraPos);
        targetLookAt.current.set(...phase.cameraTarget);
        if (phase.highlightComponent) {
          setSelected(phase.highlightComponent);
        } else {
          setSelected(null);
        }
        if (!useEditStore.getState().isDragging) {
          isTransitioning.current = true;
          transitionTimer.current = 1.8;
        }
      }
    }
  }, [isSimulating, currentPhaseIndex, setSelected]);

  // Smooth lerp camera ONLY when transitioning
  useFrame((state, delta) => {
    if (isTransitioning.current && controlsRef.current) {
      transitionTimer.current -= delta;
      if (transitionTimer.current <= 0) {
        isTransitioning.current = false;
        camera.position.copy(targetCamPos.current);
        controlsRef.current.target.copy(targetLookAt.current);
        controlsRef.current.update();
        return;
      }

      const factor = Math.min(1.0, 5.0 * delta);
      camera.position.lerp(targetCamPos.current, factor);
      controlsRef.current.target.lerp(targetLookAt.current, factor);
      controlsRef.current.update();
    }
  });

  return null;
}
