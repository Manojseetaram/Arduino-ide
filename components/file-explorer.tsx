import { IconFolder, IconFile } from "@tabler/icons-react";

export function FileExplorer() {
  return (
    <div className="p-2 text-sm">
      <div className="flex items-center gap-2 py-1">
        <IconFolder size={16} /> src
      </div>

      <div className="ml-4 flex items-center gap-2 py-1">
        <IconFile size={14} /> main.rs
      </div>

      <div className="ml-4 flex items-center gap-2 py-1">
        <IconFile size={14} /> lib.rs
      </div>
    </div>
  );
}
