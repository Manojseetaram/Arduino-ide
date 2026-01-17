"use client";

import Editor from "@monaco-editor/react";

interface Props {
  theme: "light" | "dark";
}

export function MonacoEditor({ theme }: Props) {
  return (
    <Editor
      height="100%"
      defaultLanguage="cpp"
      defaultValue="// Arduino sketch"
      theme={theme === "dark" ? "vs-dark" : "light"}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
      }}
    />
  );
}
