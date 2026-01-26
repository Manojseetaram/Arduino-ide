"use client";

import { useState, useRef, useEffect } from "react";
import {
  IconX,
  IconTerminal2,
  IconCopy,
  IconTrash,
} from "@tabler/icons-react";
import { listen } from "@tauri-apps/api/event";

interface Props {
  onClose: () => void;
  theme: "light" | "dark";
}

export default function TerminalWrapper({ onClose, theme }: Props) {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [command, setCommand] = useState("");
  const terminalRef = useRef<HTMLDivElement>(null);

  // 🔥 buffers (IMPORTANT)
  const bufferRef = useRef<string[]>([]);
  const flushTimerRef = useRef<NodeJS.Timeout | null>(null);

  const dark = theme === "dark";

  /* ===============================
     BUILD LOG LISTENER (BUFFERED)
     =============================== */
  useEffect(() => {
    let unlistenLog: (() => void) | undefined;
    let unlistenFinished: (() => void) | undefined;

    const flush = () => {
      if (bufferRef.current.length === 0) return;

      setTerminalOutput(prev => [...prev, ...bufferRef.current]);
      bufferRef.current = [];
    };

    (async () => {
      unlistenLog = await listen<string>("build-log", (event) => {
        bufferRef.current.push(event.payload);

        // batch updates every 100ms
        if (!flushTimerRef.current) {
          flushTimerRef.current = setTimeout(() => {
            flush();
            flushTimerRef.current = null;
          }, 100);
        }
      });

      unlistenFinished = await listen<string>("build-finished", (event) => {
        bufferRef.current.push(`✔ ${event.payload}`);
        flush();
      });
    })();

    return () => {
      unlistenLog?.();
      unlistenFinished?.();
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
      }
    };
  }, []);

  /* ===============================
     SAFE AUTO SCROLL
     =============================== */
  useEffect(() => {
    const el = terminalRef.current;
    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [terminalOutput.length]);

  /* ===============================
     TERMINAL CLEAR EVENT
     =============================== */
  useEffect(() => {
    const handleClear = () => {
      bufferRef.current = [];
      setTerminalOutput([]);
    };

    window.addEventListener("terminal:clear", handleClear);
    return () => window.removeEventListener("terminal:clear", handleClear);
  }, []);

  /* ===============================
     COMMAND INPUT (FAKE SHELL)
     =============================== */
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    setTerminalOutput(prev => [...prev, `$ ${command}`]);

    setTimeout(() => {
      setTerminalOutput(prev => [
        ...prev,
        `> Executing: ${command}`,
        `> Command executed successfully`,
      ]);
    }, 100);

    setCommand("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      setTerminalOutput([]);
    }
    if (e.ctrlKey && e.key === "c") {
      e.preventDefault();
      setTerminalOutput(prev => [...prev, "^C"]);
    }
  };

  const handleCopyTerminal = () => {
    navigator.clipboard.writeText(terminalOutput.join("\n"));
  };

  /* ===============================
     UI
     =============================== */
  return (
    <div className={`flex flex-col w-full h-full ${dark ? "bg-black" : "bg-white"}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${
        dark ? "border-gray-800 bg-gray-900" : "border-gray-300 bg-gray-100"
      }`}>
        <div className="flex items-center gap-2">
          <IconTerminal2 size={16} className={dark ? "text-green-400" : "text-green-600"} />
          <span className={`text-sm font-medium ${dark ? "text-gray-300" : "text-gray-700"}`}>
            Terminal
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={handleCopyTerminal} className="p-1.5 rounded hover:bg-gray-800">
            <IconCopy size={14} />
          </button>
          <button onClick={() => setTerminalOutput([])} className="p-1.5 rounded hover:bg-gray-800">
            <IconTrash size={14} />
          </button>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-800">
            <IconX size={14} />
          </button>
        </div>
      </div>

      {/* Output */}
      <div
        ref={terminalRef}
        className={`flex-1 p-3 font-mono text-xs overflow-y-auto ${
          dark ? "text-green-400" : "text-gray-800"
        }`}
      >
        {terminalOutput.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {line.startsWith("$") || line.startsWith(">") ? (
              <span className="text-green-500">{line}</span>
            ) : line.includes("✔") ? (
              <span className="text-green-500">{line}</span>
            ) : line.includes("^C") ? (
              <span className="text-red-500">{line}</span>
            ) : (
              <span>{line}</span>
            )}
          </div>
        ))}

        {/* Input */}
        <form onSubmit={handleCommandSubmit} className="mt-2">
          <div className="flex items-center">
            <span className="mr-2 text-green-500">$</span>
            <input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-transparent outline-none font-mono text-sm"
            />
          </div>
        </form>
      </div>

      {/* Status */}
      <div className="px-3 py-1 text-xs border-t text-gray-500 bg-gray-900">
        Ready • Ctrl+L Clear • Ctrl+C Interrupt
      </div>
    </div>
  );
}
