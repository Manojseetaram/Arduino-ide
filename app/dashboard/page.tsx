"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { MonacoEditor } from "@/components/monacoeditor";
import { CreateProjectModal } from "@/components/create-project-modal";
import { ExplorerNode, EditorTab } from "@/components/explorer/types";
import { PostmanEditor } from "@/components/explorer/postman-editor";
import { invoke } from "@tauri-apps/api/tauri";
type Project = {
  name: string;
  path: string;
};
export default function DashboardPage() {
  // const [projects, setProjects] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [projectFiles, setProjectFiles] = useState<Record<string, ExplorerNode[]>>({});
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [theme] = useState<"light" | "dark">("dark");
  const [showCreate, setShowCreate] = useState(false);
  
  // Editor state
  const [editorTabs, setEditorTabs] = useState<Record<string, EditorTab[]>>({});
  const [activeTabId, setActiveTabId] = useState<Record<string, string | null>>({});
  
  // Terminal state per project
  const [showTerminal, setShowTerminal] = useState<Record<string, boolean>>({});

const addProject = async (name: string) => {
  try {
    const projectPath: string = await invoke("create_project", { name });

    const files: ExplorerNode[] = await invoke("list_project_files", {
      projectPath,
    });

    setProjects(prev => [...prev, { name, path: projectPath }]);

    setProjectFiles(prev => ({
      ...prev,
      [name]: files,
    }));

    setEditorTabs(prev => ({ ...prev, [name]: [] }));
    setActiveTabId(prev => ({ ...prev, [name]: null }));
    setShowTerminal(prev => ({ ...prev, [name]: false }));

    setCurrentProject(name);
    setShowCreate(false);
  } catch (err) {
    console.error(err);
  }
};
// Add this function in dashboard/page.tsx
const debugFileStructure = useCallback(() => {
  if (!currentProject) return;
  
  const files = projectFiles[currentProject] || [];
  console.log("=== DEBUG File Structure ===");
  console.log("Current Project:", currentProject);
  console.log("Files array:", files);
  
  // Recursively log all files and folders
  const logNode = (node: ExplorerNode, depth: number = 0) => {
    const indent = "  ".repeat(depth);
    console.log(`${indent}${node.type === 'folder' ? '📁' : '📄'} ${node.name} (${node.id})`);
    if (node.type === 'folder' && node.children) {
      node.children.forEach(child => logNode(child, depth + 1));
    }
  };
  
  files.forEach(node => logNode(node));
  console.log("=== END DEBUG ===");
}, [currentProject, projectFiles]);

// Add a debug button in your return statement (temporarily)
{currentProject && (
  <button 
    onClick={debugFileStructure}
    className="absolute bottom-4 right-4 bg-red-500 text-white p-2 rounded text-xs z-50"
  >
    Debug Files
  </button>
)}

  // Function to open Postman as a tab - ALWAYS CREATE NEW TAB
  const openPostmanTab = useCallback(() => {
    if (!currentProject) return;

    const projectTabs = editorTabs[currentProject] || [];
    
    // ALWAYS create new Postman tab with timestamp to allow duplicates
    const timestamp = new Date().getTime();
    const postmanTab: EditorTab = {
      id: crypto.randomUUID(),
      name: `Postman ${timestamp}`, // Add timestamp to allow duplicates
      path: `postman://api-testing-${timestamp}`,
      saved: true,
      type: "postman"
    };

    setEditorTabs(prev => ({
      ...prev,
      [currentProject]: [...(prev[currentProject] || []), postmanTab]
    }));

    setActiveTabId(prev => ({
      ...prev,
      [currentProject]: postmanTab.id
    }));
    
    console.log("Postman tab created:", postmanTab.name);
  }, [currentProject, editorTabs]);

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
        saved: true,
        type: "file"
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
          tab.id === tabId && tab.type !== "postman" ? { ...tab, saved: false } : tab
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

  // Check if active tab is Postman (any tab that starts with "Postman")
  const activeTab = currentTabs.find(tab => tab.id === currentActiveTabId);
  const isPostmanTab = activeTab?.type === "postman" || (activeTab?.name?.startsWith("Postman") ?? false);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
<Sidebar
  projects={projects.map(p => p.name)}
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
  onOpenPostman={openPostmanTab}
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
        ) : isPostmanTab ? (
          // Render Postman when active tab is Postman
          <PostmanEditor
            projectName={currentProject}
            theme={theme}
            tabs={currentTabs}
            activeTabId={currentActiveTabId}
            onTabSelect={handleTabSelect}
            onTabClose={handleTabClose}
            showTerminal={currentShowTerminal}
            onToggleTerminal={handleToggleTerminal}
          />
        ) : (
          // Render Monaco Editor for regular files
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