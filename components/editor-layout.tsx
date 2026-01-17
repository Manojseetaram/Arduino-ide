"use client";

import { useEffect, useState } from "react";
import { MonacoEditor } from "./monacoeditor";
import TerminalWrapper from "./terminal-wrapper";
import { EditorTopbar } from "./editor-topbar";

interface Props {
  projectName: string;
  theme: "light" | "dark";
}

export function EditorLayout({ projectName, theme }: Props) {
  const [terminalOpen, setTerminalOpen] = useState(false);

  // ================= KEYBOARD SHORTCUT =================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");

      if (
        (isMac && e.metaKey && e.key === "`") ||
        (!isMac && e.ctrlKey && e.key === "`")
      ) {
        e.preventDefault();
        setTerminalOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {/* TOP BAR */}
      <EditorTopbar
        projectName={projectName}
        theme={theme}
        terminalOpen={terminalOpen}
        onToggleTerminal={() => setTerminalOpen((p) => !p)}
      />

      {/* EDITOR */}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor projectName={projectName} theme={theme} />
      </div>

      {/* TERMINAL */}
      {terminalOpen && (
        <div
          className={`h-52 border-t overflow-hidden ${
            theme === "dark"
              ? "bg-black border-zinc-700"
              : "bg-white border-zinc-300"
          }`}
        >
          <TerminalWrapper
            theme={theme}
            onClose={() => setTerminalOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
