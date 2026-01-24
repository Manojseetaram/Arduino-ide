use tauri::command;
use std::fs;
use std::process::Command;
use std::env;

#[command]
pub fn create_project(name: String) -> Result<String, String> {
    if name.trim().is_empty() {
        return Err("Project name cannot be empty".into());
    }

    let home = dirs::home_dir().ok_or("Failed to find home directory")?;

    let base_path = home.join("esp-projects");
    fs::create_dir_all(&base_path)
        .map_err(|e| format!("Failed to create base path: {}", e))?;

    let idf_path = home.join("esp/esp-idf");
    let python = home.join(".espressif/python_env/idf6.0_py3.14_env/bin/python");
    let idf_py = idf_path.join("tools/idf.py");

    if !python.exists() {
        return Err("ESP-IDF python environment not found".into());
    }

    let status = Command::new(&python)
        .arg(idf_py)
        .arg("create-project")
        .arg(&name)
        .current_dir(&base_path)
        .env("IDF_PATH", &idf_path)
        .env("PYTHONPATH", "")
        .status()
        .map_err(|e| format!("Failed to run idf.py: {}", e))?;

    if !status.success() {
        return Err("idf.py create-project failed".into());
    }

    Ok(base_path.join(&name).to_string_lossy().to_string())
}
