export type ExplorerNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: ExplorerNode[];
  parentId?: string | null;
  // isOpen: boolean; // ✅ FIX
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
  projects?: string[]; // 👈 make optional
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
// In your existing types.tsx
export type PanelType = "explorer" | "search" | "extensions" | "postman";
// components/explorer/types.tsx

// components/explorer/types.tsx
export interface EditorTab {
  id: string;
  name: string;
  path: string;
  content?: string;
  saved?: boolean;
  type?: "file" | "postman"; // Add this
}

export interface PostmanTab extends EditorTab {
  type: "postman";
  protocol: "HTTP" | "MQTT" | "MQTT-SN" | "COAP";
  method?: string;
  url?: string;
  // Add other postman-specific properties as needed
}
