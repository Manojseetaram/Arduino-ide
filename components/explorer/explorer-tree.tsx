"use client";

import { invoke } from "@tauri-apps/api/tauri";
import { ExplorerNode } from "./types";
import { FileIcon, sortExplorerNodes, isEspIdfFile } from "./utils";
import { IconFolder, IconFilePlus, IconFolderPlus, IconChevronRight, IconSettings, IconFile } from "@tabler/icons-react";
import { useState } from "react";

interface ExplorerTreeProps {
  nodes: ExplorerNode[];
  onFolderSelect: (id: string) => void;
  onFileSelect?: (file: ExplorerNode) => void;
  onFolderToggle: (id: string) => void;
  openFolders: Set<string>;
  activeFileId?: string | null;
  depth: number;
  selectedFolderId: string | null;
  creating: "file" | "folder" | null;
  tempName: string;
  parentId: string | null;
  onStartCreate: (type: "file" | "folder", folderId: string) => void;
  onCreateNode: () => void;
  onCancelCreate: () => void;
  onTempNameChange: (name: string) => void;
}

export function ExplorerTree({
  nodes,
  onFolderSelect,
  onFileSelect,
  onFolderToggle,
  openFolders,
  activeFileId,
  depth,
  selectedFolderId,
  creating,
  tempName,
  parentId,
  onStartCreate,
  onCreateNode,
  onCancelCreate,
  onTempNameChange,
}: ExplorerTreeProps) {
  
  const sortedNodes = sortExplorerNodes(nodes);

  return (
    <div className="space-y-px">
      {sortedNodes.map((node) =>
        node.type === "folder" ? (
          <FolderItem
            key={node.id}
            folder={node}
            onSelect={onFolderSelect}
            onToggle={onFolderToggle}
            isOpen={openFolders.has(node.id)}
            onFileSelect={onFileSelect}
            openFolders={openFolders}
            activeFileId={activeFileId}
            depth={depth}
            selectedFolderId={selectedFolderId}
            creating={creating}
            tempName={tempName}
            onStartCreate={onStartCreate}
            onCreateNode={onCreateNode}
            onCancelCreate={onCancelCreate}
            onTempNameChange={onTempNameChange}
          />
        ) : (
          <FileItem
            key={node.id}
            file={node}
            onClick={() => onFileSelect?.(node)}
            isActive={activeFileId === node.id}
            depth={depth}
          />
        )
      )}
      
      {creating && selectedFolderId === parentId && (
        <div className="pl-2" style={{ paddingLeft: `${depth * 16 + 24}px` }}>
          <input
            autoFocus
            value={tempName}
            onChange={(e) => onTempNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCreateNode();
              if (e.key === "Escape") onCancelCreate();
            }}
            onBlur={() => {
              setTimeout(() => {
                if (tempName.trim()) onCreateNode();
                else onCancelCreate();
              }, 100);
            }}
            className="w-full text-xs px-2 py-1 rounded border border-blue-300 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder={`New ${creating}...`}
          />
        </div>
      )}
    </div>
  );
}

function FolderItem({
  folder,
  onSelect,
  onToggle,
  isOpen,
  onFileSelect,
  openFolders,
  activeFileId,
  depth,
  selectedFolderId,
  creating,
  tempName,
  onStartCreate,
  onCreateNode,
  onCancelCreate,
  onTempNameChange,
}: {
  folder: ExplorerNode & { type: "folder" };
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  isOpen: boolean;
  onFileSelect?: (file: ExplorerNode) => void;
  openFolders: Set<string>;
  activeFileId?: string | null;
  depth: number;
  selectedFolderId: string | null;
  creating: "file" | "folder" | null;
  tempName: string;
  onStartCreate: (type: "file" | "folder", folderId: string) => void;
  onCreateNode: () => void;
  onCancelCreate: () => void;
  onTempNameChange: (name: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  function updateFolderChildren(id: string, children: unknown) {
    throw new Error("Function not implemented.");
  }

  return (
    <div>
      <div
        className={`group flex items-center text-sm cursor-pointer px-1 py-1 hover:bg-gray-100 ${
          selectedFolderId === folder.id 
            ? "bg-blue-50" 
            : ""
        }`}
       onClick={async (e) => {
  e.stopPropagation();

  console.log("🟢 Folder clicked:");
  console.log({
    id: folder.id,
    name: folder.name,
    type: folder.type,
    path: folder.path,
    children: folder.children,
    isOpen: folder.isOpen,
  });

  onToggle(folder.id);
  onSelect(folder.id);
  if (!folder.children || folder.children.length === 0) {
    try {
      const children = await invoke("list_project_files", {
        projectPath: folder.path,
      });

      // update tree
      updateFolderChildren(folder.id, children);
    } catch (err) {
      console.error("Failed to load folder:", folder.path, err);
    }
  }
}}

        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <div className={`transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`}>
          <IconChevronRight size={14} className="text-gray-500 mr-1" />
        </div>
        <IconFolder size={16} className="text-blue-500 mr-2 flex-shrink-0" />
        <span className="text-gray-700 truncate flex-1">{folder.name}</span>
        
        {/* Create buttons - show on hover */}
        <div className={`flex gap-1 ml-2 ${isHovered ? "opacity-100" : "opacity-0"} transition-opacity`} onClick={(e) => e.stopPropagation()}>
          <button
            className="p-0.5 rounded hover:bg-gray-200 text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              onStartCreate("file", folder.id);
            }}
            title="New File"
          >
            <IconFilePlus size={12} />
          </button>
          <button
            className="p-0.5 rounded hover:bg-gray-200 text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              onStartCreate("folder", folder.id);
            }}
            title="New Folder"
          >
            <IconFolderPlus size={12} />
          </button>
        </div>
      </div>

      {creating && selectedFolderId === folder.id && (
        <div className="pl-2" style={{ paddingLeft: `${(depth + 1) * 12 + 32}px` }}>
          <input
            autoFocus
            value={tempName}
            onChange={(e) => onTempNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCreateNode();
              if (e.key === "Escape") onCancelCreate();
            }}
            onBlur={() => {
              setTimeout(() => {
                if (tempName.trim()) onCreateNode();
                else onCancelCreate();
              }, 100);
            }}
            className="w-full text-xs px-2 py-1 rounded border border-blue-300 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder={`New ${creating}...`}
          />
        </div>
      )}

      {isOpen && folder.children && folder.children.length > 0 && (
        <ExplorerTree
          nodes={folder.children}
          onFolderSelect={onSelect}
          onFileSelect={onFileSelect}
          onFolderToggle={onToggle}
          openFolders={openFolders}
          activeFileId={activeFileId}
          depth={depth + 1}
          selectedFolderId={selectedFolderId}
          creating={creating}
          tempName={tempName}
          parentId={folder.id}
          onStartCreate={onStartCreate}
          onCreateNode={onCreateNode}
          onCancelCreate={onCancelCreate}
          onTempNameChange={onTempNameChange}
        />
      )}
    </div>
  );
}

function FileItem({
  file,
  onClick,
  isActive,
  depth,
}: {
  file: ExplorerNode & { type: "file" };
  onClick: () => void;
  isActive: boolean;
  depth: number;
}) {
  const isEspIdf = isEspIdfFile(file.name);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group flex items-center text-sm px-1 py-1 cursor-pointer ${
        isActive
          ? "bg-blue-100 text-blue-700"
          : "hover:bg-gray-100 text-gray-700"
      }`}
      style={{ paddingLeft: `${depth * 12 + 32}px` }}
    >
      <div className="mr-2 flex-shrink-0">
        {isEspIdf ? (
          <IconSettings size={16} className="text-yellow-600" />
        ) : (
          <FileIcon name={file.name} />
        )}
      </div>
      <span className="truncate flex-1">{file.name}</span>
      {isEspIdf && (
        <span className={`text-xs px-1.5 py-0.5 rounded ml-2 ${
          isActive 
            ? "bg-blue-200 text-blue-800" 
            : "bg-yellow-100 text-yellow-700"
        }`}>
          IDF
        </span>
      )}
    </div>
  );
}