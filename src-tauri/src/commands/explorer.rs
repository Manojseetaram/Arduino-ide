use tauri::command;
use std::fs;
use std::path::PathBuf;

#[derive(serde::Serialize)]
pub struct ExplorerNode {
    pub id: String,
    pub name: String,
    pub path: String,
    pub type_: String,
    pub children: Option<Vec<ExplorerNode>>,
}

#[command]
pub fn list_project_files(project_path: String) -> Result<Vec<ExplorerNode>, String> {
    fn read_dir(path: &PathBuf) -> Vec<ExplorerNode> {
        let mut nodes = vec![];
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                let path_buf = entry.path();
                let file_name = entry.file_name().to_string_lossy().to_string();
                if path_buf.is_dir() {
                    nodes.push(ExplorerNode {
                        id: uuid::Uuid::new_v4().to_string(),
                        name: file_name.clone(),
                        path: path_buf.to_string_lossy().to_string(),
                        type_: "folder".to_string(),
                        children: Some(read_dir(&path_buf)),
                    });
                } else {
                    nodes.push(ExplorerNode {
                        id: uuid::Uuid::new_v4().to_string(),
                        name: file_name.clone(),
                        path: path_buf.to_string_lossy().to_string(),
                        type_: "file".to_string(),
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
