"use client";

import { useState, useMemo } from "react";
import { 
  IconSearch, 
  IconFilter, 
  IconDownload, 
  IconStar, 
  IconCheck, 
  IconPackage,
  IconCpu,
  IconTools,
  IconPalette,
  IconRefresh,
  IconArrowUp,
  IconArrowDown,
  IconX,
  IconInfoCircle
} from "@tabler/icons-react";
import { Extension, ExtensionCategory } from "./extensions-types";

interface ExtensionsPanelProps {
  theme: "light" | "dark";
}

// Mock data for Arduino-like extensions
const mockExtensions: Extension[] = [
  {
    id: "1",
    name: "Arduino AVR Boards",
    description: "Official support for Arduino boards (Uno, Mega, Leonardo, etc.)",
    author: "Arduino",
    version: "1.8.6",
    installed: true,
    downloads: 1250000,
    rating: 4.8,
    tags: ["boards", "official", "avr"],
    icon: "⚡"
  },
  {
    id: "2",
    name: "ESP32",
    description: "ESP32 board support for Arduino IDE",
    author: "espressif",
    version: "2.0.11",
    installed: true,
    downloads: 890000,
    rating: 4.7,
    tags: ["boards", "esp32", "wifi", "bluetooth"],
    icon: "📡"
  },
  {
    id: "3",
    name: "Adafruit SSD1306",
    description: "Driver for SSD1306 monochrome OLED displays",
    author: "Adafruit",
    version: "2.5.7",
    installed: false,
    downloads: 450000,
    rating: 4.6,
    tags: ["display", "oled", "adafruit"],
    icon: "🖥️"
  },
  {
    id: "4",
    name: "FastLED",
    description: "Fast LED library for Arduino",
    author: "FastLED",
    version: "3.5.0",
    installed: false,
    downloads: 680000,
    rating: 4.9,
    tags: ["led", "rgb", "animation"],
    icon: "💡"
  },
  {
    id: "5",
    name: "Arduino IoT Cloud",
    description: "Connect your devices to Arduino IoT Cloud",
    author: "Arduino",
    version: "1.8.0",
    installed: true,
    downloads: 320000,
    rating: 4.5,
    tags: ["iot", "cloud", "official"],
    icon: "☁️"
  },
  {
    id: "6",
    name: "Servo",
    description: "Standard servo motor library",
    author: "Arduino",
    version: "1.2.1",
    installed: true,
    downloads: 950000,
    rating: 4.4,
    tags: ["servo", "motor", "official"],
    icon: "⚙️"
  },
  {
    id: "7",
    name: "DHT sensor library",
    description: "Temperature and humidity sensor library",
    author: "Adafruit",
    version: "1.4.4",
    installed: false,
    downloads: 560000,
    rating: 4.3,
    tags: ["sensor", "temperature", "humidity"],
    icon: "🌡️"
  },
  {
    id: "8",
    name: "PlatformIO",
    description: "Professional development platform for embedded systems",
    author: "PlatformIO",
    version: "3.0.0",
    installed: false,
    downloads: 210000,
    rating: 4.8,
    tags: ["platform", "tools", "professional"],
    icon: "🔧"
  }
];

const categories: { id: ExtensionCategory; label: string; icon: React.ReactNode; count: number }[] = [
  { id: 'all', label: 'All', icon: <IconPackage size={14} />, count: mockExtensions.length },
  { id: 'installed', label: 'Installed', icon: <IconCheck size={14} />, count: mockExtensions.filter(e => e.installed).length },
  { id: 'popular', label: 'Popular', icon: <IconStar size={14} />, count: 4 },
  { id: 'boards', label: 'Boards', icon: <IconCpu size={14} />, count: 2 },
  { id: 'tools', label: 'Tools', icon: <IconTools size={14} />, count: 1 },
];

// ... (previous imports and mock data remain the same)

export function ExtensionsPanel({ theme }: ExtensionsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ExtensionCategory>('all');
  const [sortBy, setSortBy] = useState<'name' | 'downloads' | 'rating'>('downloads');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [selectedExtension, setSelectedExtension] = useState<Extension | null>(null);

  const dark = theme === "dark";

  // Filter extensions (same as before)
  const filteredExtensions = useMemo(() => mockExtensions.filter(ext => {
    const matchesSearch = searchQuery === '' || 
      ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedCategory === 'installed') {
      return matchesSearch && ext.installed;
    } else if (selectedCategory === 'boards') {
      return matchesSearch && ext.tags.includes('boards');
    } else if (selectedCategory === 'tools') {
      return matchesSearch && ext.tags.includes('tools');
    } else if (selectedCategory === 'popular') {
      return matchesSearch && ext.downloads > 500000;
    }
    
    return matchesSearch;
  }), [searchQuery, selectedCategory]);

  // Sort extensions (same as before)
  const sortedExtensions = useMemo(() => {
    return [...filteredExtensions].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'downloads') {
        comparison = a.downloads - b.downloads;
      } else if (sortBy === 'rating') {
        comparison = a.rating - b.rating;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredExtensions, sortBy, sortOrder]);

  const handleInstallToggle = (extension: Extension) => {
    if (installingId) return;
    
    setInstallingId(extension.id);
    
    setTimeout(() => {
      console.log(`${extension.installed ? 'Uninstalling' : 'Installing'} ${extension.name}`);
      setInstallingId(null);
      
      // Update local mock data
      const index = mockExtensions.findIndex(e => e.id === extension.id);
      if (index !== -1) {
        mockExtensions[index].installed = !mockExtensions[index].installed;
        
        if (selectedExtension?.id === extension.id) {
          setSelectedExtension(mockExtensions[index]);
        }
      }
    }, 1500);
  };

  const formatDownloads = (downloads: number) => {
    if (downloads >= 1000000) {
      return `${(downloads / 1000000).toFixed(1)}M`;
    }
    if (downloads >= 1000) {
      return `${(downloads / 1000).toFixed(1)}K`;
    }
    return downloads.toString();
  };

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <IconStar
            key={i}
            size={10}
            className={
              i < fullStars
                ? "text-yellow-500 fill-yellow-500"
                : i === fullStars && hasHalfStar
                ? "text-yellow-500 fill-yellow-500/50"
                : "text-gray-400"
            }
          />
        ))}
        <span className="ml-1 text-xs text-gray-500">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header - Compact for sidebar */}
      <div className={`p-3 border-b ${dark ? "border-gray-700" : "border-gray-300"}`}>
        <div className="relative mb-2">
          <IconSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search extensions..."
            className={`w-full pl-8 pr-2 py-1.5 rounded text-xs outline-none ${
              dark
                ? "bg-gray-800 text-gray-200 border border-gray-700"
                : "bg-white text-gray-800 border border-gray-300"
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              <IconX size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <IconFilter size={12} className={dark ? "text-gray-400" : "text-gray-600"} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`text-xs px-1.5 py-1 rounded outline-none ${
                dark
                  ? "bg-gray-800 text-gray-200 border border-gray-700"
                  : "bg-white text-gray-800 border border-gray-300"
              }`}
            >
              <option value="downloads">Downloads</option>
              <option value="rating">Rating</option>
              <option value="name">Name</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={`p-0.5 rounded ${
                dark ? "hover:bg-gray-800" : "hover:bg-gray-200"
              }`}
            >
              {sortOrder === 'asc' ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />}
            </button>
          </div>
        </div>
      </div>

      {/* Categories - Horizontal scroll for narrow sidebar */}
      <div className={`p-2 border-b overflow-x-auto ${dark ? "border-gray-700 bg-gray-800/50" : "border-gray-300 bg-gray-50"}`}>
        <div className="flex gap-1.5 min-w-max">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded whitespace-nowrap ${
                selectedCategory === category.id
                  ? dark
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : dark
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              {category.icon}
              <span className="hidden sm:inline">{category.label}</span>
              <span className={`px-1 py-0.5 rounded text-[10px] min-w-[1.25rem] text-center ${
                selectedCategory === category.id
                  ? dark ? "bg-blue-700" : "bg-blue-400"
                  : dark ? "bg-gray-600" : "bg-gray-300"
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Extensions List - Compact cards */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {sortedExtensions.length > 0 ? (
            sortedExtensions.map((extension) => (
              <div
                key={extension.id}
                className={`rounded p-3 cursor-pointer transition-all ${
                  dark
                    ? "bg-gray-800/50 hover:bg-gray-800 border border-gray-700"
                    : "bg-white hover:bg-gray-50 border border-gray-200"
                } ${selectedExtension?.id === extension.id ? (dark ? "ring-1 ring-blue-500" : "ring-1 ring-blue-400") : ""}`}
                onClick={() => setSelectedExtension(extension)}
              >
                <div className="flex items-start gap-2">
                  {/* Icon */}
                  <div className={`text-xl mt-0.5 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                    {extension.icon || "📦"}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-medium text-sm truncate ${dark ? "text-gray-200" : "text-gray-800"}`}>
                        {extension.name}
                      </h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          extension.installed
                            ? dark ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-700"
                            : dark ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-600"
                        }`}>
                          {extension.installed ? "✓" : "○"}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          dark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700"
                        }`}>
                          v{extension.version}
                        </span>
                      </div>
                    </div>
                    
                    {/* Description - Truncated */}
                    <p className={`text-xs mb-2 line-clamp-2 ${dark ? "text-gray-400" : "text-gray-600"}`}>
                      {extension.description}
                    </p>
                    
                    {/* Stats row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] ${dark ? "text-gray-500" : "text-gray-500"}`}>
                          {extension.author}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <IconDownload size={10} />
                          <span className={`text-[10px] ${dark ? "text-gray-400" : "text-gray-600"}`}>
                            {formatDownloads(extension.downloads)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Rating - Compact */}
                      <div className="flex items-center gap-0.5">
                        <IconStar size={10} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] text-gray-500">
                          {extension.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Tags - Compact and truncated */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {extension.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            dark ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                      {extension.tags.length > 2 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          dark ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-600"
                        }`}>
                          +{extension.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Install button - Only show on hover or selection */}
                {(selectedExtension?.id === extension.id || installingId === extension.id) && (
                  <div className="mt-2 pt-2 border-t border-gray-700 dark:border-gray-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInstallToggle(extension);
                      }}
                      disabled={installingId !== null}
                      className={`w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded text-xs font-medium ${
                        installingId === extension.id
                          ? dark
                            ? "bg-yellow-900/30 text-yellow-400"
                            : "bg-yellow-100 text-yellow-700"
                          : extension.installed
                          ? dark
                            ? "bg-red-900/30 hover:bg-red-800/40 text-red-400"
                            : "bg-red-100 hover:bg-red-200 text-red-700"
                          : dark
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      {installingId === extension.id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                          {extension.installed ? "Uninstalling..." : "Installing..."}
                        </>
                      ) : extension.installed ? (
                        <>
                          <IconPackage size={12} />
                          Uninstall
                        </>
                      ) : (
                        <>
                          <IconDownload size={12} />
                          Install
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={`text-center py-6 px-2 ${dark ? "text-gray-500" : "text-gray-600"}`}>
              <div className="text-2xl mb-1">📦</div>
              <p className="text-sm font-medium mb-1">No extensions found</p>
              <p className="text-xs">Try a different search or category</p>
            </div>
          )}
        </div>
      </div>

      {/* Extension Details Modal/Overlay - FIXED POSITIONING */}
      {selectedExtension && (
        <div 
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setSelectedExtension(null)}
        >
          <div 
            className="absolute inset-0 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden ${
              dark ? "bg-gray-900 text-gray-200" : "bg-white text-gray-800"
            }`}>
              {/* Modal header */}
              <div className={`p-4 border-b flex items-center justify-between ${
                dark ? "border-gray-700" : "border-gray-300"
              }`}>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{selectedExtension.icon || "📦"}</div>
                  <div>
                    <h3 className="font-bold text-lg">{selectedExtension.name}</h3>
                    <p className="text-sm opacity-75">by {selectedExtension.author}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedExtension(null)}
                  className={`p-1.5 rounded ${
                    dark ? "hover:bg-gray-800" : "hover:bg-gray-200"
                  }`}
                >
                  <IconX size={18} />
                </button>
              </div>

              {/* Modal content */}
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">Description</h4>
                    <p className="text-sm">{selectedExtension.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-1">Version</h4>
                      <p className="text-sm">{selectedExtension.version}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Downloads</h4>
                      <p className="text-sm">{formatDownloads(selectedExtension.downloads)}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Rating</h4>
                      <div className="flex items-center gap-1">
                        {getRatingStars(selectedExtension.rating)}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Status</h4>
                      <p className={`text-sm ${selectedExtension.installed ? "text-green-500" : "text-gray-500"}`}>
                        {selectedExtension.installed ? "Installed" : "Not Installed"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedExtension.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-2 py-1 rounded text-xs ${
                            dark ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className={`p-4 border-t ${
                dark ? "border-gray-700" : "border-gray-300"
              }`}>
                <button
                  onClick={() => handleInstallToggle(selectedExtension)}
                  disabled={installingId !== null}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded font-medium ${
                    installingId === selectedExtension.id
                      ? dark
                        ? "bg-yellow-900/30 text-yellow-400"
                        : "bg-yellow-100 text-yellow-700"
                      : selectedExtension.installed
                      ? dark
                        ? "bg-red-900/30 hover:bg-red-800/40 text-red-400"
                        : "bg-red-100 hover:bg-red-200 text-red-700"
                      : dark
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {installingId === selectedExtension.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      {selectedExtension.installed ? "Uninstalling..." : "Installing..."}
                    </>
                  ) : selectedExtension.installed ? (
                    <>
                      <IconPackage size={16} />
                      Uninstall Extension
                    </>
                  ) : (
                    <>
                      <IconDownload size={16} />
                      Install Extension
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer - Compact */}
      <div className={`p-2 border-t ${dark ? "border-gray-700 bg-gray-900/50" : "border-gray-300 bg-gray-50"}`}>
        <div className="flex items-center justify-between text-xs">
          <span className={dark ? "text-gray-400" : "text-gray-600"}>
            {sortedExtensions.length} of {mockExtensions.length}
          </span>
          <button
            onClick={() => {
              console.log("Refreshing extensions");
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
              dark
                ? "text-blue-400 hover:text-blue-300 hover:bg-gray-800"
                : "text-blue-600 hover:text-blue-700 hover:bg-gray-200"
            }`}
          >
            <IconRefresh size={12} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
}