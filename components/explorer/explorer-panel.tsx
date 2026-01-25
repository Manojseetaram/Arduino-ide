"use client";

import { ExplorerNode } from "./types";
import { IconFolder, IconChevronRight, IconChevronDown, IconFolderPlus, IconFilePlus } from "@tabler/icons-react";
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
  onStartCreate: (type: "file" | "folder", folderId: string) => void;
  onCreateNode: () => void;
  onCancelCreate: () => void;
  onTempNameChange: (name: string) => void;
  showProjectHeader?: boolean;
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
  showProjectHeader = true,
}: ExplorerPanelProps) {
  const projectNode = files[0];

  if (!currentProject || !projectNode) {
    return (
      <div className="p-4 text-center text-gray-500">
        <IconFolder size={32} className="mx-auto text-gray-300 mb-3" />
        <p>No project selected</p>
      </div>
    );
  }

  return (
    <div className="p-3">
      {showProjectHeader && (
        <div className="mb-3">
          <div
            className="group flex items-center justify-between px-3 py-2.5 rounded-lg  from-blue-50 to-blue-100  cursor-pointer"
            onClick={() => onFolderToggle(projectNode.id)}
          >
            <div className="flex items-center gap-3">
              <div className={`transition-transform ${openFolders.has(projectNode.id) ? "rotate-90" : ""}`}>
                <IconChevronRight size={16} className="text-blue-500" />
              </div>
              <IconFolder size={18} className="text-blue-600" />
              <span className="font-semibold text-gray-800">{currentProject}</span>
            </div>
            
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
              <button
                className="p-1.5  bg-white hover:bg-blue-50 text-blue-600  transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartCreate("file", projectNode.id);
                }}
                title="New File"
              >
                <IconFilePlus size={14} />
              </button>
              <button
                className="p-1.5 rounded-md bg-white hover:bg-blue-50 text-blue-600 transition-colors"
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

      {(!currentProject || (projectNode && openFolders.has(projectNode.id))) && (
        <div className="overflow-y-auto   bg-white">
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