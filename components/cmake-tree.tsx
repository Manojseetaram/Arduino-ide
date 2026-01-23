// components/cmake-tree.tsx
"use client";

import { ExplorerNode } from "@/components/explorer/types";
import { useState } from "react";
import { ChevronRight, ChevronDown, FileText, Folder } from "lucide-react";

interface CmakeTreeProps {
  nodes: ExplorerNode[];
  onFileSelect: (file: ExplorerNode) => void;
  theme: "light" | "dark";
}

export function CmakeTree({ nodes, onFileSelect, theme }: CmakeTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const renderNode = (node: ExplorerNode, depth = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    
    return (
      <div key={node.id}>
        <div 
          className={`flex items-center py-1 px-2 hover:bg-gray-700 cursor-pointer ${depth > 0 ? `ml-${depth * 4}` : ''}`}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.id);
            } else {
              onFileSelect(node);
            }
          }}
          style={{ marginLeft: `${depth * 16}px` }}
        >
          {node.type === 'folder' ? (
            <>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 mr-1" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-1" />
              )}
              <Folder className="w-4 h-4 mr-2 text-blue-400" />
            </>
          ) : (
            <>
              <div className="w-5 mr-2" /> {/* Spacer for alignment */}
              {node.isCmake ? (
                <FileText className="w-4 h-4 mr-2 text-green-400" />
              ) : (
                <FileText className="w-4 h-4 mr-2 text-gray-400" />
              )}
            </>
          )}
          
          <span className={`text-sm truncate ${node.isCmake ? 'text-green-300 font-medium' : ''}`}>
            {node.name}
            {node.isCmake && ' 📋'}
          </span>
        </div>
        
        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-2 border-b border-gray-700">
        <h3 className="font-semibold text-gray-300">CMake Files</h3>
        <p className="text-xs text-gray-500">ESP-IDF: {nodes[0]?.path?.split('/').slice(-3, -1).join('/')}</p>
      </div>
      <div className="p-2">
        {nodes.map(node => renderNode(node))}
      </div>
    </div>
  );
}