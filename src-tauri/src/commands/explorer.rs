use tauri::command;
use std::fs::{self, File};
use std::path::PathBuf;

#[derive(serde::Serialize)]
pub struct ExplorerNode {
    pub id: String,
    pub name: String,
    pub path: String,
    pub node_type: String, // "file" or "folder"
    pub children: Option<Vec<ExplorerNode>>,
}


#[command]
pub fn list_project_files(project_path: String) -> Result<Vec<ExplorerNode>, String> {
    fn read_dir(path: &PathBuf) -> Vec<ExplorerNode> {
        let mut nodes = vec![];
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                let path = entry.path();
                let name = entry.file_name().to_string_lossy().to_string();
                if path.is_dir() {
                    nodes.push(ExplorerNode {
                        id: path.to_string_lossy().to_string(),
                        name,
                        path: path.to_string_lossy().to_string(),
                        node_type: "folder".into(),
                        children: Some(read_dir(&path)),
                    });
                } else {
                    nodes.push(ExplorerNode {
                        id: path.to_string_lossy().to_string(),
                        name,
                        path: path.to_string_lossy().to_string(),
                        node_type: "file".into(),
                        children: None,
                    });
                }
            }
        }
        nodes
    }

    let path = PathBuf::from(project_path);
    if !path.exists() {
        return Err("Project path does not exist".into());
    }

    Ok(read_dir(&path))
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

