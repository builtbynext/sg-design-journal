import * as THREE from "three";
import { Project } from "@/lib/types";

export function createStampTexture(
  _project: Project,
  img: HTMLImageElement | null
): THREE.CanvasTexture {
  const SIZE = 512;
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;

  // Dark background fallback
  ctx.fillStyle = "#1a1918";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Full-bleed image — title/type revealed only on hover overlay
  if (img) {
    ctx.drawImage(img, 0, 0, SIZE, SIZE);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function createHoverOverlayTexture(project: Project): THREE.CanvasTexture {
  const SIZE = 512;
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;

  // Dark gradient from transparent at top to nearly opaque at bottom
  const gradient = ctx.createLinearGradient(0, SIZE * 0.35, 0, SIZE);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(0.5, "rgba(0,0,0,0.72)");
  gradient.addColorStop(1, "rgba(0,0,0,0.92)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const pad = 32;

  // Category label
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.font = "500 16px 'Helvetica Neue', Arial, sans-serif";
  ctx.letterSpacing = "4px";
  ctx.textAlign = "left";
  ctx.fillText(project.category.toUpperCase(), pad, SIZE - 96);

  // Project title
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.font = "500 26px 'Helvetica Neue', Arial, sans-serif";
  ctx.letterSpacing = "0px";
  const title = project.title.length > 24 ? project.title.slice(0, 23) + "…" : project.title;
  ctx.fillText(title, pad, SIZE - 60);

  // Description snippet
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.font = "13px 'Helvetica Neue', Arial, sans-serif";
  ctx.letterSpacing = "0px";
  const snippet = project.description.length > 44
    ? project.description.slice(0, 43) + "…"
    : project.description;
  ctx.fillText(snippet, pad, SIZE - 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

export function createTitleTexture(hovered: boolean = false): { texture: THREE.CanvasTexture, linkBox: { x: number, y: number, w: number, h: number } } {
  const SIZE = 512;
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, SIZE, SIZE);

  const cx = SIZE / 2;
  const cy = SIZE / 2;

  // "FOFSG#25 - START" — small caps, wide tracking
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.font = "22px Geist Mono, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "5px";
  ctx.fillText("Friends of Figma Singapore", cx, cy - 42);

  // Main title — large italic serif
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = "48px Geist Mono, serif";
  ctx.letterSpacing = "0px";
  ctx.fillText("Design Field Notes", cx, cy + 35);

  // Subtitle (hyperlink)
  ctx.fillStyle = hovered ? "#4a90e2" : "rgba(255, 255, 255, 0.65)";
  ctx.font = "24px 'Geist Mono', monospace";
  ctx.letterSpacing = "5px";
  ctx.textAlign = "center";
  const linkText = "Submit your project";
  ctx.fillText(linkText, cx, cy + 100);

  // Calculate bounding box for link
  const metrics = ctx.measureText(linkText);
  const linkW = metrics.width;
  const linkH = 28; // Approximate height
  const linkX = cx - linkW / 2;
  const linkY = cy + 100 - linkH / 2;

  // Underline effect on hover
  if (hovered) {
    ctx.strokeStyle = "#4a90e2";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(linkX, cy + 110);
    ctx.lineTo(linkX + linkW, cy + 110);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return { texture, linkBox: { x: linkX, y: linkY, w: linkW, h: linkH } };
}
