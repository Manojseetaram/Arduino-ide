"use client";

interface Props {
  theme: "light" | "dark";
  terminalOpen: boolean;
  onToggleTerminal: () => void;
  projectName: string;
}

export function EditorTopbar({
  theme,
  terminalOpen,
  onToggleTerminal,
 
}: Props) {
  return (
    <div
      className={`h-10 flex items-center justify-between px-4 border-b text-sm ${
        theme === "dark"
          ? "bg-zinc-900 border-zinc-700 text-zinc-200"
          : "bg-zinc-100 border-zinc-300 text-zinc-800"
      }`}
    >
     

      {/* Right */}
      <button
        onClick={onToggleTerminal}
        className={`px-3 py-1 rounded text-xs font-medium transition ${
          terminalOpen
            ? "bg-red-600 hover:bg-red-500 text-white"
            : "bg-blue-600 hover:bg-blue-500 text-white"
        }`}
      >
        {terminalOpen ? "Close Terminal" : "Open Terminal"}
      </button>
      
    </div>
  );
}
