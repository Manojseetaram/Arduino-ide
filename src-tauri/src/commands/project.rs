use tauri::command;
use std::fs;
use std::path::PathBuf;
use std::process::{Command, Stdio};

#[command]
pub fn create_project(name: String) -> Result<String, String> {
    let mut base_path = dirs::home_dir().ok_or("Failed to find home directory")?;
    base_path.push("esp-projects");

    fs::create_dir_all(&base_path)
        .map_err(|e| format!("Failed to create base path: {}", e))?;

    // Command to run in a shell that sources export.sh
    let shell_cmd = format!(
        ". ~/esp/esp-idf/export.sh && python3 ~/esp/esp-idf/tools/idf.py create-project {}",
        name
    );

    let status = Command::new("bash")
        .arg("-c")
        .arg(shell_cmd)
        .current_dir(&base_path)
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .status()
        .map_err(|e| format!("Failed to run idf.py: {}", e))?;

    if status.success() {
        Ok(base_path.join(&name).to_string_lossy().to_string())
    } else {
        Err("Project creation failed".into())
    }
}
