"use client";

import { ExplorerNode } from "./types";
import { FileIcon, sortExplorerNodes } from "./utils";
import { IconFolder, IconFilePlus, IconFolderPlus, IconChevronRight, IconChevronDown } from "@tabler/icons-react";
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
    <div className="space-y-0.5 py-2">
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
        <div className="pl-2" style={{ paddingLeft: `${depth * 16 + 32}px` }}>
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
            className="w-full text-sm px-3 py-1.5 rounded border border-blue-300 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder={`New ${creating} name...`}
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

  return (
    <div>
      <div
        className={`group flex items-center gap-2 text-sm cursor-pointer px-3 py-1.5 rounded mx-2 transition-colors ${
          selectedFolderId === folder.id 
            ? "bg-blue-100 text-blue-700 border border-blue-200" 
            : "hover:bg-blue-50 text-gray-700"
        }`}
        onClick={() => {
          onToggle(folder.id);
          onSelect(folder.id);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <div className={`transition-transform ${isOpen ? "rotate-90" : ""}`}>
          <IconChevronRight size={14} className="text-blue-500" />
        </div>
        <IconFolder size={16} className="text-blue-500" />
        <span className="flex-1 font-medium truncate">{folder.name}</span>
        
        {(isHovered || selectedFolderId === folder.id) && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <button
              className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onStartCreate("file", folder.id);
              }}
              title="New File"
            >
              <IconFilePlus size={12} />
            </button>
            <button
              className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onStartCreate("folder", folder.id);
              }}
              title="New Folder"
            >
              <IconFolderPlus size={12} />
            </button>
          </div>
        )}
      </div>

      {creating && selectedFolderId === folder.id && (
        <div className="pl-2" style={{ paddingLeft: `${(depth + 1) * 16 + 32}px` }}>
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
            className="w-full text-sm px-3 py-1.5 rounded border border-blue-300 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder={`New ${creating} name...`}
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
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 text-sm px-3 py-1.5 rounded mx-2 transition-all cursor-pointer ${
        isActive
          ? "bg-blue-600 text-white shadow-sm"
          : "hover:bg-blue-50 text-gray-700"
      }`}
      style={{ paddingLeft: `${depth * 16 + 32}px` }}
    >
      <div className={`${isActive ? "text-white" : "text-blue-500"}`}>
        <FileIcon name={file.name} />
      </div>
      <span className="flex-1 truncate font-medium">{file.name}</span>
    </div>
  );
}