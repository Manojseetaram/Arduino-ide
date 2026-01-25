"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { MonacoEditor } from "@/components/monacoeditor";
import { CreateProjectModal } from "@/components/create-project-modal";
import { ExplorerNode, EditorTab } from "@/components/explorer/types";
import { PostmanEditor } from "@/components/explorer/postman-editor";
import { invoke } from "@tauri-apps/api/tauri";
import { IconPlus, IconFolderPlus, IconSettings } from "@tabler/icons-react";

type Project = {
  name: string;
  path: string;
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectFiles, setProjectFiles] = useState<Record<string, ExplorerNode[]>>({});
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [theme] = useState<"light" | "dark">("light");
  const [showCreate, setShowCreate] = useState(false);
  
  const [editorTabs, setEditorTabs] = useState<Record<string, EditorTab[]>>({});
  const [activeTabId, setActiveTabId] = useState<Record<string, string | null>>({});
  const [showTerminal, setShowTerminal] = useState<Record<string, boolean>>({});

  const addProject = async (name: string) => {
    try {
      const projectPath: string = await invoke("create_project", { name });
      const children: ExplorerNode[] = await invoke("list_project_files", { projectPath });

const rootNode: ExplorerNode = {
  id: name,
  name,
  type: "folder",
  path: projectPath,
  children,
};

setProjectFiles(prev => ({
  ...prev,
  [name]: [rootNode],
}));

      setProjects(prev => [...prev, { name, path: projectPath }]);
     
      setEditorTabs(prev => ({ ...prev, [name]: [] }));
      setActiveTabId(prev => ({ ...prev, [name]: null }));
      setShowTerminal(prev => ({ ...prev, [name]: false }));
      setCurrentProject(name);
      setShowCreate(false);
    } catch (err) {
      console.error(err);
    }
  };

  const openPostmanTab = useCallback(() => {
    if (!currentProject) return;
    const timestamp = new Date().getTime();
    const postmanTab: EditorTab = {
      id: crypto.randomUUID(),
      name: `Postman ${timestamp}`,
      path: `postman://api-testing-${timestamp}`,
      saved: true,
      type: "postman"
    };

    setEditorTabs(prev => ({
      ...prev,
      [currentProject]: [...(prev[currentProject] || []), postmanTab]
    }));
    setActiveTabId(prev => ({ ...prev, [currentProject]: postmanTab.id }));
  }, [currentProject, editorTabs]);

  const handleFileSelect = useCallback((file: ExplorerNode) => {
    if (!currentProject || file.type === "folder") return;
    const projectTabs = editorTabs[currentProject] || [];
    const existingTab = projectTabs.find(tab => tab.path === file.path);

    if (existingTab) {
      setActiveTabId(prev => ({ ...prev, [currentProject]: existingTab.id }));
    } else {
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
      setActiveTabId(prev => ({ ...prev, [currentProject]: newTab.id }));
    }
  }, [currentProject, editorTabs]);

  const handleTabSelect = useCallback((tabId: string) => {
    if (!currentProject) return;
    setActiveTabId(prev => ({ ...prev, [currentProject]: tabId }));
  }, [currentProject]);

  const handleTabClose = useCallback((tabId: string) => {
    if (!currentProject) return;
    const projectTabs = editorTabs[currentProject] || [];
    const updatedTabs = projectTabs.filter(tab => tab.id !== tabId);
    
    setEditorTabs(prev => ({ ...prev, [currentProject]: updatedTabs }));
    if (activeTabId[currentProject] === tabId) {
      if (updatedTabs.length > 0) {
        setActiveTabId(prev => ({ ...prev, [currentProject]: updatedTabs[updatedTabs.length - 1].id }));
      } else {
        setActiveTabId(prev => ({ ...prev, [currentProject]: null }));
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
  const activeTab = currentTabs.find(tab => tab.id === currentActiveTabId);
  const isPostmanTab = activeTab?.type === "postman" || (activeTab?.name?.startsWith("Postman") ?? false);

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
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
            [currentProject]: typeof value === "function"
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
          <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white p-8">
            <div className="max-w-md w-full text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-200 text-blue-600 flex items-center justify-center text-4xl mb-6 shadow-lg">
                <IconFolderPlus size={48} />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Arduino IDE+</h1>
              <p className="text-gray-600 mb-8">
                A modern IDE for Arduino, C, and C++ development with clean interface and powerful features
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <IconPlus size={20} />
                  Create New Project
                </button>
                
                <button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow flex items-center gap-2">
                  <IconSettings size={20} />
                  Open Existing
                </button>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="w-10 h-10 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                    📁
                  </div>
                  <h3 className="font-semibold text-gray-800">File Management</h3>
                  <p className="text-sm text-gray-600 mt-1">Clean file explorer</p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="w-10 h-10 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3">
                    ⚡
                  </div>
                  <h3 className="font-semibold text-gray-800">Fast Compilation</h3>
                  <p className="text-sm text-gray-600 mt-1">Quick build & upload</p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="w-10 h-10 mx-auto rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                    🔧
                  </div>
                  <h3 className="font-semibold text-gray-800">API Testing</h3>
                  <p className="text-sm text-gray-600 mt-1">Built-in Postman</p>
                </div>
              </div>
            </div>
          </div>
        ) : isPostmanTab ? (
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