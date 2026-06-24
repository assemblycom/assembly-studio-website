"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Animated WebGL mesh gradient with a mouse-driven fluid distortion — adapted
 * from Cameron Knight's pen (codepen.io/cameronknight/pen/ogxWmBP). Recolored
 * to the light DIA palette (white → periwinkle → lime). Rendered as a fixed
 * full-viewport layer; it's covered by the opaque page content and only shows
 * in the reveal gap below the footer (and the overscroll bounce).
 *
 * The cursor leaves a fading "touch" trail that warps the gradient like water.
 */

// Fading touch trail painted into a small canvas, fed to the shader as a texture.
class TouchTexture {
  size = 64;
  width = 64;
  height = 64;
  maxAge = 64;
  radius = 0.25 * 64;
  speed = 1 / 64;
  trail: {
    x: number;
    y: number;
    age: number;
    force: number;
    vx: number;
    vy: number;
  }[] = [];
  last: { x: number; y: number } | null = null;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.Texture;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext("2d")!;
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.texture = new THREE.Texture(this.canvas);
  }

  update() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.width, this.height);
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const point = this.trail[i];
      const f = point.force * this.speed * (1 - point.age / this.maxAge);
      point.x += point.vx * f;
      point.y += point.vy * f;
      point.age++;
      if (point.age > this.maxAge) this.trail.splice(i, 1);
      else this.drawPoint(point);
    }
    this.texture.needsUpdate = true;
  }

  addTouch(x: number, y: number) {
    let force = 0;
    let vx = 0;
    let vy = 0;
    const last = this.last;
    if (last) {
      const dx = x - last.x;
      const dy = y - last.y;
      if (dx === 0 && dy === 0) return;
      const dd = dx * dx + dy * dy;
      const d = Math.sqrt(dd);
      vx = dx / d;
      vy = dy / d;
      force = Math.min(dd * 20000, 2.0);
    }
    this.last = { x, y };
    this.trail.push({ x, y, age: 0, force, vx, vy });
  }

  drawPoint(point: (typeof this.trail)[number]) {
    const pos = { x: point.x * this.width, y: (1 - point.y) * this.height };
    let intensity = 1;
    if (point.age < this.maxAge * 0.3) {
      intensity = Math.sin((point.age / (this.maxAge * 0.3)) * (Math.PI / 2));
    } else {
      const t = 1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7);
      intensity = -t * (t - 2);
    }
    intensity *= point.force;
    const color = `${((point.vx + 1) / 2) * 255}, ${((point.vy + 1) / 2) * 255}, ${intensity * 255}`;
    const offset = this.size * 5;
    this.ctx.shadowOffsetX = offset;
    this.ctx.shadowOffsetY = offset;
    this.ctx.shadowBlur = this.radius;
    this.ctx.shadowColor = `rgba(${color},${0.2 * intensity})`;
    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(255,0,0,1)";
    this.ctx.arc(pos.x - offset, pos.y - offset, this.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vUv = uv;
  }
`;

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColor1; uniform vec3 uColor2; uniform vec3 uColor3;
  uniform vec3 uColor4; uniform vec3 uColor5; uniform vec3 uColor6;
  uniform float uSpeed;
  uniform float uIntensity;
  uniform sampler2D uTouchTexture;
  uniform float uGrainIntensity;
  uniform vec3 uBase;
  uniform float uGradientSize;
  varying vec2 vUv;

  float grain(vec2 uv, float t) {
    vec2 g = uv * uResolution * 0.5;
    return fract(sin(dot(g + t, vec2(12.9898, 78.233))) * 43758.5453) * 2.0 - 1.0;
  }

  vec3 getGradientColor(vec2 uv, float time) {
    float r = uGradientSize;
    vec2 c1 = vec2(0.5 + sin(time*uSpeed*0.4)*0.4, 0.5 + cos(time*uSpeed*0.5)*0.4);
    vec2 c2 = vec2(0.5 + cos(time*uSpeed*0.6)*0.5, 0.5 + sin(time*uSpeed*0.45)*0.5);
    vec2 c3 = vec2(0.5 + sin(time*uSpeed*0.35)*0.45, 0.5 + cos(time*uSpeed*0.55)*0.45);
    vec2 c4 = vec2(0.5 + cos(time*uSpeed*0.5)*0.4, 0.5 + sin(time*uSpeed*0.4)*0.4);
    vec2 c5 = vec2(0.5 + sin(time*uSpeed*0.7)*0.35, 0.5 + cos(time*uSpeed*0.6)*0.35);
    vec2 c6 = vec2(0.5 + cos(time*uSpeed*0.45)*0.5, 0.5 + sin(time*uSpeed*0.65)*0.5);
    // Weight each center by proximity × a gentle time pulse.
    float w1 = (1.0 - smoothstep(0.0, r, length(uv-c1))) * (0.6 + 0.4*sin(time*uSpeed));
    float w2 = (1.0 - smoothstep(0.0, r, length(uv-c2))) * (0.6 + 0.4*cos(time*uSpeed*1.2));
    float w3 = (1.0 - smoothstep(0.0, r, length(uv-c3))) * (0.6 + 0.4*sin(time*uSpeed*0.8));
    float w4 = (1.0 - smoothstep(0.0, r, length(uv-c4))) * (0.6 + 0.4*cos(time*uSpeed*1.3));
    float w5 = (1.0 - smoothstep(0.0, r, length(uv-c5))) * (0.6 + 0.4*sin(time*uSpeed*1.1));
    float w6 = (1.0 - smoothstep(0.0, r, length(uv-c6))) * (0.6 + 0.4*cos(time*uSpeed*0.9));
    float total = w1 + w2 + w3 + w4 + w5 + w6;
    // Weighted AVERAGE (not sum) — overlaps blend to teal/green instead of
    // blowing out to white.
    vec3 blended = (uColor1*w1 + uColor2*w2 + uColor3*w3 + uColor4*w4 + uColor5*w5 + uColor6*w6) / max(total, 0.001);
    // Coverage decides color vs dark base; capped so it never reaches the base
    // colors' full brightness in a way that washes to white.
    float coverage = clamp(total * uIntensity, 0.0, 0.92);
    return mix(uBase, blended, coverage);
  }

  void main() {
    vec2 uv = vUv;
    vec4 touch = texture2D(uTouchTexture, uv);
    float vx = -(touch.r * 2.0 - 1.0);
    float vy = -(touch.g * 2.0 - 1.0);
    float intensity = touch.b;
    uv.x += vx * 0.7 * intensity;
    uv.y += vy * 0.7 * intensity;
    float dist = length(uv - vec2(0.5));
    uv += vec2(sin(dist*20.0 - uTime*3.0)*0.04*intensity + sin(dist*15.0 - uTime*2.0)*0.03*intensity);

    vec3 color = getGradientColor(uv, uTime);
    color += grain(uv, uTime) * uGrainIntensity;
    color = clamp(color, 0.0, 1.0);
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function GradientCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
      depth: false,
      stencil: false,
    });
    // The gradient lives in a band at the bottom of the viewport (where it's
    // revealed below the footer), so the vivid centers sit in the visible gap
    // instead of floating mid-viewport behind the content.
    const BAND = 0.65;
    const bandH = () => Math.round(window.innerHeight * BAND);

    renderer.setSize(window.innerWidth, bandH());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mount.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / bandH(),
      0.1,
      10000,
    );
    camera.position.z = 50;
    const scene = new THREE.Scene();
    const clock = new THREE.Clock();
    const touch = new TouchTexture();

    const c = (hex: number) =>
      new THREE.Vector3(
        ((hex >> 16) & 255) / 255,
        ((hex >> 8) & 255) / 255,
        (hex & 255) / 255,
      );

    const uniforms = {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, bandH()),
      },
      uColor1: { value: c(0x7da4ff) }, // blue
      uColor2: { value: c(0xd9ed92) }, // lime
      uColor3: { value: c(0x7da4ff) }, // blue
      uColor4: { value: c(0xd9ed92) }, // lime
      uColor5: { value: c(0x7da4ff) }, // blue
      uColor6: { value: c(0xd9ed92) }, // lime
      uSpeed: { value: 0.55 },
      uIntensity: { value: 0.65 },
      uTouchTexture: { value: touch.texture },
      uGrainIntensity: { value: 0.05 },
      uBase: { value: c(0x101010) }, // dark base — colors glow against near-black
      uGradientSize: { value: 0.5 },
    };

    const getViewSize = () => {
      const fov = (camera.fov * Math.PI) / 180;
      const height = Math.abs(camera.position.z * Math.tan(fov / 2) * 2);
      return { width: height * camera.aspect, height };
    };

    const view = getViewSize();
    const geometry = new THREE.PlaneGeometry(view.width, view.height, 1, 1);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const onMouseMove = (e: MouseEvent) => {
      touch.addTouch(
        e.clientX / window.innerWidth,
        (window.innerHeight - e.clientY) / bandH(),
      );
    };
    const onResize = () => {
      camera.aspect = window.innerWidth / bandH();
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, bandH());
      uniforms.uResolution.value.set(window.innerWidth, bandH());
      const v = getViewSize();
      mesh.geometry.dispose();
      mesh.geometry = new THREE.PlaneGeometry(v.width, v.height, 1, 1);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);

    let raf = 0;
    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      uniforms.uTime.value += delta;
      touch.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      touch.texture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-[65vh]"
    />
  );
}
