/**
 * Utility — not a React hook.
 * Creates stamp PlaneGeometry meshes for each project, adds them to the scene,
 * and returns an onFrame function that lerps hover scales each rAF tick.
 */
import * as THREE from "three";
import { Project } from "@/lib/types";
import { ThreeCtx } from "./useThreeScene";
import { createStampTexture } from "./stampTexture";

// Matches the CSS gallery stagger rhythm
const ROTATIONS = [-2.1, 1.4, -0.8, 2.3, -1.6, 0.9, -2.4, 1.1];

const COLS = 4;
const COL_SPACING = 2.2;
const ROW_SPACING = 2.8;

// Stagger Y offsets per column index (0-based)
const COL_Y_OFFSET = [0, 0.5, 0.25, 0, 0.5, 0.25];

export type StampMeshCtx = {
  meshes: THREE.Mesh[];
  hoveredIdRef: { value: string | null };
  /** Set as ctx.onFrame to drive scale/rotation lerp each rAF tick */
  onFrame: () => void;
  dispose: () => void;
};

export async function setupStampMeshes(
  ctx: ThreeCtx,
  projects: Project[]
): Promise<StampMeshCtx> {
  // Pre-load all images in parallel
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
  const hoveredIdRef = { value: null as string | null };

  projects.forEach((project, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);

    const texture = createStampTexture(project, images[i]);
    const geo = new THREE.PlaneGeometry(1.6, 1.6);
    const mat = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geo, mat);

    // World-space position
    const totalWidth = (COLS - 1) * COL_SPACING;
    mesh.position.x = col * COL_SPACING - totalWidth / 2;
    mesh.position.y = -(row * ROW_SPACING) + (COL_Y_OFFSET[col] ?? 0);

    // Slight rotation like stamp gallery
    mesh.rotation.z = (ROTATIONS[i % ROTATIONS.length] * Math.PI) / 180;

    mesh.userData.projectId = project.id;
    mesh.userData.baseRotZ = mesh.rotation.z;

    ctx.scene.add(mesh);
    meshes.push(mesh);
  });

  function onFrame() {
    meshes.forEach((mesh) => {
      const isHovered = mesh.userData.projectId === hoveredIdRef.value;
      const targetScale = isHovered ? 1.08 : 1.0;
      const targetRotZ = isHovered ? 0 : mesh.userData.baseRotZ;

      mesh.scale.x += (targetScale - mesh.scale.x) * 0.12;
      mesh.scale.y += (targetScale - mesh.scale.y) * 0.12;
      mesh.rotation.z += (targetRotZ - mesh.rotation.z) * 0.12;
    });
  }

  function dispose() {
    meshes.forEach((mesh) => {
      ctx.scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.MeshBasicMaterial).map?.dispose();
      (mesh.material as THREE.MeshBasicMaterial).dispose();
    });
  }

  return { meshes, hoveredIdRef, onFrame, dispose };
}
