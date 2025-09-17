"use client";
import { useState } from "react";
import Terminal from "./Terminal";

export default function TerminalWrapper() {
  const [isOpen, setIsOpen] = useState(true); // start with terminal open (optional)

  if (!isOpen) return null; // completely hide when closed

  return (
    <div className="flex flex-col w-full h-64 border-t border-gray-700">
      {/* Terminal Header */}
      <div className="flex items-center justify-between bg-gray-700  border-b border-gray-700">
        <span className="text-xs font-mono text-gray-300">Terminal</span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400"
        >
          ✕
        </button>
      </div>


      <div className="flex-1 overflow-hidden">
        <Terminal />
      </div>
    </div>
  );
}
