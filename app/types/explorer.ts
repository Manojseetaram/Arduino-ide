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
