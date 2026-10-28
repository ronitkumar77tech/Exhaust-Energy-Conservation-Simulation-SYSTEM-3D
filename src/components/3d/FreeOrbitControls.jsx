import React, { forwardRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

// Free spherical orbit controls with unrestricted vertical rotation.
//
// drei/three-stdlib OrbitControls and camera-controls both clamp the polar
// angle to [ε, π−ε] on every update, so the camera can never cross a pole
// and the assembly cannot be flipped fully upside down in one continuous
// drag. These controls avoid spherical clamping: orientation is accumulated
// as a quaternion (yaw about the world-up axis through the target, pitch
// about the camera's own right axis) and the camera position is derived
// from that orientation, keeping rotation continuous over both poles.

const STATE_NONE = -1;
const STATE_ROTATE = 0;
const STATE_DOLLY = 1;
const STATE_PAN = 2;
const STATE_TOUCH_DOLLY_PAN = 3;
const WORLD_UP = new THREE.Vector3(0, 1, 0);

export const FreeOrbitControls = forwardRef(function FreeOrbitControls({
  dampingFactor = 0.08,
  enableDamping = true,
  enableZoom = true,
  enableRotate = true,
  enablePan = true,
  zoomSpeed = 1.0,
  rotateSpeed = 1.0,
  panSpeed = 1.0,
  minDistance = 0.05,
  maxDistance = Infinity,
  touches,
  onStart,
  onEnd,
  makeDefault = false,
}, ref) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const set = useThree((state) => state.set);

  const controls = useMemo(() => {
    const dispatcher = new THREE.EventDispatcher();
    const target = new THREE.Vector3(0, 0, 0);
    const orientation = new THREE.Quaternion();
    const offset = new THREE.Vector3().copy(camera.position).sub(target);
    const lookMatrix = new THREE.Matrix4().lookAt(camera.position, target, WORLD_UP);
    orientation.setFromRotationMatrix(lookMatrix);
    return {
      enabled: true,
      target,
      minDistance: 0.05,
      maxDistance: Infinity,
      update: () => {},
      dispose: () => {},
      addEventListener: (...args) => dispatcher.addEventListener(...args),
      removeEventListener: (...args) => dispatcher.removeEventListener(...args),
      dispatchEvent: (...args) => dispatcher.dispatchEvent(...args),
      dispatcher,
      orientation,
      orientationTarget: orientation.clone(),
      radius: offset.length(),
      radiusTarget: offset.length(),
      yawDelta: 0,
      pitchDelta: 0,
      panOffset: new THREE.Vector3(),
      pointers: new Map(),
      interaction: STATE_NONE,
      pinchDistance: 0,
      pinchMidX: 0,
      pinchMidY: 0,
      lastX: 0,
      lastY: 0,
      lastWrittenPos: camera.position.clone(),
      scratch: {
        offset: new THREE.Vector3(),
        eye: new THREE.Vector3(),
        quat: new THREE.Quaternion(),
        right: new THREE.Vector3(),
        up: new THREE.Vector3(),
        matrix: new THREE.Matrix4(),
      },
    };
  }, [camera]);

  const rotateWithOneFinger = !touches || touches.ONE !== 1;
  const twoFingerMode = touches ? touches.TWO : 3;

  useEffect(() => {
    controls.minDistance = minDistance;
    controls.maxDistance = maxDistance;
  }, [controls, minDistance, maxDistance]);

  useEffect(() => {
    const el = gl.domElement;
    const state = controls;
    const previousTouchAction = el.style.touchAction;
    el.style.touchAction = "none";

    const emitStart = (event) => {
      state.dispatcher.dispatchEvent({ type: "start", target: event });
      onStart?.(event);
    };
    const emitEnd = (event) => {
      state.dispatcher.dispatchEvent({ type: "end", target: event });
      onEnd?.(event);
    };

    const panByGesture = (dx, dy) => {
      const rect = el.getBoundingClientRect();
      const fov = (camera.fov * Math.PI) / 180;
      const worldPerPixel = (2 * Math.tan(fov / 2) * state.radius) / Math.max(1, rect.height);
      const { right, up } = state.scratch;
      right.set(1, 0, 0).applyQuaternion(state.orientation);
      up.set(0, 1, 0).applyQuaternion(state.orientation);
      state.panOffset.addScaledVector(right, -dx * worldPerPixel * panSpeed);
      state.panOffset.addScaledVector(up, dy * worldPerPixel * panSpeed);
    };

    const dollyBy = (factor) => {
      state.radiusTarget = THREE.MathUtils.clamp(state.radiusTarget * factor, state.minDistance, state.maxDistance);
    };

    const handlePointerDown = (event) => {
      if (!state.enabled) return;
      event.preventDefault();
      el.setPointerCapture?.(event.pointerId);
      state.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (state.pointers.size === 1) {
        state.lastX = event.clientX;
        state.lastY = event.clientY;
        if (event.button === 2 && enablePan) state.interaction = STATE_PAN;
        else if (event.button === 1 && enableZoom) state.interaction = STATE_DOLLY;
        else if (enableRotate && rotateWithOneFinger) state.interaction = STATE_ROTATE;
        else state.interaction = STATE_NONE;
      } else if (state.pointers.size === 2 && (enableZoom || enablePan)) {
        state.interaction = STATE_TOUCH_DOLLY_PAN;
        const [a, b] = [...state.pointers.values()];
        state.pinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
        state.pinchMidX = (a.x + b.x) / 2;
        state.pinchMidY = (a.y + b.y) / 2;
      }
      emitStart(event);
    };

    const handlePointerMove = (event) => {
      if (!state.enabled || !state.pointers.has(event.pointerId)) return;
      state.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (state.interaction === STATE_TOUCH_DOLLY_PAN && state.pointers.size >= 2) {
        const [a, b] = [...state.pointers.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        if ((twoFingerMode === 3 || twoFingerMode === 1) && enableZoom && state.pinchDistance > 0) {
          dollyBy(distance / state.pinchDistance);
        }
        if ((twoFingerMode === 3 || twoFingerMode === 2) && enablePan) {
          panByGesture(midX - state.pinchMidX, midY - state.pinchMidY);
        }
        state.pinchDistance = distance;
        state.pinchMidX = midX;
        state.pinchMidY = midY;
        return;
      }

      const dx = event.clientX - state.lastX;
      const dy = event.clientY - state.lastY;
      state.lastX = event.clientX;
      state.lastY = event.clientY;

      if (state.interaction === STATE_ROTATE && enableRotate) {
        const rect = el.getBoundingClientRect();
        const anglePerPixel = (2 * Math.PI) / Math.max(1, rect.height);
        state.yawDelta += dx * anglePerPixel * rotateSpeed;
        state.pitchDelta += dy * anglePerPixel * rotateSpeed;
      } else if (state.interaction === STATE_PAN && enablePan) {
        panByGesture(dx, dy);
      } else if (state.interaction === STATE_DOLLY && enableZoom) {
        dollyBy(Math.exp(dy * 0.004 * zoomSpeed));
      }
    };

    const handlePointerEnd = (event) => {
      if (!state.pointers.has(event.pointerId)) return;
      state.pointers.delete(event.pointerId);
      el.releasePointerCapture?.(event.pointerId);
      if (state.pointers.size === 0) {
        state.interaction = STATE_NONE;
        emitEnd(event);
      } else if (state.pointers.size === 1) {
        const [remaining] = [...state.pointers.values()];
        state.lastX = remaining.x;
        state.lastY = remaining.y;
        state.interaction = enableRotate && rotateWithOneFinger ? STATE_ROTATE : STATE_NONE;
        state.pinchDistance = 0;
      }
    };

    const handleWheel = (event) => {
      if (!state.enabled || !enableZoom) return;
      event.preventDefault();
      emitStart(event);
      dollyBy(Math.exp(event.deltaY * 0.001 * zoomSpeed));
      emitEnd(event);
    };

    const handleContextMenu = (event) => event.preventDefault();

    el.addEventListener("pointerdown", handlePointerDown);
    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerup", handlePointerEnd);
    el.addEventListener("pointercancel", handlePointerEnd);
    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("contextmenu", handleContextMenu);

    state.dispose = () => {
      el.removeEventListener("pointerdown", handlePointerDown);
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerup", handlePointerEnd);
      el.removeEventListener("pointercancel", handlePointerEnd);
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("contextmenu", handleContextMenu);
      el.style.touchAction = previousTouchAction;
    };

    return () => state.dispose();
  }, [controls, gl, camera, enableZoom, enableRotate, enablePan, zoomSpeed, rotateSpeed, panSpeed, onStart, onEnd, rotateWithOneFinger, twoFingerMode]);

  // Sync camera to the internal orbit state. Also absorbs external camera
  // moves (simulation transitions, Reset View, zoom buttons): if anything
  // wrote to camera.position between our own updates, orientation and radius
  // are re-derived from the camera, exactly like OrbitControls does.
  //
  // Crucially, the comparison is against the position THIS control wrote
  // itself (lastWrittenPos), not against a position recomputed from the
  // just-slerped orientation. Comparing against the recomputed position
  // misclassified our own damped motion as an external move every frame and
  // wiped yaw/pitch state, which froze rotation entirely.
  controls.update = () => {
    const state = controls;
    const { offset, eye, matrix } = state.scratch;

    if (camera.position.distanceToSquared(state.lastWrittenPos) > 1e-12) {
      eye.copy(camera.position).sub(state.target);
      state.radius = state.radiusTarget = Math.max(eye.length(), state.minDistance);
      matrix.lookAt(camera.position, state.target, WORLD_UP);
      state.orientation.setFromRotationMatrix(matrix);
      state.orientationTarget.copy(state.orientation);
      state.yawDelta = 0;
      state.pitchDelta = 0;
      state.panOffset.set(0, 0, 0);
    }

    offset.set(0, 0, 1).applyQuaternion(state.orientation).multiplyScalar(state.radius);
    camera.position.copy(state.target).add(offset);
    camera.quaternion.copy(state.orientation);
    state.lastWrittenPos.copy(camera.position);
  };

  useEffect(() => {
    if (!makeDefault) return undefined;
    set({ controls });
    return () => set((current) => (current.controls === controls ? { ...current, controls: null } : current));
  }, [makeDefault, set, controls]);

  useFrame((_, delta) => {
    if (!controls.enabled) return;
    const state = controls;
    const { quat, right } = state.scratch;
    const frameFactor = enableDamping
      ? 1 - Math.pow(1 - Math.min(dampingFactor, 0.99), delta * 60)
      : 1;

    if (state.yawDelta !== 0 || state.pitchDelta !== 0) {
      // Apply the full pointer delta to the goal orientation in one step so
      // the camera responds immediately; the slerp below provides damping.
      // Drag right (dx > 0) orbits the camera toward +x, matching OrbitControls.
      if (state.yawDelta !== 0) {
        quat.setFromAxisAngle(WORLD_UP, state.yawDelta);
        state.orientationTarget.premultiply(quat);
      }
      if (state.pitchDelta !== 0) {
        // Drag down (dy > 0) lowers the camera, matching OrbitControls. Pitch
        // uses the goal orientation's right axis (after this frame's yaw) so
        // rotation stays continuous through both poles with no clamping.
        right.set(1, 0, 0).applyQuaternion(state.orientationTarget);
        quat.setFromAxisAngle(right, state.pitchDelta);
        state.orientationTarget.premultiply(quat);
      }
      state.orientationTarget.normalize();
      state.yawDelta = 0;
      state.pitchDelta = 0;
    }

    state.orientation.slerp(state.orientationTarget, frameFactor);
    state.radius += (state.radiusTarget - state.radius) * frameFactor;
    state.target.addScaledVector(state.panOffset, frameFactor);
    state.panOffset.multiplyScalar(1 - frameFactor);

    state.update();
  }, -1);

  if (ref) ref.current = controls;
  return null;
});
