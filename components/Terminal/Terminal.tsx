"use client"
import { useEffect, useRef, useState } from "react"
import { invoke } from "@tauri-apps/api/tauri"
import { listen } from "@tauri-apps/api/event"

interface TerminalLine {
  id: number
  content: string
  type: "input" | "output" | "error"
}

export default function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [lineId, setLineId] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  // 🔥 LISTEN FOR LIVE LOGS FROM RUST
  useEffect(() => {
    const unlisten = listen<string>("terminal-output", (e) => {
      setLines((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: e.payload,
          type: e.payload.startsWith("[ERR]") ? "error" : "output",
        },
      ])
    })

    return () => {
      unlisten.then((f) => f())
    }
  }, [])

  // 🔥 run real-time commands
  async function runCommand(cmd: string, args: string[] = []) {
    await invoke("run_live_command", { command: cmd, args })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentInput.trim()) {
      setLines((prev) => [...prev, { id: lineId, content: `$ `, type: "input" }])
      setLineId((prev) => prev + 1)
      setCurrentInput("")
      return
    }

    const command = currentInput.trim()
    setLines((prev) => [...prev, { id: lineId, content: `$ ${command}`, type: "input" }])
    setLineId((prev) => prev + 1)

    // -----------------------------------------
    // 🔥 CUSTOM COMMANDS (LIVE STREAM)
    // -----------------------------------------

    if (command === "ping") {
      runCommand("ping", ["google.com"])
      setCurrentInput("")
      return
    }

    if (command === "build") {
      runCommand("idf.py", ["build"])
      setCurrentInput("")
      return
    }

    // -----------------------------------------
    // default commands
    // -----------------------------------------

    let output = ""
    let outputType: "output" | "error" = "output"

    if (command === "clear") {
      setLines([])
      setCurrentInput("")
      return
    } else if (command === "help") {
      output = "Available commands: help, clear, ping, build"
    } else if (command.startsWith("echo ")) {
      output = command.slice(5)
    } else {
      output = `Command not found: ${command}`
      outputType = "error"
    }

    setLines((prev) => [...prev, { id: lineId + 1, content: output, type: outputType }])
    setLineId((prev) => prev + 2)
    setCurrentInput("")
  }

  const handleClick = () => {
    if (inputRef.current) inputRef.current.focus()
  }

  return (
    <div
      ref={terminalRef}
      className="w-full h-full bg-white text-black font-mono text-sm p-2 overflow-y-auto cursor-text"
      onClick={handleClick}
    >
      {lines.map((line) => (
        <div
          key={line.id}
          className={`whitespace-pre-wrap ${
            line.type === "error" ? "text-red-600" : "text-black"
          }`}
        >
          {line.content}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="flex items-center">
        <span className="text-black mr-1">$</span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-black font-mono"
          autoComplete="off"
          spellCheck={false}
        />
      </form>
    </div>
  )
}
