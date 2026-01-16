"use client"

import { useState, useEffect } from "react"

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [theme, setTheme] = useState<"light" | "dark">("dark")

  useEffect(() => {
    document.body.className = theme
  }, [theme])

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light")

  const sidebarBg = theme === "dark" ? "bg-gray-900" : "bg-gray-200"
  const iconBg = "bg-blue-600"
  const iconColor = "text-white"

  const sidebarWidth = isOpen ? 14 : 0 // w-64 = 16rem, 0 = hidden

  return (
    <div className="flex h-screen">
      {/* ----- ICON BAR (constant) ----- */}
      <div className={`flex flex-col justify-between py-4 ${iconBg} w-16`}>
        {/* Top Icons */}
        <div className="flex flex-col items-center space-y-4">
          {/* Open/Close (affects sidebar only) */}
          <button
            className={`p-3 rounded ${iconColor} hover:bg-blue-500 transition-colors`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search */}
          <button className={`p-3 rounded ${iconColor} hover:bg-blue-500 transition-colors`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1116.65 2a7.5 7.5 0 010 14.65z" />
            </svg>
          </button>
        </div>

        {/* Bottom Icons */}
        <div className="flex flex-col items-center space-y-4">
          {/* Extension */}
          <button className={`p-3 rounded ${iconColor} hover:bg-blue-500 transition-colors`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3 7h7l-5.5 4 2 7-6-4-6 4 2-7L2 9h7l3-7z" />
            </svg>
          </button>

          {/* Theme */}
          <button
            className={`p-3 rounded ${iconColor} hover:bg-blue-500 transition-colors`}
            onClick={toggleTheme}
          >
            {theme === "light" ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m8-10h2M2 12h2m15.364-6.364l1.414 1.414M4.222 19.778l1.414-1.414M19.778 19.778l-1.414-1.414M4.222 4.222l1.414 1.414M12 7a5 5 0 100 10 5 5 0 000-10z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c.132 0 .263.003.393.009a9 9 0 100 17.982A9 9 0 0112 3z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ----- SIDEBAR (collapsible / auto-hide) ----- */}
      <div
        className={`flex flex-col py-4 transition-all duration-300 overflow-hidden ${sidebarBg}`}
        style={{ width: `${sidebarWidth}rem` }}
      >
        {isOpen && (
          <div className="px-4 text-white">
            <h2 className="text-lg font-bold">Sidebar Content</h2>
            <p className="mt-2">Add menus, options here.</p>
          </div>
        )}
      </div>

      {/* ----- DASHBOARD ----- */}
      <div className="flex-1 transition-all duration-300 bg-gray-100 dark:bg-gray-900 p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Arduino IDE Dashboard</h1>
        <p className="text-gray-700 dark:text-gray-300 mt-2">
          Sidebar auto-hides when closed. Icon bar fixed. Dashboard fills remaining space.
        </p>
      </div>
    </div>
  )
}
