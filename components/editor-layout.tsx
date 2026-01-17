"use client";

import { useEffect, useRef, useState } from "react";
import { MonacoEditor } from "./monacoeditor";
import TerminalWrapper from "./terminal-wrapper";

interface Props {
  projectName: string;
  theme: "light" | "dark";
}

export function EditorLayout({ projectName, theme }: Props) {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const dragging = useRef(false);

  // Ctrl + `
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        setTerminalOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Drag logic
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragging.current) return;
      setTerminalHeight((h) => Math.max(100, h - e.movementY));
    };

    const up = () => (dragging.current = false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="h-10 px-4 flex items-center justify-between border-b">
        <span className="font-semibold">{projectName}</span>
        <button
          onClick={() => setTerminalOpen((v) => !v)}
          className="text-xs px-3 py-1 bg-blue-600 text-white rounded"
        >
          Terminal
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor theme={theme} />
      </div>

      {/* Terminal */}
      {terminalOpen && (
        <>
          {/* Resize Handle */}
          <div
            onMouseDown={() => (dragging.current = true)}
            className="h-1 cursor-row-resize bg-gray-500"
          />

          <div style={{ height: terminalHeight }}>
            <TerminalWrapper
              theme={theme}
              onClose={() => setTerminalOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}
