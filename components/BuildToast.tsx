"use client";

export function BuildToast({ status }: { status: string }) {
  if (status === "idle") return null;

  const base =
    "fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow text-sm z-50";

  if (status === "building") {
    return (
      <div className={`${base} bg-blue-600 text-white`}>
        🔧 Compiling…
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className={`${base} bg-green-600 text-white`}>
        ✅ Compile successful
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={`${base} bg-red-600 text-white`}>
        ❌ Compile failed
      </div>
    );
  }

  return null;
}
