"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Project } from "@/lib/types";

type Props = {
  project: Project | null;
  onClose: () => void;
};

export default function ProjectPanel({ project, onClose }: Props) {
  const handleCopyLink = () => {
    if (!project) return;
    const url = `${window.location.origin}/?project=${project.id}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <AnimatePresence>
      {project && (
        <>
          {/* Backdrop — click to close on mobile */}
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            className="panel fixed right-0 top-0 z-50 flex h-full flex-col overflow-y-auto"
            style={{ background: "var(--panel-bg)", borderLeft: "1px solid var(--border)" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 flex items-start justify-between px-6 pt-6 pb-4"
              style={{ background: "var(--panel-bg)", borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex-1 pr-4">
                <p
                  className="mb-1 text-[10px] font-semibold tracking-[0.2em]"
                  style={{ color: "var(--muted)" }}
                >
                  {project.category}
                </p>
                <h2 className="text-xl font-semibold leading-snug" style={{ color: "var(--foreground)" }}>
                  {project.title}
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                  by {project.author_name}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleCopyLink}
                  className="flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-white/10"
                  title="Copy link"
                  aria-label="Copy link"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--muted)" }}>
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </button>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-white/10"
                  title="Close"
                  aria-label="Close panel"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--muted)" }}>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Cover image — stamp styled */}
            <div className="px-6 pt-6">
              <div className="stamp-panel-outer mx-auto max-w-xs">
                <div className="stamp-panel-inner">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={`${project.cover_image_url}/400/400`}
                      alt={project.title}
                      fill
                      sizes="320px"
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="px-6 pt-6">
              {project.description.split("\n\n").map((para, i) => (
                <p
                  key={i}
                  className="mb-4 text-sm leading-relaxed"
                  style={{ color: i === 0 ? "var(--foreground)" : "var(--muted)" }}
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Link */}
            {project.project_url && (
              <div className="px-6 pt-2 pb-12">
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
                  style={{ color: "var(--foreground)" }}
                >
                  Visit Project
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              </div>
            )}

            {!project.project_url && <div className="pb-12" />}
          </motion.aside>

          <style jsx>{`
            .panel {
              width: 360px;
              min-width: 300px;
              max-width: 360px;
            }

            @media (max-width: 768px) {
              .panel {
                width: 100%;
                min-width: unset;
                max-width: unset;
              }
            }

            .stamp-panel-outer {
              position: relative;
              display: inline-block;
              width: 100%;
              padding: 10px;
              background-image: radial-gradient(
                circle at 50% 50%,
                transparent 5px,
                #111111 5px
              );
              background-size: 13px 13px;
              background-position: 0 0;
            }

            .stamp-panel-inner {
              background: #1a1918;
              border: 5px solid #1a1918;
              width: 100%;
              overflow: hidden;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
