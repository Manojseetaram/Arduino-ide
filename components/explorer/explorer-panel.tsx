import { ExplorerNode } from "./types";
import { IconFolder, IconFile } from "@tabler/icons-react";
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
  onStartCreate: (type: "file" | "folder") => void;
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

  return (
    <div className="p-2">
      {currentProject && (
        <div className="flex items-center justify-between px-2 py-1 text-sm font-semibold mb-2">
          <span>{currentProject}</span>
          <div className="flex gap-2">
            <IconFolder
              size={16}
              className="cursor-pointer hover:text-blue-400"
              onClick={() => onStartCreate("folder")}
            />
            <IconFile
              size={16}
              className="cursor-pointer hover:text-blue-400"
              onClick={() => onStartCreate("file")}
            />
          </div>
        </div>
      )}

      {/* CREATE INPUT */}
      {creating && (
        <div className="px-3 py-2 mb-2">
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
            className={`w-full text-sm px-3 py-1 rounded outline-none ${
              dark
                ? "bg-gray-800 border border-blue-500 text-gray-200"
                : "bg-white border border-blue-400 text-gray-800"
            }`}
            placeholder={`New ${creating} name...`}
          />
        </div>
      )}

      {/* FILE EXPLORER TREE */}
      <div className="overflow-y-auto max-h-[calc(100vh-150px)]">
        <ExplorerTree
          nodes={files}
          onFolderSelect={onFolderSelect}
          onFileSelect={onFileSelect}
          onFolderToggle={onFolderToggle}
          openFolders={openFolders}
          activeFileId={activeFileId}
          depth={0}
        />
      </div>
    </div>
  );
}