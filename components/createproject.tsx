"use client"

import { useState } from "react"

interface CreateProjectProps {
  addProject: (name: string) => void
}

export function CreateProject({ addProject }: CreateProjectProps) {
  const [projectName, setProjectName] = useState("")

  const handleCreate = () => {
    if (!projectName.trim()) return
    addProject(projectName.trim())
    setProjectName("")
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">Create New Project</h1>
      <div className="flex gap-2">
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project Name"
          className="p-2 rounded border border-gray-400"
        />
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
        >
          Create
        </button>
      </div>
    </div>
  )
}
