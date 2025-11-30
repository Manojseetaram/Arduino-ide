// "use client";
// import { useRouter } from "next/navigation";

// export default function TopBar() {
//   return (
//     <div
//       className="
//         w-full h-10
//         bg-[#1d1d1f]
//         text-white
//         flex items-center
//         px-3 gap-4
//         select-none
//         border-b border-[#333]
//         drag-region
//       "
//       style={{ WebkitAppRegion: "drag" }}
//     >
//       {/* Mac Traffic Lights */}
//       <div className="flex gap-2 mr-4" style={{ WebkitAppRegion: "no-drag" }}>
//         <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
//         <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
//         <div className="w-3 h-3 rounded-full bg-[#28c840]" />
//       </div>

//       {/* Search Bar */}
//       <input
//         placeholder="Search..."
//         className="
//           bg-[#2b2b2d]
//           px-3 py-1 rounded-md w-80 text-sm
//           focus:outline-none
//         "
//         style={{ WebkitAppRegion: "no-drag" }}
//       />

//       {/* Tabs */}
//       <div
//         className="flex gap-3 ml-6"
//         style={{ WebkitAppRegion: "no-drag" }}
//       >
//         <div className="px-3 py-1 bg-[#2b2b2d] rounded-md text-sm">
//           Your Repositories
//         </div>
//         <div className="px-3 py-1 bg-[#2b2b2d] rounded-md text-sm">
//           Request Assistance
//         </div>
//       </div>

//       {/* Right Side Icons */}
//       <div className="ml-auto flex items-center gap-4 text-xs"
//         style={{ WebkitAppRegion: "no-drag" }}
//       >
//         <span>🔋 38%</span>
//         <span>📶</span>
//         <span>🕓</span>
//       </div>
//     </div>
//   );
// }
