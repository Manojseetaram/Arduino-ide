use tauri::Window;
use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader};
use std::thread;

#[tauri::command]
pub fn build_project(project_path: String, window: Window) -> Result<(), String> {
    let home = dirs::home_dir().ok_or("Failed to find home directory")?;
    let esp_idf = home.join("esp/esp-idf/export.sh");

    if !esp_idf.exists() {
        return Err("ESP-IDF export.sh not found".into());
    }

    // Tell frontend build started
    let _ = window.emit("build-log", "==> Starting ESP-IDF build...");
    let _ = window.emit("build-log", "==> Loading ESP-IDF environment...");

    let mut child = Command::new("bash")
        .arg("-c")
        .arg(format!(
            "source {} && idf.py build",
            esp_idf.display()
        ))
        .current_dir(&project_path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to capture stderr")?;

    let win_out = window.clone();
    let win_err = window.clone();

    // stdout thread
    thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines().flatten() {
            let _ = win_out.emit("build-log", line);
        }
    });

    // stderr thread
    thread::spawn(move || {
        let reader = BufReader::new(stderr);
        for line in reader.lines().flatten() {
            let _ = win_err.emit("build-log", format!("ERROR: {}", line));
        }
    });

    let status = child.wait().map_err(|e| e.to_string())?;

    if status.success() {
        let _ = window.emit("build-finished", "Build successful");
        Ok(())
    } else {
        let _ = window.emit("build-finished", "Build failed");
        Err("Build failed".into())
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
