"use client";

import { useState, useRef, useEffect } from "react";
import { IconX, IconTerminal2, IconCopy, IconTrash } from "@tabler/icons-react";
import { listen } from "@tauri-apps/api/event";

interface Props {
  onClose: () => void;
  theme: "light" | "dark";
}

export default function TerminalWrapper({ onClose, theme }: Props) {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "$ Arduino CLI 0.35.3",
    "$ Compiling sketch...",
    "$ Uploading...",
    "✔ Done"
  ]);
  const [command, setCommand] = useState<string>("");
  const terminalRef = useRef<HTMLDivElement>(null);

  const dark = theme === "dark";

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    // Add command to output
    setTerminalOutput(prev => [...prev, `$ ${command}`]);
    
    // Simulate command execution
    setTimeout(() => {
      setTerminalOutput(prev => [
        ...prev,
        `> Executing: ${command}`,
        `> Command executed successfully`
      ]);
    }, 100);

    setCommand("");
  };

  const handleClearTerminal = () => {
    setTerminalOutput([]);
  };
useEffect(() => {
  let unlistenLog: (() => void) | undefined;
  let unlistenFinished: (() => void) | undefined;

  (async () => {
    unlistenLog = await listen<string>("build-log", (event) => {
      setTerminalOutput(prev => [...prev, event.payload]);
    });

    unlistenFinished = await listen<string>("build-finished", (event) => {
      setTerminalOutput(prev => [...prev, `✔ ${event.payload}`]);
    });
  })();

  return () => {
    if (unlistenLog) unlistenLog();
    if (unlistenFinished) unlistenFinished();
  };
}, []);

useEffect(() => {
  const handleClear = () => setTerminalOutput([]);
  window.addEventListener("terminal:clear", handleClear);

  return () => window.removeEventListener("terminal:clear", handleClear);
}, []);


  const handleCopyTerminal = () => {
    const text = terminalOutput.join('\n');
    navigator.clipboard.writeText(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      handleClearTerminal();
    }
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      // Add interrupt symbol
      setTerminalOutput(prev => [...prev, "^C"]);
    }
  };

  return (
    <div className={`flex flex-col w-full h-full ${dark ? "bg-black" : "bg-white"}`}>
      {/* Terminal header */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${dark ? "border-gray-800 bg-gray-900" : "border-gray-300 bg-gray-100"}`}>
        <div className="flex items-center gap-2">
          <IconTerminal2 size={16} className={dark ? "text-green-400" : "text-green-600"} />
          <span className={`text-sm font-medium ${dark ? "text-gray-300" : "text-gray-700"}`}>
            Terminal
          </span>
          <span className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>
            • Interactive shell
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopyTerminal}
            className={`p-1.5 rounded ${dark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-200 text-gray-600"}`}
            title="Copy terminal output"
          >
            <IconCopy size={14} />
          </button>
          <button
            onClick={handleClearTerminal}
            className={`p-1.5 rounded ${dark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-200 text-gray-600"}`}
            title="Clear terminal"
          >
            <IconTrash size={14} />
          </button>
          <button
            onClick={onClose}
            className={`p-1.5 rounded ${dark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-200 text-gray-600"}`}
            title="Hide terminal"
          >
            <IconX size={14} />
          </button>
        </div>
      </div>

      {/* Terminal output */}
      <div
        ref={terminalRef}
        className={`flex-1 p-3 font-mono text-xs overflow-y-auto ${dark ? "text-green-400" : "text-gray-800"}`}
        style={{ background: dark ? '#000' : '#fff' }}
      >
        {terminalOutput.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {line.includes("$") || line.includes(">") ? (
              <span className={dark ? "text-green-400" : "text-green-600"}>{line}</span>
            ) : line.includes("✔") ? (
              <span className="text-green-500">{line}</span>
            ) : line.includes("^C") ? (
              <span className="text-red-500">{line}</span>
            ) : (
              <span>{line}</span>
            )}
          </div>
        ))}
        
        {/* Command input */}
        <form onSubmit={handleCommandSubmit} className="mt-2">
          <div className="flex items-center">
            <span className={`mr-2 ${dark ? "text-green-400" : "text-green-600"}`}>$</span>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyPress}
              className={`flex-1 bg-transparent border-none outline-none font-mono text-sm ${
                dark ? "text-green-400" : "text-green-600"
              }`}
              placeholder="Type a command..."
              autoFocus
            />
          </div>
        </form>
      </div>

      {/* Terminal status bar */}
      <div className={`px-3 py-1 text-xs border-t ${dark ? "border-gray-800 text-gray-500 bg-gray-900" : "border-gray-300 text-gray-600 bg-gray-100"}`}>
        <div className="flex items-center justify-between">
          <span>Ready</span>
          <span>Press Ctrl+L to clear, Ctrl+C to interrupt</span>
        </div>
      </div>
    </div>
  );
}