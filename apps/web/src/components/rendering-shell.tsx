'use client';

import { useEffect, useRef, useState } from 'react';
import { Color, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { readCoreBoundary } from '../lib/wasm/core';

/** Browser-only Three.js shell. Scene analysis remains outside React. */
export function RenderingShell() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wasmBoundary, setWasmBoundary] = useState('loading');

  useEffect(() => {
    let isCurrent = true;

    void readCoreBoundary().then(
      (value) => {
        if (isCurrent) setWasmBoundary(value);
      },
      () => {
        if (isCurrent) setWasmBoundary('unavailable');
      },
    );

    const canvas = canvasRef.current;
    if (!canvas) return;

    let cleanup: (() => void) | undefined;

    try {
      const renderer = new WebGLRenderer({ canvas, antialias: true });
      const scene = new Scene();
      scene.background = new Color('#172a38');
      const camera = new PerspectiveCamera(45, 2, 0.1, 100);
      camera.position.z = 3;

      const render = () => {
        const { clientWidth, clientHeight } = canvas;
        renderer.setSize(clientWidth, clientHeight, false);
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      };
      render();
      window.addEventListener('resize', render);
      cleanup = () => {
        window.removeEventListener('resize', render);
        renderer.dispose();
      };
    } catch {
      // WebGL context may be unavailable in headless CI environments
    }

    return () => {
      isCurrent = false;
      cleanup?.();
    };
  }, []);

  return (
    <>
      <canvas aria-label="Three-dimensional rendering canvas" id="three-canvas" ref={canvasRef} />
      <p aria-live="polite">WASM boundary: {wasmBoundary}</p>
    </>
  );
}
