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
 * Wide-angle 3D "photo tunnel": customer images are laid out around a ring,
 * angled tangent to it, and viewed from inside through a very wide lens — so
 * they curve away into depth and the edge frames loom large. A barrel-distortion
 * post-pass bows the whole image like a fisheye, with chromatic aberration at the
 * edges. The ring itself never spins (cards don't rotate); the camera drifts so
 * the whole scene stays alive. Inspired by the Visu.Haus gallery piece.
 *
 * Tuning knobs mirror the reference's Layout / Lens / Motion panels.
 */
const SETTINGS = {
  // Layout
  ringRadius: 6.5, // how far frames sit from the ring center
  frameWidth: 4, // image plane width ("frame size") — wider than the arc chord
  frameHeight: 2.6, // image plane height   so neighbours overlap into a wall
  frames: 24, // packed tightly around the FULL ring so they abut into one
  // continuous curved wall (no gaps)
  // Lens
  fov: 115, // wide-angle lens — naturally crops the visible arc, no side slivers
  barrel: 0.75, // fisheye / edge bulge
  chroma: 0, // RGB edge split (0 = off)
  // Motion — the whole cylinder spins so the ribbon scrolls sideways.
  spin: 0.18, // ring rotation speed
  drift: 0.3, // camera sway amount
  // Camera sits inside the ring, offset toward the front, so edge frames loom
  // large (and crop off-screen) while the far wall reads smaller.
  cameraZ: 3,
};

/** Barrel (fisheye) lens distortion applied to the whole frame. */
class BarrelEffectImpl extends Effect {
  constructor({ barrel = 0.9 } = {}) {
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

function Frame({ src, angle }: { src: string; angle: number }) {
  const texture = useTexture(src);
  texture.colorSpace = THREE.SRGBColorSpace;
  const x = Math.sin(angle) * SETTINGS.ringRadius;
  const z = Math.cos(angle) * SETTINGS.ringRadius;
  // Angled tangent to the ring — this is what gives the tunnel its depth.
  return (
    <mesh position={[x, 0, z]} rotation={[0, -angle, 0]}>
      <planeGeometry args={[SETTINGS.frameWidth, SETTINGS.frameHeight]} />
      <meshBasicMaterial map={texture} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Ring({ images }: { images: string[] }) {
  const group = useRef<THREE.Group>(null);
  const frames = useMemo(() => {
    const n = SETTINGS.frames;
    return Array.from({ length: n }, (_, i) => ({
      src: images[i % images.length],
      // Evenly around the full ring — packed tight so they form a continuous
      // wall. The camera's FOV crops the visible front arc.
      angle: (i / n) * Math.PI * 2,
    }));
  }, [images]);

  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += delta * SETTINGS.spin;
    // Whole-scene motion: the camera sways so the tunnel drifts, without any
    // card changing orientation.
    const t = state.clock.elapsedTime;
    state.camera.position.x = Math.sin(t * 0.18) * SETTINGS.drift;
    state.camera.position.y = Math.cos(t * 0.12) * SETTINGS.drift * 0.35;
    state.camera.position.z = SETTINGS.cameraZ;
    state.camera.lookAt(0, 0, -SETTINGS.ringRadius);
  });

  return (
    <group ref={group}>
      {frames.map((f, i) => (
        <Frame key={i} src={f.src} angle={f.angle} />
      ))}
    </group>
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
        <Ring images={images} />
      </Suspense>
      <EffectComposer>
        <BarrelEffect barrel={SETTINGS.barrel} />
        <ChromaticAberration
          offset={[SETTINGS.chroma * 0.06, SETTINGS.chroma * 0.06]}
          radialModulation={false}
          modulationOffset={0}
        />
      </EffectComposer>
    </Canvas>
  );
}
