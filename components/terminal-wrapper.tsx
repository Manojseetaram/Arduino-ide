"use client";

import Terminal from "./terminal";

interface Props {
  onClose: () => void;
  theme: "light" | "dark";
}

export default function TerminalWrapper({ onClose, theme }: Props) {
  return (
    <div
      className={`flex flex-col w-full h-full border-t ${
        theme === "dark"
          ? "bg-black border-gray-700"
          : "bg-white border-gray-300"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-3 py-1 h-7 border-b ${
          theme === "dark"
            ? "border-gray-700 text-gray-200"
            : "border-gray-300 text-gray-700"
        }`}
      >
        <span className="text-xs font-mono">Terminal</span>

        <button
          onClick={onClose}
          className="hover:opacity-80 rounded px-2 text-sm"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        <Terminal theme={theme} />
      </div>
    </div>
  );
}
