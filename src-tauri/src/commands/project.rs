use tauri::command;
use std::process::Command;

#[command]
pub fn create_project(name: String, base_path: String) -> Result<(), String> {
    let status = Command::new("idf.py")
        .args(["create-project", &name])
        .current_dir(base_path)
        .status()
        .map_err(|e| e.to_string())?;

    status.success().then(|| ()).ok_or("Project creation failed".into())
}
