import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "../../store/useAppStore";
import { useEditStore, IDENTITY_TRANSFORM, isTransformModified } from "../../store/useEditStore";
import { getEditable } from "../../data/editableComponents";
import { HighlightAura } from "./HighlightAura";

function measureLocalBounds(outer, inner) {
  if (!outer || !inner) return null;
  try {
    outer.updateMatrixWorld(true);
    const inverse = new THREE.Matrix4().copy(inner.matrixWorld).invert();
    const helper = new THREE.Matrix4();
    const box = new THREE.Box3();
    let found = false;
    inner.traverse((node) => {
      if (!node.isMesh || !node.geometry) return;
      if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
      if (!node.geometry.boundingBox) return;
      const local = node.geometry.boundingBox.clone();
      helper.multiplyMatrices(inverse, node.matrixWorld);
      local.applyMatrix4(helper);
      box.union(local);
      found = true;
    });
    if (!found || box.isEmpty()) return null;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    if (!Number.isFinite(center.x) || !Number.isFinite(size.x)) return null;
    return {
      center: [center.x, center.y, center.z],
      size: [Math.max(size.x, 0.01), Math.max(size.y, 0.01), Math.max(size.z, 0.01)],
    };
  } catch {
    return null;
  }
}

export function EditableComponent({ id, measureKey, children }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const outlineRef = useRef(null);
  const [bounds, setBounds] = useState(null);

  const entry = getEditable(id);
  const pivot = entry ? entry.pivot : [0, 0, 0];

  const transform = useEditStore((state) => state.transforms[id]);
  const setSelected = useAppStore((state) => state.setSelectedComponentId);
  const setHovered = useAppStore((state) => state.setHoveredComponentId);
  const viewMode = useAppStore((state) => state.viewMode);

  const tr = transform || IDENTITY_TRANSFORM;
  const modified = isTransformModified(transform);

  useLayoutEffect(() => {
    const object = outerRef.current;
    if (!object) return undefined;
    useEditStore.getState().registerTarget(id, object);
    return () => useEditStore.getState().unregisterTarget(id);
  }, [id]);

  // Re-measure whenever the caller key changes or the view mode shifts geometry
  // (exploded view offsets), so the "modified" outline tracks the actual bounds.
  useEffect(() => {
    const box = measureLocalBounds(outerRef.current, innerRef.current);
    setBounds(box ? box : null);
  }, [measureKey, viewMode]);

  useFrame((state) => {
    if (outlineRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 5) * 0.25 + 0.7;
      outlineRef.current.material.opacity = pulse;
    }
  });

  const handleClick = (event) => {
    event.stopPropagation();
    if (useAppStore.getState().isOrbiting) return;
    if (useEditStore.getState().isClickSuppressed()) return;
    setSelected(id);
  };

  const handleOver = (event) => {
    event.stopPropagation();
    setHovered(id);
  };

  const handleOut = () => {
    setHovered(null);
  };

  const outline = modified && bounds ? bounds : null;

  return (
    <group
      ref={outerRef}
      position={[pivot[0] + tr.position[0], pivot[1] + tr.position[1], pivot[2] + tr.position[2]]}
      rotation={tr.rotation}
      scale={tr.scale}
      onClick={handleClick}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
    >
      <group ref={innerRef} position={[-pivot[0], -pivot[1], -pivot[2]]}>
        {children}
        <HighlightAura id={id} />
        {outline ? (
          <mesh ref={outlineRef} position={outline.center} raycast={() => null}>
            <boxGeometry args={outline.size} />
            <meshBasicMaterial
              color="#fbbf24"
              wireframe
              transparent
              opacity={0.8}
              depthWrite={false}
            />
          </mesh>
        ) : null}
      </group>
    </group>
  );
}
