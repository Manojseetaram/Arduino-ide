// components/explorer/explorer-panel.tsx
"use client";

import { ExplorerNode } from "./types";
import { IconFolder, IconChevronRight, IconFolderPlus, IconFilePlus } from "@tabler/icons-react";
import { ExplorerTree } from "./explorer-tree";

interface ExplorerPanelProps {
  currentProject: string | null;
  theme: "light" | "dark";
  files: ExplorerNode[];
  selectedFolderId: string | null;
  creating: "file" | "folder" | null;
  tempName: string;
  openFolders: Set<string>;
  activeFileId?: string | null;
  onFolderSelect: (id: string) => void;
  onFileSelect?: (file: ExplorerNode) => void;
  onFolderToggle: (id: string) => void;
  onStartCreate: (type: "file" | "folder", folderId: string) => void; // Updated
  onCreateNode: () => void;
  onCancelCreate: () => void;
  onTempNameChange: (name: string) => void;
}

export function ExplorerPanel({
  currentProject,
  theme,
  files,
  selectedFolderId,
  creating,
  tempName,
  openFolders,
  activeFileId,
  onFolderSelect,
  onFileSelect,
  onFolderToggle,
  onStartCreate,
  onCreateNode,
  onCancelCreate,
  onTempNameChange,
}: ExplorerPanelProps) {
  const dark = theme === "dark";
  const projectNode = files[0]; // First node is the project folder

  return (
    <div className="p-2">
      {/* Project Header */}
      {currentProject && projectNode && (
        <div className="mb-2">
          <div
            className={`group flex items-center justify-between px-2 py-1.5 rounded text-sm font-semibold cursor-pointer ${
              dark 
                ? "hover:bg-gray-800 text-gray-200" 
                : "hover:bg-gray-200 text-gray-800"
            }`}
            onClick={() => onFolderToggle(projectNode.id)}
          >
            <div className="flex items-center gap-2">
              <div className={`transition-transform ${openFolders.has(projectNode.id) ? "rotate-90" : ""}`}>
                <IconChevronRight size={14} />
              </div>
              <IconFolder size={14} />
              <span>{currentProject}</span>
            </div>
            
            {/* CREATE BUTTONS - Always visible */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
              <button
                className={`p-1 rounded ${
                  dark 
                    ? "hover:bg-gray-700 text-gray-300 hover:text-blue-400" 
                    : "hover:bg-gray-300 text-gray-600 hover:text-blue-600"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onStartCreate("file", projectNode.id);
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
                  onStartCreate("folder", projectNode.id);
                }}
                title="New Folder"
              >
                <IconFolderPlus size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILE EXPLORER TREE */}
      {(!currentProject || (projectNode && openFolders.has(projectNode.id))) && (
        <div className="overflow-y-auto max-h-[calc(100vh-150px)]">
          <ExplorerTree
            nodes={projectNode?.children || []}
            onFolderSelect={onFolderSelect}
            onFileSelect={onFileSelect}
            onFolderToggle={onFolderToggle}
            openFolders={openFolders}
            activeFileId={activeFileId}
            depth={1}
            selectedFolderId={selectedFolderId}
            creating={creating}
            tempName={tempName}
            parentId={projectNode?.id || null}
            onStartCreate={onStartCreate}
            onCreateNode={onCreateNode}
            onCancelCreate={onCancelCreate}
            onTempNameChange={onTempNameChange}
          />
        </div>
      )}
    </div>
  );
}