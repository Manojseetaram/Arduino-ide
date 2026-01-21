"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { MonacoEditor } from "@/components/monacoeditor";
import { CreateProjectModal } from "@/components/create-project-modal";
import { ExplorerNode, EditorTab } from "@/components/explorer/types";

export default function DashboardPage() {
  const [projects, setProjects] = useState<string[]>([]);
  const [projectFiles, setProjectFiles] = useState<Record<string, ExplorerNode[]>>({});
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [theme] = useState<"light" | "dark">("dark");
  const [showCreate, setShowCreate] = useState(false);
  
  // Editor state
  const [editorTabs, setEditorTabs] = useState<Record<string, EditorTab[]>>({});
  const [activeTabId, setActiveTabId] = useState<Record<string, string | null>>({});
  
  // Terminal state per project
  const [showTerminal, setShowTerminal] = useState<Record<string, boolean>>({});

  const addProject = (name: string) => {
    const normalized = name.trim();
    if (!normalized) return;

    setProjects((p) => [...p, normalized]);
    
    // Start with empty files array for the new project
    setProjectFiles((f) => ({ ...f, [normalized]: [] }));
    
    setEditorTabs((t) => ({ ...t, [normalized]: [] }));
    setActiveTabId((a) => ({ ...a, [normalized]: null }));
    setShowTerminal((s) => ({ ...s, [normalized]: false }));
    setCurrentProject(normalized);
    setShowCreate(false);
  };

  const handleFileSelect = useCallback((file: ExplorerNode) => {
    if (!currentProject || file.type === "folder") return;

    const projectTabs = editorTabs[currentProject] || [];
    const existingTab = projectTabs.find(tab => tab.path === file.path);

    if (existingTab) {
      // Tab already exists, just activate it
      setActiveTabId(prev => ({
        ...prev,
        [currentProject]: existingTab.id
      }));
    } else {
      // Create new tab
      const newTab: EditorTab = {
        id: crypto.randomUUID(),
        name: file.name,
        path: file.path,
        saved: true
      };

      setEditorTabs(prev => ({
        ...prev,
        [currentProject]: [...(prev[currentProject] || []), newTab]
      }));

      setActiveTabId(prev => ({
        ...prev,
        [currentProject]: newTab.id
      }));
    }
  }, [currentProject, editorTabs]);

  const handleTabSelect = useCallback((tabId: string) => {
    if (!currentProject) return;
    
    setActiveTabId(prev => ({
      ...prev,
      [currentProject]: tabId
    }));
  }, [currentProject]);

  const handleTabClose = useCallback((tabId: string) => {
    if (!currentProject) return;

    const projectTabs = editorTabs[currentProject] || [];
    const updatedTabs = projectTabs.filter(tab => tab.id !== tabId);
    
    setEditorTabs(prev => ({
      ...prev,
      [currentProject]: updatedTabs
    }));

    // If we're closing the active tab, activate another one or clear
    if (activeTabId[currentProject] === tabId) {
      if (updatedTabs.length > 0) {
        setActiveTabId(prev => ({
          ...prev,
          [currentProject]: updatedTabs[updatedTabs.length - 1].id
        }));
      } else {
        setActiveTabId(prev => ({
          ...prev,
          [currentProject]: null
        }));
      }
    }
  }, [currentProject, editorTabs, activeTabId]);

  const handleContentChange = useCallback((tabId: string, content: string) => {
    if (!currentProject) return;

    setEditorTabs(prev => {
      const projectTabs = prev[currentProject] || [];
      return {
        ...prev,
        [currentProject]: projectTabs.map(tab => 
          tab.id === tabId ? { ...tab, saved: false } : tab
        )
      };
    });
  }, [currentProject]);

  const handleToggleTerminal = useCallback(() => {
    if (!currentProject) return;

    setShowTerminal(prev => ({
      ...prev,
      [currentProject]: !prev[currentProject]
    }));
  }, [currentProject]);

  const currentTabs = currentProject ? editorTabs[currentProject] || [] : [];
  const currentActiveTabId = currentProject ? activeTabId[currentProject] || null : null;
  const currentShowTerminal = currentProject ? showTerminal[currentProject] || false : false;
  const currentFiles = currentProject ? projectFiles[currentProject] || [] : [];

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        projects={projects}
        currentProject={currentProject}
        onSelectProject={setCurrentProject}
        theme={theme}
        files={currentFiles}
        setFiles={(value) => {
          if (!currentProject) return;

          setProjectFiles((prev) => ({
            ...prev,
            [currentProject]:
              typeof value === "function"
                ? value(prev[currentProject] ?? [])
                : value,
          }));
        }}
        onFileSelect={handleFileSelect}
        activeFileId={null}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {!currentProject ? (
          <div className="h-full flex items-center justify-center">
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Create New Project
            </button>
          </div>
        ) : (
          <MonacoEditor
            projectName={currentProject}
            theme={theme}
            tabs={currentTabs}
            activeTabId={currentActiveTabId}
            onTabSelect={handleTabSelect}
            onTabClose={handleTabClose}
            onContentChange={handleContentChange}
            showTerminal={currentShowTerminal}
            onToggleTerminal={handleToggleTerminal}
          />
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