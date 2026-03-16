/**
 * Utility — not a React hook.
 * Attaches all mouse/wheel/touch event listeners to the renderer's canvas.
 * Returns a cleanup function.
 */
import * as THREE from "three";
import { ThreeCtx } from "./useThreeScene";
import { StampMeshCtx } from "./useStampMeshes";
import { createTitleTexture } from "./stampTexture";

export function setupInteraction(
  ctx: ThreeCtx,
  stampCtx: StampMeshCtx,
  onSelectProject: (id: string) => void
): () => void {
  const { renderer, camera, cameraOffsetRef } = ctx;
  const { meshes, hoveredIdRef, panLimits, titleMesh, titleMat, titleX, titleY, titleLinkBox } = stampCtx;
  const MAX_PAN_X = panLimits.x;
  const MAX_PAN_Y = panLimits.y;
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

  /** Returns world-space x,y where the current raycaster ray hits z=0. */
  function worldAtZ0(): { x: number; y: number } {
    const t = -raycaster.ray.origin.z / raycaster.ray.direction.z;
    return {
      x: raycaster.ray.origin.x + t * raycaster.ray.direction.x,
      y: raycaster.ray.origin.y + t * raycaster.ray.direction.y,
    };
  }

  // ── Mouse move: hover ───────────────────────────────────────────────────
  let titleHover = false;
  function onMouseMove(e: MouseEvent) {
    const hit = getHit(e.clientX, e.clientY);
    hoveredIdRef.value = hit ? hit.userData.projectId : null;
    canvas.style.cursor = hit ? "pointer" : "default";

    // Check if mouse is over the title link
    const w = worldAtZ0();
    const localX = (w.x - titleX) * (512 / 1.36) + 256;
    const localY = -(w.y - titleY) * (512 / 1.36) + 256;
    const box = titleLinkBox;
    const inLink = localX >= box.x && localX <= box.x + box.w && localY >= box.y && localY <= box.y + box.h;
    if (inLink !== titleHover) {
      titleHover = inLink;
      titleMat.map?.dispose();
      const { texture } = createTitleTexture(titleHover);
      titleMat.map = texture;
      titleMat.needsUpdate = true;
    }
    if (inLink) {
      canvas.style.cursor = "pointer";
    }
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
      // Check if mouse is over the title link
      const w = worldAtZ0();
      const localX = (w.x - titleX) * (512 / 1.36) + 256;
      const localY = -(w.y - titleY) * (512 / 1.36) + 256;
      const box = titleLinkBox;
      const inLink = localX >= box.x && localX <= box.x + box.w && localY >= box.y && localY <= box.y + box.h;
      if (inLink) {
        window.open("https://google.com", "_blank");
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
