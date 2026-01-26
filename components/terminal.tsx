"use client";

interface Props {
  theme: "light" | "dark";
}

export default function Terminal({ theme }: Props) {
  return (
    <div
      className={`h-full p-3 font-mono text-xs overflow-y-auto ${
        theme === "dark"
          ? "bg-black text-green-400"
          : "bg-white text-gray-800"
      }`}
    >
    
    </div>
  );
}
