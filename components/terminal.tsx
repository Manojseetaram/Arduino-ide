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
      <div>$ Arduino CLI 0.35.3</div>
      <div>$ Compiling sketch...</div>
      <div>$ Uploading...</div>
      <div className="text-green-500">✔ Done</div>
    </div>
  );
}
