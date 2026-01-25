"use client"

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { IconX, IconTerminal2 } from "@tabler/icons-react";
import { EditorTab } from "./explorer/types";
import TerminalWrapper from "./terminal-wrapper";
import { invoke } from "@tauri-apps/api/tauri";
import { IconPlayerPlay } from "@tabler/icons-react";

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
  onToggleTerminal
}: MonacoEditorProps) {
  const [editorContent, setEditorContent] = useState<Record<string, string>>({});
  const [internalShowTerminal, setInternalShowTerminal] = useState(false);
  
  // Use external terminal control if provided, otherwise use internal state
  const showTerminal = externalShowTerminal !== undefined ? externalShowTerminal : internalShowTerminal;
  const toggleTerminal = onToggleTerminal || (() => setInternalShowTerminal(!showTerminal));
  
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  
  const getLanguageFromFilename = (filename: string): string => {
    if (filename.endsWith('.js')) return 'javascript';
    if (filename.endsWith('.ts')) return 'typescript';
    if (filename.endsWith('.jsx')) return 'javascript';
    if (filename.endsWith('.tsx')) return 'typescript';
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.rs')) return 'rust';
    return 'plaintext';
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeTab && value !== undefined) {
      setEditorContent(prev => ({
        ...prev,
        [activeTab.id]: value
      }));
      onContentChange?.(activeTab.id, value);
    }
  };

  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    onTabClose(tabId);
  };
useEffect(() => {
  const handler = async () => {
    if (!projectName) return;

    try {
      toggleTerminal(); // open terminal automatically

      // Find the full path of the project
    const projectPath: string = await invoke("get_project_path", { name: projectName });
await invoke("build_project", { projectPath });


      // Optionally, show "Build Success" toast after completion
      console.log("Build finished!");
    } catch (err) {
      console.error("Build failed", err);
    }
  };

  window.addEventListener("compile-project", handler);
  return () => window.removeEventListener("compile-project", handler);
}, [projectName]);


  // Initialize content for new tabs
  useEffect(() => {
    tabs.forEach(tab => {
      if (!editorContent[tab.id] && tab.content === undefined) {
        setEditorContent(prev => ({
          ...prev,
          [tab.id]: getDefaultContent(tab.name)
        }));
      } else if (tab.content !== undefined && editorContent[tab.id] === undefined) {
        setEditorContent(prev => ({
          ...prev,
          [tab.id]: tab.content || getDefaultContent(tab.name)
        }));
      }
    });
  }, [tabs]);

  const getDefaultContent = (filename: string): string => {
    if (filename.endsWith('.html')) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename.replace('.html', '')}</title>
</head>
<body>
    <h1>Welcome to ${filename}</h1>
</body>
</html>`;
    }
    if (filename.endsWith('.css')) {
      return `/* ${filename} - Stylesheet */\n\nbody {\n    margin: 0;\n    padding: 0;\n    font-family: sans-serif;\n}`;
    }
    if (filename.endsWith('.js') || filename.endsWith('.jsx')) {
      return `// ${filename}\n\nconsole.log('Hello from ${filename}');`;
    }
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) {
      return `// ${filename}\n\ntype Props = {};\n\nexport default function ${filename.replace(/\.(tsx|ts)$/, '')}() {\n    return (\n        <div>\n            <h1>${filename}</h1>\n        </div>\n    );\n}`;
    }
    return `// ${filename}\n\n// Start coding here...`;
  };

  // Calculate editor height based on terminal visibility
  const editorHeight = showTerminal ? '70%' : '100%';
  const terminalHeight = '30%';

  return (
    <div className="h-full flex flex-col">
      {/* Project header with tabs */}
      <div className="bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
        {/* Project title with terminal toggle */}
        <div className="px-4 py-2 border-b border-gray-300 dark:border-gray-700 flex items-center justify-between">
         
          
          {/* Terminal toggle button */}
          <button
            onClick={toggleTerminal}
            className={`flex items-center gap-2 px-3 py-1 rounded text-sm ${
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
          <button
  onClick={() => {
    window.dispatchEvent(new Event("compile-project"));
  }}
  className={`flex items-center gap-2 px-3 py-1 rounded text-sm ${
    theme === "dark"
      ? "bg-green-600 text-white hover:bg-green-500"
      : "bg-green-500 text-white hover:bg-green-600"
  }`}
>
  ▶ Compile
</button>

        </div>
      

        {/* File tabs */}
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
          
          {/* Empty state */}
          {tabs.length === 0 && (
            <div className="px-4 py-2 text-gray-500 dark:text-gray-400 italic">
              No files open
            </div>
          )}
        </div>
      </div>

      {/* Main content area (Editor + Terminal) */}
      <div className="flex-1 flex flex-col">
        {/* Monaco Editor - Dynamic height based on terminal visibility */}
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

        {/* Terminal - Only shown when toggled */}
        {showTerminal && (
          <div style={{ height: terminalHeight, minHeight: '0' }}>
            <TerminalWrapper
              theme={theme}
              onClose={toggleTerminal}
            />
          </div>
        )}
      </div>
    </div>
  );
}