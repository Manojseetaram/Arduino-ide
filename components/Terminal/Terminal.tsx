"use client";
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";

interface TerminalLine {
  id: number;
  content: string;
  type: "input" | "output" | "error";
}

export default function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [lineId, setLineId] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    terminalRef.current!.scrollTop = terminalRef.current!.scrollHeight;
  }, [lines]);

  // Listen for live terminal output from Rust
  useEffect(() => {
    const unlisten = listen<string>("terminal-output", (e) => {
      setLines((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: e.payload,
          type: e.payload.startsWith("[ERR]") ? "error" : "output",
        },
      ]);
    });
    return () => {
      unlisten.then((f) => f());
    };
  }, []);

 useEffect(() => {
  const openListener = (e: any) => {
    const cmd = e?.detail?.cmd || "ping";
    const args = e?.detail?.args || ["google.com"];

    setLines((prev) => [
      ...prev,
      { id: prev.length + 1, content: `$ ${cmd} ${args.join(" ")}`, type: "input" },
    ]);

    runCommand(cmd, args);
  };

  window.addEventListener("terminal-open", openListener);

  return () => window.removeEventListener("terminal-open", openListener);
}, []);


  // Run live command via backend
  async function runCommand(cmd: string, args: string[] = []) {
    await invoke("run_live_command", { command: cmd, args });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const command = currentInput.trim();
    if (!command) return;

    setLines((prev) => [
      ...prev,
      { id: lineId, content: `$ ${command}`, type: "input" },
    ]);
    setLineId((prev) => prev + 1);

    if (command === "ping") runCommand("ping", ["google.com"]);
    else if (command === "build") runCommand("idf.py", ["build"]);
    else if (command === "flash") runCommand("idf.py", ["flash"]);
    else if (command === "clear") setLines([]);
    else {
      setLines((prev) => [
        ...prev,
        { id: lineId + 1, content: `Command not found: ${command}`, type: "error" },
      ]);
      setLineId((prev) => prev + 2);
    }

    setCurrentInput("");
  };

  const handleClick = () => inputRef.current?.focus();

  return (
    <div
      ref={terminalRef}
      className="w-full h-full bg-black text-white font-mono text-sm p-2 overflow-y-auto cursor-text"
      onClick={handleClick}
    >
      {lines.map((line) => (
        <div
          key={line.id}
          className={`whitespace-pre-wrap ${line.type === "error" ? "text-red-600" : "text-white"}`}
        >
          {line.content}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="flex items-center">
        <span className="text-white mr-1">$</span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={(e) => {
            // Stop process with Ctrl + C
            if (e.ctrlKey && e.key === "c") {
              e.preventDefault();
              invoke("stop_current_process");
              setLines((prev) => [...prev, { id: prev.length + 1, content: "^C", type: "error" }]);
            }
          }}
          className="flex-1 bg-transparent border-none outline-none text-white font-mono"
          autoComplete="off"
          spellCheck={false}
        />
      </form>
    </div>
  );
}
