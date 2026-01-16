"use client"

import { useState, useEffect } from "react"

export default function DashboardPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    // Apply theme class to body
    document.body.className = theme
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-6 transition-colors duration-300 bg-white text-black dark:bg-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p>Welcome to your dashboard!</p>

      <button
        onClick={toggleTheme}
        className="rounded-md bg-gray-800 px-4 py-2 text-white hover:bg-gray-700 dark:bg-white dark:text-black dark:hover:bg-gray-200"
      >
        Toggle Theme ({theme === "light" ? "Dark" : "Light"})
      </button>
    </div>
  )
}
