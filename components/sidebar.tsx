"use client";

import { useState } from "react";
import {
  IconFolder,
  IconFile,
  IconSearch,
  IconPlug,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";

interface SidebarProps {
  currentProject: string | null;
  theme: "light" | "dark";
}

type Panel = "explorer" | "search" | "extensions";

export function Sidebar({
  currentProject,
  theme,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [panel, setPanel] = useState<Panel>("explorer");

  const dark = theme === "dark";

  return (
    <div className="flex h-screen">
      {/* ICON BAR */}
      <div
        className={`w-14 flex flex-col items-center
        ${dark ? "bg-gray-950 text-gray-300" : "bg-gray-300 text-gray-800"}`}
      >
        {/* OPEN / CLOSE */}
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="h-12 w-full flex items-center justify-center hover:bg-blue-600 hover:text-white"
          title="Toggle Sidebar"
        >
          {isOpen ? (
            <IconLayoutSidebarLeftCollapse size={20} />
          ) : (
            <IconLayoutSidebarLeftExpand size={20} />
          )}
        </button>

        {/* PANEL ICONS */}
        <SidebarIcon
          active={panel === "explorer"}
          onClick={() => {
            setPanel("explorer");
            setIsOpen(true);
          }}
        >
          <IconFolder size={20} />
        </SidebarIcon>

        <SidebarIcon
          active={panel === "search"}
          onClick={() => {
            setPanel("search");
            setIsOpen(true);
          }}
        >
          <IconSearch size={20} />
        </SidebarIcon>

        <SidebarIcon
          active={panel === "extensions"}
          onClick={() => {
            setPanel("extensions");
            setIsOpen(true);
          }}
        >
          <IconPlug size={20} />
        </SidebarIcon>
      </div>

      {/* SIDEBAR PANEL */}
      <div
        className={`transition-all duration-200 overflow-hidden
        ${isOpen ? "w-56" : "w-0"}
        ${dark
          ? "bg-gray-900 border-r border-gray-700 text-gray-200"
          : "bg-gray-100 border-r border-gray-300 text-gray-800"}`}
      >
        {isOpen && (
          <>
            <div className="px-4 py-2 text-xs font-semibold border-b">
              {panel.toUpperCase()}
            </div>

            {/* EXPLORER */}
            {panel === "explorer" && currentProject && (
              <div className="p-2">
                <div className="flex items-center justify-between px-2 py-1 text-sm font-medium">
                  <span>{currentProject}</span>

                  <div className="flex items-center gap-2">
                    <button
                      title="New Folder"
                      className="p-1 rounded hover:bg-blue-600 hover:text-white"
                    >
                      <IconFolder size={16} />
                    </button>

                    <button
                      title="New File"
                      className="p-1 rounded hover:bg-blue-600 hover:text-white"
                    >
                      <IconFile size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {panel === "search" && (
              <div className="p-3 text-xs opacity-70">
                Search
              </div>
            )}

            {panel === "extensions" && (
              <div className="p-3 text-xs opacity-70">
                Extensions
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SidebarIcon({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full h-12 flex items-center justify-center
      ${
        active
          ? "bg-blue-600 text-white"
          : "hover:bg-blue-500 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
