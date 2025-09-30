// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { invoke } from "@tauri-apps/api/tauri";

// export default function Dashboard() {
//   const router = useRouter();
//   const [projects, setProjects] = useState<{ path: string; name: string }[]>([]);

//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         // Replace with your Rust command to list project folders
//         const folderList: string[] = await invoke("list_projects", { folder: "/home/user/projects" });
//         setProjects(folderList.map((f) => ({ path: f, name: f.split("/").pop() || f })));
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     fetchProjects();
//   }, []);

//   const openProject = (path: string) => {
//     router.push(`/editor?path=${encodeURIComponent(path)}`);
//   };

//   const createNewProject = async () => {
//     const newFolder = `/home/user/projects/project-${Date.now()}`;
//     await invoke("create_folder", { path: newFolder }); // Rust command to create folder
//     openProject(newFolder);
//   };

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl mb-4">Recent Projects</h1>
//       {projects.length > 0 ? (
//         <div className="mb-4">
//           {projects.map((p) => (
//             <div
//               key={p.path}
//               className="p-2 border mb-2 cursor-pointer"
//               onClick={() => openProject(p.path)}
//             >
//               {p.name}
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p>No recent projects.</p>
//       )}
//       <button
//         onClick={createNewProject}
//         className="p-2 bg-blue-500 text-white rounded"
//       >
//         + New Project
//       </button>
//     </div>
//   );
// }
