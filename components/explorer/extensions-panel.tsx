interface ExtensionsPanelProps {
  theme: "light" | "dark";
}

export function ExtensionsPanel({ theme }: ExtensionsPanelProps) {
  const dark = theme === "dark";

  return (
    <div className="p-4 text-center text-gray-500">
      Extensions panel coming soon
    </div>
  );
}