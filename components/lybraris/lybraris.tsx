// "use client";

// import { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
// import { Input } from "@/components/ui/input";
// import { invoke } from "@tauri-apps/api/tauri";

// interface Extension {
//   id: string;
//   name: string;
//   description: string;
//   installed: boolean;
// }

// interface ExtensionsDialogProps {
//   onInstall?: (newFiles: any[]) => void; // callback to VSCodeEditor
// }

// const mockExtensions: Extension[] = [
//   {
//     id: "ext-1",
//     name: "Rust Analyzer",
//     description: "Adds Rust language support.",
//     installed: false,
//   },
//   {
//     id: "ext-2",
//     name: "Prettier Formatter",
//     description: "Auto-format your code with Prettier.",
//     installed: false,
//   },
//   {
//     id: "ext-3",
//     name: "Python Tools",
//     description: "Python linting, debugging, and IntelliSense.",
//     installed: true,
//   },
// ];

// export default function ExtensionsDialog({ onInstall }: ExtensionsDialogProps) {
//   const [extensions, setExtensions] = useState(mockExtensions);
//   const [installing, setInstalling] = useState<string | null>(null);
//   const [progress, setProgress] = useState(0);
//   const [search, setSearch] = useState("");

//   const handleInstall = (id: string) => {
//     setInstalling(id);
//     setProgress(0);

//     const interval = setInterval(async () => {
//       setProgress((p) => {
//         if (p >= 100) {
//           clearInterval(interval);

//           setExtensions((prev) =>
//             prev.map((ext) =>
//               ext.id === id ? { ...ext, installed: true } : ext
//             )
//           );

//           // 👇 Call backend read_folder after install
//           invoke("read_folder", {
//             path: "/home/shettyanikethan/Desktop", // you can adjust this
//           })
//             .then((files: any) => {
//               if (onInstall) onInstall(files);
//             })
//             .catch((err) => console.error("Error reading folder:", err));

//           setInstalling(null);
//           return 100;
//         }
//         return p + 20;
//       });
//     }, 400);
//   };

//   const filteredExtensions = extensions.filter(
//     (ext) =>
//       ext.name.toLowerCase().includes(search.toLowerCase()) ||
//       ext.description.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button variant="outline" size="icon" className="ml-4">
//           ⚡
//         </Button>
//       </DialogTrigger>

//       <DialogContent className="max-w-lg">
//         <DialogHeader>
//           <DialogTitle>Extensions Marketplace</DialogTitle>
//         </DialogHeader>

//         {/* 🔍 Search bar */}
//         <div className="mb-4">
//           <Input
//             placeholder="Search extensions..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>

//         {/* List */}
//         <div className="space-y-4 max-h-72 overflow-y-auto">
//           {filteredExtensions.length === 0 ? (
//             <p className="text-sm text-muted-foreground">No results found.</p>
//           ) : (
//             filteredExtensions.map((ext) => (
//               <div
//                 key={ext.id}
//                 className="p-3 border rounded-lg flex justify-between items-center"
//                 draggable={ext.installed}
//                 onDragStart={(e) => {
//                   if (ext.installed) {
//                     e.dataTransfer.setData("extension-id", ext.id);
//                   }
//                 }}
//               >
//                 <div>
//                   <h3 className="font-semibold">{ext.name}</h3>
//                   <p className="text-sm text-muted-foreground">
//                     {ext.description}
//                   </p>
//                 </div>
//                 <div>
//                   {ext.installed ? (
//                     <Button size="sm" disabled>
//                       Installed
//                     </Button>
//                   ) : installing === ext.id ? (
//                     <div className="w-24">
//                       <Progress value={progress} />
//                     </div>
//                   ) : (
//                     <Button size="sm" onClick={() => handleInstall(ext.id)}>
//                       Install
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { invoke } from "@tauri-apps/api/tauri";

// ✅ Extension interface with packageName
interface Extension {
  id: string;
  name: string;
  description: string;
  installed: boolean;
  packageName: string; 
}

interface ExtensionsDialogProps {
  onInstall?: (newFiles: any[]) => void; // callback to refresh explorer
}

// ✅ Mock data with valid npm package names
const mockExtensions: Extension[] = [
  {
    id: "ext-1",
    name: "Rust Analyzer",
    description: "Adds Rust language support.",
    installed: false,
    packageName: "rust-analyzer",
  },
  {
    id: "ext-2",
    name: "Prettier Formatter",
    description: "Auto-format your code with Prettier.",
    installed: false,
    packageName: "prettier",
  },
  {
    id: "ext-3",
    name: "Python Tools",
    description: "Python linting, debugging, and IntelliSense.",
    installed: true,
    packageName: "python-tools",
  },
];

export default function ExtensionsDialog({ onInstall }: ExtensionsDialogProps) {
  const [extensions, setExtensions] = useState<Extension[]>(mockExtensions);
  const [installing, setInstalling] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [search, setSearch] = useState("");

  // ✅ Install extension via Tauri backend
  const handleInstall = async (id: string, packageName: string) => {
    setInstalling(id);
    setProgress(0);

    try {
      const result = await invoke("install_extension", {
        projectPath: "/Users/manojseetaramgowda", // adjust your project root
        packageName,
      });

      console.log("Install result:", result);

      // fake progress bar animation
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);

            setExtensions((prev) =>
              prev.map((ext) =>
                ext.id === id ? { ...ext, installed: true } : ext
              )
            );

            // Refresh explorer after install
            invoke("read_folder", { path: "/Users/manojseetaramgowda" })
              .then((files: any) => {
                if (onInstall) onInstall(files);
              })
              .catch((err) => console.error("Error reading folder:", err));

            setInstalling(null);
            return 100;
          }
          return p + 20;
        });
      }, 400);
    } catch (err) {
      console.error("Error installing extension:", err);
      setInstalling(null);
    }
  };

  // Filter extensions based on search input
  const filteredExtensions = extensions.filter(
    (ext) =>
      ext.name.toLowerCase().includes(search.toLowerCase()) ||
      ext.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="ml-4">
          ⚡
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Extensions Marketplace</DialogTitle>
        </DialogHeader>

        {/* Search bar */}
        <div className="mb-4">
          <Input
            placeholder="Search extensions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Extension list */}
        <div className="space-y-4 max-h-72 overflow-y-auto">
          {filteredExtensions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No results found.</p>
          ) : (
            filteredExtensions.map((ext) => (
              <div
                key={ext.id}
                className="p-3 border rounded-lg flex justify-between items-center"
                draggable={ext.installed}
                onDragStart={(e) => {
                  if (ext.installed) {
                    e.dataTransfer.setData("extension-id", ext.id);
                  }
                }}
              >
                <div>
                  <h3 className="font-semibold">{ext.name}</h3>
                  <p className="text-sm text-muted-foreground">{ext.description}</p>
                </div>
                <div>
                  {ext.installed ? (
                    <Button size="sm" disabled>Installed</Button>
                  ) : installing === ext.id ? (
                    <div className="w-24">
                      <Progress value={progress} />
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleInstall(ext.id, ext.packageName)}
                    >
                      Install
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
