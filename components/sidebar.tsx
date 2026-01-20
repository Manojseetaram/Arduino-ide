"use client";

import { useState } from "react";
import {
  IconFolder,
  IconSearch,
  IconPlug,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconFile,
  IconBrandRust,
  IconFileTypeCss,
} from "@tabler/icons-react";

/* ================= TYPES ================= */

export type ExplorerNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: ExplorerNode[];
};

interface SidebarProps {
  projects: string[];
  currentProject: string | null;
  onSelectProject: (p: string) => void;
  theme: "light" | "dark";
  files: ExplorerNode[];
  setFiles: React.Dispatch<React.SetStateAction<ExplorerNode[]>>;
}

type Panel = "explorer" | "search" | "extensions";

/* ================= SIDEBAR ================= */

export function Sidebar({
  currentProject,
  theme,
  files,
  setFiles,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [panel, setPanel] = useState<Panel>("explorer");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const [creating, setCreating] = useState<"file" | "folder" | null>(null);
  const [tempName, setTempName] = useState("");

  const dark = theme === "dark";

  /* ========= INSERT NODE ========= */
  const insertNode = (
    nodes: ExplorerNode[],
    folderId: string | null,
    newNode: ExplorerNode
  ): ExplorerNode[] => {
    if (!folderId) return [...nodes, newNode];

    return nodes.map((node) => {
      if (node.type === "folder") {
        if (node.id === folderId) {
          return {
            ...node,
            children: [...(node.children ?? []), newNode],
          };
        }
        return {
          ...node,
          children: insertNode(node.children ?? [], folderId, newNode),
        };
      }
      return node;
    });
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

        <SidebarIcon active={panel === "explorer"} onClick={() => setPanel("explorer")}>
          <IconFolder size={20} />
        </SidebarIcon>

        <SidebarIcon active={panel === "search"} onClick={() => setPanel("search")}>
          <IconSearch size={20} />
        </SidebarIcon>

        <SidebarIcon active={panel === "extensions"} onClick={() => setPanel("extensions")}>
          <IconPlug size={20} />
        </SidebarIcon>
      </div>

      {/* EXPLORER */}
      <div
        className={`transition-all duration-200 overflow-hidden ${
          isOpen ? "w-64" : "w-0"
        } ${
          dark
            ? "bg-gray-900 border-r border-gray-700 text-gray-200"
            : "bg-gray-100 border-r border-gray-300 text-gray-800"
        }`}
      >
        {isOpen && panel === "explorer" && (
          <div className="p-2">
            {currentProject && (
              <div className="flex items-center justify-between px-2 py-1 text-sm font-semibold">
                <span>{currentProject}</span>

                <div className="flex gap-2">
                  <IconFolder
                    size={16}
                    className="cursor-pointer"
                    onClick={() => {
                      console.log("📁 Start creating folder");
                      setCreating("folder");
                      setTempName("");
                    }}
                  />

                  <IconFile
                    size={16}
                    className="cursor-pointer"
                    onClick={() => {
                      console.log("📄 Start creating file");
                      setCreating("file");
                      setTempName("");
                    }}
                  />
                </div>
              </div>
            )}

            {/* INLINE CREATE INPUT (✅ FIXED POSITION) */}
            {creating && (
              <div className="px-3 py-1">
                <input
                  autoFocus
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && tempName.trim()) {
                      setFiles((prev) =>
                        insertNode(prev, selectedFolderId, {
                          id: crypto.randomUUID(),
                          name: tempName.trim(),
                          type: creating,
                          ...(creating === "folder" ? { children: [] } : {}),
                        })
                      );
                      setCreating(null);
                      setTempName("");
                    }

                    if (e.key === "Escape") {
                      setCreating(null);
                      setTempName("");
                    }
                  }}
                  className="w-full text-sm px-2 py-1 bg-transparent border border-blue-500 rounded outline-none"
                  placeholder={`Enter ${creating} name`}
                />
              </div>
            )}

            <ExplorerTree
              nodes={files}
              onSelect={(id) => setSelectedFolderId(id)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function SidebarIcon({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full h-12 flex items-center justify-center ${
        active ? "bg-blue-600 text-white" : "hover:bg-blue-500 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function FileIcon({ name }: { name: string }) {
  if (name.endsWith(".rs")) return <IconBrandRust size={16} />;
  if (name.endsWith(".css")) return <IconFileTypeCss size={16} />;
  return <IconFile size={16} />;
}

/* ================= TREE ================= */

function ExplorerTree({
  nodes,
  onSelect,
}: {
  nodes: ExplorerNode[];
  onSelect: (id: string) => void;
}) {
  if (!nodes.length) {
    return <div className="px-3 text-xs opacity-50">No files</div>;
  }

  return (
    <div className="pl-3 space-y-1">
      {nodes.map((node) =>
        node.type === "folder" ? (
          <FolderItem key={node.id} folder={node} onSelect={onSelect} />
        ) : (
          <FileItem key={node.id} file={node} />
        )
      )}
    </div>
  );
}

function FolderItem({
  folder,
  onSelect,
}: {
  folder: ExplorerNode & { type: "folder" };
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <div
        className="flex items-center gap-2 text-sm cursor-pointer hover:bg-blue-500/20 px-2 rounded"
        onClick={() => {
          setOpen(!open);
          onSelect(folder.id);
        }}
      >
        <IconFolder size={16} />
        {folder.name}
      </div>

      {open && (
        <ExplorerTree nodes={folder.children ?? []} onSelect={onSelect} />
      )}
    </div>
  );
}

function FileItem({ file }: { file: ExplorerNode & { type: "file" } }) {
  return (
    <div className="flex items-center gap-2 text-sm px-2 ml-4 rounded hover:bg-blue-500/20 cursor-pointer">
      <FileIcon name={file.name} />
      {file.name}
    </div>
  );
}
