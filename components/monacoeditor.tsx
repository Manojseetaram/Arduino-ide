"use client";

import { useState, useEffect } from "react";
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
  const [isTerminalOpening, setIsTerminalOpening] = useState(false);

  const showTerminal =
    externalShowTerminal !== undefined
      ? externalShowTerminal
      : internalShowTerminal;

  const toggleTerminal =
    onToggleTerminal ||
    (() => setInternalShowTerminal((prev) => !prev));

  // 🚀 FORCE OPEN TERMINAL IMMEDIATELY
  const forceOpenTerminal = () => {
    if (!showTerminal) {
      setIsTerminalOpening(true);
      if (onToggleTerminal) {
        onToggleTerminal();
      } else {
        setInternalShowTerminal(true);
      }
      // Reset opening state after a short delay
      setTimeout(() => setIsTerminalOpening(false), 100);
    }
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
     🚀 UPDATED COMPILE HANDLER 
     ============================ */
  const handleCompile = async () => {
    if (!projectName || isBuilding || isTerminalOpening) return;

    try {
      // 1. OPEN TERMINAL IMMEDIATELY (BEFORE ANYTHING ELSE)
      forceOpenTerminal();
      
      // 2. Start building state
      setIsBuilding(true);
      
      // 3. Clear previous terminal output
      window.dispatchEvent(new CustomEvent("terminal:clear"));
      
      // 4. Give terminal a moment to open and show initial message
      setTimeout(() => {
        const startTime = new Date();
        window.dispatchEvent(new CustomEvent("terminal:info", {
          detail: `🚀 Starting ESP-IDF build for: ${projectName}`
        }));
        window.dispatchEvent(new CustomEvent("terminal:info", {
          detail: `⏰ Started at: ${startTime.toLocaleTimeString()}`
        }));
        window.dispatchEvent(new CustomEvent("terminal:info", {
          detail: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        }));
      }, 50);

      // 5. Resolve project path
      const projectPath: string = await invoke("get_project_path", { name: projectName });

      // 6. Send project info to terminal
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("terminal:info", {
          detail: `📁 Project: ${projectName}`
        }));
        window.dispatchEvent(new CustomEvent("terminal:info", {
          detail: `📂 Path: ${projectPath}`
        }));
        window.dispatchEvent(new CustomEvent("terminal:info", {
          detail: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        }));
      }, 100);

      // 7. Trigger build - this will stream to terminal via Tauri events
      await invoke("build_project", { projectPath });

      // 8. Show success message
      setTimeout(() => {
        const endTime = new Date();
        window.dispatchEvent(new CustomEvent("terminal:info", {
          detail: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        }));
        window.dispatchEvent(new CustomEvent("terminal:success", {
          detail: `✅ ESP-IDF build completed successfully!`
        }));
      }, 100);

      // 9. Trigger explorer refresh
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("refresh-project-files", {
          detail: projectPath
        }));
      }, 1000);

    } catch (err: any) {
      console.error("Build failed:", err);
      
      // Show error in terminal
      window.dispatchEvent(new CustomEvent("terminal:error", {
        detail: `❌ Build failed: ${err.message || err}`
      }));
      
      // Show ESP-IDF specific tips
      if (err.message.includes("idf.py") || err.message.includes("ESP-IDF")) {
        window.dispatchEvent(new CustomEvent("terminal:info", {
          detail: "💡 ESP-IDF Tips:"
        }));
        window.dispatchEvent(new CustomEvent("terminal:info", {
          detail: "   1. Make sure ESP-IDF is installed and sourced"
        }));
        window.dispatchEvent(new CustomEvent("terminal:info", {
          detail: "   2. Check if idf.py is in your PATH"
        }));
        window.dispatchEvent(new CustomEvent("terminal:info", {
          detail: "   3. Verify your project configuration"
        }));
      }
    } finally {
      // Reset build state
      setTimeout(() => setIsBuilding(false), 500);
    }
  };

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
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {projectName}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Terminal toggle button */}
            <button
              onClick={toggleTerminal}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                showTerminal
                  ? theme === "dark"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : theme === "dark"
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              title={showTerminal ? "Hide Terminal" : "Show Terminal"}
            >
              <IconTerminal2 size={16} />
              <span>Terminal</span>
            </button>
            
            {/* Compile button */}
            <button
              onClick={handleCompile}
              disabled={isBuilding || isTerminalOpening}
              className={`px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 ${
                isBuilding || isTerminalOpening
                  ? "bg-yellow-600 text-white cursor-wait"
                  : "bg-green-600 hover:bg-green-500 text-white"
              }`}
            >
              {isBuilding || isTerminalOpening ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isTerminalOpening ? "Opening Terminal..." : "Building..."}</span>
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

        {/* Terminal */}
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