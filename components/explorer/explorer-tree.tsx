"use client";

import { invoke } from "@tauri-apps/api/tauri";
import { EditingState, ExplorerNode } from "./types";
import { FileIcon, sortExplorerNodes, isEspIdfFile } from "./utils";
import { IconFolder, IconFilePlus, IconFolderPlus, IconChevronRight, IconSettings, IconFile } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { exists } from "@tauri-apps/api/fs";

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
  onNodesUpdated?: () => void; // Add callback to refresh nodes after operations
}

async function renameNode(node: ExplorerNode, newName: string) {
  console.log("Renaming node:", node.path, "to", newName);
  try {
    await invoke("rename_path", { old_path: node.path, new_name: newName });
  } catch (err) {
    console.error("Rename failed:", err);
    alert("Failed to rename: " + err);
  }
}

async function deleteNode(node: ExplorerNode) {
  const pathExists = await exists(node.path);
  if (!pathExists) {
    alert(`Cannot delete. Path does not exist: ${node.path}`);
    return;
  }

  try {
    await invoke("delete_path", { path: node.path });
    console.log(`Deleted ${node.path}`);
  } catch (err) {
    console.error("Delete failed:", err);
  }
}


async function copyName(node: ExplorerNode) {
  await navigator.clipboard.writeText(node.name);
}

async function copyPath(node: ExplorerNode) {
  await navigator.clipboard.writeText(node.path);
}

function MenuItem({
  label,
  onClick,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`px-3 py-1 cursor-pointer ${
        danger
          ? "hover:bg-red-600 text-red-400"
          : "hover:bg-[#094771]"
      }`}
    >
      {label}
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-[#3c3c3c] my-1" />;
}

function FileItem({
  file,
  onClick,
  isActive,
  depth,
  onContextMenu,
}: {
  file: ExplorerNode & { type: "file" };
  onClick: () => void;
  isActive: boolean;
  depth: number;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  const isEspIdf = isEspIdfFile(file.name);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={onContextMenu}
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

interface FolderItemProps {
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
  onContextMenu: (e: React.MouseEvent) => void;
  onNodesUpdated?: () => void;
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
  onContextMenu,
  onNodesUpdated,
}: FolderItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  

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
          
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={onContextMenu}
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
          onNodesUpdated={onNodesUpdated}
        />
      )}
    </div>
  );
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
  onNodesUpdated,
}: ExplorerTreeProps) {
  const sortedNodes = sortExplorerNodes(nodes);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: ExplorerNode;
  } | null>(null);
  const [editingName, setEditingName] = useState("");

  // Handle editing when editing state changes
  useEffect(() => {
    if (editing) {
      const node = nodes.find(n => n.id === editing.nodeId);
      if (node) {
        setEditingName(node.name);
      }
    }
  }, [editing, nodes]);

  const handleRenameSubmit = async () => {
    if (!editing || !editingName.trim() || editingName === editing.originalName) {
      setEditing(null);
      return;
    }

    try {
      const node = nodes.find(n => n.id === editing.nodeId);
      if (node) {
        await renameNode(node, editingName);
        setEditing(null);
        // Refresh the nodes to show the updated name
        if (onNodesUpdated) {
          onNodesUpdated();
        }
      }
    } catch (error) {
      console.error("Failed to rename:", error);
      alert(`Failed to rename: ${error}`);
    }
  };

  const handleDelete = async (node: ExplorerNode) => {
    if (confirm(`Are you sure you want to delete "${node.name}"?`)) {
      try {
        await deleteNode(node);
        setContextMenu(null);
        // Refresh the nodes to remove the deleted item
        if (onNodesUpdated) {
          onNodesUpdated();
        }
      } catch (error) {
        console.error("Failed to delete:", error);
        alert(`Failed to delete: ${error}`);
      }
    }
  };

  return (
    <>
      <div className="space-y-px">
        {sortedNodes.map((node) => {
          if (editing?.nodeId === node.id) {
            return (
              <div
                key={node.id}
                className="pl-2"
                style={{ paddingLeft: `${depth * 12 + (node.type === "folder" ? 8 : 32)}px` }}
              >
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameSubmit();
                    if (e.key === "Escape") setEditing(null);
                  }}
                  onBlur={() => {
                    setTimeout(handleRenameSubmit, 100);
                  }}
                  className="w-full text-xs px-2 py-1 rounded border border-blue-300 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="New name..."
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            );
          }

          return node.type === "folder" ? (
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
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setContextMenu({
                  x: e.clientX,
                  y: e.clientY,
                  node: node,
                });
              }}
              onNodesUpdated={onNodesUpdated}
            />
          ) : (
            <FileItem
              key={node.id}
              file={node}
              onClick={() => onFileSelect?.(node)}
              isActive={activeFileId === node.id}
              depth={depth}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setContextMenu({
                  x: e.clientX,
                  y: e.clientY,
                  node: node,
                });
              }}
            />
          );
        })}
        
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

      {contextMenu && (
        <div
          className="fixed z-50 bg-[#252526] text-gray-200 border border-[#3c3c3c] rounded shadow-lg text-sm"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            minWidth: 180,
          }}
          onClick={() => setContextMenu(null)}
        >
          {/* Rename */}
          <MenuItem
            label="Rename"
            onClick={() => {
              setEditing({
                nodeId: contextMenu.node.id,
                originalName: contextMenu.node.name,
              });
              setContextMenu(null);
            }}
          />

          {/* Delete */}
          <MenuItem
            label="Delete"
            danger
            onClick={async () => {
              await handleDelete(contextMenu.node);
            }}
          />

          <Divider />

          {/* Copy Name */}
          <MenuItem
            label="Copy Name"
            onClick={() => {
              copyName(contextMenu.node);
              setContextMenu(null);
            }}
          />

          {/* Copy Path */}
          <MenuItem
            label="Copy Path"
            onClick={() => {
              copyPath(contextMenu.node);
              setContextMenu(null);
            }}
          />
        </div>
      )}
    </>
  );
}