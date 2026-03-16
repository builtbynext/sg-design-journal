/**
 * Utility — not a React hook.
 * Creates the Three.js renderer, camera and scene, appends canvas to container,
 * starts the rAF loop, and returns a cleanup function.
 */
import * as THREE from "three";

export type ThreeCtx = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  cameraOffsetRef: { x: number; y: number };
  tiltRef: { x: number; y: number };
  /** Set by useStampMeshes; called each frame to lerp hover scales */
  onFrame: (() => void) | null;
};

export function setupThreeScene(container: HTMLDivElement): {
  ctx: ThreeCtx;
  cleanup: () => void;
} {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0a0a0a");

  const camera = new THREE.PerspectiveCamera(
    25, // Halved FOV for 2x zoom
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.z = 12;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const ctx: ThreeCtx = {
    scene,
    camera,
    renderer,
    cameraOffsetRef: { x: 0, y: 0 },
    tiltRef: { x: 0, y: 0 },
    onFrame: null,
  };

  let rafId: number;

  function render() {
    rafId = requestAnimationFrame(render);

    camera.position.x += (ctx.cameraOffsetRef.x - camera.position.x) * 0.08;
    camera.position.y += (ctx.cameraOffsetRef.y - camera.position.y) * 0.08;

    ctx.onFrame?.();

    renderer.render(scene, camera);
  }

  render();

  const ro = new ResizeObserver(() => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
  ro.observe(container);

  function cleanup() {
    cancelAnimationFrame(rafId);
    ro.disconnect();
    renderer.dispose();
    if (renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement);
    }
  }

  return { ctx, cleanup };
}
