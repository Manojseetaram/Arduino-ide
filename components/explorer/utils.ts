import {
  IconBrandRust,
  IconFileTypeCss,
  IconFileTypeTsx,
  IconFileTypeJsx,
  IconFileTypeJs,
  IconFileTypeHtml,
  IconFileTypeJson,
  IconFileTypeTs,
  IconFile,
} from "@tabler/icons-react";
import React from "react";
import { ExplorerNode, SearchResult } from "./types";

/* ========= FILE ICONS ========= */
const fileIcons: Record<string, React.ReactNode> = {
  '.rs': React.createElement(IconBrandRust, { size: 16 }),
  '.css': React.createElement(IconFileTypeCss, { size: 16 }),
  '.tsx': React.createElement(IconFileTypeTsx, { size: 16 }),
  '.jsx': React.createElement(IconFileTypeJsx, { size: 16 }),
  '.js': React.createElement(IconFileTypeJs, { size: 16 }),
  '.html': React.createElement(IconFileTypeHtml, { size: 16 }),
  '.json': React.createElement(IconFileTypeJson, { size: 16 }),
  '.ts': React.createElement(IconFileTypeTs, { size: 16 }),
};

export function FileIcon({ name }: { name: string }) {
  const extension = Object.keys(fileIcons).find(ext => name.endsWith(ext));
  if (extension && fileIcons[extension]) {
    return fileIcons[extension];
  }
  return React.createElement(IconFile, { size: 16 });
}

export function getFileExtension(name: string): string {
  const lastDot = name.lastIndexOf('.');
  return lastDot === -1 ? '' : name.substring(lastDot);
}

/* ========= SEARCH UTILITIES ========= */
export function searchFiles(
  nodes: ExplorerNode[],
  query: string,
  parentPath: string = ""
): SearchResult[] {
  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();

  nodes.forEach(node => {
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    
    if (node.name.toLowerCase().includes(lowerQuery)) {
      const score = node.name.toLowerCase().indexOf(lowerQuery);
      results.push({
        node: { ...node, path: currentPath },
        matches: { path: currentPath, score }
      });
    }

    if (node.type === "folder" && node.children) {
      results.push(...searchFiles(node.children, query, currentPath));
    }
  });

  return results.sort((a, b) => a.matches.score - b.matches.score);
}

/* ========= NODE OPERATIONS ========= */
export function insertNode(
  nodes: ExplorerNode[],
  folderId: string | null,
  newNode: ExplorerNode
): ExplorerNode[] {
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
}