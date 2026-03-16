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
