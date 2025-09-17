
"use client"
import { useEffect, useRef, useState } from "react"
import type React from "react"

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
    
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "x") {
        e.preventDefault()
        setLines((prev) => [...prev, { id: lineId, content: `$ ${currentInput}`, type: "input" }])
        setLineId((prev) => prev + 1)
        setCurrentInput("")
        return
      }

  
      if (inputRef.current && !inputRef.current.matches(":focus")) {
        inputRef.current.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentInput, lineId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentInput.trim()) {
      setLines((prev) => [...prev, { id: lineId, content: `$ `, type: "input" }])
      setLineId((prev) => prev + 1)
      setCurrentInput("")
      return
    }

    
    setLines((prev) => [...prev, { id: lineId, content: `$ ${currentInput}`, type: "input" }])
    setLineId((prev) => prev + 1)

  
    const command = currentInput.trim()
    let output = ""
    let outputType: "output" | "error" = "output"

    if (command === "clear") {
      setLines([])
      setCurrentInput("")
      return
    } else if (command === "help") {
      output = "Available commands: help, clear, echo <message>"
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
    if (inputRef.current) {
      inputRef.current.focus()
    }
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
            line.type === "error" ? "text-red-600" : line.type === "output" ? "text-black" : "text-black"
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
