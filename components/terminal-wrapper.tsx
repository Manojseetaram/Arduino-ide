"use client";

import { useState, useRef, useEffect } from "react";
import {
  IconX,
  IconTerminal2,
  IconCopy,
  IconTrash,
  IconEye,
} from "@tabler/icons-react";
import { listen } from "@tauri-apps/api/event";

interface Props {
  onClose: () => void;
  theme: "light" | "dark";
  projectPath?: string;
  isBuilding?: boolean; // Added prop to know when building
}

export default function TerminalWrapper({ onClose, theme, projectPath, isBuilding }: Props) {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [command] = useState(""); // Remove command input
  const terminalRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<string>("");

  // 🔥 Use a single buffer to prevent race conditions
  const bufferRef = useRef<string[]>([]);
  const flushTimerRef = useRef<NodeJS.Timeout | null>(null);

  const dark = theme === "dark";

  /* ===============================
     BUILD LOG LISTENER (IMPROVED)
     =============================== */
  useEffect(() => {
    let unlistenLog: (() => void) | undefined;
    let unlistenFinished: (() => void) | undefined;
    let unlistenError: (() => void) | undefined;
    let unlistenInfo: (() => void) | undefined;
    let unlistenSuccess: (() => void) | undefined;

    const flush = () => {
      if (bufferRef.current.length === 0) return;
      
      // Add all buffered lines at once
      setTerminalOutput(prev => [...prev, ...bufferRef.current]);
      bufferRef.current = [];
    };

    (async () => {
      try {
        // Listen for build logs (from ESP-IDF)
        unlistenLog = await listen<string>("build-log", (event) => {
          if (typeof event.payload === 'string') {
            const message = event.payload;
            // Avoid duplicate messages
            if (message !== lastMessageRef.current) {
              lastMessageRef.current = message;
              const timestamp = new Date().toLocaleTimeString();
              bufferRef.current.push(`[${timestamp}] ${message}`);
            }
          }

          // Batch updates every 30ms for smoother streaming
          if (flushTimerRef.current) {
            clearTimeout(flushTimerRef.current);
          }
          
          flushTimerRef.current = setTimeout(() => {
            flush();
            flushTimerRef.current = null;
          }, 30);
        });

        // Listen for build completion
        unlistenFinished = await listen<string>("build-finished", (event) => {
          const timestamp = new Date().toLocaleTimeString();
          bufferRef.current.push(`[${timestamp}] ✅ ${event.payload}`);
          flush();
        });
        
        // Listen for build errors
        unlistenError = await listen("build-error", (event) => {
          const timestamp = new Date().toLocaleTimeString();
          bufferRef.current.push(`[${timestamp}] ❌ ERROR: ${event.payload}`);
          flush();
        });
        
        // Listen for info messages
        unlistenInfo = await listen("terminal:info", (event) => {
          const timestamp = new Date().toLocaleTimeString();
          bufferRef.current.push(`[${timestamp}] ℹ️ ${event.payload}`);
          flush();
        });
        
        // Listen for success messages
        unlistenSuccess = await listen("terminal:success", (event) => {
          const timestamp = new Date().toLocaleTimeString();
          bufferRef.current.push(`[${timestamp}] 🎉 ${event.payload}`);
          flush();
        });
        
      } catch (error) {
        console.error("Failed to set up terminal listeners:", error);
      }
    })();

    return () => {
      unlistenLog?.();
      unlistenFinished?.();
      unlistenError?.();
      unlistenInfo?.();
      unlistenSuccess?.();
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
      }
    };
  }, []);

  /* ===============================
     AUTO SCROLL (IMPROVED)
     =============================== */
  useEffect(() => {
    const el = terminalRef.current;
    if (!el) return;

    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 20);
    
    return () => clearTimeout(timer);
  }, [terminalOutput.length]);

  /* ===============================
     CLEAR TERMINAL
     =============================== */
  const clearTerminal = () => {
    bufferRef.current = [];
    setTerminalOutput([]);
    lastMessageRef.current = "";
  };

  useEffect(() => {
    const handleClear = () => clearTerminal();
    window.addEventListener("terminal:clear", handleClear);
    return () => window.removeEventListener("terminal:clear", handleClear);
  }, []);

  /* ===============================
     REMOVED COMMAND HANDLING
     =============================== */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      clearTerminal();
    }
  };

  const handleCopyTerminal = async () => {
    try {
      await navigator.clipboard.writeText(terminalOutput.join("\n"));
      // Show copied message
      const timestamp = new Date().toLocaleTimeString();
      bufferRef.current.push(`[${timestamp}] 📋 Copied ${terminalOutput.length} lines to clipboard`);
      setTerminalOutput(prev => [...prev, `[${timestamp}] 📋 Copied ${terminalOutput.length} lines to clipboard`]);
    } catch (error) {
      console.error("Failed to copy terminal content:", error);
    }
  };

  /* ===============================
     VIEW-ONLY TERMINAL UI
     =============================== */
  return (
    <div className={`flex flex-col w-full h-full ${dark ? "bg-black" : "bg-white"}`}>
      {/* Header with Build Status */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${
        dark ? "border-gray-800 bg-gray-900" : "border-gray-300 bg-gray-100"
      }`}>
        <div className="flex items-center gap-2">
          <IconTerminal2 size={16} className={dark ? "text-green-400" : "text-green-600"} />
          <span className={`text-sm font-medium ${dark ? "text-gray-300" : "text-gray-700"}`}>
            Build Output {isBuilding && "(Live ESP-IDF Build)"}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded ${dark ? "bg-gray-800 text-gray-400" : "bg-gray-200 text-gray-600"}`}>
            <IconEye size={10} className="inline mr-1" />
            View Only
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isBuilding && (
            <div className="px-2 py-1 text-xs bg-blue-600 text-white rounded mr-2 animate-pulse">
              ESP-IDF BUILDING...
            </div>
          )}
          <button 
            onClick={handleCopyTerminal} 
            className={`p-1.5 rounded ${dark ? "hover:bg-gray-800" : "hover:bg-gray-200"}`}
            title="Copy terminal output"
          >
            <IconCopy size={14} />
          </button>
          <button 
            onClick={clearTerminal} 
            className={`p-1.5 rounded ${dark ? "hover:bg-gray-800" : "hover:bg-gray-200"}`}
            title="Clear terminal"
          >
            <IconTrash size={14} />
          </button>
          <button 
            onClick={onClose} 
            className={`p-1.5 rounded ${dark ? "hover:bg-gray-800" : "hover:bg-gray-200"}`}
            title="Close terminal"
          >
            <IconX size={14} />
          </button>
        </div>
      </div>

      {/* Output Area - READ ONLY */}
      <div
        ref={terminalRef}
        className={`flex-1 p-3 font-mono text-xs overflow-y-auto ${
          dark ? "text-gray-300 bg-black" : "text-gray-800 bg-white"
        }`}
        style={{ 
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          userSelect: 'text',
          cursor: 'text'
        }}
        onKeyDown={handleKeyPress}
        tabIndex={0} // Make div focusable for keyboard shortcuts
      >
        {terminalOutput.length === 0 ? (
          <div className={`text-center py-8 ${dark ? "text-gray-500" : "text-gray-400"}`}>
            <IconTerminal2 size={32} className="mx-auto mb-3 opacity-50" />
            <p className="mb-1">ESP-IDF Build Terminal</p>
            <p className="text-xs opacity-70">Click "Compile" to start building and see live output here</p>
            <p className="text-xs opacity-60 mt-2">Terminal is view-only • Ctrl+L: Clear • Click and drag to select text</p>
          </div>
        ) : (
          terminalOutput.map((line, i) => {
            // Enhanced color coding for ESP-IDF output
            let lineColor = "";
            if (line.includes("❌") || line.includes("ERROR:") || line.includes("error:")) {
              lineColor = dark ? "text-red-400" : "text-red-600";
            } else if (line.includes("warning:")) {
              lineColor = dark ? "text-yellow-400" : "text-yellow-600";
            } else if (line.includes("Building") || line.includes("Compiling") || line.includes("Linking")) {
              lineColor = dark ? "text-blue-400" : "text-blue-600";
            } else if (line.includes("✅") || line.includes("Success") || line.includes("✔") || line.includes("🎉")) {
              lineColor = dark ? "text-green-400" : "text-green-600";
            } else if (line.includes("ℹ️") || line.includes("Note:")) {
              lineColor = dark ? "text-cyan-400" : "text-cyan-600";
            } else if (line.includes("━━━━")) {
              lineColor = dark ? "text-gray-500" : "text-gray-400";
            }
            
            return (
              <div 
                key={i} 
                className={`${lineColor} ${dark ? "hover:bg-gray-900" : "hover:bg-gray-50"} px-1 rounded font-mono`}
              >
                {line}
              </div>
            );
          })
        )}
        
        {/* Build Status Indicator */}
        {isBuilding && terminalOutput.length > 0 && (
          <div className={`mt-2 p-2 rounded text-xs ${dark ? "bg-gray-900 text-gray-400" : "bg-gray-100 text-gray-600"}`}>
            <div className="flex items-center">
              <div className="animate-pulse h-2 w-2 rounded-full bg-green-500 mr-2"></div>
              <span>Receiving live ESP-IDF build output...</span>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className={`px-3 py-1 text-xs border-t ${
        dark ? "bg-gray-900 text-gray-500 border-gray-800" : "bg-gray-100 text-gray-600 border-gray-300"
      }`}>
        <div className="flex justify-between">
          <span>
            {isBuilding ? "▶️ Live ESP-IDF Build • " : "Ready • "}
            View Only • Ctrl+L: Clear • Click to select text
          </span>
          <span>{terminalOutput.length} lines</span>
        </div>
      </div>
    </div>
  );
}