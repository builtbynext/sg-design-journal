/**
 * Utility — not a React hook.
 * Attaches all mouse/wheel/touch event listeners to the renderer's canvas.
 * Returns a cleanup function.
 */
import * as THREE from "three";
import { ThreeCtx } from "./useThreeScene";
import { StampMeshCtx } from "./useStampMeshes";

const MAX_PAN_Y = 4;
const MAX_PAN_X = 3;
const MAX_TILT_RAD = (3 * Math.PI) / 180; // ±3°

export function setupInteraction(
  ctx: ThreeCtx,
  stampCtx: StampMeshCtx,
  onSelectProject: (id: string) => void
): () => void {
  const { renderer, camera, cameraOffsetRef, tiltRef } = ctx;
  const { meshes, hoveredIdRef } = stampCtx;
  const canvas = renderer.domElement;

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function getHit(clientX: number, clientY: number): THREE.Mesh | null {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(meshes);
    return hits.length > 0 ? (hits[0].object as THREE.Mesh) : null;
  }

  // ── Mouse move: hover + tilt ────────────────────────────────────────────
  function onMouseMove(e: MouseEvent) {
    const hit = getHit(e.clientX, e.clientY);
    hoveredIdRef.value = hit ? hit.userData.projectId : null;
    canvas.style.cursor = hit ? "pointer" : "default";

    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 … 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    tiltRef.x = -ny * MAX_TILT_RAD * 2;
    tiltRef.y = -nx * MAX_TILT_RAD * 2;
  }

  // ── Wheel: pan ──────────────────────────────────────────────────────────
  function onWheel(e: WheelEvent) {
    e.preventDefault();
    cameraOffsetRef.x = Math.max(
      -MAX_PAN_X,
      Math.min(MAX_PAN_X, cameraOffsetRef.x + e.deltaX * 0.005)
    );
    cameraOffsetRef.y = Math.max(
      -MAX_PAN_Y,
      Math.min(MAX_PAN_Y, cameraOffsetRef.y - e.deltaY * 0.005)
    );
  }

  // ── Drag / click ────────────────────────────────────────────────────────
  let dragStart = { x: 0, y: 0 };
  let dragDelta = 0;
  let isDragging = false;

  function onMouseDown(e: MouseEvent) {
    dragStart = { x: e.clientX, y: e.clientY };
    dragDelta = 0;
    isDragging = true;
  }

  function onMouseDrag(e: MouseEvent) {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    dragDelta = Math.sqrt(dx * dx + dy * dy);

    cameraOffsetRef.x = Math.max(
      -MAX_PAN_X,
      Math.min(MAX_PAN_X, cameraOffsetRef.x - dx * 0.005)
    );
    cameraOffsetRef.y = Math.max(
      -MAX_PAN_Y,
      Math.min(MAX_PAN_Y, cameraOffsetRef.y + dy * 0.005)
    );
    dragStart = { x: e.clientX, y: e.clientY };
  }

  function onMouseUp(e: MouseEvent) {
    if (!isDragging) return;
    isDragging = false;
    if (dragDelta < 4) {
      const hit = getHit(e.clientX, e.clientY);
      if (hit?.userData.projectId) {
        onSelectProject(hit.userData.projectId);
      }
    }
  }

  // ── Touch ───────────────────────────────────────────────────────────────
  let touchStart = { x: 0, y: 0 };
  let touchDelta = 0;

  function onTouchStart(e: TouchEvent) {
    const t = e.touches[0];
    touchStart = { x: t.clientX, y: t.clientY };
    touchDelta = 0;
  }

  function onTouchMove(e: TouchEvent) {
    const t = e.touches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    touchDelta = Math.sqrt(dx * dx + dy * dy);

    cameraOffsetRef.x = Math.max(
      -MAX_PAN_X,
      Math.min(MAX_PAN_X, cameraOffsetRef.x - dx * 0.005)
    );
    cameraOffsetRef.y = Math.max(
      -MAX_PAN_Y,
      Math.min(MAX_PAN_Y, cameraOffsetRef.y + dy * 0.005)
    );
    touchStart = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e: TouchEvent) {
    if (touchDelta < 4) {
      const t = e.changedTouches[0];
      const hit = getHit(t.clientX, t.clientY);
      if (hit?.userData.projectId) {
        onSelectProject(hit.userData.projectId);
      }
    }
  }

  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseDrag);
  window.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("touchstart", onTouchStart, { passive: true });
  canvas.addEventListener("touchmove", onTouchMove, { passive: true });
  canvas.addEventListener("touchend", onTouchEnd);

  return function cleanup() {
    canvas.removeEventListener("mousemove", onMouseMove);
    canvas.removeEventListener("wheel", onWheel);
    canvas.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mousemove", onMouseDrag);
    window.removeEventListener("mouseup", onMouseUp);
    canvas.removeEventListener("touchstart", onTouchStart);
    canvas.removeEventListener("touchmove", onTouchMove);
    canvas.removeEventListener("touchend", onTouchEnd);
  };
}
