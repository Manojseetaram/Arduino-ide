use tauri::command;
use std::fs;
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
#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    let p = std::path::Path::new(&path);

    if p.is_dir() {
        return Err("Cannot open a directory".into());
    }

    std::fs::read_to_string(p).map_err(|e| e.to_string())
}
