use tauri::command;
use std::fs::{self, File};
use std::path::PathBuf;
use serde::Serialize;
#[derive(serde::Serialize)]
pub struct ExplorerNode {
    pub id: String,
    pub name: String,
    pub path: String,
     #[serde(rename = "type")] // 🔥 THIS LINE FIXES EVERYTHING
    pub node_type: String, // "file" or "folder"
    pub children: Option<Vec<ExplorerNode>>,
}


#[tauri::command]
pub fn list_project_files(project_path: String) -> Result<Vec<ExplorerNode>, String> {
    let mut nodes = Vec::new();

    let entries = fs::read_dir(&project_path).map_err(|e| e.to_string())?;

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;
        let is_dir = metadata.is_dir();

        nodes.push(ExplorerNode {
            id: path.to_string_lossy().to_string(),
            name: entry.file_name().to_string_lossy().to_string(),
            path: path.to_string_lossy().to_string(),
            node_type: if is_dir { "folder".into() } else { "file".into() },
            children: if is_dir {
                Some(list_project_files(path.to_string_lossy().to_string())?)
            } else {
                None
            },
        });
    }

    Ok(nodes)
}

#[command]
pub fn read_file(path: String) -> Result<String, String> {
    let p = std::path::Path::new(&path);

    if p.is_dir() {
        return Err("Cannot open a directory".into());
    }

    std::fs::read_to_string(p).map_err(|e| e.to_string())
}

#[command]
pub fn create_folder(project_name: String, relative_path: String) -> Result<String, String> {
    let home = dirs::home_dir().ok_or("No home dir")?;
    let base = home.join("esp-projects").join(project_name);

    let folder_path = base.join(relative_path);

    if folder_path.exists() {
        return Err("Folder already exists".into());
    }

    std::fs::create_dir_all(&folder_path)
        .map_err(|e| e.to_string())?;

    Ok(format!("Folder created: {}", folder_path.display()))
}


#[command]

pub fn create_file(project_name: String, relative_path: String) -> Result<String, String> {
    let home = dirs::home_dir().ok_or("No home dir")?;
    let base = home.join("esp-projects").join(project_name);

    let file_path = base.join(relative_path);

    if file_path.exists() {
        return Err("File already exists".into());
    }

    std::fs::create_dir_all(file_path.parent().unwrap())
        .map_err(|e| e.to_string())?;

    std::fs::File::create(&file_path)
        .map_err(|e| e.to_string())?;

    Ok(format!("Created: {}", file_path.display()))
}

