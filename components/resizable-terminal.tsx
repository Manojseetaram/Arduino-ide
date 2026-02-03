import { useState, useRef , useEffect } from "react";
import TerminalWrapper from "./terminal-wrapper";


interface Props {
  theme: "light" | "dark";
  onClose: () => void;
  projectPath?: string;
  isBuilding?: boolean;
}

export function ResizableTerminalWrapper({ theme, onClose, projectPath, isBuilding }: Props) {
  const [height, setHeight] = useState(200); // default terminal height
  const resizerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggingRef.current) return;
    setHeight(window.innerHeight - e.clientY);
  };

  const handleMouseUp = () => {
    draggingRef.current = false;
  };

  // attach/remove global listeners
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className="flex flex-col w-full" style={{ height }}>
      {/* Drag handle */}
      <div
        ref={resizerRef}
        className="h-1 cursor-row-resize bg-gray-300 dark:bg-gray-700"
        onMouseDown={handleMouseDown}
      />

      {/* Terminal content */}
      <div className="flex-1">
        <TerminalWrapper
          theme={theme}
          onClose={onClose}
          projectPath={projectPath}
          isBuilding={isBuilding}
        />
      </div>
    </div>
  );
}
