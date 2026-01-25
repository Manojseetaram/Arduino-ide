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
} from "@tabler/icons-react";

import { SidebarProps, ExplorerNode } from "@/components/explorer/types";
import { getFileExtension, insertNode, isEspIdfFile } from "@/components/explorer/utils";
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
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const [internalFiles, internalSetFiles] = useState<ExplorerNode[]>(() => {
    if (externalFiles) return externalFiles;
    return [];
  });

  const files = externalFiles || internalFiles;
  const setFiles = externalSetFiles || internalSetFiles;

  // Filter ESP-IDF files (CMake files) from file tree
  const filterEspIdfFiles = useCallback((nodes: ExplorerNode[]): ExplorerNode[] => {
    return nodes
      .filter(node => {
        if (node.type === "folder") {
          return true; // Always show folders
        }
        // Filter out ESP-IDF CMake/config files from tree
        return !isEspIdfFile(node.name);
      })
      .map(node => {
        if (node.type === "folder" && node.children) {
          return {
            ...node,
            children: filterEspIdfFiles(node.children)
          };
        }
        return node;
      });
  }, []);

  const getCurrentProjectFiles = useCallback(() => {
    if (!currentProject) return [];

    const projectNode = files.find(f => f.name === currentProject && f.type === "folder");
    
    if (projectNode) {
      // Apply ESP-IDF filtering to the project files
      const filteredProjectNode = {
        ...projectNode,
        children: projectNode.children ? filterEspIdfFiles(projectNode.children) : []
      };
      return [filteredProjectNode];
    }

    return [{
      id: crypto.randomUUID(),
      name: currentProject,
      type: "folder" as const,
      path: currentProject,
      children: [],
    }];
  }, [currentProject, files, filterEspIdfFiles]);

  // Clear hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  const toggleFolder = useCallback((folderId: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      next.has(folderId) ? next.delete(folderId) : next.add(folderId);
      return next;
    });
  }, []);

  const handleCreateNode = useCallback(() => {
    if (!tempName.trim() || !creating) {
      setCreating(null);
      setTempName("");
      return;
    }

    const extension = creating === "file" ? getFileExtension(tempName) : "";
    const finalName = creating === "file" && !extension ? `${tempName}.cpp` : tempName;

    const newNode: ExplorerNode = {
      id: crypto.randomUUID(),
      name: finalName,
      type: creating,
      path: finalName,
      ...(creating === "folder" ? { children: [] } : {}),
    };

    const currentFiles = getCurrentProjectFiles();
    const updatedFiles = insertNode(currentFiles, selectedFolderId, newNode);
    
    setFiles(prev => {
      const filtered = prev.filter(f => !(f.name === currentProject && f.type === "folder"));
      return [...filtered, ...updatedFiles];
    });

    if (creating === "folder" && selectedFolderId) {
      setOpenFolders(prev => new Set(prev).add(selectedFolderId));
    }

    setCreating(null);
    setTempName("");
  }, [tempName, creating, selectedFolderId, currentProject, getCurrentProjectFiles, setFiles]);

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

  // Handle project hover with delay for better UX
  const handleProjectHover = useCallback((project: string | null) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    
    if (project) {
      const timeout = setTimeout(() => {
        setHoveredProject(project);
      }, 100);
      setHoverTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setHoveredProject(null);
      }, 300);
      setHoverTimeout(timeout);
    }
  }, [hoverTimeout]);

  const renderPanel = () => {
    switch (panel) {
      case "explorer":
        return (
          <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Projects</h2>
                <button
                  onClick={() => setShowNewProjectInput(true)}
                  className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                  title="New Project"
                >
                  <IconFolderPlus size={16} />
                </button>
              </div>
              
              {showNewProjectInput && (
                <div className="mb-3 relative">
                  <input
                    autoFocus
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateNewProject();
                      if (e.key === "Escape") {
                        setShowNewProjectInput(false);
                        setNewProjectName("");
                      }
                    }}
                    className="w-full text-sm px-3 py-2 pl-9 rounded-lg border border-blue-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type project name..."
                    spellCheck="false"
                  />
                  <IconFolder size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <button
                    onClick={() => {
                      setShowNewProjectInput(false);
                      setNewProjectName("");
                    }}
                    className="absolute right-2 top-2.5 p-0.5 rounded hover:bg-gray-200"
                  >
                    <IconX size={14} className="text-gray-400" />
                  </button>
                </div>
              )}

              <div className="space-y-1">
                {projects.map((project) => {
                  const projectNode = files.find(f => f.name === project && f.type === "folder");
                  const isCurrent = currentProject === project;
                  const isHovered = hoveredProject === project;
                  const showIcons = isCurrent || isHovered;

                  return (
                    <div
                      key={project}
                      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                        isCurrent
                          ? "bg-blue-600 text-white shadow-sm"
                          : "hover:bg-blue-50 text-gray-700"
                      }`}
                      onMouseEnter={() => handleProjectHover(project)}
                      onMouseLeave={() => handleProjectHover(null)}
                    >
                      <div 
                        className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                        onClick={() => onSelectProject(project)}
                      >
                        <IconFolder size={18} className={`flex-shrink-0 ${isCurrent ? "text-white" : "text-blue-500"}`} />
                        <span className="font-medium truncate">{project}</span>
                      </div>
                      
                      {/* Create icons - Always visible when project is selected/hovered */}
                      <div 
                        className={`flex items-center gap-1 ml-2 transition-all duration-200 ${
                          showIcons ? "opacity-100" : "opacity-0"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className={`p-1.5 rounded-md transition-colors ${
                            isCurrent
                              ? "bg-white/20 hover:bg-white/30 text-white"
                              : "bg-blue-100 hover:bg-blue-200 text-blue-600"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (projectNode) {
                              setSelectedFolderId(projectNode.id);
                              setCreating("file");
                              setTempName("");
                              if (!openFolders.has(projectNode.id)) toggleFolder(projectNode.id);
                              if (!isCurrent) onSelectProject(project);
                            } else {
                              // Create project folder if it doesn't exist
                              const newProjectNode: ExplorerNode = {
                                id: crypto.randomUUID(),
                                name: project,
                                type: "folder",
                                path: project,
                                children: [],
                              };
                              setFiles(prev => [...prev, newProjectNode]);
                              setSelectedFolderId(newProjectNode.id);
                              setCreating("file");
                              setTempName("");
                              if (!isCurrent) onSelectProject(project);
                            }
                          }}
                          title="New File"
                        >
                          <IconFilePlus size={14} />
                        </button>
                        <button
                          className={`p-1.5 rounded-md transition-colors ${
                            isCurrent
                              ? "bg-white/20 hover:bg-white/30 text-white"
                              : "bg-blue-100 hover:bg-blue-200 text-blue-600"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (projectNode) {
                              setSelectedFolderId(projectNode.id);
                              setCreating("folder");
                              setTempName("");
                              if (!openFolders.has(projectNode.id)) toggleFolder(projectNode.id);
                              if (!isCurrent) onSelectProject(project);
                            } else {
                              const newProjectNode: ExplorerNode = {
                                id: crypto.randomUUID(),
                                name: project,
                                type: "folder",
                                path: project,
                                children: [],
                              };
                              setFiles(prev => [...prev, newProjectNode]);
                              setSelectedFolderId(newProjectNode.id);
                              setCreating("folder");
                              setTempName("");
                              if (!isCurrent) onSelectProject(project);
                            }
                          }}
                          title="New Folder"
                        >
                          <IconFolderPlus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {projects.length === 0 && !showNewProjectInput && (
                  <div className="text-center py-6">
                    <IconFolder size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm">No projects yet</p>
                    <p className="text-gray-400 text-xs mt-1">Create your first project</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-auto p-2">
              {currentProject ? (
                <ExplorerPanel
                  currentProject={currentProject}
                  theme={theme}
                  files={getCurrentProjectFiles()}
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
                  showProjectHeader={false}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                  <IconFolder size={40} className="text-gray-300 mb-3" />
                  <p className="text-center">Select a project to view files</p>
                </div>
              )}
            </div>
          </div>
        );
      case "search":
        return (
          <SearchPanel
            nodes={files} // Pass unfiltered files for search
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
      <div className="w-14 flex flex-col items-center bg-gradient-to-b from-white to-blue-50 border-r border-gray-200">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-12 w-full flex items-center justify-center hover:bg-blue-100 transition-colors border-b border-gray-200"
          title={isOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isOpen ? (
            <IconLayoutSidebarLeftCollapse size={20} className="text-gray-600" />
          ) : (
            <IconLayoutSidebarLeftExpand size={20} className="text-gray-600" />
          )}
        </button>

        <div className="flex-1 flex flex-col items-center pt-4 space-y-2">
          <SidebarIcon
            active={panel === "explorer"}
            onClick={() => handlePanelClick("explorer")}
            tooltip="Explorer"
            className={`${panel === "explorer" ? "bg-blue-100 text-blue-600 border-blue-200" : "hover:bg-gray-100 text-gray-600"}`}
          >
            <IconFolder size={20} />
          </SidebarIcon>

          <SidebarIcon
            active={panel === "search"}
            onClick={() => handlePanelClick("search")}
            tooltip="Search"
            className={`${panel === "search" ? "bg-blue-100 text-blue-600 border-blue-200" : "hover:bg-gray-100 text-gray-600"}`}
          >
            <IconSearch size={20} />
          </SidebarIcon>

          <SidebarIcon
            active={panel === "extensions"}
            onClick={() => handlePanelClick("extensions")}
            tooltip="Extensions"
            className={`${panel === "extensions" ? "bg-blue-100 text-blue-600 border-blue-200" : "hover:bg-gray-100 text-gray-600"}`}
          >
            <IconPlug size={20} />
          </SidebarIcon>
        </div>

        <div className="mt-auto mb-4">
          <SidebarIcon
            onClick={handlePostmanClick}
            tooltip="API Testing"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md"
          >
            <IconSend size={20} />
          </SidebarIcon>
        </div>
      </div>

      <div
        className={`transition-all duration-300 overflow-hidden flex flex-col shadow-lg ${
          isOpen ? "w-72" : "w-0"
        } bg-white border-r border-gray-200`}
      >
        {isOpen && (
          <>
            <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">
                {panel === "explorer" && "EXPLORER"}
                {panel === "search" && "SEARCH"}
                {panel === "extensions" && "EXTENSIONS"}
              </h2>
            </div>
            
            <div className="flex-1 overflow-hidden bg-white">
              {renderPanel()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}