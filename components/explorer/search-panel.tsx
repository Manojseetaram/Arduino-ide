import { useState } from "react";
import { IconSearch, IconX } from "@tabler/icons-react";
import { ExplorerNode, SearchResult } from "./types";
import { FileIcon, searchFiles } from "./utils";
import { IconFolder } from "@tabler/icons-react";

interface SearchPanelProps {
  nodes: ExplorerNode[];
  theme: "light" | "dark";
  onFileSelect?: (file: ExplorerNode) => void;
  onFolderToggle?: (folderId: string) => void;
  activeFileId?: string | null;
}

export function SearchPanel({
  nodes,
  theme,
  onFileSelect,
  onFolderToggle,
  activeFileId,
}: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const dark = theme === "dark";

  const searchResults = searchQuery.trim()
    ? searchFiles(nodes, searchQuery)
    : [];

  return (
    <div className="p-4">
      <div className="relative mb-4">
        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search files..."
          className={`w-full pl-10 pr-10 py-2 rounded text-sm outline-none ${
            dark
              ? "bg-gray-800 text-gray-200 border border-gray-700"
              : "bg-white text-gray-800 border border-gray-300"
          }`}
          autoFocus
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <IconX size={16} />
          </button>
        )}
      </div>

      {searchQuery && (
        <div className="text-xs text-gray-500 mb-2">
          {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
        </div>
      )}

      <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
        {searchQuery ? (
          searchResults.length > 0 ? (
            searchResults.map((result) => (
              <div
                key={result.node.id}
                onClick={() => {
                  if (onFileSelect) onFileSelect(result.node);
                  if (result.node.type === "folder" && onFolderToggle) {
                    onFolderToggle(result.node.id);
                  }
                }}
                className={`flex items-center gap-2 p-2 text-sm rounded cursor-pointer ${
                  dark ? "hover:bg-gray-800" : "hover:bg-gray-200"
                } ${
                  activeFileId === result.node.id
                    ? dark ? "bg-blue-900/30" : "bg-blue-100"
                    : ""
                }`}
              >
                {result.node.type === "folder" ? (
                  <IconFolder size={16} />
                ) : (
                  <FileIcon name={result.node.name} />
                )}
                <div className="flex-1">
                  <div className="font-medium">{result.node.name}</div>
                  <div className={`text-xs ${dark ? "text-gray-400" : "text-gray-600"}`}>
                    {result.matches.path}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={`text-center py-4 ${dark ? "text-gray-500" : "text-gray-600"}`}>
              No results found for "{searchQuery}"
            </div>
          )
        ) : (
          <div className={`text-center py-4 ${dark ? "text-gray-500" : "text-gray-600"}`}>
            Type to search files and folders
          </div>
        )}
      </div>
    </div>
  );
}