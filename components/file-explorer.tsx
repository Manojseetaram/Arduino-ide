"use client";

import type React from "react";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

import { Button } from "@/components/ui/button";
import { CreateItemDialog } from "@/components/create-item-dialog";
import { FileNode } from "@/app/editor/page";

interface FileExplorerProps {
  fileTree: FileNode[];
  setFileTree: React.Dispatch<React.SetStateAction<FileNode[]>>;
  onFileSelect: (file: FileNode) => void;
  selectedFolder: FileNode | null;
  setSelectedFolder: React.Dispatch<React.SetStateAction<FileNode | null>>;
  folder_name: string;
}

export function FileExplorer({
  fileTree,
  setFileTree,
  onFileSelect,
  selectedFolder,
  setSelectedFolder,
  folder_name,
}: FileExplorerProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: FileNode;
  } | null>(null);
  const [createDialog, setCreateDialog] = useState<{
    isOpen: boolean;
    type: "file" | "folder";
    parentId?: string;
    parentName?: string;
  }>({ isOpen: false, type: "file" });
  const [draggedNode, setDraggedNode] = useState<FileNode | null>(null);
  const [dragOverNode, setDragOverNode] = useState<string | null>(null);

  const toggleFolder = (nodeId: string) => {
    const updateNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === nodeId && node.type === "folder") {
          return { ...node, isOpen: !node.isOpen };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };
    setFileTree(updateNode);
  };

  const deleteNode = (nodeId: string) => {
    const removeNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.filter((node) => {
        if (node.id === nodeId) return false;
        if (node.children) {
          node.children = removeNode(node.children);
        }
        return true;
      });
    };
    setFileTree(removeNode);
    setContextMenu(null);
  };

  const createItem = async (name: string) => {
  const newItem: FileNode = {
    id: Date.now().toString(),
    name,
    type: createDialog.type,
    content: createDialog.type === "file" ? "" : undefined,
    children: createDialog.type === "folder" ? [] : undefined,
    isOpen: createDialog.type === "folder" ? false : undefined,
    folder_name,
  };

  try {
    const basePath = "/Users/manojseetaramgowda/Desktop"; // change as needed
    let fullPath = `${basePath}/${name}`;

    if (createDialog.parentName) {
      fullPath = `${basePath}/${createDialog.parentName}/${name}`;
    }

    if (createDialog.type === "folder") {
      // Create folder in OS
      const result = await invoke<string>("create_folder", { path: fullPath });
      console.log(result);
    } else if (createDialog.type === "file") {
      // Create file in OS
      const result = await invoke<string>("create_file", { path: fullPath, content: "" });
      console.log(result); // "File created: /Users/.../name"
    }

    // Update React state
    if (createDialog.parentId) {
      const addToNode = (nodes: FileNode[]): FileNode[] => {
        return nodes.map((node) => {
          if (node.id === createDialog.parentId && node.type === "folder") {
            return {
              ...node,
              children: [...(node.children || []), newItem],
              isOpen: true,
            };
          }
          if (node.children) {
            return { ...node, children: addToNode(node.children) };
          }
          return node;
        });
      };
      setFileTree(addToNode);
    } else {
      setFileTree((prev) => [...prev, newItem]);
    }
  } catch (err) {
    console.error("Failed to create item in OS:", err);
  }
};


  const moveNode = (sourceId: string, targetId: string) => {
    let nodeToMove: FileNode | null = null;

    // Find and remove the source node
    const removeNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.filter((node) => {
        if (node.id === sourceId) {
          nodeToMove = node;
          return false;
        }
        if (node.children) {
          node.children = removeNode(node.children);
        }
        return true;
      });
    };

    // Add node to target folder
    const addToTarget = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === targetId && node.type === "folder" && nodeToMove) {
          return {
            ...node,
            children: [...(node.children || []), nodeToMove],
            isOpen: true,
          };
        }
        if (node.children) {
          return { ...node, children: addToTarget(node.children) };
        }
        return node;
      });
    };

    setFileTree((prev) => {
      const withoutSource = removeNode([...prev]);
      if (nodeToMove) {
        return addToTarget(withoutSource);
      }
      return prev;
    });
  };

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  const handleDragStart = (e: React.DragEvent, node: FileNode) => {
    setDraggedNode(node);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, node: FileNode) => {
    if (node.type === "folder" && draggedNode && draggedNode.id !== node.id) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverNode(node.id);
    }
  };

  const handleDragLeave = () => {
    setDragOverNode(null);
  };

  const handleDrop = (e: React.DragEvent, targetNode: FileNode) => {
    e.preventDefault();
    if (
      draggedNode &&
      targetNode.type === "folder" &&
      draggedNode.id !== targetNode.id
    ) {
      moveNode(draggedNode.id, targetNode.id);
    }
    setDraggedNode(null);
    setDragOverNode(null);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const iconClass = "w-4 h-4 mr-2";

    switch (ext) {
      case "tsx":
      case "jsx":
        return (
          <div
            className={`${iconClass} bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs font-bold`}
          >
            R
          </div>
        );
      case "ts":
      case "js":
        return (
          <div
            className={`${iconClass} bg-yellow-500 rounded-sm flex items-center justify-center text-white text-xs font-bold`}
          >
            JS
          </div>
        );
      case "css":
        return (
          <div
            className={`${iconClass} bg-blue-600 rounded-sm flex items-center justify-center text-white text-xs font-bold`}
          >
            CSS
          </div>
        );
      case "html":
        return (
          <div
            className={`${iconClass} bg-orange-500 rounded-sm flex items-center justify-center text-white text-xs font-bold`}
          >
            H
          </div>
        );
      case "json":
        return (
          <div
            className={`${iconClass} bg-green-600 rounded-sm flex items-center justify-center text-white text-xs font-bold`}
          >
            J
          </div>
        );
      case "md":
        return (
          <div
            className={`${iconClass} bg-gray-600 rounded-sm flex items-center justify-center text-white text-xs font-bold`}
          >
            MD
          </div>
        );
      case "py":
        return (
          <div
            className={`${iconClass} bg-green-500 rounded-sm flex items-center justify-center text-white text-xs font-bold`}
          >
            PY
          </div>
        );
      case "c":
        return (
          <div
            className={`${iconClass} bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs font-bold`}
          >
            C
          </div>
        );
      default:
        return (
          <svg
            className={`${iconClass} text-muted-foreground`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const renderNode = (node: FileNode, depth = 0) => {
    const isFolder = node.type === "folder";
    const isSelected = selectedFolder?.id === node.id;
    const isDragOver = dragOverNode === node.id;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center py-1.5 px-2 hover:bg-accent/50 cursor-pointer group transition-all duration-150 rounded-sm mx-1 ${
            isSelected ? "bg-accent" : ""
          } ${
            isDragOver
              ? "bg-primary/20 border-2 border-primary/50 border-dashed"
              : ""
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          draggable
          onClick={() => {
            if (isFolder) {
              toggleFolder(node.id);
              setSelectedFolder(node);
            } else {
              onFileSelect(node);
              setSelectedFolder(null);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, node)}
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={(e) => handleDragOver(e, node)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node)}
        >
          {isFolder && (
            <svg
              className={`w-3 h-3 mr-2 transition-transform duration-200 text-muted-foreground ${
                node.isOpen ? "rotate-90" : ""
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}

          {isFolder ? (
            <svg
              className="w-4 h-4 mr-2 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
          ) : (
            getFileIcon(node.name)
          )}

          <span className="text-sm truncate flex-1">{node.name}</span>
        </div>

        {isFolder && node.isOpen && node.children && (
          <div className="animate-in slide-in-from-top-1 duration-200">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 border-b border-border/50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Explorer
            </h2>
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setCreateDialog({
                    isOpen: true,
                    type: "file",
                    parentId: selectedFolder?.id,
                    parentName: selectedFolder?.name,
                  })
                }
                className="h-6 w-6 p-0 hover:bg-accent"
                title="New File (Ctrl+N)"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setCreateDialog({
                    isOpen: true,
                    type: "folder",
                    parentId: selectedFolder?.id,
                    parentName: selectedFolder?.name,
                  })
                }
                className="h-6 w-6 p-0 hover:bg-accent"
                title="New Folder (Ctrl+Shift+N)"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
              </Button>
            </div>
          </div>
          {folder_name && (
            <div className="text-xs text-muted-foreground bg-accent/30  py-1 rounded">
              Project Name: {folder_name}
            </div>
          )}

          
        </div>

        <div className="py-2">{fileTree.map((node) => renderNode(node))}</div>

        {/* Context Menu */}
        {contextMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setContextMenu(null)}
            />
            <div
              className="fixed z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[160px]"
              style={{ left: contextMenu.x, top: contextMenu.y }}
            >
              {contextMenu.node.type === "folder" && (
                <>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center"
                    onClick={() => {
                      setCreateDialog({
                        isOpen: true,
                        type: "file",
                        parentId: contextMenu.node.id,
                        parentName: contextMenu.node.name,
                      });
                      setContextMenu(null);
                    }}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    New File
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center"
                    onClick={() => {
                      setCreateDialog({
                        isOpen: true,
                        type: "folder",
                        parentId: contextMenu.node.id,
                        parentName: contextMenu.node.name,
                      });
                      setContextMenu(null);
                    }}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                    New Folder
                  </button>
                  <div className="border-t border-border my-1" />
                </>
              )}
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-destructive hover:text-destructive-foreground flex items-center"
                onClick={() => deleteNode(contextMenu.node.id)}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      <CreateItemDialog
        isOpen={createDialog.isOpen}
        onClose={() => setCreateDialog({ isOpen: false, type: "file" })}
        onConfirm={createItem}
        type={createDialog.type}
        parentName={createDialog.parentName}
      />
    </>
  );
}
