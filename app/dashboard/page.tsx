"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { MonacoEditor } from "@/components/monacoeditor";
import { CreateProjectModal } from "@/components/create-project-modal";
import { ExplorerNode, EditorTab } from "@/components/explorer/types";
import { PostmanEditor } from "@/components/explorer/postman-editor";
import { invoke } from "@tauri-apps/api/tauri";
import { IconPlus, IconFolderPlus, IconSettings, IconClock, IconFolder } from "@tabler/icons-react";

type Project = {
  name: string;
  path: string;
};

type EditorTabState = {
  project_name: string;
  tabs: EditorTab[];
  active_tab_id: string | null;
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [projectFiles, setProjectFiles] = useState<Record<string, ExplorerNode[]>>({});
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [theme] = useState<"light" | "dark">("light");
  const [showCreate, setShowCreate] = useState(false);

  const [editorTabs, setEditorTabs] = useState<Record<string, EditorTab[]>>({});
  const [activeTabId, setActiveTabId] = useState<Record<string, string | null>>({});
  const [showTerminal, setShowTerminal] = useState<Record<string, boolean>>({});

  // ---------------- Load recent projects ----------------
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const recents: Project[] = await invoke("read_recent_projects");
        setRecentProjects(recents);
      } catch (err) {
        console.error("Failed to load recent projects:", err);
      }
    };
    loadRecent();
  }, []);

  // ---------------- Load editor state ----------------
  useEffect(() => {
    const loadEditorState = async () => {
      try {
        const savedState: EditorTabState[] = await invoke("load_editor_state");
        savedState.forEach(s => {
          setEditorTabs(prev => ({ ...prev, [s.project_name]: s.tabs }));
          setActiveTabId(prev => ({ ...prev, [s.project_name]: s.active_tab_id || null }));
        });
      } catch (err) {
        console.error("Failed to load editor state:", err);
      }
    };
    loadEditorState();
  }, []);

 useEffect(() => {
  const loadProjects = async () => {
    try {
      const allProjects: Project[] = await invoke("read_recent_projects");
      setProjects(allProjects);
      setRecentProjects(allProjects.slice(0, 5));

      // Load files for each project
      const filesState: Record<string, ExplorerNode[]> = {};

      for (const proj of allProjects) {
        try {
          const children: ExplorerNode[] = await invoke("list_project_files", { projectPath: proj.path });

          filesState[proj.name] = [
            {
              id: proj.name,
              name: proj.name,
              type: "folder",
              path: proj.path,
              children,
            },
          ];
        } catch (err) {
          console.error(`Failed to load files for project ${proj.name}:`, err);
        }
      }

      setProjectFiles(filesState);

    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  };

  loadProjects();
}, []);


  // ---------------- Add new project ----------------
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

      setProjectFiles(prev => ({ ...prev, [name]: [rootNode] }));
      setProjects(prev => [...prev, { name, path: projectPath }]);

      const updatedRecent = [{ name, path: projectPath }, ...recentProjects.filter(p => p.name !== name)].slice(0, 5);
      setRecentProjects(updatedRecent);

      // Save recent projects in Rust
      await invoke("write_recent_projects", { projects: updatedRecent });

      setEditorTabs(prev => ({ ...prev, [name]: [] }));
      setActiveTabId(prev => ({ ...prev, [name]: null }));
      setShowTerminal(prev => ({ ...prev, [name]: false }));
      setCurrentProject(name);
      setShowCreate(false);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- Select project (recent or normal) ----------------
  const handleSelectProject = async (name: string, path: string) => {
    setCurrentProject(name);

    if (!projectFiles[name]) {
      try {
        const children: ExplorerNode[] = await invoke("list_project_files", { projectPath: path });
        const rootNode: ExplorerNode = {
          id: name,
          name,
          type: "folder",
          path,
          children,
        };
        setProjectFiles(prev => ({ ...prev, [name]: [rootNode] }));
      } catch (err) {
        console.error("Failed to load project files:", err);
      }
    }

    try {
      const savedState: EditorTabState[] = await invoke("load_editor_state");
      const projectState = savedState.find(s => s.project_name === name);
      if (projectState) {
        setEditorTabs(prev => ({ ...prev, [name]: projectState.tabs }));
        setActiveTabId(prev => ({ ...prev, [name]: projectState.active_tab_id || null }));
      } else {
        setEditorTabs(prev => ({ ...prev, [name]: [] }));
        setActiveTabId(prev => ({ ...prev, [name]: null }));
      }
      setShowTerminal(prev => ({ ...prev, [name]: false }));
    } catch (err) {
      console.error("Failed to load project editor state:", err);
    }

    const updatedRecent = [{ name, path }, ...recentProjects.filter(p => p.name !== name)].slice(0, 5);
    setRecentProjects(updatedRecent);

    // Persist recent projects in Rust
    await invoke("write_recent_projects", { projects: updatedRecent });
  };

  // ---------------- Editor helpers ----------------
  const openPostmanTab = useCallback(() => {
    if (!currentProject) return;
    const timestamp = new Date().getTime();
    const postmanTab: EditorTab = {
      id: crypto.randomUUID(),
      name: `Postman ${timestamp}`,
      path: `postman://api-testing-${timestamp}`,
      saved: true,
      type: "postman",
    };

    setEditorTabs(prev => ({
      ...prev,
      [currentProject]: [...(prev[currentProject] || []), postmanTab],
    }));
    setActiveTabId(prev => ({ ...prev, [currentProject]: postmanTab.id }));
  }, [currentProject]);

  const handleFileSelect = useCallback(
    async (file: ExplorerNode) => {
      if (!currentProject || file.type === "folder") return;

      const projectTabs = editorTabs[currentProject] || [];
      const existingTab = projectTabs.find(tab => tab.path === file.path);

      if (existingTab) {
        setActiveTabId(prev => ({ ...prev, [currentProject]: existingTab.id }));
        return;
      }

      const content: string = await invoke("read_file", { path: file.path });

      const newTab: EditorTab = {
        id: crypto.randomUUID(),
        name: file.name,
        path: file.path,
        content,
        saved: true,
        type: "file",
      };

      setEditorTabs(prev => ({
        ...prev,
        [currentProject]: [...(prev[currentProject] || []), newTab],
      }));

      setActiveTabId(prev => ({ ...prev, [currentProject]: newTab.id }));
    },
    [currentProject, editorTabs]
  );

  const handleTabSelect = useCallback((tabId: string) => {
    if (!currentProject) return;
    setActiveTabId(prev => ({ ...prev, [currentProject]: tabId }));
  }, [currentProject]);

  const handleTabClose = useCallback(
    (tabId: string) => {
      if (!currentProject) return;
      const projectTabs = editorTabs[currentProject] || [];
      const updatedTabs = projectTabs.filter(tab => tab.id !== tabId);

      setEditorTabs(prev => ({ ...prev, [currentProject]: updatedTabs }));
      if (activeTabId[currentProject] === tabId) {
        setActiveTabId(prev => ({ ...prev, [currentProject]: updatedTabs.length ? updatedTabs[updatedTabs.length - 1].id : null }));
      }
    },
    [currentProject, editorTabs, activeTabId]
  );

  const handleContentChange = useCallback(
    (tabId: string, content: string) => {
      if (!currentProject) return;

      setEditorTabs(prev => {
        const projectTabs = prev[currentProject] || [];
        const updatedTabs = projectTabs.map(tab =>
          tab.id === tabId && tab.type !== "postman" ? { ...tab, content, saved: false } : tab
        );

        invoke("save_editor_state", {
          state: Object.entries({ ...prev, [currentProject]: updatedTabs }).map(([project_name, tabs]) => ({
            project_name,
            tabs,
            active_tab_id: activeTabId[project_name] || null,
          })),
        }).catch(console.error);

        return { ...prev, [currentProject]: updatedTabs };
      });
    },
    [currentProject, activeTabId]
  );

  const handleToggleTerminal = useCallback(() => {
    if (!currentProject) return;
    setShowTerminal(prev => ({ ...prev, [currentProject]: !prev[currentProject] }));
  }, [currentProject]);

  // ---------------- Render ----------------
  const currentTabs = currentProject ? editorTabs[currentProject] || [] : [];
  const currentActiveTabId = currentProject ? activeTabId[currentProject] || null : null;
  const currentShowTerminal = currentProject ? showTerminal[currentProject] || false : false;
  const currentFiles = currentProject ? projectFiles[currentProject] || [] : [];
  const activeTab = currentTabs.find(tab => tab.id === currentActiveTabId);
  const isPostmanTab = activeTab?.type === "postman" || (activeTab?.name?.startsWith("Postman") ?? false);

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
      <Sidebar
        projects={[...projects.map(p => p.name), ...recentProjects.map(p => p.name)]}
        currentProject={currentProject}
        onSelectProject={(name) => {
          const proj = projects.find(p => p.name === name) || recentProjects.find(p => p.name === name);
          if (proj) handleSelectProject(proj.name, proj.path);
        }}
        theme={theme}
        files={currentFiles}
        setFiles={(value) => {
          if (!currentProject) return;
          setProjectFiles(prev => ({
            ...prev,
            [currentProject]: typeof value === "function" ? value(prev[currentProject] ?? []) : value,
          }));
        }}
        onFileSelect={handleFileSelect}
        activeFileId={null}
        onOpenPostman={openPostmanTab}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {!currentProject ? (
          <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white p-8">
            <div className="max-w-2xl w-full">
              {/* Header Section */}
              <div className="text-center mb-12">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-200 text-blue-600 flex items-center justify-center text-4xl mb-6">
                  <IconFolderPlus size={40} />
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-3">
                  Welcome to <span className="text-blue-600">Arduino IDE+</span>
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Create your next Arduino project with a powerful, modern development environment.
                </p>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center mb-12">
                  <button
                    onClick={() => setShowCreate(true)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow hover:shadow-lg flex items-center gap-2"
                  >
                    <IconPlus size={20} />
                    Create New Project
                  </button>

                  <button className="px-8 py-3 bg-white border border-gray-300 text-gray-700 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2">
                    <IconSettings size={20} />
                    Open Existing
                  </button>
                </div>
              </div>

              {/* Recent Projects Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <IconClock className="text-gray-500" size={20} />
                  <h2 className="text-xl font-semibold text-gray-800">Recent Projects</h2>
                </div>

                {recentProjects.length > 0 ? (
                  <div className="space-y-2">
                    {recentProjects.slice(0, 5).map(p => (
                      <button
                        key={p.name}
                        onClick={() => handleSelectProject(p.name, p.path)}
                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-md transition-colors text-left group"
                      >
                        <IconFolder className="text-blue-500 group-hover:text-blue-600" size={18} />
                        <span className="font-medium text-gray-700 group-hover:text-blue-600">
                          {p.name}
                        </span>
                        <span className="text-sm text-gray-500 truncate ml-auto">
                          {p.path.split('/').pop()}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <IconFolder className="mx-auto mb-2 text-gray-400" size={24} />
                    <p>No recent projects found</p>
                  </div>
                )}
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

        {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreate={addProject} />}
      </div>
    </div>
  );
}