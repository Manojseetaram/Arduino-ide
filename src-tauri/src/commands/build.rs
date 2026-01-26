use tauri::Window;
use std::process::{Command, Stdio};
use crate::services::process_stream;

#[tauri::command]
pub fn build_project(project_path: String, window: Window) -> Result<(), String> {
    let home = dirs::home_dir().ok_or("Failed to find home directory")?;

    let idf_path = home.join("esp/esp-idf");
    let python = home.join(".espressif/python_env/idf6.0_py3.14_env/bin/python");
    let idf_py = idf_path.join("tools/idf.py");

    if !python.exists() {
        return Err("ESP-IDF Python environment not found".into());
    }
    if !idf_py.exists() {
        return Err("idf.py not found in ESP-IDF path".into());
    }

    println!("Python: {}", python.display());
    println!("idf.py: {}", idf_py.display());
    println!("Project path: {}", project_path);

    let child = Command::new(python)
        .arg(idf_py)
        .arg("build")
        .current_dir(&project_path)
        .env("IDF_PATH", &idf_path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    let result = process_stream::stream(child, window.clone(), "build-log");

    match result {
        Ok(_) => {
            let _ = window.emit("build-finished", "Build succeeded");
            Ok(())
        }
        Err(e) => {
            let _ = window.emit("build-finished", format!("Build failed: {}", e));
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
