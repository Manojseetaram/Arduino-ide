


"use client";

import { useState, useMemo, useCallback } from "react";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";

import { SidebarProps, ExplorerNode } from "@/components/explorer/types";
import { getFileExtension, insertNode } from "@/components/explorer/utils";
import { SearchPanel } from "@/components/explorer/search-panel";
import { ExplorerPanel } from "@/components/explorer/explorer-panel";

import { SidebarIcon } from "@/components/explorer/sidebar-icon";
import { IconFolder, IconSearch, IconPlug } from "@tabler/icons-react";
import { ExtensionsPanel } from "./explorer/extensions-panel";

export function Sidebar({
  currentProject,
  theme,
  files: externalFiles,
  setFiles: externalSetFiles,
  onFileSelect,
  activeFileId,
}: SidebarProps & {
  onFileSelect?: (file: ExplorerNode) => void;
  activeFileId?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [panel, setPanel] = useState<"explorer" | "search" | "extensions">("explorer");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);
  const [tempName, setTempName] = useState("");
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());

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

  const handleStartCreate = useCallback((type: "file" | "folder") => {
    setCreating(type);
    setTempName("");
  }, []);

  /* ========= RENDER PANELS ========= */
  const renderPanel = () => {
    switch (panel) {
      case "explorer":
        return (
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
            onStartCreate={handleStartCreate}
            onCreateNode={handleCreateNode}
            onCancelCreate={handleCancelCreate}
            onTempNameChange={setTempName}
          />
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