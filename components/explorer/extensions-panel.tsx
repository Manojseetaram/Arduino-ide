"use client";

import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useMemo, useState } from "react";
import {
  IconSearch,
  IconFilter,
  IconDownload,
  IconStar,
  IconPackage,
  IconRefresh,
  IconArrowUp,
  IconArrowDown,
  IconX,
} from "@tabler/icons-react";
import { Extension, ExtensionCategory } from "./extensions-types";

interface ExtensionsPanelProps {
  theme: "light" | "dark";
}

export function ExtensionsPanel({ theme }: ExtensionsPanelProps) {
  const dark = theme === "dark";

  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<ExtensionCategory>("all");
  const [sortBy, setSortBy] =
    useState<"name" | "downloads" | "rating">("downloads");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [selectedExtension, setSelectedExtension] =
    useState<Extension | null>(null);

  /* ================= FETCH CONTROLLERS ================= */

  useEffect(() => {
    const fetchControllers = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("access_token");
        if (!token) return;
        const res = await invokeWithAuth<any>("get_student_controllers");

        const mapped: Extension[] = res.controllers.map((c: any) => ({
          id: c.controller_id,
          name: `Controller ${c.controller_no}`,
          description: `Device: ${c.device_id}`,
          author: "Vithsutra",
          version: "1.0.0",

          // 🔥 KEY FIX
          installed: !c.selectable, // selected == installed

          downloads: 0,
          rating: c.status === "online" ? 5 : 3,
          tags: ["controller", c.status],
          icon: c.status === "online" ? "🟢" : "🔴",
        }));

        setExtensions(mapped);
      } catch (err) {
        console.error("Failed to load controllers", err);
      } finally {
        setLoading(false);
      }
    };

    fetchControllers();
  }, []);

  async function invokeWithAuth<T>(
    command: string,
    args: any = {}
  ): Promise<T> {
    const accessToken = localStorage.getItem("access_token");

    try {
      return await invoke<T>(command, {
        ...args,
        accessToken,
      });
    } catch (err: any) {
      const msg = String(err);

      // ❌ Do NOT retry if refresh itself failed
      if (!msg.includes("expired")) {
        throw err;
      }

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        throw new Error("No refresh token found");
      }

      // 🔁 Refresh ONCE
      const refreshed: any = await invoke("refresh_token", {
        refreshToken,
      });

      if (!refreshed?.access_token) {
        throw new Error("Refresh failed");
      }

      localStorage.setItem("access_token", refreshed.access_token);

      // 🔁 Retry original call ONCE
      return await invoke<T>(command, {
        ...args,
        accessToken: refreshed.access_token,
      });
    }
  }

  /* ================= FILTER ================= */

  const filteredExtensions = useMemo(() => {
    return extensions.filter((ext) => {
      const matchesSearch =
        searchQuery === "" ||
        ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ext.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ext.tags.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        );

      if (selectedCategory === "installed")
        return matchesSearch && ext.installed;
      if (selectedCategory === "boards")
        return matchesSearch && ext.tags.includes("boards");
      if (selectedCategory === "tools")
        return matchesSearch && ext.tags.includes("tools");
      if (selectedCategory === "popular")
        return matchesSearch && ext.downloads > 500000;

      return matchesSearch;
    });
  }, [extensions, searchQuery, selectedCategory]);

  /* ================= SORT ================= */

  const sortedExtensions = useMemo(() => {
    return [...filteredExtensions].sort((a, b) => {
      let val = 0;

      if (sortBy === "name") val = a.name.localeCompare(b.name);
      if (sortBy === "downloads") val = a.downloads - b.downloads;
      if (sortBy === "rating") val = a.rating - b.rating;

      return sortOrder === "asc" ? val : -val;
    });
  }, [filteredExtensions, sortBy, sortOrder]);

  /* ================= INSTALL / UNINSTALL ================= */

  const handleInstallToggle = async (ext: Extension) => {
    if (installingId) return;
    setInstallingId(ext.id);

    try {
      if (!ext.installed) {
        // 🔒 SELECT CONTROLLER
        await invokeWithAuth("select_controller", {
          controllerId: ext.id,
        });
      } else {
        // 🔓 RELEASE CONTROLLER
        await invokeWithAuth("release_controller", {
          controllerId: ext.id,
        });
      }

      // 🔄 Refresh list from backend (SOURCE OF TRUTH)
      await refreshControllers();
    } catch (err) {
      console.error("Controller action failed", err);
      
      // CORRECTED ERROR HANDLING ADDED HERE
      const msg = String(err);
      if (msg.includes("no rows")) {
        alert("Controller not available or already in use");
      } else {
        alert(msg);
      }
    } finally {
      setInstallingId(null);
    }
  };

  const refreshControllers = async () => {
    try {
      setLoading(true);
      const res = await invokeWithAuth<any>("get_student_controllers");

      const mapped: Extension[] = res.controllers.map((c: any) => ({
        id: c.controller_id,
        name: `Controller ${c.controller_no}`,
        description: `Device: ${c.device_id}`,
        author: "Vithsutra",
        version: "1.0.0",
        installed: !c.selectable,
        downloads: 0,
        rating: c.status === "online" ? 5 : 3,
        tags: ["controller", c.status],
        icon: c.status === "online" ? "🟢" : "🔴",
      }));

      setExtensions(mapped);
    } catch (err) {
      console.error("Failed to load controllers", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDownloads = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}K`
      : n.toString();

  /* ================= UI ================= */

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div
        className={`p-3 border-b ${
          dark ? "border-gray-700" : "border-gray-300"
        }`}
      >
        <div className="relative">
          <IconSearch
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
            size={14}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search controllers..."
            className={`w-full pl-8 pr-2 py-1.5 rounded text-xs ${
              dark
                ? "bg-gray-800 text-gray-200 border border-gray-700"
                : "bg-white text-gray-800 border border-gray-300"
            }`}
          />
        </div>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {loading && (
          <div className="text-center text-xs text-gray-500 py-4">
            Loading controllers…
          </div>
        )}

        {!loading &&
          sortedExtensions.map((ext) => (
            <div
              key={ext.id}
              onClick={() => setSelectedExtension(ext)}
              className={`p-3 rounded cursor-pointer border ${
                dark
                  ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{ext.icon}</span>
                  <div>
                    <div className="text-sm font-medium">{ext.name}</div>
                    <div className="text-xs text-gray-500">
                      {ext.description}
                    </div>
                  </div>
                </div>

                <button
                  disabled={
                    installingId === ext.id ||
                    (!ext.installed && !ext.tags.includes("online"))
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInstallToggle(ext);
                  }}
                  className={`px-3 py-1 text-xs rounded ${
                    ext.installed
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-500 text-white disabled:opacity-50"
                  }`}
                >
                  {installingId === ext.id
                    ? "..."
                    : ext.installed
                    ? "Release"
                    : "Select"}
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* FOOTER */}
      <div
        className={`p-2 border-t text-xs flex justify-between ${
          dark ? "border-gray-700 bg-gray-900/50" : "border-gray-300 bg-gray-50"
        }`}
      >
        <span>{sortedExtensions.length} controllers</span>
        <button
          onClick={refreshControllers}
          className="flex items-center gap-1 text-blue-500"
        >
          <IconRefresh size={12} />
          Refresh
        </button>
      </div>
    </div>
  );
}