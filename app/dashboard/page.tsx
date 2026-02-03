"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { MonacoEditor } from "@/components/monacoeditor";
import { CreateProjectModal } from "@/components/create-project-modal";
import { ExplorerNode, EditorTab } from "@/components/explorer/types";
import { PostmanEditor } from "@/components/explorer/postman-editor";
import { invoke } from "@tauri-apps/api/tauri";
import { IconPlus, IconFolderPlus, IconSettings, IconClock, IconFolder } from "@tabler/icons-react";
import { listen } from "@tauri-apps/api/event";

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
const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [editorTabs, setEditorTabs] = useState<Record<string, EditorTab[]>>({});
  const [activeTabId, setActiveTabId] = useState<Record<string, string | null>>({});
  const [showTerminal, setShowTerminal] = useState<Record<string, boolean>>({});
const uniqueProjectNames = Array.from(
  new Set([...projects.map(p => p.name), ...recentProjects.map(p => p.name)])
);

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
  if (!currentProject) {
    setIsSidebarOpen(false);
  }
}, [currentProject]);

// ---------------- Load projects ----------------
useEffect(() => {
  const loadProjects = async () => {
    try {
      const allProjects: Project[] = await invoke("read_recent_projects");
      console.log("[LOG] read_recent_projects:", allProjects);

      setProjects(allProjects);
      setRecentProjects(allProjects.slice(0, 5));

      const filesState: Record<string, ExplorerNode[]> = {};

      for (const proj of allProjects) {
        try {
          console.log(`[LOG] list_project_files invoked for project: ${proj.name}, path: ${proj.path}`);
          const children: ExplorerNode[] = normalizeNodes(
            await invoke("list_project_files", { projectPath: proj.path }),
            proj.path
          );
          console.log(`[LOG] list_project_files returned ${children.length} nodes for project: ${proj.name}`);

        filesState[proj.name] = children; // children already includes the project root

        } catch (err) {
          console.error(`[ERROR] Failed to load files for project ${proj.name}:`, err);
        }
      }

      setProjectFiles(filesState);

    } catch (err) {
      console.error("[ERROR] Failed to load projects:", err);
    }
  };

  loadProjects();
}, []);

const addProject = async (name: string) => {
  try {
    console.log(`[LOG] create_project invoked for project: ${name}`);
    const projectPath: string = await invoke("create_project", { name });
    console.log(`[LOG] create_project returned path: ${projectPath}`);

    console.log(`[LOG] list_project_files invoked for new project: ${name}`);
    const children: ExplorerNode[] = normalizeNodes(
      await invoke("list_project_files", { projectPath }),
      projectPath
    );
    console.log(`[LOG] list_project_files returned ${children.length} nodes for new project: ${name}`);

    const rootNode: ExplorerNode = {
      id: name,
      name,
      type: "folder",
      path: projectPath,
      children,
      isOpen: false
    };
    
setProjectFiles(prev => ({ ...prev, [name]: children })); // children already has root node

    setProjects(prev => [...prev, { name, path: projectPath }]);

    const updatedRecent = [{ name, path: projectPath }, ...recentProjects.filter(p => p.name !== name)].slice(0, 5);
    setRecentProjects(updatedRecent);

    await invoke("write_recent_projects", { projects: updatedRecent });

    setEditorTabs(prev => ({ ...prev, [name]: [] }));
    setActiveTabId(prev => ({ ...prev, [name]: null }));
    setShowTerminal(prev => ({ ...prev, [name]: false }));
    setCurrentProject(name);
    setIsSidebarOpen(true); // 👈 OPEN sidebar
    setShowCreate(false);
  } catch (err) {
    console.error("[ERROR] addProject failed:", err);
  }
};
const updateFolderChildren = useCallback(
  (folderId: string, children: ExplorerNode[]) => {
    if (!currentProject) return;

    const update = (nodes: ExplorerNode[]): ExplorerNode[] =>
      nodes.map(node => {
        if (node.id === folderId) {
          return { ...node, children };
        }
        if (node.children) {
          return { ...node, children: update(node.children) };
        }
        return node;
      });

    setProjectFiles(prev => ({
      ...prev,
      [currentProject]: update(prev[currentProject]),
    }));
  },
  [currentProject]
);

 // ---------------- Select project (recent or normal) ----------------
const handleSelectProject = useCallback(
  async (name: string, path: string) => {
    setCurrentProject(name);
    setIsSidebarOpen(true); // 👈 OPEN sidebar

    if (!projectFiles[name]) {
      try {
        const children: ExplorerNode[] = normalizeNodes(
          await invoke("list_project_files", { projectPath: path }),
          path
        );

        // ✅ Create root node only if it does not exist
        setProjectFiles(prev => {
          if (prev[name]?.length) {
            // root exists, just update children
            return {
              ...prev,
              [name]: prev[name].map(node =>
                node.id === name ? { ...node, children } : node
              ),
            };
          } else {
            // root does not exist, create it
            const rootNode: ExplorerNode = {
              id: name,
              name,
              type: "folder",
              path,
              children,
              isOpen: false,
            };
            return { ...prev, [name]: [rootNode] };
          }
        });
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
  },
  [projectFiles, recentProjects]
);


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

// ---------------- File select ----------------
const handleFileSelect = useCallback(
  async (node: ExplorerNode) => {
    if (node.type !== "file") {
      console.warn("[LOG] Blocked directory open:", node.path);
      return;
    }

    if (!currentProject) return;

    const projectTabs = editorTabs[currentProject] || [];
    const existingTab = projectTabs.find(tab => tab.path === node.path);

    if (existingTab) {
      setActiveTabId(prev => ({ ...prev, [currentProject]: existingTab.id }));
      return;
    }

    console.log(`[LOG] read_file invoked for path: ${node.path}`);
    const content: string = await invoke("read_file", { path: node.path });
    console.log(`[LOG] read_file returned content length: ${content.length} for path: ${node.path}`);

    const newTab: EditorTab = {
      id: crypto.randomUUID(),
      name: node.name,
      path: node.path,
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
useEffect(() => {
  const unlisten = listen("menu-open-project", async () => {
    console.log("[MENU] Open Project triggered");

    try {
      const path: string | null = await invoke("open_project_dialog");
      console.log("[MENU] Dialog returned:", path);

      if (!path) return;

      const name = path.split("/").pop() || "Unnamed";
      await handleSelectProject(name, path);
    } catch (err) {
      console.error("[MENU] Open project failed:", err);
    }
  });

  return () => {
    unlisten.then(f => f());
  };
}, [handleSelectProject]);


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

const autoSave = useCallback(
  debounce(async (tabPath: string, content: string) => {
    try {
      await invoke("save_file", { path: tabPath, content });
      console.log("Auto-saved:", tabPath);
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  }, 1000), // save 1s after user stops typing
  []
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
    tabs: tabs.map(tab => ({
      ...tab,
      tab_type: tab.type || "file"   // <-- ADD THIS LINE
    })),
    active_tab_id: activeTabId[project_name] || null,
  })),
}).catch(console.error);

      // Auto-save to disk
      const activeTab = projectTabs.find(tab => tab.id === tabId);
      if (activeTab && activeTab.type === "file") {
        autoSave(activeTab.path, content);
      }

      return { ...prev, [currentProject]: updatedTabs };
    });
  },
  [currentProject, activeTabId, autoSave]
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
  projects={uniqueProjectNames}
  currentProject={currentProject}
  isOpen={isSidebarOpen}               // ✅ controlled
  onToggle={() => setIsSidebarOpen(prev => !prev)} // ✅ toggle button works
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
      <div className="max-w-6xl w-full">
        {/* Header - Full width */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-200 text-blue-600 flex items-center justify-center mb-6">
            <IconFolderPlus size={40} />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Welcome to <span className="text-blue-600">Arduino IDE+</span>
          </h1>

          <p className="text-lg text-gray-600">
            Create your next Arduino project with a powerful, modern development environment.
          </p>
        </div>

       
        <div className="flex gap-8">
  {/* LEFT SIDE — Create Project */}
  <div className="w-72 space-y-6">
    <button
      onClick={() => setShowCreate(true)}
      className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow hover:shadow-lg flex items-center justify-center gap-3"
    >
      <IconPlus size={22} />
      Create New Project
    </button>
  </div>

  {/* RIGHT SIDE — Recent Projects */}
  <div className="flex-1">
    <div className="flex items-center gap-3 mb-6">
      <h2 className="text-md font-bold text-gray-800">
        Recent Projects
      </h2>
    </div>

    {recentProjects.length > 0 ? (
      <div className="space-y-3">
        {recentProjects.slice(0, 5).map(p => (
          <button
            key={p.name}
            onClick={() => handleSelectProject(p.name, p.path)}
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left group border border-transparent hover:border-gray-200"
          >
            <IconFolder size={10} />
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm text-gray-800 group-hover:text-blue-600 block truncate">
                {p.name}
              </span>
              <span className="text-sm text-gray-500 truncate block">
                {p.path}
              </span>
            </div>
          </button>
        ))}
      </div>
    ) : (
      <div className="text-center py-10">
        <IconFolder className="mx-auto text-gray-400 mb-4" size={32} />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No recent projects
        </h3>
        <p className="text-gray-500 mb-6">
          Create your first project to get started
        </p>
      </div>
    )}
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

function normalizeNodes(nodes: any[], parentPath: string): ExplorerNode[] {
  return nodes
    .filter(node => node.name !== ".DS_Store")
    .map(node => ({
      id: node.id || `${parentPath}/${node.name}`,
      name: node.name,
      type: node.type,
      path: node.path,
      children: node.children ? normalizeNodes(node.children, node.path) : [],
      isOpen: false,
    }));
}

function debounce<Func extends (...args: any[]) => void>(fn: Func, delay: number) {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<Func>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
