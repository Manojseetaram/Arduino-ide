"use client";

import { useState } from "react";

export function CreateProject({ addProject }: { addProject: (n: string) => void }) {
  const [name, setName] = useState("");

  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-80 rounded-xl shadow-lg bg-white dark:bg-gray-800 p-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl mb-4">
          📁
        </div>

        <h2 className="font-semibold mb-4">Create New Project</h2>

        <input
          className="w-full p-2 border rounded mb-3 dark:bg-gray-700"
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          onClick={() => {
            if (!name.trim()) return;
            addProject(name.trim());
          }}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500"
        >
          Create
        </button>
      </div>
    </div>
  );
}
