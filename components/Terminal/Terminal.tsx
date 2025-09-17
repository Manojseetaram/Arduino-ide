"use client"
import { useEffect, useRef } from "react"
import { Terminal as XTerm } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import "xterm/css/xterm.css"

export default function Terminal() {
  const terminalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (terminalRef.current) {
      const xterm = new XTerm({
        cursorBlink: true,
        fontSize: 14,
        theme: {
       
          foreground : "#1e1e1e",
          background : "#d4d4d4"
        },
      })

      const fitAddon = new FitAddon()
      xterm.loadAddon(fitAddon)
      xterm.open(terminalRef.current)
      fitAddon.fit()

      xterm.write("$ ")

      let currentCommand = ""

      xterm.onData((data) => {
        const code = data.charCodeAt(0)

        if (code === 13) {
          // Enter
          if (currentCommand.trim()) {
            if (currentCommand === "clear") {
              xterm.clear()
            } else if (currentCommand === "help") {
              xterm.writeln("\r\nAvailable: help, clear, echo <msg>\r\n")
            } else if (currentCommand.startsWith("echo ")) {
              xterm.writeln("\r\n" + currentCommand.slice(5) + "\r\n")
            } else {
              xterm.writeln(`\r\nUnknown command: ${currentCommand}\r\n`)
            }
          }
          currentCommand = ""
          xterm.write("$ ")
        } else if (code === 127) {
          // Backspace
          if (currentCommand.length > 0) {
            currentCommand = currentCommand.slice(0, -1)
            xterm.write("\b \b")
          }
        } else {
          currentCommand += data
          xterm.write(data)
        }
      })

     
      xterm.attachCustomKeyEventHandler((e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === "c") {
          const selection = xterm.getSelection()
          if (selection) {
            navigator.clipboard.writeText(selection)
          }
          return false
        }
        if (e.ctrlKey && e.key === "v") {
          navigator.clipboard.readText().then((text) => {
            xterm.write(text)
            currentCommand += text
          })
          return false
        }
        // if (e.ctrlKey && e.key == "x"){
        //     const selection = xterm.getSelection()
        //         if(selection) {
        //             navigator.clipboard.endText(selection)
        //         }

        //     return false
        // }
        return true
      })

      const handleResize = () => fitAddon.fit()
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <div ref={terminalRef} className="w-full h-full bg-black" />
}
