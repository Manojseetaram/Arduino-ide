"use client";

import { IconDeviceFloppy, IconFolderPlus, IconFilePlus, IconTrash } from "@tabler/icons-react";

interface ToolbarProps {
  theme: "light" | "dark";
  hasUnsavedChanges: boolean;
  onSave?: () => void;
  onNewFile?: () => void;
  onNewFolder?: () => void;
  onDelete?: () => void;
}

export function Toolbar({ 
  theme, 
  hasUnsavedChanges, 
  onSave, 
  onNewFile, 
  onNewFolder,
  onDelete 
}: ToolbarProps) {
  const dark = theme === "dark";
  
  return (
    <div className={`px-4 py-2 border-b ${dark ? 'border-gray-700' : 'border-gray-300'}`}>
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={!hasUnsavedChanges}
          className={`flex items-center gap-2 px-3 py-1 rounded ${
            hasUnsavedChanges
              ? dark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              : dark
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <IconDeviceFloppy size={16} />
          <span className="text-sm">Save</span>
        </button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
        
        <button
          onClick={onNewFile}
          className={`flex items-center gap-2 px-3 py-1 rounded ${
            dark 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          <IconFilePlus size={16} />
          <span className="text-sm">New File</span>
        </button>
        
        <button
          onClick={onNewFolder}
          className={`flex items-center gap-2 px-3 py-1 rounded ${
            dark 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          <IconFolderPlus size={16} />
          <span className="text-sm">New Folder</span>
        </button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>
        
        <button
          onClick={onDelete}
          className={`flex items-center gap-2 px-3 py-1 rounded ${
            dark 
              ? 'bg-red-900/30 hover:bg-red-800/40 text-red-300' 
              : 'bg-red-100 hover:bg-red-200 text-red-700'
          }`}
        >
          <IconTrash size={16} />
          <span className="text-sm">Delete</span>
        </button>
      </div>
    </div>
  );
}