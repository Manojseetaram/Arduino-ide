use tauri::Window;
use std::process::{Command, Stdio};
use crate::services::process_stream;

#[tauri::command]
pub fn build_project(project_path: String, window: Window) -> Result<(), String> {
    // Find home directory
    let home = dirs::home_dir().ok_or("Failed to find home directory")?;

    // ESP-IDF and Python paths
    let idf_path = home.join("esp/esp-idf");
    let python = home.join(".espressif/python_env/idf6.0_py3.14_env/bin/python");
    let idf_py = idf_path.join("tools/idf.py");

    if !python.exists() {
        return Err("ESP-IDF Python environment not found".into());
    }
    if !idf_py.exists() {
        return Err("idf.py not found in ESP-IDF path".into());
    }

    // Debug print paths
    println!("Python: {}", python.display());
    println!("idf.py: {}", idf_py.display());
    println!("Project path: {}", project_path);

    // Run build command using full Python + idf.py path
    let cmd = Command::new(python)
        .arg(idf_py)
        .arg("build")
        .current_dir(&project_path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    // Stream output line by line to terminal
    let res = process_stream::stream(cmd, window.clone(), "build-log");

    // Emit final success or failure
    match res {
        Ok(_) => {
            let _ = window.emit("build-finished", "Build succeeded");
            Ok(())
        },
        Err(e) => {
            let _ = window.emit("build-finished", &format!("Build failed: {}", e));
            Err(e)
        }
    }
}

#[tauri::command]
pub fn get_project_path(name: String) -> Result<String, String> {
    let home = dirs::home_dir().ok_or("Failed to find home directory")?;
    let path = home.join("esp-projects").join(&name);

    if path.exists() {
        Ok(path.to_string_lossy().to_string())
    } else {
        Err("Project path does not exist".into())
    }
}
