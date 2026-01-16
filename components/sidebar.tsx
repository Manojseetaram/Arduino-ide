
'use client'
import { useState } from "react"

interface SidebarProps {
  projects: string[]
  theme: "light" | "dark"
  toggleTheme: () => void
  onSelectProject: (proj: string) => void
}

export function Sidebar({ projects, theme, toggleTheme, onSelectProject }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)

  const sidebarBg = theme === "dark" ? "bg-gray-900" : "bg-gray-200"
  const iconBg = "bg-blue-600"
  const iconColor = "text-white"
  const sidebarWidth = isOpen ? 14 : 0

  return (
    <div className="flex h-screen">
      {/* Icon bar */}
      <div className={`flex flex-col justify-between py-4 ${iconBg} w-16`}>
        <div className="flex flex-col items-center space-y-4">
          <button
            className={`p-3 rounded ${iconColor} hover:bg-blue-500 transition-colors`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {/* Hamburger icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <button
            className={`p-3 rounded ${iconColor} hover:bg-blue-500 transition-colors`}
            onClick={toggleTheme}
          >
            {theme === "light" ? "🌞" : "🌙"}
          </button>
        </div>
      </div>

      {/* Sidebar projects */}
      <div
        className={`flex flex-col py-4 transition-all duration-300 overflow-hidden ${sidebarBg}`}
        style={{ width: `${sidebarWidth}rem` }}
      >
        {isOpen && (
          <div className="px-4 flex flex-col gap-4 text-white">
            {projects.map((proj) => (
              <div
                key={proj}
                className="flex items-center gap-2 p-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer"
                onClick={() => onSelectProject(proj)}
              >
                <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-white text-sm">
                  {proj[0].toUpperCase()}
                </div>
                <span>{proj}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
