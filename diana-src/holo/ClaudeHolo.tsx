"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { HoloState } from "./model";
import styles from "./brain-os-lab.module.css";

const stateCopy: Record<HoloState, { label: string; detail: string }> = {
  idle: { label: "Idle", detail: "Ready at the current checkpoint" },
  listening: { label: "Listening", detail: "Previewing an intent-review state" },
  speaking: { label: "Speaking", detail: "Previewing a response state; no audio is generated" },
  working: { label: "Working", detail: "Showing a sample review workflow" },
  alert: { label: "Attention", detail: "A sample decision or uncertain outcome needs review" },
};

function motionFor(state: HoloState) {
  if (state === "alert") return 1.35;
  if (state === "working") return 1.12;
  if (state === "listening") return 0.92;
  if (state === "speaking") return 1.18;
  return 0.48;
}

export function ClaudeHolo({
  state,
  onActivate,
}: {
  state: HoloState;
  onActivate: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      canvas.hidden = true;
      return () => {
        canvas.hidden = false;
      };
    }

    const particleCount = 9000;
    const positions = new Float32Array(particleCount * 3);
    const targets = new Float32Array(particleCount * 3);
    const seeds = new Float32Array(particleCount);
    const sparks = new Float32Array(particleCount);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const tau = Math.PI * 2;
    const fract = (value: number) => value - Math.floor(value);

    for (let index = 0; index < particleCount; index += 1) {
      const offset = index * 3;
      const seed = fract(Math.sin((index + 1) * 12.9898) * 43758.5453);
      const depthSeed = fract(Math.sin((index + 7) * 78.233) * 24634.6345);
      const y = 1 - 2 * ((index + 0.5) / particleCount);
      const latitudeRadius = Math.sqrt(Math.max(0, 1 - y * y));
      const longitude = index * goldenAngle;
      const volumeRadius = index % 13 === 0 ? 1 : 0.3 + 0.7 * Math.cbrt(depthSeed);
      const latitude = Math.acos(Math.max(-1, Math.min(1, y)));
      const tubeRadius = 0.14 + 0.25 * Math.sqrt(depthSeed);
      const ringRadius = 0.61 + 0.055 * Math.sin(longitude * 3 + seed * tau);

      positions[offset] = Math.cos(longitude) * latitudeRadius * volumeRadius;
      positions[offset + 1] = y * volumeRadius;
      positions[offset + 2] = Math.sin(longitude) * latitudeRadius * volumeRadius;
      targets[offset] = (ringRadius + tubeRadius * Math.cos(latitude)) * Math.cos(longitude);
      targets[offset + 1] = tubeRadius * Math.sin(latitude);
      targets[offset + 2] = (ringRadius + tubeRadius * Math.cos(latitude)) * Math.sin(longitude);
      seeds[index] = seed;
      sparks[index] = index % 211 === 0 ? 1 : 0;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      });
    } catch {
      canvas.hidden = true;
      return () => {
        canvas.hidden = false;
      };
    }
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 10);
    camera.position.z = 3.12;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aTarget", new THREE.BufferAttribute(targets, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute("aSpark", new THREE.BufferAttribute(sparks, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMotion: { value: motionFor(state) },
        uPixelRatio: { value: 1 },
      },
      vertexShader: `
        precision highp float;
        uniform float uTime;
        uniform float uMotion;
        uniform float uPixelRatio;
        attribute vec3 aTarget;
        attribute float aSeed;
        attribute float aSpark;
        varying float vDepth;
        varying float vSpark;
        varying float vPulse;

        float easeInOut(float value) {
          return value * value * (3.0 - 2.0 * value);
        }

        mat2 rotate2d(float angle) {
          float sine = sin(angle);
          float cosine = cos(angle);
          return mat2(cosine, -sine, sine, cosine);
        }

        void main() {
          float time = uTime * uMotion;
          float morph = easeInOut(0.5 + 0.5 * sin(time * 0.31 - 0.68));
          vec3 point = mix(position, aTarget, morph);
          vec3 flow = vec3(
            sin(point.y * 3.45 + time * 1.26 + aSeed * 5.7),
            sin(point.z * 3.72 - time * 1.04 + aSeed * 3.3),
            sin(point.x * 3.08 + time * 0.89 - aSeed * 4.2)
          );
          point += 0.072 * vec3(
            flow.x - flow.y * 0.34,
            flow.y - flow.z * 0.31,
            flow.z - flow.x * 0.28
          );
          point *= 1.0 + sin(time * 1.52 + aSeed * 6.28318) * 0.022;
          point.xz = rotate2d(time * 0.105) * point.xz;
          point.yz = rotate2d(0.16 + sin(time * 0.37) * 0.09) * point.yz;
          vec4 viewPosition = modelViewMatrix * vec4(point, 1.0);
          vDepth = clamp((point.z + 1.18) / 2.36, 0.0, 1.0);
          vSpark = aSpark;
          vPulse = 0.72 + 0.28 * sin(time * 2.05 + aSeed * 12.0);
          float perspective = clamp(3.05 / -viewPosition.z, 0.72, 1.38);
          gl_PointSize = (0.6 + vDepth * 0.58 + aSeed * 0.15 + aSpark * 2.35) * uPixelRatio * perspective;
          gl_Position = projectionMatrix * viewPosition;
        }
      `,
      fragmentShader: `
        precision highp float;
        varying float vDepth;
        varying float vSpark;
        varying float vPulse;

        void main() {
          vec2 centered = gl_PointCoord - vec2(0.5);
          float distanceToCenter = length(centered);
          float disc = 1.0 - smoothstep(0.16, 0.52, distanceToCenter);
          float core = 1.0 - smoothstep(0.0, 0.17, distanceToCenter);
          vec3 deepAmber = vec3(0.56, 0.205, 0.035);
          vec3 nearAmber = vec3(1.0, 0.69, 0.32);
          vec3 color = mix(deepAmber, nearAmber, vDepth * 0.86 + vSpark * 0.14);
          float alpha = disc * mix(0.17, 0.74, vDepth) * vPulse;
          alpha += core * vSpark * 0.6;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(color, alpha);
        }
      `,
    });

    const field = new THREE.Points(geometry, material);
    field.scale.setScalar(1.08);
    scene.add(field);
    let animationFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let tiltX = 0;
    let tiltY = 0;
    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const size = Math.max(1, Math.min(rect.width, rect.height));
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(size, size, false);
      material.uniforms.uPixelRatio.value = pixelRatio;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
    };

    const pointerMove = (event: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.2;
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.14;
    };
    const pointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
    };
    const draw = (timestamp: number) => {
      material.uniforms.uTime.value = timestamp * 0.001;
      tiltX += (pointerY - tiltX) * 0.035;
      tiltY += (pointerX - tiltY) * 0.035;
      field.rotation.x = tiltX;
      field.rotation.y = tiltY;
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(draw);
    };

    resize();
    draw(0);
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    parent.addEventListener("pointermove", pointerMove);
    parent.addEventListener("pointerleave", pointerLeave);
    return () => {
      observer.disconnect();
      parent.removeEventListener("pointermove", pointerMove);
      parent.removeEventListener("pointerleave", pointerLeave);
      cancelAnimationFrame(animationFrame);
      scene.remove(field);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [state]);

  const copy = stateCopy[state];
  return (
    <button
      type="button"
      className={styles.holo}
      data-holo-state={state}
      aria-label={`Diana Holo state: ${copy.label}. ${copy.detail}. Activate for explanation.`}
      onClick={onActivate}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <span className={styles.holoAura} aria-hidden="true" />
      <span className={styles.holoCore}>
        <span className={styles.holoState}><i aria-hidden="true" />{copy.label}</span>
        <strong>DIANA</strong>
        <small>{copy.detail}</small>
      </span>
      {state === "working" && (
        <span className={styles.workerRing} aria-hidden="true">
          <i /><i /><i />
        </span>
      )}
    </button>
  );
}
