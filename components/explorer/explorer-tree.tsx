// components/explorer-tree.tsx
import { ExplorerNode } from "./types";
import { FileIcon, sortExplorerNodes } from "./utils";
import { IconFolder, IconFilePlus, IconFolderPlus } from "@tabler/icons-react";
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
  
  // Sort nodes: folders first, then files alphabetically
  const sortedNodes = sortExplorerNodes(nodes);
  
  // DEBUG: Log nodes to see what's coming in
  if (nodes.length > 0 && depth === 0) {
    console.log("ExplorerTree - Root nodes:", nodes);
    console.log("Sorted nodes:", sortedNodes);
  }

  return (
    <div className="space-y-1">
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
      
      {/* Create input for this folder level */}
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
            className={`w-full text-sm px-2 py-1 rounded outline-none ${
              depth === 1
                ? "bg-gray-800 border border-blue-500 text-gray-200"
                : "bg-gray-700 border border-blue-400 text-gray-200"
            }`}
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
  
  // DEBUG: Log folder info
  console.log(`FolderItem: ${folder.name} (${folder.id}), children:`, folder.children?.length || 0);

  return (
    <div>
      <div
        className={`group flex items-center gap-2 text-sm cursor-pointer px-2 py-1 rounded hover:bg-blue-500/20`}
        onClick={() => {
          console.log(`Toggling folder: ${folder.name}`);
          onToggle(folder.id);
          onSelect(folder.id);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <div className={`transform transition-transform ${isOpen ? "rotate-0" : "-rotate-90"}`}>
          <IconFolder size={16} />
        </div>
        <span className="flex-1">{folder.name}</span>
        
        {/* Create buttons - show on hover or when folder is selected */}
        {(isHovered || selectedFolderId === folder.id) && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <button
              className="p-1 rounded hover:bg-gray-700 text-gray-300 hover:text-blue-400"
              onClick={(e) => {
                e.stopPropagation();
                onStartCreate("file", folder.id);
              }}
              title="New C File"
            >
              <IconFilePlus size={12} />
            </button>
            <button
              className="p-1 rounded hover:bg-gray-700 text-gray-300 hover:text-blue-400"
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

      {/* Create input for this folder */}
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
            className={`w-full text-sm px-2 py-1 rounded outline-none ${
              depth === 1
                ? "bg-gray-800 border border-blue-500 text-gray-200"
                : "bg-gray-700 border border-blue-400 text-gray-200"
            }`}
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
  console.log(`FileItem: ${file.name} at depth ${depth}`);
  
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 text-sm px-2 py-1 rounded cursor-pointer ${
        isActive
          ? "bg-blue-500/30 text-blue-300"
          : "hover:bg-blue-500/20"
      }`}
      style={{ paddingLeft: `${depth * 16 + 32}px` }}
    >
      <FileIcon name={file.name} />
      <span className="flex-1 truncate">{file.name}</span>
    </div>
  );
}