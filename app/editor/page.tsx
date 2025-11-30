"use client";

import { useState, useEffect, useRef } from "react";
import { FileExplorer } from "@/components/file-explorer";
import CodeEditor from "@/components/code-editor";
import { invoke } from "@tauri-apps/api/tauri";
import { ProjectDropdown } from "@/components/editor/dropdown";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowRightIcon, Terminal as TerminalIcon } from "lucide-react";
import TerminalWrapper from "@/components/Terminal/TerminalWrapper";
import ExtensionsDialog from "@/components/lybraris/lybraris";
import { CreateItemDialog } from "@/components/create-item-dialog";

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
  folder_name: string;
}

export default function VSCodeEditor() {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [openTabs, setOpenTabs] = useState<FileNode[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FileNode | null>(null);
  const [folderName, setFolderName] = useState<string>("");
  const [recentProjects, setRecentProjects] = useState<string[]>([]);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const isResizing = useRef(false);


  useEffect(() => {
    const loadFolder = async () => {
      try {
        const files: FileNode[] = await invoke("read_folder", { path: "/home/shettyanikethan/Desktop/test" });
        if (files.length > 0) setFolderName(files[0].folder_name);
        setFileTree(files);
      } catch (error) {
        console.error("Failed to read folder:", error);
      }
    };
    loadFolder();
  }, []);

  // Load recent projects
  useEffect(() => {
    const loadRecentProjects = async () => {
      try {
        const files: FileNode[] = await invoke("read_folder", { path: "/Users/manojseetaramgowda/Desktop" });
        const folders = files.filter(f => f.type === "folder").map(f => f.id);
        setRecentProjects(folders);
      } catch (error) {
        console.error("Failed to load recent projects:", error);
      }
    };
    loadRecentProjects();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
const handleCompileAndFlash = () => {
  invoke("compile_and_flash");
  window.dispatchEvent(new CustomEvent("terminal-open"));
};


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing.current) {
        setTerminalHeight(Math.max(100, window.innerHeight - e.clientY));
      }
    };
    const handleMouseUp = () => { isResizing.current = false; };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // File handling
  const openFile = (file: FileNode) => {
    setActiveFile(file);
    if (!openTabs.find(tab => tab.id === file.id)) setOpenTabs(prev => [...prev, file]);
  };

  const closeTab = (fileId: string) => {
    setOpenTabs(prev => prev.filter(tab => tab.id !== fileId));
    if (activeFile?.id === fileId) {
      const remainingTabs = openTabs.filter(tab => tab.id !== fileId);
      setActiveFile(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1] : null);
    }
  };

  const updateFileContent = (fileId: string, content: string) => {
    const updateNode = (nodes: FileNode[]): FileNode[] =>
      nodes.map(node => {
        if (node.id === fileId) return { ...node, content };
        if (node.children) return { ...node, children: updateNode(node.children) };
        return node;
      });
    setFileTree(prev => updateNode(prev));
    if (activeFile?.id === fileId) setActiveFile({ ...activeFile, content });
    setOpenTabs(prev => prev.map(tab => (tab.id === fileId ? { ...tab, content } : tab)));
  };

 
  const projectsToShow = showAllProjects ? recentProjects : recentProjects.slice(0, 3);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
   
      <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4 shadow-sm shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
            </svg>
          </div>
          <h1 className="text-lg font-semibold">Vithsutra Editor</h1>
        </div>

        <div className="flex items-center space-x-2">
          <ProjectDropdown
            onProjectOpen={async (path) => {
              const files: FileNode[] = await invoke("read_folder", { path });
              setFileTree(files);
              setFolderName(files[0]?.folder_name || "");
            }}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <ExtensionsDialog
                onInstall={(newFiles) => {
                  const extensionNode: FileNode = {
                    id: Date.now().toString(),
                    name: "rust-analyzer",
                    type: "folder",
                    children: [{ id: (Date.now() + 1).toString(), name: "README.md", type: "file", content: "# Rust Analyzer", folder_name: folderName }],
                    folder_name: folderName,
                    isOpen: true,
                  };
                  setFileTree(prev => [...prev, extensionNode]);
                  setSelectedFolder(extensionNode);
                }}
              />
            </TooltipTrigger>
            <TooltipContent><p>Extensions</p></TooltipContent>
          </Tooltip>

         <Tooltip>
  <TooltipTrigger>
    <Button
      onClick={handleCompileAndFlash}
      variant="outline"
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
              <Button className="ml-4" variant="outline" size="icon" onClick={() => setIsTerminalOpen(prev => !prev)}>
                <TerminalIcon className="w-5 h-5 text-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Toggle Terminal</p></TooltipContent>
          </Tooltip>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
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
              {openTabs.map(tab => (
                <div key={tab.id} className={`flex items-center px-4 py-2 border-r border-border cursor-pointer hover:bg-accent/50 min-w-0 transition-colors ${activeFile?.id === tab.id ? "bg-background border-b-2 border-b-primary" : ""}`} onClick={() => setActiveFile(tab)}>
                  <span className="text-sm truncate mr-2">{tab.name}</span>
                  <button className="hover:bg-destructive hover:text-destructive-foreground rounded p-1" onClick={e => { e.stopPropagation(); closeTab(tab.id); }}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 min-h-0" style={{ height: `calc(100% - ${isTerminalOpen ? terminalHeight : 0}px)` }}>
              {activeFile ? (
                <CodeEditor key={activeFile.id} file={activeFile} onChange={(content: any) => updateFileContent(activeFile.id, content)} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-background/50 gap-4">
                  <div className="text-center max-w-md">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-muted-foreground/50" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Welcome to VS Code Editor</h2>
                    <p className="text-sm mb-6 text-muted-foreground/80">
                      Select a file from the explorer to start editing, or create a new project to begin coding.
                    </p>

                    {/* Buttons */}
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="p-2 bg-accent/30 text-black rounded hover:bg-accent/50"
                      >
                        Create New Project
                      </Button>

                      {recentProjects.length > 0 && (
                        <>
                          <h3 className="mt-2 text-sm font-semibold">Recent Projects</h3>
                          {projectsToShow.map(path => (
                            <Button key={path} onClick={async () => {
                              const files: FileNode[] = await invoke("read_folder", { path });
                              if (files.length > 0) setFolderName(files[0].folder_name);
                              setFileTree(files);
                            }} className=" p-2 bg-accent/30 rounded hover:bg-accent/50 text-left text-black">
                              {path.split("/").pop()}
                            </Button>
                          ))}

                          {recentProjects.length > 3 && (
                            <Button onClick={() => setShowAllProjects(prev => !prev)} className="p-2 bg-gray rounded hover:bg-accent/50 text-left text-black mt-1">
                              {showAllProjects ? "Show Less" : "More"}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isTerminalOpen && (
              <div className="border-t border-border bg-black text-white flex flex-col" style={{ height: `${terminalHeight}px` }}>
                <div className="h-1 cursor-row-resize bg-white" onMouseDown={() => (isResizing.current = true)} />
                <div className="flex-1 overflow-hidden">
                  <TerminalWrapper onClose={() => setIsTerminalOpen(false)} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    <CreateItemDialog
  isOpen={isCreateDialogOpen}
  type="folder"
  onClose={() => setIsCreateDialogOpen(false)}
  onConfirm={async (folderName: string) => {
    try {
      const fullPath = `/Users/manojseetaramgowda/Desktop/${folderName}`;

      // Call Tauri to create folder
      const result: string = await invoke("create_folder", { path: fullPath });

      alert(result); // Shows "Folder created: ..."

      // Add folder to recent projects
      setRecentProjects(prev => [fullPath, ...prev]);

      
      setFileTree(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          name: folderName,
          type: "folder",
          folder_name: folderName,
          children: [],
          isOpen: false,
        },
      ]);

    } catch (err) {
      console.error(err);
      alert("Failed to create folder");
    }
  }}
/>


    </div>
  );
}
