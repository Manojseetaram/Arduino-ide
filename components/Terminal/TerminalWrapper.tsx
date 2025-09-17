
"use client";

import Terminal from "./Terminal";

interface Props {
  onClose: () => void;
}

export default function TerminalWrapper({ onClose }: Props) {
  return (
    <div className="flex flex-col w-full h-full bg-white border-gray-300">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1 h-6 border-b border-gray-300">
        <span className="text-xs font-mono text-gray-700">Terminal</span>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800 rounded px-2 py-1 text-sm"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden bg-white">
        <Terminal />
      </div>
    </div>
  );
}
