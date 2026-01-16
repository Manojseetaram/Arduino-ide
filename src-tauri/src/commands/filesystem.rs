use std::{fs, path::PathBuf, fs::File, io::Write};
use tauri::command;
use crate::services::file_tree::read_dir_recursive;
use crate::models::file_tree::FileNode;

#[command]
pub fn read_folder(path: &str) -> tauri::Result<Vec<FileNode>> {
    let path = PathBuf::from(path);
    if !path.exists() { return Ok(vec![]); }

    let root = path.file_name().unwrap().to_string_lossy().to_string();
    Ok(read_dir_recursive(&path, &root)?)
}

#[command]
pub fn create_folder(path: String) -> Result<String, String> {
    fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    Ok("Folder created".into())
}

#[command]
pub fn create_file(path: String, content: Option<String>) -> Result<String, String> {
    let mut file = File::create(&path).map_err(|e| e.to_string())?;
    if let Some(text) = content {
        file.write_all(text.as_bytes()).map_err(|e| e.to_string())?;
    }
    Ok("File created".into())
}
