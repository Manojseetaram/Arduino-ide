export type ExplorerNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  children?: ExplorerNode[];
  parentId?: string | null;
};

export interface SidebarProps {
  projects: string[];
  currentProject: string | null;
  onSelectProject: (p: string) => void;
  theme: "light" | "dark";
  files?: ExplorerNode[];
  setFiles?: React.Dispatch<React.SetStateAction<ExplorerNode[]>>;
}

export interface SearchResult {
  node: ExplorerNode;
  matches: { path: string; score: number };
}