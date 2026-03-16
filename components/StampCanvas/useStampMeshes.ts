/**
 * Utility — not a React hook.
 * Creates stamp PlaneGeometry meshes for each project, adds them to the scene,
 * and returns an onFrame function that lerps hover scales each rAF tick.
 */
import * as THREE from "three";
import { Project } from "@/lib/types";
import { ThreeCtx } from "./useThreeScene";
import { createStampTexture, createTitleTexture, createHoverOverlayTexture } from "./stampTexture";

const COL_SPACING = 2.2;
const ROW_SPACING = 2.8;

export type StampMeshCtx = {
  meshes: THREE.Mesh[];
  hoveredIdRef: { value: string | null };
  panLimits: { x: number; y: number };
  /** Set as ctx.onFrame to drive scale/opacity lerp each rAF tick */
  onFrame: () => void;
  dispose: () => void;
  titleMesh: THREE.Mesh;
  titleMat: THREE.MeshBasicMaterial;
  titleGeo: THREE.PlaneGeometry;
  titleX: number;
  titleY: number;
  titleLinkBox: { x: number; y: number; w: number; h: number };
};

export async function setupStampMeshes(
  ctx: ThreeCtx,
  projects: Project[]
): Promise<StampMeshCtx> {
  // ── Derive how many columns fit the visible viewport ─────────────────────
  // Visible world-height at z=0 from a 50° FOV camera at z=12
    // Visible world-height at z=0 from the actual camera FOV
  const fovY = (ctx.camera.fov * Math.PI) / 180; 
  const visibleH = 2 * Math.tan(fovY / 2) * ctx.camera.position.z;
  const aspect = ctx.renderer.domElement.clientWidth / ctx.renderer.domElement.clientHeight;
  const visibleW = visibleH * aspect;

  // Fill visible width + 1 extra column on each side; force odd so a column
  // lands exactly at x=0, guaranteeing the title slot is centered on load.
  const rawCols = Math.max(5, Math.round(visibleW / COL_SPACING) + 2);
  const COLS = rawCols % 2 === 0 ? rawCols + 1 : rawCols;

  // +1 accounts for the reserved title slot; force odd for y=0 centering too.
  const rawRows = Math.ceil((projects.length + 1) / COLS);
  const ROWS = rawRows % 2 === 0 ? rawRows + 1 : rawRows;

  const gridHalfW = ((COLS - 1) * COL_SPACING) / 2;
  const gridHalfH = ((ROWS - 1) * ROW_SPACING) / 2;

  // Pan limits: allow camera to reach the outermost stamps (minus half viewport)
  const panLimits = {
    x: Math.max(0, gridHalfW - visibleW / 2 + COL_SPACING),
    y: Math.max(0, gridHalfH - visibleH / 2 + ROW_SPACING),
  };

  // ── Pre-load all images in parallel ──────────────────────────────────────
  const images = await Promise.all(
    projects.map(
      (p) =>
        new Promise<HTMLImageElement | null>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = `${p.cover_image_url}/400/400`;
        })
    )
  );

  const meshes: THREE.Mesh[] = [];
  const overlays: THREE.Mesh[] = [];
  const hoveredIdRef = { value: null as string | null };

  // Both COLS and ROWS are odd, so (COLS-1)/2 and (ROWS-1)/2 are exact integers
  // that map to world x=0, y=0 — the camera's initial look-at point.
  const titleSlot = ((ROWS - 1) / 2) * COLS + (COLS - 1) / 2;
  const totalSlots = ROWS * COLS;

  // Walk grid slots, skipping titleSlot; consume one project per non-title slot
  let projectIdx = 0;
  for (let slotIdx = 0; slotIdx < totalSlots && projectIdx < projects.length; slotIdx++) {
    if (slotIdx === titleSlot) continue;

    const project = projects[projectIdx];
    const img = images[projectIdx];
    projectIdx++;

    const col = slotIdx % COLS;
    const row = Math.floor(slotIdx / COLS);
    const stampX = col * COL_SPACING - gridHalfW;
    const stampY = -(row * ROW_SPACING) + gridHalfH;

    // ── Stamp mesh ──────────────────────────────────────────────────────────
    const texture = createStampTexture(project, img);
    const geo = new THREE.PlaneGeometry(1.36, 1.36);
    const mat = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(stampX, stampY, 0);
    mesh.userData.projectId = project.id;
    ctx.scene.add(mesh);
    meshes.push(mesh);

    // ── Hover overlay mesh ──────────────────────────────────────────────────
    const overlayTexture = createHoverOverlayTexture(project);
    const overlayGeo = new THREE.PlaneGeometry(1.36, 1.36);
    const overlayMat = new THREE.MeshBasicMaterial({
      map: overlayTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const overlayMesh = new THREE.Mesh(overlayGeo, overlayMat);
    overlayMesh.position.set(stampX, stampY, 0.02);
    ctx.scene.add(overlayMesh);
    overlays.push(overlayMesh);
  }

  // ── Title mesh — occupies the reserved center grid slot ──────────────────
  const titleCol = titleSlot % COLS;
  const titleRow = Math.floor(titleSlot / COLS);
  const titleX = titleCol * COL_SPACING - gridHalfW;
  const titleY = -(titleRow * ROW_SPACING) + gridHalfH;

  let titleHover = false;
  let { texture: titleTexture, linkBox: titleLinkBox } = createTitleTexture(titleHover);
  const titleGeo = new THREE.PlaneGeometry(1.36, 1.36);
  const titleMat = new THREE.MeshBasicMaterial({
    map: titleTexture,
    transparent: true,
    depthWrite: false,
  });
  const titleMesh = new THREE.Mesh(titleGeo, titleMat);
  titleMesh.position.set(titleX, titleY, 0);
  titleMesh.userData.isTitle = true;
  titleMesh.userData.linkBox = titleLinkBox;
  ctx.scene.add(titleMesh);

  function onFrame() {
    meshes.forEach((mesh, i) => {
      const isHovered = mesh.userData.projectId === hoveredIdRef.value;

      // Scale lerp
      const targetScale = isHovered ? 1.08 : 1.0;
      mesh.scale.x += (targetScale - mesh.scale.x) * 0.12;
      mesh.scale.y += (targetScale - mesh.scale.y) * 0.12;

      // Overlay opacity lerp
      const mat = overlays[i].material as THREE.MeshBasicMaterial;
      mat.opacity += ((isHovered ? 1.0 : 0.0) - mat.opacity) * 0.14;
    });
  }

  function dispose() {
    meshes.forEach((mesh, i) => {
      ctx.scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.MeshBasicMaterial).map?.dispose();
      (mesh.material as THREE.MeshBasicMaterial).dispose();

      ctx.scene.remove(overlays[i]);
      overlays[i].geometry.dispose();
      (overlays[i].material as THREE.MeshBasicMaterial).map?.dispose();
      (overlays[i].material as THREE.MeshBasicMaterial).dispose();
    });
    ctx.scene.remove(titleMesh);
    titleGeo.dispose();
    titleMat.map?.dispose();
    titleMat.dispose();
  }

  return { meshes, hoveredIdRef, panLimits, onFrame, dispose, titleMesh, titleMat, titleGeo, titleX, titleY, titleLinkBox };
}
