// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs, path::{Path, PathBuf}, process::{Command, Stdio}};


#[tauri::command]
fn hello() -> String{
  "hello world".to_string() 
}

#[tauri::command]
fn create_esp_idf_project(project_name: &str) -> tauri::Result<()> {
  let project_path = Path::new("/home/shettyanikethan/Desktop").join(project_name);

  if project_path.exists() {
      eprintln!(" Project already exists at {}", project_path.display());
      return Ok(());
  }

  println!(" Creating new ESP-IDF project: {}", project_name);


  let status = Command::new("idf.py")
        .arg("create-project")
        .arg(project_name)
        .current_dir("/home/shettyanikethan/Desktop") 
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .status()?;

  if status.success() {
      println!(" Project created at {}", project_path.display());
  } else {
      eprintln!(" Failed to create project.");
  }

  Ok(())
}



#[derive(Debug, serde::Serialize)]
pub struct FileNode {
    pub id: String,
    pub name: String,
    pub r#type: String, // "file" or "folder"
    pub content: Option<String>,
    pub children: Option<Vec<FileNode>>,
}

fn read_dir_recursive(path: &Path) -> std::io::Result<Vec<FileNode>> {
    let mut nodes = Vec::new();

    for entry in fs::read_dir(path)? {
        let entry = entry?;
        let metadata = entry.metadata()?;
        let file_name = entry.file_name().into_string().unwrap_or_default();

        if metadata.is_dir() {
            let children = read_dir_recursive(&entry.path())?;
            nodes.push(FileNode {
                id: entry.path().to_string_lossy().to_string(),
                name: file_name,
                r#type: "folder".to_string(),
                content: None,
                children: Some(children),
            });
        } else {
            let content = fs::read_to_string(&entry.path()).unwrap_or_default();
            nodes.push(FileNode {
                id: entry.path().to_string_lossy().to_string(),
                name: file_name,
                r#type: "file".to_string(),
                content: Some(content),
                children: None,
            });
        }
    }

    Ok(nodes)
}

#[tauri::command]
 fn read_folder(path: &str) -> tauri::Result<Vec<FileNode>> {
    let path = PathBuf::from(path);
    if !path.exists() || !path.is_dir() {
        return Ok(vec![]);
    }
    let files = read_dir_recursive(&path)?;
    Ok(files)
}



fn main() {
  tauri::Builder::default()
  .invoke_handler(tauri::generate_handler![hello,create_esp_idf_project,read_folder])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
