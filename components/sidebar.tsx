"use client";

import { useState, useCallback } from "react";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";

import { SidebarProps, ExplorerNode } from "@/components/explorer/types";
import { getFileExtension, insertNode } from "@/components/explorer/utils";
import { SearchPanel } from "@/components/explorer/search-panel";
import { ExplorerPanel } from "@/components/explorer/explorer-panel";

import { SidebarIcon } from "@/components/explorer/sidebar-icon";
import { 
  IconFolder, 
  IconSearch, 
  IconPlug, 
  IconFilePlus, 
  IconFolderPlus
} from "@tabler/icons-react";
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
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [panel, setPanel] = useState<"explorer" | "search" | "extensions">("explorer");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);
  const [tempName, setTempName] = useState("");
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  const dark = theme === "dark";

  // Use external files if provided, otherwise use internal state
  const [internalFiles, internalSetFiles] = useState<ExplorerNode[]>(() => {
    if (externalFiles) return externalFiles;
    
    return currentProject ? [{
      id: crypto.randomUUID(),
      name: currentProject,
      type: "folder" as const,
      path: currentProject,
      children: [],
    }] : [];
  });

  const files = externalFiles || internalFiles;
  const setFiles = externalSetFiles || internalSetFiles;

  /* ========= FOLDER TOGGLE ========= */
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

  /* ========= NODE OPERATIONS ========= */
  const handleCreateNode = useCallback(() => {
    if (!tempName.trim() || !creating) {
      setCreating(null);
      setTempName("");
      return;
    }

    const extension = creating === "file" ? getFileExtension(tempName) : "";
    const finalName = creating === "file" && !extension ? `${tempName}.txt` : tempName;

    const newNode: ExplorerNode = {
      id: crypto.randomUUID(),
      name: finalName,
      type: creating,
      path: finalName,
      ...(creating === "folder" ? { children: [] } : {}),
    };

    setFiles(prev => insertNode(prev, selectedFolderId, newNode));

    if (creating === "folder" && selectedFolderId) {
      setOpenFolders(prev => new Set(prev).add(selectedFolderId));
    }

    setCreating(null);
    setTempName("");
  }, [tempName, creating, selectedFolderId, setFiles]);

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

  /* ========= RENDER PANELS ========= */
  const renderPanel = () => {
    switch (panel) {
      case "explorer":
        return (
          <div className="flex flex-col h-full">
            {/* PROJECTS SECTION */}
            <div className="px-3 py-2 border-b border-gray-800">
              
              {/* New Project Input */}
              {showNewProjectInput && (
                <div className="mb-2">
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
                    onBlur={() => {
                      setTimeout(() => {
                        if (newProjectName.trim()) handleCreateNewProject();
                        else setShowNewProjectInput(false);
                      }, 100);
                    }}
                    className="w-full text-sm px-2 py-1 rounded outline-none bg-gray-800 border border-blue-500 text-gray-200"
                    placeholder="New project name..."
                    spellCheck="false"
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                </div>
              )}

              {/* Projects List with Create Icons */}
              <div className="space-y-1">
                {projects.map((project) => (
                  <div
                    key={project}
                    className={`group flex items-center justify-between px-3 py-2 rounded text-sm ${
                      currentProject === project
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-800 text-gray-300"
                    }`}
                    onMouseEnter={() => setHoveredProject(project)}
                    onMouseLeave={() => setHoveredProject(null)}
                  >
                    {/* Clickable project name */}
                    <div 
                      className="flex items-center gap-2 flex-1 cursor-pointer"
                      onClick={() => {
                        console.log("Project clicked:", project);
                        onSelectProject(project);
                      }}
                    >
                      <IconFolder size={16} />
                      <span className="truncate">{project}</span>
                    </div>
                    
                    {/* Create File/Folder Icons - Show on hover or when active */}
                    {(hoveredProject === project || currentProject === project) && (
                      <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          className={`p-1 rounded ${
                            dark 
                              ? "hover:bg-gray-700 text-gray-300 hover:text-blue-400" 
                              : "hover:bg-gray-300 text-gray-600 hover:text-blue-600"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("File icon clicked for project:", project);
                            // Find or create project folder
                            let projectNode = files.find(f => f.name === project && f.type === "folder");
                            
                            if (!projectNode) {
                              // Create project folder if it doesn't exist
                              projectNode = {
                                id: crypto.randomUUID(),
                                name: project,
                                type: "folder" as const,
                                path: project,
                                children: [],
                              };
                              setFiles(prev => [...prev, projectNode]);
                            }
                            
                            setSelectedFolderId(projectNode.id);
                            setCreating("file");
                            setTempName("");
                            
                            // Ensure project is open
                            if (!openFolders.has(projectNode.id)) {
                              toggleFolder(projectNode.id);
                            }
                            
                            // Select project if not selected
                            if (currentProject !== project) {
                              onSelectProject(project);
                            }
                          }}
                          title="New File"
                        >
                          <IconFilePlus size={14} />
                        </button>
                        <button
                          className={`p-1 rounded ${
                            dark 
                              ? "hover:bg-gray-700 text-gray-300 hover:text-blue-400" 
                              : "hover:bg-gray-300 text-gray-600 hover:text-blue-600"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("Folder icon clicked for project:", project);
                            // Find or create project folder
                            let projectNode = files.find(f => f.name === project && f.type === "folder");
                            
                            if (!projectNode) {
                              // Create project folder if it doesn't exist
                              projectNode = {
                                id: crypto.randomUUID(),
                                name: project,
                                type: "folder" as const,
                                path: project,
                                children: [],
                              };
                              setFiles(prev => [...prev, projectNode]);
                            }
                            
                            setSelectedFolderId(projectNode.id);
                            setCreating("folder");
                            setTempName("");
                            
                            // Ensure project is open
                            if (!openFolders.has(projectNode.id)) {
                              toggleFolder(projectNode.id);
                            }
                            
                            // Select project if not selected
                            if (currentProject !== project) {
                              onSelectProject(project);
                            }
                          }}
                          title="New Folder"
                        >
                          <IconFolderPlus size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                {projects.length === 0 && !showNewProjectInput && (
                  <div className="text-center text-gray-500 text-sm py-4">
                    No projects yet
                  </div>
                )}
              </div>
            </div>

            {/* FILE EXPLORER SECTION */}
            <div className="flex-1 overflow-auto">
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
                  console.log("Start create:", type, "in folder:", folderId);
                  setSelectedFolderId(folderId);
                  setCreating(type);
                  setTempName("");
                }}
                onCreateNode={handleCreateNode}
                onCancelCreate={handleCancelCreate}
                onTempNameChange={setTempName}
              />
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
      {/* LEFT ICON BAR */}
      <div
        className={`w-14 flex flex-col items-center ${
          dark ? "bg-gray-950 text-gray-300" : "bg-gray-300 text-gray-800"
        }`}
      >
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="h-12 w-full flex items-center justify-center hover:bg-blue-600 hover:text-white"
        >
          {isOpen ? (
            <IconLayoutSidebarLeftCollapse size={20} />
          ) : (
            <IconLayoutSidebarLeftExpand size={20} />
          )}
        </button>

        <SidebarIcon
          active={panel === "explorer"}
          onClick={() => setPanel("explorer")}
          tooltip="Explorer"
        >
          <IconFolder size={20} />
        </SidebarIcon>

        <SidebarIcon
          active={panel === "search"}
          onClick={() => setPanel("search")}
          tooltip="Search"
        >
          <IconSearch size={20} />
        </SidebarIcon>

        <SidebarIcon
          active={panel === "extensions"}
          onClick={() => setPanel("extensions")}
          tooltip="Extensions"
        >
          <IconPlug size={20} />
        </SidebarIcon>
      </div>

      {/* MAIN SIDEBAR */}
      <div
        className={`transition-all duration-200 overflow-hidden flex flex-col ${
          isOpen ? "w-64" : "w-0"
        } ${
          dark
            ? "bg-gray-900 border-r border-gray-700 text-gray-200"
            : "bg-gray-100 border-r border-gray-300 text-gray-800"
        }`}
      >
        {isOpen && (
          <>
            <div className="px-4 py-3 border-b border-gray-700 font-semibold text-sm">
              {panel === "explorer" && "EXPLORER"}
              {panel === "search" && "SEARCH"}
              {panel === "extensions" && "EXTENSIONS"}
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