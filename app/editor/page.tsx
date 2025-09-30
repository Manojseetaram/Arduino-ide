
"use client";

import { useState, useEffect, useRef } from "react";
import { FileExplorer } from "@/components/file-explorer";
import CodeEditor from "@/components/code-editor";
import { invoke } from "@tauri-apps/api/tauri";
import { ProjectDropdown } from "@/components/editor/dropdown";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowRightIcon, Terminal as TerminalIcon } from "lucide-react";
import TerminalWrapper from "@/components/Terminal/TerminalWrapper";
import ExtensionsDialog from "@/components/lybraris/lybraris";

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
  folder_name:string;
}

export default function VSCodeEditor() {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [openTabs, setOpenTabs] = useState<FileNode[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FileNode | null>(null);


  
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const isResizing = useRef(false);

  const [folderName, setFolderName] = useState<string>("");


  useEffect(() => {
    const loadFolder = async () => {
      try { 
        const files: FileNode[] = await invoke("read_folder", {
          path: "/home/shettyanikethan/Desktop/test",
        })
        if (files.length > 0) {
          setFolderName(files[0].folder_name) 
        }
        setFileTree(files);
      } catch (error) {
        console.error("Failed to read folder:", error);
      }
    };
    loadFolder();
  }, []);

  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
     
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault(); 
        setIsTerminalOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);


  // Handle resize drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing.current) {
        setTerminalHeight(Math.max(100, window.innerHeight - e.clientY));
      }
    };
    const handleMouseUp = () => {
      isResizing.current = false;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const openFile = (file: FileNode) => {
    setActiveFile(file);
    if (!openTabs.find((tab) => tab.id === file.id)) {
      setOpenTabs((prev) => [...prev, file]);
    }
  };

  const closeTab = (fileId: string) => {
    setOpenTabs((prev) => prev.filter((tab) => tab.id !== fileId));
    if (activeFile?.id === fileId) {
      const remainingTabs = openTabs.filter((tab) => tab.id !== fileId);
      setActiveFile(
        remainingTabs.length > 0
          ? remainingTabs[remainingTabs.length - 1]
          : null
      );
    }
  };

  const updateFileContent = (fileId: string, content: string) => {
    const updateNode = (nodes: FileNode[]): FileNode[] =>
      nodes.map((node) => {
        if (node.id === fileId) return { ...node, content };
        if (node.children) return { ...node, children: updateNode(node.children) };
        return node;
      });

    setFileTree((prev) => updateNode(prev));

    if (activeFile?.id === fileId) {
      setActiveFile({ ...activeFile, content });
    }

    setOpenTabs((prev) =>
      prev.map((tab) => (tab.id === fileId ? { ...tab, content } : tab))
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
   <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4 shadow-sm shrink-0">
  <div className="flex items-center space-x-2">
    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
      <svg
        className="w-4 h-4 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z"
          clipRule="evenodd"
        />
      </svg>
    </div>
    <h1 className="text-lg font-semibold">Vithsutra Editor</h1>
  </div>

  <div className="flex items-center space-x-2">
    {/* First Project Dropdown */}
   

    {/* This was broken Button – removed the dangling part */}
    {/* Second Project Dropdown */}
    <div className="">
      <ProjectDropdown
        onProjectOpen={async (path) => {
          try {
            const files: FileNode[] = await invoke("read_folder", { path });
            setFileTree(files);
            setFolderName(files[0].folder_name);
          } catch (error) {
            console.error("Failed to read new project:", error);
          }
        }}
      />
<Tooltip>
  <TooltipTrigger asChild>
   <ExtensionsDialog
  onInstall={(newFiles) => {
    // Create a FileNode for the installed extension
    const extensionNode: FileNode = {
      id: Date.now().toString(),
      name: "rust-analyzer", // extension name
      type: "folder",         // folder because it contains files
      children: [
        {
          id: (Date.now() + 1).toString(),
          name: "README.md",
          type: "file",
          content: "# Rust Analyzer",
          folder_name: folderName,
        },
        // Add more files if needed
      ],
      folder_name: folderName,
      isOpen: true, // open by default
    };

    // Add the extension node to the fileTree
    setFileTree((prev) => [...prev, extensionNode]);

    // Optionally select the new extension folder
    setSelectedFolder(extensionNode);
  }}
/>


  </TooltipTrigger>
  <TooltipContent>
    <p>Extensions</p>
  </TooltipContent>
</Tooltip>

      
      <Tooltip>
        <TooltipTrigger>
          <Button
            variant={"outline"}
            className="ml-4 rounded-2xl bg-primary w-[60px] text-white font-semibold text-md leading-none hover:bg-primary/90 hover:text-white"
          >
            <ArrowRightIcon className="w-5 h-5 font-bold" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Compile and Flash</p>
        </TooltipContent>
      </Tooltip>

     
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
          className="ml-4"
            variant="outline"
            size="icon"
            onClick={() => setIsTerminalOpen((prev) => !prev)}
          >
            <TerminalIcon className="w-5 h-5 text-primary" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle Terminal</p>
        </TooltipContent>
      </Tooltip>
    </div>
  </div>
</header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-card border-r border-border flex flex-col shadow-sm shrink-0">
          <FileExplorer
            fileTree={fileTree}
            setFileTree={setFileTree}
            onFileSelect={openFile}
            selectedFolder={selectedFolder}
            setSelectedFolder={setSelectedFolder}
            folder_name={folderName}
          />
        </div>

 
        <div className="flex-1 flex flex-col min-w-0">
         
          {openTabs.length > 0 && (
            <div className="flex bg-card border-b border-border overflow-x-auto shrink-0">
              {openTabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`flex items-center px-4 py-2 border-r border-border cursor-pointer hover:bg-accent/50 min-w-0 transition-colors ${
                    activeFile?.id === tab.id
                      ? "bg-background border-b-2 border-b-primary"
                      : ""
                  }`}
                  onClick={() => setActiveFile(tab)}
                >
                  <span className="text-sm truncate mr-2">{tab.name}</span>
                  <button
                    className="hover:bg-destructive hover:text-destructive-foreground rounded p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Editor + Resizable Terminal */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Editor */}
            <div
              className="flex-1 min-h-0"
              style={{ height: `calc(100% - ${isTerminalOpen ? terminalHeight : 0}px)` }}
            >
              {activeFile ? (
                <CodeEditor
                  key={activeFile.id}
                  file={activeFile}
                  //@ts-expect-error
                  onChange={(content) =>
                    updateFileContent(activeFile.id, content)
                  }
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground bg-background/50">
                  {/* ✅ Your Welcome UI stays here */}
                  <div className="text-center max-w-md">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-muted-foreground/50"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">
                      Welcome to VS Code Editor
                    </h2>
                    <p className="text-sm mb-6 text-muted-foreground/80">
                      Select a file from the explorer to start editing, or create
                      a new file to begin coding.
                    </p>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex items-center justify-center space-x-2 p-2 bg-accent/30 rounded">
                        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                          Ctrl+N
                        </kbd>
                        <span>New File</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 p-2 bg-accent/30 rounded">
                        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                          Ctrl+Shift+N
                        </kbd>
                        <span>New Folder</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 p-2 bg-accent/30 rounded">
                        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                          Ctrl+S
                        </kbd>
                        <span>Save File</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

           
             {isTerminalOpen && (
        <div
          className="border-t border-border bg-black text-white flex flex-col"
          style={{ height: `${terminalHeight}px` }}
        >
          {/* Resize handle */}
          <div
            className="h-1 cursor-row-resize bg-white"
            onMouseDown={() => (isResizing.current = true)}
          />

         
          <div className="flex-1 overflow-hidden">
            <TerminalWrapper onClose={() => setIsTerminalOpen(false)} />
          </div>
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  );
}