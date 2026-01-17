"use client";

import { useState } from "react";

export function CreateProjectModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("");

  return (
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-80 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl mb-4">
          📁
        </div>

        <h2 className="font-semibold mb-4">Create Project</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded mb-3 dark:bg-gray-700"
          placeholder="project name"
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            onClick={() => name && onCreate(name)}
            className="flex-1 py-2 bg-blue-600 text-white rounded"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
