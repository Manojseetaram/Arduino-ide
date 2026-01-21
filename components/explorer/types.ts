export type ExplorerNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: ExplorerNode[];
  parentId?: string | null;
};

// export interface SidebarProps {
//   projects: string[];
//   currentProject: string | null;
//   onSelectProject: (p: string) => void;
//   theme: "light" | "dark";
//   files?: ExplorerNode[];
//   setFiles?: React.Dispatch<React.SetStateAction<ExplorerNode[]>>;
// }
// components/explorer/types.ts
export interface SidebarProps {
  projects: string[];
  currentProject: string | null;
  onSelectProject: (projectName: string) => void;
  theme: "light" | "dark";
  files: ExplorerNode[];
  setFiles: (value: ExplorerNode[] | ((prev: ExplorerNode[]) => ExplorerNode[])) => void;
  onFileSelect?: (file: ExplorerNode) => void;
  activeFileId?: string | null;
}
export interface SearchResult {
  node: ExplorerNode;
  matches: { path: string; score: number };
}

export interface EditorTab {
  id: string;
  name: string;
  path: string;
  content?: string;
  saved?: boolean;
}

export interface EditorState {
  tabs: EditorTab[];
  activeTabId: string | null;
}

// Context menu types
export interface ContextMenuState {
  x: number;
  y: number;
  nodeId: string | null;
  nodeType: "file" | "folder" | null;
}

// Editing state
export interface EditingState {
  nodeId: string;
  originalName: string;
}