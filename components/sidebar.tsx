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

/* ========= TYPES ========= */

export type FileNode = {
  id: string;
  name: string;
  type: "file";
};

export type FolderNode = {
  id: string;
  name: string;
  type: "folder";
  children: ExplorerNode[];
};

export type ExplorerNode = FileNode | FolderNode;

interface SidebarProps {
  projects: string[];
  currentProject: string | null;
  onSelectProject: (p: string) => void;
  theme: "light" | "dark";
  files: ExplorerNode[];
  setFiles: (files: ExplorerNode[]) => void;
}

type Panel = "explorer" | "search" | "extensions";

/* ========= SIDEBAR ========= */

export function Sidebar({
  projects,
  currentProject,
  onSelectProject,
  theme,
  files,
  setFiles,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [panel, setPanel] = useState<Panel>("explorer");

  const dark = theme === "dark";

  const createFolder = () => {
    const name = prompt("Folder name?");
    if (!name) return;

    setFiles([
      ...files,
      {
        id: crypto.randomUUID(),
        name,
        type: "folder",
        children: [],
      },
    ]);
  };

  const createFile = () => {
    const name = prompt("File name? (ex: main.rs)");
    if (!name) return;

    setFiles([
      ...files,
      {
        id: crypto.randomUUID(),
        name,
        type: "file",
      },
    ]);
  };

  return (
    <div className="flex h-screen">
      {/* LEFT BAR */}
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

      {/* PANEL */}
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
            {/* PROJECT HEADER */}
            {currentProject && (
              <div className="flex items-center justify-between px-2 py-1 text-sm font-semibold">
                <span>{currentProject}</span>
                <div className="flex gap-2">
                  <IconFolder size={16} onClick={createFolder} className="cursor-pointer" />
                  <IconFile size={16} onClick={createFile} className="cursor-pointer" />
                </div>
              </div>
            )}

            {/* FILE TREE */}
            <ExplorerTree nodes={files} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ========= HELPERS ========= */

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
  if (name.endsWith(".c")) return <IconFileTypeCss size={16} />;
  return <IconFile size={16} />;
}

function ExplorerTree({ nodes }: { nodes: ExplorerNode[] }) {
  if (!nodes.length) {
    return <div className="px-3 text-xs opacity-50">No files</div>;
  }

  return (
    <div className="pl-4 space-y-1">
      {nodes.map((node) =>
        node.type === "folder" ? (
          <div key={node.id}>
            <div className="flex items-center gap-2 text-sm">
              <IconFolder size={16} />
              {node.name}
            </div>
          </div>
        ) : (
          <div
            key={node.id}
            className="flex items-center gap-2 text-sm px-2 rounded hover:bg-blue-500/20 cursor-pointer"
          >
            <FileIcon name={node.name} />
            {node.name}
          </div>
        )
      )}
    </div>
  );
}
