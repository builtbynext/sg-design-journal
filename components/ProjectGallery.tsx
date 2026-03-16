"use client";

import { motion } from "framer-motion";
import { Project } from "@/lib/types";
import ProjectCard from "./ProjectCard";

type Props = {
  projects: Project[];
  onSelectProject: (id: string) => void;
  dimmed: boolean;
};

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ProjectGallery({
  projects,
  onSelectProject,
  dimmed,
}: Props) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Floating center title */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 select-none"
        style={{ zIndex: 10 }}
      >
        <p
          className="text-[10px] font-semibold tracking-[0.35em] uppercase"
          style={{ color: "var(--muted)", opacity: 0.6 }}
        >
          FOFSG
        </p>
        <p
          className="font-serif text-3xl italic"
          style={{ color: "var(--muted)", opacity: 0.45 }}
        >
          Side Projects
        </p>
        <p
          className="text-[9px] tracking-widest uppercase"
          style={{ color: "var(--muted)", opacity: 0.3, fontFamily: "var(--font-geist-mono)" }}
        >
          community builds
        </p>
      </div>

      {/* Gallery grid */}
      <motion.div
        className="gallery-grid relative"
        style={{
          zIndex: 1,
          transition: "filter 0.4s ease, opacity 0.4s ease",
          filter: dimmed ? "blur(3px)" : "none",
          opacity: dimmed ? 0.35 : 1,
          pointerEvents: dimmed ? "none" : "auto",
        }}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            variants={item}
            style={{
              marginTop: index % 6 === 1 || index % 6 === 4 ? "2.5rem" : index % 6 === 2 || index % 6 === 5 ? "1.25rem" : "0",
            }}
          >
            <ProjectCard
              project={project}
              index={index}
              onClick={() => onSelectProject(project.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      <style jsx>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, 148px);
          justify-content: center;
          gap: 2.5rem 2rem;
          align-items: start;
          padding: 3rem 2rem;
        }
      `}</style>
    </div>
  );
}
