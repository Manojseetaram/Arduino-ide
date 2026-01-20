// "use client";

// import { useState, useMemo, useEffect, useCallback } from "react";
// import {
//   IconFolder,
//   IconSearch,
//   IconPlug,
//   IconLayoutSidebarLeftCollapse,
//   IconLayoutSidebarLeftExpand,
//   IconFile,
//   IconBrandRust,
//   IconFileTypeCss,
//   IconFileTypeTsx,
//   IconFileTypeJsx,
//   IconFileTypeJs,
//   IconFileTypeHtml,
//   IconFileTypeJson,
//   IconFileTypeTs,
//   IconX,
// } from "@tabler/icons-react";

// /* ================= TYPES ================= */
// export type ExplorerNode = {
//   id: string;
//   name: string;
//   type: "file" | "folder";
//   path: string;
//   children?: ExplorerNode[];
//   parentId?: string | null;
// };

// interface SidebarProps {
//   projects: string[];
//   currentProject: string | null;
//   onSelectProject: (p: string) => void;
//   theme: "light" | "dark";
//   onFileSelect?: (file: ExplorerNode) => void;
//   activeFileId?: string | null;
// }

// /* ================= UTILITIES ================= */
// const fileIcons: Record<string, React.ReactNode> = {
//   '.rs': <IconBrandRust size={16} />,
//   '.css': <IconFileTypeCss size={16} />,
//   '.tsx': <IconFileTypeTsx size={16} />,
//   '.jsx': <IconFileTypeJsx size={16} />,
//   '.js': <IconFileTypeJs size={16} />,
//   '.html': <IconFileTypeHtml size={16} />,
//   '.json': <IconFileTypeJson size={16} />,
//   '.ts': <IconFileTypeTs size={16} />,
// };

// function FileIcon({ name }: { name: string }) {
//   const extension = Object.keys(fileIcons).find(ext => name.endsWith(ext));
//   if (extension && fileIcons[extension]) {
//     return <>{fileIcons[extension]}</>;
//   }
//   return <IconFile size={16} />;
// }

// function getFileExtension(name: string): string {
//   const lastDot = name.lastIndexOf('.');
//   return lastDot === -1 ? '' : name.substring(lastDot);
// }

// /* ================= SEARCH UTILITIES ================= */
// interface SearchResult {
//   node: ExplorerNode;
//   matches: { path: string; score: number };
// }

// function searchFiles(
//   nodes: ExplorerNode[],
//   query: string,
//   parentPath: string = ""
// ): SearchResult[] {
//   const results: SearchResult[] = [];
//   const lowerQuery = query.toLowerCase();

//   nodes.forEach(node => {
//     const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    
//     if (node.name.toLowerCase().includes(lowerQuery)) {
//       const score = node.name.toLowerCase().indexOf(lowerQuery);
//       results.push({
//         node: { ...node, path: currentPath },
//         matches: { path: currentPath, score }
//       });
//     }

//     if (node.type === "folder" && node.children) {
//       results.push(...searchFiles(node.children, query, currentPath));
//     }
//   });

//   return results.sort((a, b) => a.matches.score - b.matches.score);
// }

// /* ================= MAIN COMPONENT ================= */
// export function Sidebar({
//   currentProject,
//   theme,
//   onFileSelect,
//   activeFileId,
// }: SidebarProps) {
//   const [isOpen, setIsOpen] = useState(true);
//   const [panel, setPanel] = useState<"explorer" | "search" | "extensions">("explorer");
//   const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
//   const [creating, setCreating] = useState<"file" | "folder" | null>(null);
//   const [tempName, setTempName] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());

//   const dark = theme === "dark";

//   // Initial file structure
//   const [files, setFiles] = useState<ExplorerNode[]>([
//     {
//       id: crypto.randomUUID(),
//       name: currentProject || "New Project",
//       type: "folder",
//       path: currentProject || "New Project",
//       children: [
//         {
//           id: crypto.randomUUID(),
//           name: "index.html",
//           type: "file",
//           path: `${currentProject || "New Project"}/index.html`,
//           parentId: null,
//         },
//         {
//           id: crypto.randomUUID(),
//           name: "styles",
//           type: "folder",
//           path: `${currentProject || "New Project"}/styles`,
//           parentId: null,
//           children: [
//             {
//               id: crypto.randomUUID(),
//               name: "main.css",
//               type: "file",
//               path: `${currentProject || "New Project"}/styles/main.css`,
//               parentId: null,
//             },
//           ],
//         },
//         {
//           id: crypto.randomUUID(),
//           name: "src",
//           type: "folder",
//           path: `${currentProject || "New Project"}/src`,
//           parentId: null,
//           children: [
//             {
//               id: crypto.randomUUID(),
//               name: "App.tsx",
//               type: "file",
//               path: `${currentProject || "New Project"}/src/App.tsx`,
//               parentId: null,
//             },
//             {
//               id: crypto.randomUUID(),
//               name: "components",
//               type: "folder",
//               path: `${currentProject || "New Project"}/src/components`,
//               parentId: null,
//               children: [
//                 {
//                   id: crypto.randomUUID(),
//                   name: "Button.tsx",
//                   type: "file",
//                   path: `${currentProject || "New Project"}/src/components/Button.tsx`,
//                   parentId: null,
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//     },
//   ]);

//   // Search results
//   const searchResults = useMemo(() => {
//     if (!searchQuery.trim()) return [];
//     return searchFiles(files, searchQuery);
//   }, [files, searchQuery]);

//   /* ========= FOLDER TOGGLE ========= */
//   const toggleFolder = useCallback((folderId: string) => {
//     setOpenFolders(prev => {
//       const next = new Set(prev);
//       if (next.has(folderId)) {
//         next.delete(folderId);
//       } else {
//         next.add(folderId);
//       }
//       return next;
//     });
//   }, []);

//   /* ========= NODE OPERATIONS ========= */
//   const insertNode = useCallback((
//     nodes: ExplorerNode[],
//     folderId: string | null,
//     newNode: ExplorerNode
//   ): ExplorerNode[] => {
//     if (!folderId) return [...nodes, newNode];

//     return nodes.map((node) => {
//       if (node.type === "folder") {
//         if (node.id === folderId) {
//           return {
//             ...node,
//             children: [...(node.children ?? []), newNode],
//           };
//         }
//         return {
//           ...node,
//           children: insertNode(node.children ?? [], folderId, newNode),
//         };
//       }
//       return node;
//     });
//   }, []);

//   const handleCreateNode = useCallback(() => {
//     if (!tempName.trim()) {
//       setCreating(null);
//       return;
//     }

//     const extension = creating === "file" ? getFileExtension(tempName) : "";
//     const finalName = creating === "file" && !extension ? `${tempName}.txt` : tempName;

//     setFiles(prev =>
//       insertNode(prev, selectedFolderId, {
//         id: crypto.randomUUID(),
//         name: finalName,
//         type: creating!,
//         path: finalName,
//         ...(creating === "folder" ? { children: [] } : {}),
//       })
//     );

//     if (creating === "folder" && selectedFolderId) {
//       setOpenFolders(prev => new Set(prev).add(selectedFolderId));
//     }

//     setCreating(null);
//     setTempName("");
//   }, [tempName, creating, selectedFolderId, insertNode]);

//   /* ========= SEARCH PANEL ========= */
//   const SearchPanel = () => (
//     <div className="p-4">
//       <div className="relative mb-4">
//         <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//         <input
//           type="text"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           placeholder="Search files..."
//           className={`w-full pl-10 pr-10 py-2 rounded text-sm outline-none ${
//             dark
//               ? "bg-gray-800 text-gray-200 border border-gray-700"
//               : "bg-white text-gray-800 border border-gray-300"
//           }`}
//           autoFocus
//         />
//         {searchQuery && (
//           <button
//             onClick={() => setSearchQuery("")}
//             className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//           >
//             <IconX size={16} />
//           </button>
//         )}
//       </div>

//       {searchQuery && (
//         <div className="text-xs text-gray-500 mb-2">
//           {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
//         </div>
//       )}

//       <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
//         {searchQuery ? (
//           searchResults.length > 0 ? (
//             searchResults.map((result) => (
//               <div
//                 key={result.node.id}
//                 onClick={() => {
//                   if (onFileSelect) onFileSelect(result.node);
//                   if (result.node.type === "folder") {
//                     toggleFolder(result.node.id);
//                   }
//                 }}
//                 className={`flex items-center gap-2 p-2 text-sm rounded cursor-pointer ${
//                   dark ? "hover:bg-gray-800" : "hover:bg-gray-200"
//                 } ${
//                   activeFileId === result.node.id
//                     ? dark ? "bg-blue-900/30" : "bg-blue-100"
//                     : ""
//                 }`}
//               >
//                 {result.node.type === "folder" ? (
//                   <IconFolder size={16} />
//                 ) : (
//                   <FileIcon name={result.node.name} />
//                 )}
//                 <div className="flex-1">
//                   <div className="font-medium">{result.node.name}</div>
//                   <div className={`text-xs ${dark ? "text-gray-400" : "text-gray-600"}`}>
//                     {result.matches.path}
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className={`text-center py-4 ${dark ? "text-gray-500" : "text-gray-600"}`}>
//               No results found for "{searchQuery}"
//             </div>
//           )
//         ) : (
//           <div className={`text-center py-4 ${dark ? "text-gray-500" : "text-gray-600"}`}>
//             Type to search files and folders
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   /* ========= EXPLORER PANEL ========= */
//   const ExplorerPanel = () => (
//     <div className="p-2">
//       {currentProject && (
//         <div className="flex items-center justify-between px-2 py-1 text-sm font-semibold mb-2">
//           <span>{currentProject}</span>
//           <div className="flex gap-2">
//             <IconFolder
//               size={16}
//               className="cursor-pointer hover:text-blue-400"
//               onClick={() => {
//                 setCreating("folder");
//                 setTempName("");
//               }}
//             />
//             <IconFile
//               size={16}
//               className="cursor-pointer hover:text-blue-400"
//               onClick={() => {
//                 setCreating("file");
//                 setTempName("");
//               }}
//             />
//           </div>
//         </div>
//       )}

//       {/* CREATE INPUT */}
//       {creating && (
//         <div className="px-3 py-2 mb-2">
//           <input
//             autoFocus
//             value={tempName}
//             onChange={(e) => setTempName(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter") handleCreateNode();
//               if (e.key === "Escape") {
//                 setCreating(null);
//                 setTempName("");
//               }
//             }}
//             onBlur={() => {
//               setTimeout(() => {
//                 if (tempName.trim()) handleCreateNode();
//                 else {
//                   setCreating(null);
//                   setTempName("");
//                 }
//               }, 100);
//             }}
//             className={`w-full text-sm px-3 py-1 rounded outline-none ${
//               dark
//                 ? "bg-gray-800 border border-blue-500 text-gray-200"
//                 : "bg-white border border-blue-400 text-gray-800"
//             }`}
//             placeholder={`New ${creating} name...`}
//           />
//         </div>
//       )}

//       {/* FILE EXPLORER TREE */}
//       <div className="overflow-y-auto max-h-[calc(100vh-150px)]">
//         <ExplorerTree
//           nodes={files}
//           onFolderSelect={setSelectedFolderId}
//           onFileSelect={onFileSelect}
//           onFolderToggle={toggleFolder}
//           openFolders={openFolders}
//           activeFileId={activeFileId}
//           depth={0}
//         />
//       </div>
//     </div>
//   );

//   return (
//     <div className="flex h-screen">
//       {/* LEFT ICON BAR */}
//       <div
//         className={`w-14 flex flex-col items-center ${
//           dark ? "bg-gray-950 text-gray-300" : "bg-gray-300 text-gray-800"
//         }`}
//       >
//         <button
//           onClick={() => setIsOpen((v) => !v)}
//           className="h-12 w-full flex items-center justify-center hover:bg-blue-600 hover:text-white"
//         >
//           {isOpen ? (
//             <IconLayoutSidebarLeftCollapse size={20} />
//           ) : (
//             <IconLayoutSidebarLeftExpand size={20} />
//           )}
//         </button>

//         <SidebarIcon
//           active={panel === "explorer"}
//           onClick={() => setPanel("explorer")}
//           tooltip="Explorer"
//         >
//           <IconFolder size={20} />
//         </SidebarIcon>

//         <SidebarIcon
//           active={panel === "search"}
//           onClick={() => setPanel("search")}
//           tooltip="Search"
//         >
//           <IconSearch size={20} />
//         </SidebarIcon>

//         <SidebarIcon
//           active={panel === "extensions"}
//           onClick={() => setPanel("extensions")}
//           tooltip="Extensions"
//         >
//           <IconPlug size={20} />
//         </SidebarIcon>
//       </div>

//       {/* MAIN SIDEBAR */}
//       <div
//         className={`transition-all duration-200 overflow-hidden flex flex-col ${
//           isOpen ? "w-64" : "w-0"
//         } ${
//           dark
//             ? "bg-gray-900 border-r border-gray-700 text-gray-200"
//             : "bg-gray-100 border-r border-gray-300 text-gray-800"
//         }`}
//       >
//         {isOpen && (
//           <>
//             <div className="px-4 py-3 border-b border-gray-700 font-semibold text-sm">
//               {panel === "explorer" && "EXPLORER"}
//               {panel === "search" && "SEARCH"}
//               {panel === "extensions" && "EXTENSIONS"}
//             </div>
            
//             <div className="flex-1 overflow-hidden">
//               {panel === "explorer" && <ExplorerPanel />}
//               {panel === "search" && <SearchPanel />}
//               {panel === "extensions" && (
//                 <div className="p-4 text-center text-gray-500">
//                   Extensions panel coming soon
//                 </div>
//               )}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// /* ================= HELPERS ================= */
// function SidebarIcon({
//   children,
//   onClick,
//   active,
//   tooltip,
// }: {
//   children: React.ReactNode;
//   onClick?: () => void;
//   active?: boolean;
//   tooltip?: string;
// }) {
//   return (
//     <button
//       onClick={onClick}
//       className={`relative w-full h-12 flex items-center justify-center group ${
//         active ? "bg-blue-600 text-white" : "hover:bg-blue-500 hover:text-white"
//       }`}
//       title={tooltip}
//     >
//       {children}
//       {tooltip && (
//         <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
//           {tooltip}
//         </div>
//       )}
//     </button>
//   );
// }

// /* ================= EXPLORER COMPONENTS ================= */
// interface ExplorerTreeProps {
//   nodes: ExplorerNode[];
//   onFolderSelect: (id: string) => void;
//   onFileSelect?: (file: ExplorerNode) => void;
//   onFolderToggle: (id: string) => void;
//   openFolders: Set<string>;
//   activeFileId?: string | null;
//   depth: number;
// }

// function ExplorerTree({
//   nodes,
//   onFolderSelect,
//   onFileSelect,
//   onFolderToggle,
//   openFolders,
//   activeFileId,
//   depth,
// }: ExplorerTreeProps) {
//   return (
//     <div className="space-y-1">
//       {nodes.map((node) =>
//         node.type === "folder" ? (
//           <FolderItem
//             key={node.id}
//             folder={node}
//             onSelect={onFolderSelect}
//             onToggle={onFolderToggle}
//             isOpen={openFolders.has(node.id)}
//             onFileSelect={onFileSelect}
//             openFolders={openFolders}
//             activeFileId={activeFileId}
//             depth={depth}
//           />
//         ) : (
//           <FileItem
//             key={node.id}
//             file={node}
//             onClick={() => onFileSelect?.(node)}
//             isActive={activeFileId === node.id}
//             depth={depth}
//           />
//         )
//       )}
//     </div>
//   );
// }

// function FolderItem({
//   folder,
//   onSelect,
//   onToggle,
//   isOpen,
//   onFileSelect,
//   openFolders,
//   activeFileId,
//   depth,
// }: {
//   folder: ExplorerNode & { type: "folder" };
//   onSelect: (id: string) => void;
//   onToggle: (id: string) => void;
//   isOpen: boolean;
//   onFileSelect?: (file: ExplorerNode) => void;
//   openFolders: Set<string>;
//   activeFileId?: string | null;
//   depth: number;
// }) {
//   return (
//     <div>
//       <div
//         className={`flex items-center gap-2 text-sm cursor-pointer px-2 py-1 rounded ${
//           depth > 0 ? `ml-${depth * 4}` : ""
//         } hover:bg-blue-500/20`}
//         onClick={() => {
//           onToggle(folder.id);
//           onSelect(folder.id);
//         }}
//         style={{ paddingLeft: `${depth * 16 + 8}px` }}
//       >
//         <div className={`transform transition-transform ${isOpen ? "rotate-0" : "-rotate-90"}`}>
//           <IconFolder size={16} />
//         </div>
//         <span className="flex-1">{folder.name}</span>
//       </div>

//       {isOpen && folder.children && (
//         <ExplorerTree
//           nodes={folder.children}
//           onFolderSelect={onSelect}
//           onFileSelect={onFileSelect}
//           onFolderToggle={onToggle}
//           openFolders={openFolders}
//           activeFileId={activeFileId}
//           depth={depth + 1}
//         />
//       )}
//     </div>
//   );
// }

// function FileItem({
//   file,
//   onClick,
//   isActive,
//   depth,
// }: {
//   file: ExplorerNode & { type: "file" };
//   onClick: () => void;
//   isActive: boolean;
//   depth: number;
// }) {
//   return (
//     <div
//       onClick={onClick}
//       className={`flex items-center gap-2 text-sm px-2 py-1 rounded cursor-pointer ${
//         isActive
//           ? "bg-blue-500/30 text-blue-300"
//           : "hover:bg-blue-500/20"
//       }`}
//       style={{ paddingLeft: `${depth * 16 + 32}px` }}
//     >
//       <FileIcon name={file.name} />
//       <span className="flex-1 truncate">{file.name}</span>
//     </div>
//   );
// }



"use client";

import { useState, useMemo, useCallback } from "react";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";

import { SidebarProps, ExplorerNode } from "@/components/explorer/types";
import { getFileExtension, insertNode } from "@/components/explorer/utils";
import { SearchPanel } from "@/components/explorer/search-panel";
import { ExplorerPanel } from "@/components/explorer/explorer-panel";

import { SidebarIcon } from "@/components/explorer/sidebar-icon";
import { IconFolder, IconSearch, IconPlug } from "@tabler/icons-react";
import { ExtensionsPanel } from "./explorer/extensions-panel";

export function Sidebar({
  currentProject,
  theme,
  files: externalFiles,
  setFiles: externalSetFiles,
  onFileSelect,
  activeFileId,
}: SidebarProps & {
  onFileSelect?: (file: ExplorerNode) => void;
  activeFileId?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [panel, setPanel] = useState<"explorer" | "search" | "extensions">("explorer");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);
  const [tempName, setTempName] = useState("");
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());

  const dark = theme === "dark";

  // Use external files if provided, otherwise use internal state
  const [internalFiles, internalSetFiles] = useState<ExplorerNode[]>(() => {
    if (externalFiles) return externalFiles;
    
    return currentProject ? [{
      id: crypto.randomUUID(),
      name: currentProject,
      type: "folder" as const,
      path: currentProject,
      children: [],
    }] : [];
  });

  const files = externalFiles || internalFiles;
  const setFiles = externalSetFiles || internalSetFiles;

  /* ========= FOLDER TOGGLE ========= */
  const toggleFolder = useCallback((folderId: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  /* ========= NODE OPERATIONS ========= */
  const handleCreateNode = useCallback(() => {
    if (!tempName.trim() || !creating) {
      setCreating(null);
      setTempName("");
      return;
    }

    const extension = creating === "file" ? getFileExtension(tempName) : "";
    const finalName = creating === "file" && !extension ? `${tempName}.txt` : tempName;

    const newNode: ExplorerNode = {
      id: crypto.randomUUID(),
      name: finalName,
      type: creating,
      path: finalName,
      ...(creating === "folder" ? { children: [] } : {}),
    };

    setFiles(prev => insertNode(prev, selectedFolderId, newNode));

    if (creating === "folder" && selectedFolderId) {
      setOpenFolders(prev => new Set(prev).add(selectedFolderId));
    }

    setCreating(null);
    setTempName("");
  }, [tempName, creating, selectedFolderId, setFiles]);

  const handleCancelCreate = useCallback(() => {
    setCreating(null);
    setTempName("");
  }, []);

  const handleStartCreate = useCallback((type: "file" | "folder") => {
    setCreating(type);
    setTempName("");
  }, []);

  /* ========= RENDER PANELS ========= */
  const renderPanel = () => {
    switch (panel) {
      case "explorer":
        return (
          <ExplorerPanel
            currentProject={currentProject}
            theme={theme}
            files={files}
            selectedFolderId={selectedFolderId}
            creating={creating}
            tempName={tempName}
            openFolders={openFolders}
            activeFileId={activeFileId}
            onFolderSelect={setSelectedFolderId}
            onFileSelect={onFileSelect}
            onFolderToggle={toggleFolder}
            onStartCreate={handleStartCreate}
            onCreateNode={handleCreateNode}
            onCancelCreate={handleCancelCreate}
            onTempNameChange={setTempName}
          />
        );
      case "search":
        return (
          <SearchPanel
            nodes={files}
            theme={theme}
            onFileSelect={onFileSelect}
            onFolderToggle={toggleFolder}
            activeFileId={activeFileId}
          />
        );
      case "extensions":
        return <ExtensionsPanel theme={theme} />;
      default:
        return null;
    }
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

        <SidebarIcon
          active={panel === "explorer"}
          onClick={() => setPanel("explorer")}
          tooltip="Explorer"
        >
          <IconFolder size={20} />
        </SidebarIcon>

        <SidebarIcon
          active={panel === "search"}
          onClick={() => setPanel("search")}
          tooltip="Search"
        >
          <IconSearch size={20} />
        </SidebarIcon>

        <SidebarIcon
          active={panel === "extensions"}
          onClick={() => setPanel("extensions")}
          tooltip="Extensions"
        >
          <IconPlug size={20} />
        </SidebarIcon>
      </div>

      {/* MAIN SIDEBAR */}
      <div
        className={`transition-all duration-200 overflow-hidden flex flex-col ${
          isOpen ? "w-64" : "w-0"
        } ${
          dark
            ? "bg-gray-900 border-r border-gray-700 text-gray-200"
            : "bg-gray-100 border-r border-gray-300 text-gray-800"
        }`}
      >
        {isOpen && (
          <>
            <div className="px-4 py-3 border-b border-gray-700 font-semibold text-sm">
              {panel === "explorer" && "EXPLORER"}
              {panel === "search" && "SEARCH"}
              {panel === "extensions" && "EXTENSIONS"}
            </div>
            
            <div className="flex-1 overflow-hidden">
              {renderPanel()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}