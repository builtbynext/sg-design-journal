"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Project } from "@/lib/types";

type Props = {
  project: Project;
  index: number;
  onClick: () => void;
};

// Deterministic rotation so it's stable across renders
function getRotation(index: number): number {
  const rotations = [-2.1, 1.4, -0.8, 2.3, -1.6, 0.9, -2.4, 1.1];
  return rotations[index % rotations.length];
}

export default function ProjectCard({ project, index, onClick }: Props) {
  const rotation = getRotation(index);

  return (
    <motion.div
      className="cursor-pointer"
      style={{ rotate: rotation }}
      whileHover={{ scale: 1.04, rotate: 0, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
    >
      {/* Stamp outer wrapper — perforated edge via radial-gradient */}
      <div className="stamp-outer">
        {/* Stamp inner — white border + image */}
        <div className="stamp-inner">
          <div className="relative aspect-square w-full overflow-hidden">
            <Image
              src={`${project.cover_image_url}/400/400`}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Hover overlay */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/60 p-3 text-center"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-xs font-medium leading-relaxed text-white/90">
                {project.description.split("\n")[0].slice(0, 80)}…
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Caption below stamp */}
      <div className="mt-2 px-0.5">
        <p
          className="text-[8px] font-medium tracking-widest uppercase truncate"
          style={{ color: "var(--muted)" }}
        >
          {project.category}
        </p>
        <p className="mt-0.5 text-[11px] font-medium leading-snug truncate" style={{ color: "var(--foreground)" }}>
          {project.title}
        </p>
      </div>

      <style jsx>{`
        .stamp-outer {
          position: relative;
          display: inline-block;
          width: 100%;
          padding: 6px;
          background-image: radial-gradient(
            circle at 50% 50%,
            transparent 3.5px,
            #0a0a0a 3.5px
          );
          background-size: 9px 9px;
          background-position: 0 0;
        }

        .stamp-inner {
          background: #1a1918;
          border: 4px solid #1a1918;
          width: 100%;
          overflow: hidden;
        }
      `}</style>
    </motion.div>
  );
}
