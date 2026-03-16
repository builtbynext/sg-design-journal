"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { mockProjects } from "@/lib/mock-data";
import ProjectPanel from "@/components/ProjectPanel";

const StampCanvas = dynamic(() => import("@/components/StampCanvas"), {
  ssr: false,
});

function GalleryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("project");

  const selectedProject =
    mockProjects.find((p) => p.id === selectedId) ?? null;

  const handleSelect = (id: string) => {
    router.push(`/?project=${id}`, { scroll: false });
  };

  const handleClose = () => {
    router.push("/", { scroll: false });
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <StampCanvas
        projects={mockProjects}
        onSelectProject={handleSelect}
        dimmed={!!selectedId}
      />
      <ProjectPanel project={selectedProject} onClose={handleClose} />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <GalleryPage />
    </Suspense>
  );
}
