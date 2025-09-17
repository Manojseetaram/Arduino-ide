"use client";

import { useState, useEffect } from "react";
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
import { ArrowRightIcon } from "lucide-react";

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            if (activeFile) {
              console.log("[v0] Saving file:", activeFile.name);
              // In a real app, this would save to backend/localStorage
            }
            break;
          case "n":
            e.preventDefault();
            if (e.shiftKey) {
              // Ctrl+Shift+N - New Folder
              console.log("[v0] Creating new folder");
            } else {
              // Ctrl+N - New File
              console.log("[v0] Creating new file");
            }
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFile]);

  const openFile = (file: FileNode) => {
    console.log(
      "[v0] Opening file:",
      file.name,
      "with content length:",
      file.content?.length || 0
    );
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
    console.log(
      "[v0] Updating file content for:",
      fileId,
      "length:",
      content.length
    );

    const updateNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === fileId) {
          return { ...node, content };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };

    setFileTree((prev) => updateNode(prev));

    // Update active file if it's the one being edited
    if (activeFile?.id === fileId) {
      setActiveFile({ ...activeFile, content });
    }

    // Update tab content
    setOpenTabs((prev) =>
      prev.map((tab) => (tab.id === fileId ? { ...tab, content } : tab))
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4 shadow-sm shrink-0">
        <div className="flex items-center space-x-4">
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
        </div>
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

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          {openTabs.length > 0 && (
            <div className="flex bg-card border-b border-border overflow-x-auto shrink-0">
              {openTabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`flex items-center px-4 py-2 border-r border-border cursor-pointer hover:bg-accent/50 min-w-0 transition-colors duration-150 ${
                    activeFile?.id === tab.id
                      ? "bg-background border-b-2 border-b-primary"
                      : ""
                  }`}
                  onClick={() => setActiveFile(tab)}
                >
                  <span className="text-sm truncate mr-2">{tab.name}</span>
                  <button
                    className="hover:bg-destructive hover:text-destructive-foreground rounded p-1 transition-colors duration-150"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 min-h-0">
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
        </div>
      </div>
    </div>
  );
}
