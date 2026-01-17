"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { EditorLayout } from "@/components/editor-layout";
import { CreateProjectModal } from "@/components/create-project-modal";

export default function DashboardPage() {
  const [projects, setProjects] = useState<string[]>([]);
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [theme] = useState<"light" | "dark">("dark");
  const [showCreate, setShowCreate] = useState(false);

  const addProject = (name: string) => {
    const normalized =
      name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

    setProjects([normalized, ...projects]);
    setCurrentProject(normalized);
    setShowCreate(false);
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        projects={projects}
        currentProject={currentProject}
        onSelectProject={setCurrentProject}
        theme={theme}
      />

      <div className="flex-1 relative">
        {!currentProject ? (
          <div className="h-full flex items-center justify-center">
            <button
              onClick={() => setShowCreate(true)}
              className="text-blue-600 text-lg font-semibold hover:underline"
            >
              + Create Project
            </button>
          </div>
        ) : (
          <EditorLayout projectName={currentProject} theme={theme} />
        )}

        {showCreate && (
          <CreateProjectModal
            onClose={() => setShowCreate(false)}
            onCreate={addProject}
          />
        )}
      </div>
    </div>
  );
}
