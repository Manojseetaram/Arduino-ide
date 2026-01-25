// components/explorer/utils.ts
import {
  IconBrandCpp,
  IconBrandCss3,
  IconFileTypeTsx,
  IconFileTypeJsx,
  IconFileTypeJs,
  IconFileTypeHtml,
  IconFileCode,
  IconFileTypeTs,
  IconFile,
  IconFileText,
  IconSettings,
  IconBinary,
  IconFileTypeTxt,
  IconFileTypeXml,
  IconFileTypeCsv,
  IconFileTypeDoc,
  IconFileTypePdf,
  IconDeviceCctv,
} from "@tabler/icons-react";
import React from "react";
import { ExplorerNode, SearchResult } from "./types";

/* ========= FILE ICONS FOR C/C++ & ESP-IDF ========= */
const fileIcons: Record<string, React.ReactNode> = {
  // C/C++ Files
  '.c': React.createElement(IconBrandCpp, { size: 16 }),
  '.cpp': React.createElement(IconBrandCpp, { size: 16 }),
  '.cc': React.createElement(IconBrandCpp, { size: 16 }),
  '.cxx': React.createElement(IconBrandCpp, { size: 16 }),
  '.h': React.createElement(IconBrandCpp, { size: 16 }),
  '.hpp': React.createElement(IconBrandCpp, { size: 16 }),
  '.hxx': React.createElement(IconBrandCpp, { size: 16 }),
  
  // Arduino Files
  '.ino': React.createElement(IconDeviceCctv, { size: 16 }),
  '.pde': React.createElement(IconDeviceCctv, { size: 16 }),
  
  // ESP-IDF Specific
  '.cmake': React.createElement(IconSettings, { size: 16 }),
  '.mk': React.createElement(IconSettings, { size: 16 }),
  '.make': React.createElement(IconSettings, { size: 16 }),
  '.ld': React.createElement(IconBinary, { size: 16 }),
  '.s': React.createElement(IconBinary, { size: 16 }),
  '.asm': React.createElement(IconBinary, { size: 16 }),
  '.inc': React.createElement(IconBinary, { size: 16 }),
  
  // Configuration files
  '.json': React.createElement(IconFileCode, { size: 16 }),
  '.yaml': React.createElement(IconFileText, { size: 16 }),
  '.yml': React.createElement(IconFileText, { size: 16 }),
  '.toml': React.createElement(IconFileText, { size: 16 }),
  '.ini': React.createElement(IconSettings, { size: 16 }),
  '.cfg': React.createElement(IconSettings, { size: 16 }),
  '.conf': React.createElement(IconSettings, { size: 16 }),
  
  // Text files
  '.txt': React.createElement(IconFileTypeTxt, { size: 16 }),
  '.md': React.createElement(IconFileText, { size: 16 }),
  '.rst': React.createElement(IconFileText, { size: 16 }),
  
  // Other files
  '.css': React.createElement(IconBrandCss3, { size: 16 }),
  '.tsx': React.createElement(IconFileTypeTsx, { size: 16 }),
  '.jsx': React.createElement(IconFileTypeJsx, { size: 16 }),
  '.js': React.createElement(IconFileTypeJs, { size: 16 }),
  '.html': React.createElement(IconFileTypeHtml, { size: 16 }),
  '.ts': React.createElement(IconFileTypeTs, { size: 16 }),
  '.xml': React.createElement(IconFileTypeXml, { size: 16 }),
  '.csv': React.createElement(IconFileTypeCsv, { size: 16 }),
  '.doc': React.createElement(IconFileTypeDoc, { size: 16 }),
  '.pdf': React.createElement(IconFileTypePdf, { size: 16 }),
};

// Special files (no extension or special names)
const specialFileIcons: Record<string, React.ReactNode> = {
  'Makefile': React.createElement(IconSettings, { size: 16 }),
  'CMakeLists.txt': React.createElement(IconSettings, { size: 16 }),
  'README': React.createElement(IconFileText, { size: 16 }),
  'LICENSE': React.createElement(IconFileText, { size: 16 }),
  '.gitignore': React.createElement(IconSettings, { size: 16 }),
  '.gitmodules': React.createElement(IconSettings, { size: 16 }),
  'platformio.ini': React.createElement(IconSettings, { size: 16 }),
  'component.mk': React.createElement(IconSettings, { size: 16 }),
  'sdkconfig': React.createElement(IconSettings, { size: 16 }),
};

export function FileIcon({ name }: { name: string }) {
  // Check for special files first
  if (specialFileIcons[name]) {
    return specialFileIcons[name];
  }
  
  // Check for extension
  const extension = Object.keys(fileIcons).find(ext => name.toLowerCase().endsWith(ext));
  if (extension && fileIcons[extension]) {
    return fileIcons[extension];
  }
  
  // Default icon
  return React.createElement(IconFile, { size: 16 });
}

export function getFileExtension(name: string): string {
  const lastDot = name.lastIndexOf('.');
  return lastDot === -1 ? '' : name.substring(lastDot).toLowerCase();
}
// components/explorer/utils.ts - Update the isEspIdfFile function

/* ========= ESP-IDF SPECIFIC UTILITIES ========= */
export function isEspIdfFile(name: string): boolean {
  const espIdfExtensions = ['.cmake', '.mk', '.make', '.ld', '.s', '.asm', '.inc'];
  const espIdfSpecialFiles = [
    'CMakeLists.txt', 
    'Makefile', 
    'component.mk',
    'sdkconfig',
    'platformio.ini',
    '.gitignore',
    '.gitmodules',
    'Kconfig',
    'Kconfig.projbuild'
  ];
  
  const ext = getFileExtension(name);
  return espIdfExtensions.includes(ext) || espIdfSpecialFiles.includes(name);
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

// In utils.ts, update the insertNode function:

/* ========= NODE OPERATIONS ========= */
export function insertNode(
  nodes: ExplorerNode[],
  folderId: string | null,
  newNode: ExplorerNode
): ExplorerNode[] {
  if (!folderId) {
    // Insert at root level
    return [...nodes, newNode];
  }

  const insertRecursive = (nodeList: ExplorerNode[]): ExplorerNode[] => {
    return nodeList.map(node => {
      if (node.id === folderId && node.type === "folder") {
        // Found the target folder
        return {
          ...node,
          children: [...(node.children || []), newNode]
        };
      }
      
      if (node.type === "folder" && node.children) {
        // Search in children
        return {
          ...node,
          children: insertRecursive(node.children)
        };
      }
      
      return node;
    });
  };

  return insertRecursive(nodes);
}
// Add debug function to utils.ts
export function debugFileTree(nodes: ExplorerNode[], depth: number = 0) {
  nodes.forEach(node => {
    const indent = '  '.repeat(depth);
    console.log(`${indent}${node.type === 'folder' ? '📁' : '📄'} ${node.name} (id: ${node.id})`);
    if (node.type === 'folder' && node.children) {
      debugFileTree(node.children, depth + 1);
    }
  });
}

export function sortExplorerNodes(nodes: ExplorerNode[]): ExplorerNode[] {
  return nodes.sort((a, b) => {
    // Folders first
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;
    
    // Then by name
    return a.name.localeCompare(b.name);
  });
}

/* ========= FILTER ESP-IDF FILES FOR TREE VIEW ========= */
export function filterEspIdfTree(nodes: ExplorerNode[]): ExplorerNode[] {
  return nodes
    .filter(node => {
      if (node.type === "folder") {
        return true;
      }
      // Hide ESP-IDF configuration files from tree view
      return !isEspIdfFile(node.name);
    })
    .map(node => {
      if (node.type === "folder" && node.children) {
        return {
          ...node,
          children: filterEspIdfTree(node.children)
        };
      }
      return node;
    });
}