"use client";

import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { IconX, IconTerminal2, IconPlayerPlay } from "@tabler/icons-react";
import { EditorTab } from "./explorer/types";
import TerminalWrapper from "./terminal-wrapper";
import { invoke } from "@tauri-apps/api/tauri";

interface MonacoEditorProps {
  projectName: string;
  theme: "light" | "dark";
  tabs: EditorTab[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onContentChange?: (tabId: string, content: string) => void;
  showTerminal?: boolean;
  onToggleTerminal?: () => void;
}

export function MonacoEditor({
  projectName,
  theme,
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onContentChange,
  showTerminal: externalShowTerminal,
  onToggleTerminal,
}: MonacoEditorProps) {
  const [editorContent, setEditorContent] = useState<Record<string, string>>({});
  const [internalShowTerminal, setInternalShowTerminal] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  
  // 🚀 Use a ref to force immediate updates
  const terminalShouldShowRef = useRef(false);

  const showTerminal =
    externalShowTerminal !== undefined
      ? externalShowTerminal
      : internalShowTerminal;

  const toggleTerminal =
    onToggleTerminal ||
    (() => setInternalShowTerminal((prev) => !prev));

  // 🚀 FORCE TERMINAL TO SHOW - BYPASS REACT BATCHING
  const forceShowTerminal = () => {
    if (!showTerminal) {
      // Update ref immediately
      terminalShouldShowRef.current = true;
      
      // Force React to update immediately (not batched)
      setTimeout(() => {
        if (onToggleTerminal) {
          onToggleTerminal();
        } else {
          setInternalShowTerminal(true);
        }
      }, 0);
      
      return true;
    }
    return false;
  };

  // 🚀 ULTRA-INSTANT TERMINAL OPENING WITH RUST
  const openTerminalWithRust = async () => {
    if (!showTerminal) {
      try {
        // 🚀 Call Rust backend to open terminal INSTANTLY
        await invoke("open_terminal_instantly");
        
        // Update UI state
        if (onToggleTerminal) {
          onToggleTerminal();
        } else {
          setInternalShowTerminal(true);
        }
        
        return true;
      } catch (error) {
        console.error("Failed to open terminal via Rust:", error);
        // Fallback to local method
        return forceShowTerminal();
      }
    }
    return false;
  };

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  const getLanguageFromFilename = (filename: string): string => {
    if (filename.endsWith(".js")) return "javascript";
    if (filename.endsWith(".ts")) return "typescript";
    if (filename.endsWith(".jsx")) return "javascript";
    if (filename.endsWith(".tsx")) return "typescript";
    if (filename.endsWith(".html")) return "html";
    if (filename.endsWith(".css")) return "css";
    if (filename.endsWith(".json")) return "json";
    if (filename.endsWith(".rs")) return "rust";
    if (filename.endsWith(".cpp")) return "cpp";
    if (filename.endsWith(".c")) return "c";
    if (filename.endsWith(".h")) return "c";
    if (filename.endsWith(".ino")) return "cpp";
    return "plaintext";
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeTab && value !== undefined) {
      setEditorContent((prev) => ({
        ...prev,
        [activeTab.id]: value,
      }));
      onContentChange?.(activeTab.id, value);
    }
  };

  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    onTabClose(tabId);
  };

  /* ============================
     🚀 INSTANT COMPILE WITH RUST BACKEND
     ============================ */
  const handleCompile = async () => {
    if (!projectName || isBuilding) return;

    try {
      // 🚀 STEP 1: OPEN TERMINAL VIA RUST (INSTANT)
      const terminalOpened = await openTerminalWithRust();
      
      if (!terminalOpened && !showTerminal) {
        // Emergency fallback
        forceShowTerminal();
      }
      
      // 🚀 STEP 2: Show building state immediately
      setIsBuilding(true);
      
      // 🚀 STEP 3: Send immediate feedback via Rust events
      window.dispatchEvent(new CustomEvent("terminal:info", {
        detail: ` Building: ${projectName}`
      }));
      
      // STEP 4: Resolve project path
      const projectPath: string = await invoke("get_project_path", { name: projectName });

      // STEP 5: Show project info
      window.dispatchEvent(new CustomEvent("terminal:info", {
        detail: ` Path: ${projectPath}`
      }));
      
      window.dispatchEvent(new CustomEvent("terminal:info", {
        detail: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      }));

      // STEP 6: Trigger build - ESP-IDF output streams via Tauri
      invoke("build_project", { projectPath });

      // STEP 7: Build completed
      window.dispatchEvent(new CustomEvent("terminal:success", {
        detail: "Build Completed"
      }));

    } catch (err: any) {
      console.error("Build failed:", err);
      
      window.dispatchEvent(new CustomEvent("terminal:error", {
        detail: ` Error: ${err.message || err}`
      }));
      
    } finally {
      setIsBuilding(false);
      terminalShouldShowRef.current = false;
    }
  };

  // Listen for Rust "force-open" event
  useEffect(() => {
    const handleForceOpen = () => {
      if (!showTerminal) {
        if (onToggleTerminal) {
          onToggleTerminal();
        } else {
          setInternalShowTerminal(true);
        }
      }
    };

    // Listen for Rust backend terminal open event
    window.addEventListener("terminal:force-open", handleForceOpen);
    
    return () => {
      window.removeEventListener("terminal:force-open", handleForceOpen);
    };
  }, [showTerminal, onToggleTerminal]);

  /* ============================
     INIT CONTENT
     ============================ */
  useEffect(() => {
    tabs.forEach((tab) => {
      if (!editorContent[tab.id] && tab.content !== undefined) {
        setEditorContent((prev) => ({
          ...prev,
          [tab.id]: tab.content || `// ${tab.name}\n\n`,
        }));
      }
    });
  }, [tabs]);

  const getDefaultContent = (filename: string): string => {
    if (filename.endsWith('.cpp') || filename.endsWith('.ino')) {
      return `// ${filename}\n\nvoid setup() {\n    // Initialize your code here\n}\n\nvoid loop() {\n    // Main program loop\n}`;
    }
    return `// ${filename}\n\n`;
  };

  const editorHeight = showTerminal ? "70%" : "100%";
  const terminalHeight = "30%";

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
        {/* Toolbar with buttons */}
        <div className="px-4 py-2 flex justify-between items-center border-b border-gray-300 dark:border-gray-700">
          
          
          <div className="flex items-center gap-3">
            {/* Terminal toggle button */}
          
            {/* 🚀 ULTRA INSTANT Compile button */}
            <button
              onClick={handleCompile}
              disabled={isBuilding}
              className={`px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 active:scale-[0.98] transition-all ${
                isBuilding
                  ? "bg-yellow-600 text-white cursor-wait"
                  : "bg-green-600 hover:bg-green-500 text-white"
              }`}
              style={{
                transform: isBuilding ? 'none' : 'translateZ(0)',
                backfaceVisibility: 'hidden'
              }}
            >
              {isBuilding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Building...</span>
                </>
              ) : (
                <>
                  <IconPlayerPlay size={14} />
                  <span>Compile</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`
                flex items-center gap-2 px-4 py-2 border-r border-gray-300 dark:border-gray-700
                min-w-[160px] max-w-[200px] cursor-pointer whitespace-nowrap
                ${activeTabId === tab.id 
                  ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                }
              `}
              onClick={() => onTabSelect(tab.id)}
            >
              <span className="truncate flex-1">{tab.name}</span>
              {!tab.saved && <span className="w-2 h-2 rounded-full bg-yellow-500"></span>}
              <button
                onClick={(e) => handleTabClose(e, tab.id)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                <IconX size={14} />
              </button>
            </div>
          ))}
          
          {tabs.length === 0 && (
            <div className="px-4 py-2 text-gray-500 dark:text-gray-400 italic">
              No files open
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Editor */}
        <div style={{ height: editorHeight, minHeight: '0' }}>
          {activeTab ? (
            <Editor
              height="100%"
              language={getLanguageFromFilename(activeTab.name)}
              value={editorContent[activeTab.id] || activeTab.content || getDefaultContent(activeTab.name)}
              theme={theme === "dark" ? "vs-dark" : "light"}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                wordWrap: "on",
                automaticLayout: true,
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p className="text-lg mb-2">No file selected</p>
                <p className="text-sm">Open a file from the explorer to start editing</p>
              </div>
            </div>
          )}
        </div>

        {/* 🚀 Terminal - Opens INSTANTLY via Rust */}
        {showTerminal && (
          <div style={{ height: terminalHeight, minHeight: '0' }}>
            <TerminalWrapper 
              theme={theme} 
              onClose={toggleTerminal} 
              projectPath={projectName} 
              isBuilding={isBuilding}
            />
          </div>
        )}
      </div>
    </div>
  );
}