"use client"

import Editor from "@monaco-editor/react"

interface MonacoEditorProps {
  projectName: string
  theme: "light" | "dark"
}

export function MonacoEditor({ projectName, theme }: MonacoEditorProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Project title */}
      <div className="p-4 border-b border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{projectName}</h2>
      </div>

      {/* Monaco Editor */}
      <Editor
        height="calc(100vh - 3rem)" // adjust for title bar
        defaultLanguage="javascript"
        defaultValue="// Start coding..."
        theme={theme === "dark" ? "vs-dark" : "light"}
      />
    </div>
  )
}
