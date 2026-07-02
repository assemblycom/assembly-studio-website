"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  EffectComposer,
  ChromaticAberration,
  wrapEffect,
} from "@react-three/postprocessing";
import { Effect } from "postprocessing";
import * as THREE from "three";

/**
 * Wide-angle 3D "photo tunnel": the customer images are painted side-by-side
 * into one texture strip wrapped around a single continuous CYLINDER, viewed
 * from just inside through a very wide lens. Because it's one smooth surface
 * (not discrete planes) there are no seams or edge-on slivers — the wall curves
 * away continuously to the sides. A barrel post-pass adds the fisheye bow.
 * Inspired by the Visu.Haus "Wide Angle Gallery" piece.
 */
const SETTINGS = {
  radius: 6.5, // cylinder radius
  height: 3.4, // cylinder height (tall enough that the band stays even, not a
  // pinched bowtie)
  repeat: 3, // how many times the image set wraps around the cylinder
  fov: 68, // lens angle (kept moderate: a flat perspective camera flares the
  // band at the edges with very wide FOVs, pinching the center)
  barrel: 0.3, // gentle fisheye / edge bulge
  chroma: 0, // RGB edge split (0 = off)
  spin: 0.15, // cylinder rotation — the ribbon scrolls
  drift: 0.3, // camera sway
  cameraZ: 0.3, // near dead-center → wall stays equidistant, so the band keeps
  // an even height (no bowtie pinch); the barrel lens supplies the edge bulge
};

/** Barrel (fisheye) lens distortion applied to the whole frame. */
class BarrelEffectImpl extends Effect {
  constructor({ barrel = 0.55 } = {}) {
    super(
      "BarrelEffect",
      /* glsl */ `
      uniform float barrel;
      void mainUv(inout vec2 uv) {
        vec2 c = uv - 0.5;
        float r2 = dot(c, c);
        uv = 0.5 + c * (1.0 - barrel * r2);
      }`,
      { uniforms: new Map([["barrel", new THREE.Uniform(barrel)]]) },
    );
  }
}
const BarrelEffect = wrapEffect(BarrelEffectImpl);

function CylinderWall({ images }: { images: string[] }) {
  const textures = useTexture(images);
  const meshRef = useRef<THREE.Mesh>(null);

  // Paint every image into one wide strip, cover-fitting each into its slot so
  // nothing is distorted, then wrap it around the cylinder.
  const map = useMemo(() => {
    const slotsAround = images.length * SETTINGS.repeat;
    const slotAspect =
      (2 * Math.PI * SETTINGS.radius) / slotsAround / SETTINGS.height;
    const slotH = 600;
    const slotW = Math.max(1, Math.round(slotH * slotAspect));
    const list = Array.isArray(textures) ? textures : [textures];

    const canvas = document.createElement("canvas");
    canvas.width = slotW * list.length;
    canvas.height = slotH;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      list.forEach((t, i) => {
        const img = t.image as HTMLImageElement | undefined;
        if (!img) return;
        // cover-fit: crop the image to the slot's aspect, centered
        const target = slotW / slotH;
        const a = img.width / img.height;
        let sw = img.width;
        let sh = img.height;
        if (a > target) sw = img.height * target;
        else sh = img.width / target;
        ctx.drawImage(
          img,
          (img.width - sw) / 2,
          (img.height - sh) / 2,
          sw,
          sh,
          i * slotW,
          0,
          slotW,
          slotH,
        );
      });
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    // Negative repeat un-mirrors the strip for inside (back-face) viewing.
    tex.repeat.set(-SETTINGS.repeat, 1);
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return tex;
  }, [textures, images.length]);

  useFrame((state, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * SETTINGS.spin;
    const t = state.clock.elapsedTime;
    state.camera.position.x = Math.sin(t * 0.16) * SETTINGS.drift;
    state.camera.position.y = Math.cos(t * 0.11) * SETTINGS.drift * 0.25;
    state.camera.position.z = SETTINGS.cameraZ;
    state.camera.lookAt(0, 0, -SETTINGS.radius);
  });

  return (
    <mesh ref={meshRef}>
      <cylinderGeometry
        args={[SETTINGS.radius, SETTINGS.radius, SETTINGS.height, 240, 1, true]}
      />
      <meshBasicMaterial map={map} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  );
}

export function ImageTunnel({ images }: { images: string[] }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: SETTINGS.fov, position: [0, 0, SETTINGS.cameraZ] }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <CylinderWall images={images} />
      </Suspense>
      <EffectComposer>
        <BarrelEffect barrel={SETTINGS.barrel} />
        <ChromaticAberration
          offset={[SETTINGS.chroma, SETTINGS.chroma]}
          radialModulation={false}
          modulationOffset={0}
        />
      </EffectComposer>
    </Canvas>
  );
}
