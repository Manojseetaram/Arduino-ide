import { ExplorerNode } from "./types";
import { FileIcon } from "./utils";
import { IconFolder } from "@tabler/icons-react";

interface ExplorerTreeProps {
  nodes: ExplorerNode[];
  onFolderSelect: (id: string) => void;
  onFileSelect?: (file: ExplorerNode) => void;
  onFolderToggle: (id: string) => void;
  openFolders: Set<string>;
  activeFileId?: string | null;
  depth: number;
}

export function ExplorerTree({
  nodes,
  onFolderSelect,
  onFileSelect,
  onFolderToggle,
  openFolders,
  activeFileId,
  depth,
}: ExplorerTreeProps) {
  return (
    <div className="space-y-1">
      {nodes.map((node) =>
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
}: {
  folder: ExplorerNode & { type: "folder" };
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  isOpen: boolean;
  onFileSelect?: (file: ExplorerNode) => void;
  openFolders: Set<string>;
  activeFileId?: string | null;
  depth: number;
}) {
  return (
    <div>
      <div
        className={`flex items-center gap-2 text-sm cursor-pointer px-2 py-1 rounded hover:bg-blue-500/20`}
        onClick={() => {
          onToggle(folder.id);
          onSelect(folder.id);
        }}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <div className={`transform transition-transform ${isOpen ? "rotate-0" : "-rotate-90"}`}>
          <IconFolder size={16} />
        </div>
        <span className="flex-1">{folder.name}</span>
      </div>

      {isOpen && folder.children && (
        <ExplorerTree
          nodes={folder.children}
          onFolderSelect={onSelect}
          onFileSelect={onFileSelect}
          onFolderToggle={onToggle}
          openFolders={openFolders}
          activeFileId={activeFileId}
          depth={depth + 1}
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