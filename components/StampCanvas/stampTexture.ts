import * as THREE from "three";
import { Project } from "@/lib/types";

export function createStampTexture(
  project: Project,
  img: HTMLImageElement | null
): THREE.CanvasTexture {
  const SIZE = 512;
  const PERF_ZONE = 24; // perforation border width in canvas px
  const DOT_RADIUS = 4;
  const DOT_SPACING = 9;

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;

  // Background (perforation zone colour)
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Inner stamp face
  ctx.fillStyle = "#1a1918";
  ctx.fillRect(PERF_ZONE, PERF_ZONE, SIZE - PERF_ZONE * 2, SIZE - PERF_ZONE * 2);

  // Draw project image inside inner rect (leave 4px inner border)
  const imgInset = PERF_ZONE + 4;
  const imgSize = SIZE - imgInset * 2;
  const IMAGE_PORTION = 0.72; // image takes top 72% of inner face
  const imgHeight = Math.round(imgSize * IMAGE_PORTION);

  if (img) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(imgInset, imgInset, imgSize, imgHeight);
    ctx.clip();
    ctx.drawImage(img, imgInset, imgInset, imgSize, imgHeight);
    ctx.restore();
  }

  // Perforated dots along all 4 edges
  ctx.fillStyle = "#0a0a0a";
  const half = DOT_RADIUS;
  const centerPerf = PERF_ZONE / 2;

  // Top & Bottom rows
  for (let x = DOT_SPACING / 2; x < SIZE; x += DOT_SPACING) {
    ctx.beginPath();
    ctx.arc(x, centerPerf, half, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, SIZE - centerPerf, half, 0, Math.PI * 2);
    ctx.fill();
  }
  // Left & Right columns
  for (let y = DOT_SPACING / 2; y < SIZE; y += DOT_SPACING) {
    ctx.beginPath();
    ctx.arc(centerPerf, y, half, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(SIZE - centerPerf, y, half, 0, Math.PI * 2);
    ctx.fill();
  }

  // Caption area (below image, inside stamp face)
  const captionTop = imgInset + imgHeight + 6;
  const captionWidth = imgSize;

  ctx.fillStyle = "#6b6760";
  ctx.font = `500 18px 'Helvetica Neue', Arial, sans-serif`;
  ctx.letterSpacing = "3px";
  const cat = project.category.toUpperCase();
  ctx.fillText(cat, imgInset, captionTop + 18, captionWidth);

  ctx.fillStyle = "#f0ede8";
  ctx.font = `500 22px 'Helvetica Neue', Arial, sans-serif`;
  ctx.letterSpacing = "0px";
  const title = project.title.length > 22 ? project.title.slice(0, 21) + "…" : project.title;
  ctx.fillText(title, imgInset, captionTop + 44, captionWidth);

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

  // Category label — small caps, muted
  ctx.fillStyle = "rgba(180, 170, 155, 0.75)";
  ctx.font = "500 16px 'Helvetica Neue', Arial, sans-serif";
  ctx.letterSpacing = "4px";
  ctx.textAlign = "left";
  ctx.fillText(project.category.toUpperCase(), pad, SIZE - 96);

  // Project title
  ctx.fillStyle = "#f0ede8";
  ctx.font = "500 26px 'Helvetica Neue', Arial, sans-serif";
  ctx.letterSpacing = "0px";
  const title = project.title.length > 24 ? project.title.slice(0, 23) + "…" : project.title;
  ctx.fillText(title, pad, SIZE - 60);

  // Description snippet
  ctx.fillStyle = "rgba(180, 170, 155, 0.6)";
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

export function createTitleTexture(): THREE.CanvasTexture {
  const SIZE = 512;
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;

  // Fully transparent background — material handles it
  ctx.clearRect(0, 0, SIZE, SIZE);

  const cx = SIZE / 2;
  const cy = SIZE / 2;

  // "FOFSG" — small caps, wide tracking
  ctx.fillStyle = "rgba(107, 103, 96, 0.55)";
  ctx.font = "600 18px 'Helvetica Neue', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "10px";
  ctx.fillText("FOFSG#25 - START", cx, cy - 42);

  // Main title — large italic serif
  ctx.fillStyle = "rgba(107, 103, 96, 0.42)";
  ctx.font = "italic 52px Georgia, 'Times New Roman', serif";
  ctx.letterSpacing = "0px";
  ctx.fillText("Design Journal", cx, cy + 12);

  // Subtitle — tiny monospace
  ctx.fillStyle = "rgba(107, 103, 96, 0.28)";
  ctx.font = "12px 'Courier New', monospace";
  ctx.letterSpacing = "5px";
  ctx.fillText("Field Notes", cx, cy + 46);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}
