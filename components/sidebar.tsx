"use client";

import { useState, useCallback, useEffect } from "react";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconFolder,
  IconSearch,
  IconPlug,
  IconFilePlus,
  IconFolderPlus,
  IconSend,
  IconChevronRight,
  IconX,
  IconPlus,
} from "@tabler/icons-react";
  // FIXED: handleCreateNode function
 import { invoke } from "@tauri-apps/api/tauri";
import { SidebarProps, ExplorerNode } from "@/components/explorer/types";
import { getFileExtension } from "@/components/explorer/utils";
import { SearchPanel } from "@/components/explorer/search-panel";
import { ExplorerPanel } from "@/components/explorer/explorer-panel";
import { SidebarIcon } from "@/components/explorer/sidebar-icon";
import { ExtensionsPanel } from "./explorer/extensions-panel";
import { fetchProjectFiles } from "@/lib/tauriApi";
import { listen } from "@tauri-apps/api/event";

export function Sidebar({
  isOpen,
  onToggle,
  projects,
  currentProject,
  onSelectProject,
  theme,
  files: externalFiles,
  setFiles: externalSetFiles,
  onFileSelect,
  activeFileId,
  onOpenPostman,
}: SidebarProps & { isOpen: boolean; onToggle: () => void; onOpenPostman?: () => void }) {
 {
  
  const [panel, setPanel] = useState<"explorer" | "search" | "extensions">("explorer");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);
  const [tempName, setTempName] = useState("");
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  const files = externalFiles || [];
  const setFiles = externalSetFiles || (() => {});

  // Get project node for current project


  const toggleFolder = useCallback((folderId: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);
const safeProjects = Array.isArray(projects) ? projects : [];
console.log("Projects:", safeProjects);


useEffect(() => {
  let unlisten: (() => void) | undefined;

  (async () => {
    unlisten = await listen<string>(
      "refresh-project-files",
      async (event) => {
        console.log("TAURI REFRESH EVENT RECEIVED", event.payload);

        const projectPath = event.payload;
        const refreshedFiles = await fetchProjectFiles(projectPath);

        setFiles(refreshedFiles);

        // open project root so build/ is visible
        if (refreshedFiles[0]) {
          setOpenFolders(new Set([refreshedFiles[0].id]));
        }
      }
    );
  })();

  return () => {
    if (unlisten) unlisten();
  };
}, [setFiles]);



const handleCreateNode = useCallback(async () => {
  if (!tempName.trim() || !creating || !currentProject) return;

  const finalName =
    creating === "file" && !tempName.includes(".")
      ? `${tempName}.cpp`
      : tempName;

  // ✅ find parent node by ID
  const findNodeById = (nodes: ExplorerNode[], id: string): ExplorerNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // ✅ parent path = folder path OR project root path
  const parentNode = selectedFolderId
    ? findNodeById(files, selectedFolderId)
    : files[0]; // project root

  if (!parentNode) {
    console.error("Parent folder not found");
    return;
  }

  const fullPath = `${parentNode.path}/${finalName}`;

  try {
    await invoke(
      creating === "folder" ? "create_folder" : "create_file",
      { fullPath }
    );

    const newNode: ExplorerNode = {
      id: fullPath,          // ✅ ID = path (simple & safe)
      name: finalName,
      type: creating,
      path: fullPath,
      children: creating === "folder" ? [] : undefined,
    };

    const insert = (nodes: ExplorerNode[]): ExplorerNode[] =>
      nodes.map(node => {
        if (node.id === parentNode.id && node.type === "folder") {
          return {
            ...node,
            children: [...(node.children || []), newNode],
          };
        }
        if (node.children) {
          return { ...node, children: insert(node.children) };
        }
        return node;
      });

    setFiles(prev => insert(prev));
  } catch (e) {
    console.error("Create failed:", e);
  }

  setCreating(null);
  setTempName("");
}, [tempName, creating, selectedFolderId, currentProject, files]);

 
 

  const handleCancelCreate = useCallback(() => {
    setCreating(null);
    setTempName("");
  }, []);

 const handleCreateNewProject = () => {
  const name = newProjectName.trim();
  if (!name) return;

  if (!safeProjects.includes(name)) {
    const updatedProjects = [...safeProjects, name];

    // IMPORTANT: parent must persist this
    onSelectProject(name);

    // 🔴 THIS is what prevents write_recent_projects crash
    window.dispatchEvent(
      new CustomEvent("projects:update", { detail: updatedProjects })
    );
  }

  setNewProjectName("");
  setShowNewProjectInput(false);
};


  const handlePanelClick = useCallback(
  (newPanel: "explorer" | "search" | "extensions") => {
    if (!isOpen) {
      onToggle(); // open sidebar if closed
      setPanel(newPanel);
    } else if (panel === newPanel) {
      onToggle(); // toggle close if same panel
    } else {
      setPanel(newPanel); // switch panel if different
    }
  },
  [isOpen, panel, onToggle]
);


  const handlePostmanClick = useCallback(() => {
    if (onOpenPostman) onOpenPostman();
  }, [onOpenPostman]);

  const handleProjectClick = useCallback((project: string) => {
    console.log(`Selecting project: ${project}`);
    onSelectProject(project);
    
    // Ensure project folder exists and open it
    const projectNode = files.find(f => f.name === project && f.type === "folder");
    if (projectNode && !openFolders.has(projectNode.id)) {
      toggleFolder(projectNode.id);
    }
  }, [files, onSelectProject, openFolders, toggleFolder]);

const renderPanel = () => {
  switch (panel) {
    case "explorer":
       const projectFilesArray = files; // <- directly use backend result
      return (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-auto p-1">
            {currentProject ? (
              <ExplorerPanel
                currentProject={currentProject}
                theme={theme}
                files={files}
                selectedFolderId={selectedFolderId}
                creating={creating}
                tempName={tempName}
                openFolders={openFolders}
                activeFileId={activeFileId}
                onFolderSelect={setSelectedFolderId}
                onFileSelect={onFileSelect}
                onFolderToggle={toggleFolder}
                onStartCreate={(type, folderId) => {
                  setSelectedFolderId(folderId);
                  setCreating(type);
                  setTempName("");
                }}
                onCreateNode={handleCreateNode}
                onCancelCreate={handleCancelCreate}
                onTempNameChange={setTempName}
                showProjectHeader
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                <IconFolder size={32} className="text-gray-300 mb-3" />
                <p className="text-sm">Select a project</p>
              </div>
            )}
          </div>
        </div>
      );

    case "search":
      return (
        <SearchPanel
          nodes={files}
          theme={theme}
          onFileSelect={onFileSelect}
          onFolderToggle={toggleFolder}
          activeFileId={activeFileId}
        />
      );

    case "extensions":
      return <ExtensionsPanel theme={theme} />;

    default:
      return null;
  }
};

  return (
   <div className="flex h-screen">
  {/* Left Icon Bar */}
  <div className="w-12 flex flex-col items-center bg-gray-50 py-2">
   <SidebarIcon
  onClick={onToggle}
  tooltip={isOpen ? "Close Sidebar" : "Open Sidebar"}
  
>
  {isOpen ? <IconLayoutSidebarLeftCollapse size={18} /> : <IconLayoutSidebarLeftExpand size={18} />}
  </SidebarIcon>



    <div className="flex-1 flex flex-col items-center pt-4 space-y-1">
       
      <SidebarIcon
        active={panel === "explorer"}
        onClick={() => handlePanelClick("explorer")}
      
      >
        <IconFolder size={18} />
      </SidebarIcon>

      <SidebarIcon
        active={panel === "search"}
        onClick={() => handlePanelClick("search")}
       
      >
        <IconSearch size={18} />
      </SidebarIcon>

      <SidebarIcon
        active={panel === "extensions"}
        onClick={() => handlePanelClick("extensions")}
      
      >
        <IconPlug size={18} />
      </SidebarIcon>

      <SidebarIcon
        onClick={handlePostmanClick}
       
      
      >
        <IconSend size={18} />
      </SidebarIcon>
    </div>
  </div>

  {/* Main Sidebar */}
  <div
    className={`transition-all duration-200 overflow-hidden flex flex-col ${isOpen ? "w-64" : "w-0"} bg-white`}
  >
    {isOpen && (
      <>
        <div className="px-3 py-2">
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            {panel === "explorer" && "Explorer"}
            {panel === "search" && "Search"}
            {panel === "extensions" && "Extensions"}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">{renderPanel()}</div>
      </>
    )}
  </div>
</div>

  );
}
}