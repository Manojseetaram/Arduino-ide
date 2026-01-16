"use client"
import { useState } from "react"
import { CreateProject } from "@/components/createproject"
import { MonacoEditor } from "@/components/monacoeditor"
import { Sidebar } from "@/components/sidebar"



export default function DashboardPage() {
  const [projects, setProjects] = useState<string[]>([])
  const [currentProject, setCurrentProject] = useState<string | null>(null)
  const [theme, setTheme] = useState<"light" | "dark">("dark")

  const addProject = (name: string) => {
    setProjects([name, ...projects])
    setCurrentProject(name)
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar projects={projects} theme={theme} toggleTheme={toggleTheme} />

      {/* Dashboard */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-900">
        {!currentProject ? (
          <CreateProject addProject={addProject} />
        ) : (
          <MonacoEditor projectName={currentProject} theme={theme} />
        )}
      </div>
    </div>
  )
}
