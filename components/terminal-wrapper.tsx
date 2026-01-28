"use client";

import { useState, useRef, useEffect } from "react";
import {
  IconX,
  IconTerminal2,
  IconCopy,
  IconTrash,
  IconEye,
  IconBolt,
} from "@tabler/icons-react";
import { listen } from "@tauri-apps/api/event";

interface Props {
  onClose: () => void;
  theme: "light" | "dark";
  projectPath?: string;
  isBuilding?: boolean;
}

export default function TerminalWrapper({ onClose, theme, projectPath, isBuilding }: Props) {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  
 
  const outputContainerRef = useRef<HTMLDivElement>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const messageBufferRef = useRef<string[]>([]);
  
 
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const dark = theme === "dark";

  useEffect(() => {
    const listeners: (() => void)[] = [];
    let isMounted = true;

   
    const flushMessagesInstantly = () => {
      if (!isMounted || messageBufferRef.current.length === 0) return;
      
      // Add all messages at once for performance
      const newMessages = [...messageBufferRef.current];
      messageBufferRef.current = [];
      
      // 🚀 INSTANT STATE UPDATE
      setTerminalOutput(prev => {
        const updated = [...prev, ...newMessages];
        
        // 🚀 INSTANT AUTO-SCROLL
        requestAnimationFrame(() => {
          if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
          }
        });
        
        return updated;
      });
    };

    const setupListeners = async () => {
      try {
        // 🚀 Listen for ESP-IDF build logs - INSTANT PROCESSING
        const unlistenLog = await listen<string>("build-log", (event) => {
          if (!isMounted || typeof event.payload !== 'string') return;
          
          const message = event.payload.trim();
          if (!message) return;
          
          const now = Date.now();
          const timestamp = new Date(now).toLocaleTimeString();
          
          // 🚀 ADD TO BUFFER IMMEDIATELY
          messageBufferRef.current.push(`[${timestamp}] ${message}`);
          
          // 🚀 FLUSH IMMEDIATELY - NO BATCHING DELAY
          flushMessagesInstantly();
        });

        listeners.push(unlistenLog);

        // 🚀 Listen for other events - ALSO INSTANT
        const eventTypes = [
          "build-started",
          "build-finished", 
          "build-error",
          "terminal:info",
          "terminal:success",
          "terminal:clear"
        ];

        for (const eventType of eventTypes) {
          const unlisten = await listen(eventType, (event) => {
            if (!isMounted) return;
            
            const now = Date.now();
            const timestamp = new Date(now).toLocaleTimeString();
            let message = "";
            
            switch (eventType) {
              case "terminal:clear":
                // 🚀 INSTANT CLEAR
                messageBufferRef.current = [];
                setTerminalOutput([]);
                return;
                
              case "build-started":
                message = `[${timestamp}] ESP-IDF Build Started`;
                break;
                
              case "build-finished":
                message = `[${timestamp}]  ${event.payload || "Build Completed"}`;
                break;
                
              case "build-error":
                message = `[${timestamp}]  ERROR: ${event.payload}`;
                break;
                
              case "terminal:info":
                message = `[${timestamp}]  ${event.payload}`;
                break;
                
              case "terminal:success":
                message = `[${timestamp}]  ${event.payload}`;
                break;
            }
            
            if (message) {
              messageBufferRef.current.push(message);
              flushMessagesInstantly();
            }
          });
          
          listeners.push(unlisten);
        }

      } catch (error) {
        console.error("Failed to set up terminal listeners:", error);
      }
    };

    setupListeners();

    // Cleanup
    return () => {
      isMounted = false;
      listeners.forEach(unlisten => unlisten?.());
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  const clearTerminal = () => {
    messageBufferRef.current = [];
    setTerminalOutput([]);
  };

  
  useEffect(() => {
    const handleClear = () => clearTerminal();
    window.addEventListener("terminal:clear", handleClear);
    return () => window.removeEventListener("terminal:clear", handleClear);
  }, []);

  const handleCopyTerminal = async () => {
    try {
      await navigator.clipboard.writeText(terminalOutput.join("\n"));
      
      const timestamp = new Date().toLocaleTimeString();
      messageBufferRef.current.push(`[${timestamp}] Copied to clipboard`);
      setTerminalOutput(prev => [...prev, `[${timestamp}]  Copied to clipboard`]);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className={`flex flex-col w-full h-full ${dark ? "bg-black" : "bg-white"}`}>
      
      <div className={`flex items-center justify-between px-3 py-2 border-b ${
        dark ? "border-gray-800 bg-gray-900" : "border-gray-300 bg-gray-100"
      }`}>
        <div className="flex items-center gap-2">
          
          <span className={`text-sm font-medium ${dark ? "text-gray-300" : "text-gray-700"}`}>
            ESP-IDF Output
          </span>
          <div className="flex items-center gap-1">
            {isBuilding ? (
              <div className="flex items-center px-2 py-0.5 rounded bg-gradient-to-r from-green-600 to-blue-600">
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse mr-1"></div>
                <span className="text-xs text-white font-bold">LIVE</span>
              </div>
            ) : (
              <span className={`text-xs px-1.5 py-0.5 rounded ${dark ? "bg-gray-800 text-gray-400" : "bg-gray-200 text-gray-600"}`}>
            
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isBuilding && (
            <div className="px-2 py-1 text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded mr-2 animate-pulse">
           
            </div>
          )}
          <button 
            onClick={clearTerminal}
            className={`p-1.5 rounded transition-colors ${dark ? "hover:bg-gray-800" : "hover:bg-gray-200"}`}
            title="Clear terminal"
          >
            <IconTrash size={14} />
          </button>
          <button 
            onClick={handleCopyTerminal}
            className={`p-1.5 rounded transition-colors ${dark ? "hover:bg-gray-800" : "hover:bg-gray-200"}`}
            title="Copy output"
          >
            <IconCopy size={14} />
          </button>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded transition-colors ${dark ? "hover:bg-gray-800" : "hover:bg-gray-200"}`}
            title="Close terminal"
          >
            <IconX size={14} />
          </button>
        </div>
      </div>

      {/* 🚀 Output Area - ULTRA INSTANT UPDATES */}
      <div
        ref={terminalRef}
        className={`flex-1 p-3 font-mono text-xs overflow-y-auto ${
          dark ? "text-gray-200 bg-black" : "text-gray-800 bg-white"
        }`}
        style={{ 
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          userSelect: 'text',
          cursor: 'text',
          willChange: 'transform', // Optimize for animation
        }}
      >
        {terminalOutput.length === 0 ? (
          <div className={`text-center py-8 ${dark ? "text-gray-500" : "text-gray-400"}`}>
           
          </div>
        ) : (
          <div ref={outputContainerRef}>
            {terminalOutput.map((line, i) => {
              // 🚀 INSTANT COLOR CODING
              let lineClass = "px-1 rounded transition-colors duration-75 ";
              
              if (line.includes("❌") || line.includes("ERROR:") || line.includes("error:")) {
                lineClass += dark ? "text-red-400 hover:bg-red-900/30" : "text-red-600 hover:bg-red-50";
              } else if (line.includes("warning:")) {
                lineClass += dark ? "text-yellow-400 hover:bg-yellow-900/30" : "text-yellow-600 hover:bg-yellow-50";
              } else if (line.includes("Building") || line.includes("Compiling") || line.includes("Linking")) {
                lineClass += dark ? "text-blue-400 hover:bg-blue-900/30" : "text-blue-600 hover:bg-blue-50";
              } else if (line.includes("✅") || line.includes("Success") || line.includes("✔") || line.includes("🎉")) {
                lineClass += dark ? "text-green-400 hover:bg-green-900/30" : "text-green-600 hover:bg-green-50";
              } else if (line.includes("🚀")) {
                lineClass += dark ? "text-purple-400 hover:bg-purple-900/30" : "text-purple-600 hover:bg-purple-50";
              } else if (line.includes("ℹ️")) {
                lineClass += dark ? "text-cyan-400 hover:bg-cyan-900/30" : "text-cyan-600 hover:bg-cyan-50";
              } else if (line.includes("━━━━")) {
                lineClass += dark ? "text-gray-500" : "text-gray-400";
              } else {
                lineClass += dark ? "text-gray-300 hover:bg-gray-900/50" : "text-gray-700 hover:bg-gray-50";
              }
              
              return (
                <div 
                  key={i} 
                  className={lineClass}
                  style={{
                    animation: i === terminalOutput.length - 1 ? 'fadeIn 0.1s ease-in' : 'none'
                  }}
                >
                  {line}
                </div>
              );
            })}
          </div>
        )}
        
        {/* 🚀 Live Streaming Indicator */}
        {isBuilding && (
          <div className={`mt-2 p-1.5 rounded text-xs flex items-center justify-between ${dark ? "bg-gray-900/50 border border-gray-800" : "bg-gray-100 border border-gray-300"}`}>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
              <span className={dark ? "text-green-400 font-medium" : "text-green-600 font-medium"}>
                ⚡ Streaming ESP-IDF output LIVE
              </span>
            </div>
            <span className={`text-xs ${dark ? "text-gray-400" : "text-gray-600"}`}>
              {terminalOutput.length} lines
            </span>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className={`px-3 py-1 text-xs border-t flex justify-between items-center ${
        dark ? "bg-gray-900 text-gray-500 border-gray-800" : "bg-gray-100 text-gray-600 border-gray-300"
      }`}>
        <div className="flex items-center">
          {isBuilding ? (
            <>
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse mr-2"></div>
              <span>⚡ Live ESP-IDF Stream</span>
            </>
          ) : (
            <span>Ready</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>{terminalOutput.length} lines</span>
          {isBuilding && (
            <div className="flex items-center">
              <div className="h-1 w-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Add CSS for instant fade-in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0.8; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}