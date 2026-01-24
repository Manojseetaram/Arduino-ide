// lib/tauriApi.ts
import { invoke } from "@tauri-apps/api/tauri";
import { ExplorerNode } from "@/components/explorer/types";

export async function fetchProjectFiles(projectPath: string): Promise<ExplorerNode[]> {
  try {
    const files = await invoke<ExplorerNode[]>("list_project_files", { projectPath });
    console.log("Fetched files:", files); // Debug log
    return files;
  } catch (err) {
    console.error("Failed to list files", err);
    return [];
  }
}

export async function createProject(name: string): Promise<string> {
  try {
    const projectPath = await invoke<string>("create_project", { name });
    console.log("Project created at:", projectPath); // Debug log
    return projectPath;
  } catch (err) {
    console.error("Failed to create project", err);
    throw err;
  }
}