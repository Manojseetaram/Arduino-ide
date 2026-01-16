"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"

export default function DashboardPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  // Apply theme to body
  useEffect(() => {
    document.body.className = theme
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return <Sidebar theme={theme} toggleTheme={toggleTheme} />
}
