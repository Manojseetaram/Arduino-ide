"use client";

import { useState, useCallback } from "react";
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

import { SidebarProps, ExplorerNode } from "@/components/explorer/types";
import { getFileExtension } from "@/components/explorer/utils";
import { SearchPanel } from "@/components/explorer/search-panel";
import { ExplorerPanel } from "@/components/explorer/explorer-panel";
import { SidebarIcon } from "@/components/explorer/sidebar-icon";
import { ExtensionsPanel } from "./explorer/extensions-panel";

export function Sidebar({
  projects,
  currentProject,
  onSelectProject,
  theme,
  files: externalFiles,
  setFiles: externalSetFiles,
  onFileSelect,
  activeFileId,
  onOpenPostman,
}: SidebarProps & { onOpenPostman?: () => void }) {
  const [isOpen, setIsOpen] = useState(true);
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
  const getCurrentProjectNode = useCallback(() => {
    if (!currentProject) return null;
    
    // Find existing project folder in files
    const projectNode = files.find(f => f.name === currentProject && f.type === "folder");
    // return files[0] ?? null;

    if (projectNode) {
      return projectNode;
    }

    // If not found, create a temporary node (but don't save it yet)
    return {
      id: currentProject,
      name: currentProject,
      type: "folder" as const,
      path: currentProject,
      children: [],
    };
  }, [currentProject, files]);

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

  // FIXED: handleCreateNode function
  const handleCreateNode = useCallback(() => {
    if (!tempName.trim() || !creating) {
      setCreating(null);
      setTempName("");
      return;
    }

    if (!currentProject) return;

    const extension = creating === "file" ? getFileExtension(tempName) : "";
    const finalName = creating === "file" && !extension ? `${tempName}.cpp` : tempName;

    // Create the new node
    const newNode: ExplorerNode = {
      id: `${Date.now()}-${finalName}`, // Simple ID
      name: finalName,
      type: creating,
      path: `${currentProject}/${finalName}`,
      ...(creating === "folder" ? { children: [] } : {}),
    };

    // Get current project node
    let projectNode = getCurrentProjectNode();
    if (!projectNode) return;

    // Find where to insert the new node
    const insertIntoNode = (nodes: ExplorerNode[], targetId: string | null): ExplorerNode[] => {
      if (!targetId) {
        // Insert at root (project level)
        return [...nodes, newNode];
      }

      return nodes.map(node => {
        if (node.id === targetId && node.type === "folder") {
          return {
            ...node,
            children: [...(node.children || []), newNode]
          };
        }
        
        if (node.type === "folder" && node.children) {
          return {
            ...node,
            children: insertIntoNode(node.children, targetId)
          };
        }
        
        return node;
      });
    };

    // Update files
    const updatedFiles = insertIntoNode(files, selectedFolderId);
    setFiles(updatedFiles);

    // Open the folder if we created a folder
    if (creating === "folder" && selectedFolderId) {
      setOpenFolders(prev => new Set(prev).add(selectedFolderId));
    }

    // Reset creation state
    setCreating(null);
    setTempName("");
  }, [tempName, creating, selectedFolderId, currentProject, files, setFiles, getCurrentProjectNode]);

  const handleCancelCreate = useCallback(() => {
    setCreating(null);
    setTempName("");
  }, []);

  const handleCreateNewProject = () => {
    if (newProjectName.trim()) {
      onSelectProject(newProjectName.trim());
      setNewProjectName("");
    }
    setShowNewProjectInput(false);
  };

  const handlePanelClick = useCallback((newPanel: "explorer" | "search" | "extensions") => {
    if (!isOpen) {
      setIsOpen(true);
      setPanel(newPanel);
    } else if (panel === newPanel) {
      setIsOpen(false);
    } else {
      setPanel(newPanel);
    }
  }, [isOpen, panel]);

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
        const projectNode = getCurrentProjectNode();
        const projectFilesArray = projectNode ? [projectNode] : [];
        
        return (
          <div className="flex flex-col h-full">
            {/* Projects Header */}
           

            {/* File Explorer */}
            <div className="flex-1 overflow-auto p-1">
              {currentProject ? (
                <ExplorerPanel
                  currentProject={currentProject}
                  theme={theme}
                  files={projectFilesArray}
                  selectedFolderId={selectedFolderId}
                  creating={creating}
                  tempName={tempName}
                  openFolders={openFolders}
                  activeFileId={activeFileId}
                  onFolderSelect={setSelectedFolderId}
                  onFileSelect={onFileSelect}
                  onFolderToggle={toggleFolder}
                  onStartCreate={(type, folderId) => {
                    console.log("Start create:", type, "in folder:", folderId);
                    setSelectedFolderId(folderId);
                    setCreating(type);
                    setTempName("");
                  }}
                  onCreateNode={handleCreateNode}
                  onCancelCreate={handleCancelCreate}
                  onTempNameChange={setTempName}
                  showProjectHeader={true}
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
      <div className="w-12 flex flex-col items-center bg-gray-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-10 w-full flex items-center justify-center hover:bg-gray-200"
          title={isOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isOpen ? (
            <IconLayoutSidebarLeftCollapse size={18} className="text-gray-600" />
          ) : (
            <IconLayoutSidebarLeftExpand size={18} className="text-gray-600" />
          )}
        </button>

        <div className="flex-1 flex flex-col items-center pt-4 space-y-1">
          <SidebarIcon
            active={panel === "explorer"}
            onClick={() => handlePanelClick("explorer")}
            tooltip="Explorer"
            className={`${panel === "explorer" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-200 text-gray-600"}`}
          >
            <IconFolder size={18} />
          </SidebarIcon>

          <SidebarIcon
            active={panel === "search"}
            onClick={() => handlePanelClick("search")}
            tooltip="Search"
            className={`${panel === "search" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-200 text-gray-600"}`}
          >
            <IconSearch size={18} />
          </SidebarIcon>

          <SidebarIcon
            active={panel === "extensions"}
            onClick={() => handlePanelClick("extensions")}
            tooltip="Extensions"
            className={`${panel === "extensions" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-200 text-gray-600"}`}
          >
            <IconPlug size={18} />
          </SidebarIcon>
        </div>

        <div className="mt-auto mb-3">
          <SidebarIcon
            onClick={handlePostmanClick}
            tooltip="API Testing"
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <IconSend size={18} />
          </SidebarIcon>
        </div>
      </div>

      {/* Main Sidebar */}
      <div
        className={`transition-all duration-200 overflow-hidden flex flex-col ${
          isOpen ? "w-64" : "w-0"
        } bg-white `}
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
            
            <div className="flex-1 overflow-hidden">
              {renderPanel()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}