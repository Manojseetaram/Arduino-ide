use tauri::Window;
use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader};
use std::thread;

#[tauri::command]
pub fn build_project(project_path: String, window: Window) -> Result<(), String> {
    thread::spawn(move || {
        let home = match dirs::home_dir() {
            Some(h) => h,
            None => {
                let _ = window.emit("build-log", "Home directory not found");
                return;
            }
        };

        let esp_idf = home.join("esp/esp-idf/export.sh");

        if !esp_idf.exists() {
            let _ = window.emit("build-log", "ESP-IDF export.sh not found");
            let _ = window.emit("build-finished", "Build failed");
            return;
        }

        let _ = window.emit("build-log", " Starting ESP-IDF build...");
let command = format!(
r#"
set -e
source "{}"

idf.py build
idf.py merge-bin -o merged.bin

# keep only merged.bin inside build
find build -mindepth 1 ! -name 'merged.bin' -exec rm -rf {{}} +
"#,
esp_idf.display()
);






        let mut child = match Command::new("bash")
            .arg("-lc")
            .arg(command)
            .current_dir(&project_path)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
        {
            Ok(c) => c,
            Err(e) => {
                let _ = window.emit("build-log", format!("❌ Failed to start build: {}", e));
                let _ = window.emit("build-finished", "Build failed");
                return;
            }
        };

        let stdout = child.stdout.take().unwrap();
        let stderr = child.stderr.take().unwrap();

        let win_out = window.clone();
        let win_err = window.clone();

        // stdout streaming
        thread::spawn(move || {
            let reader = BufReader::new(stdout);
            for line in reader.lines().flatten() {
                let _ = win_out.emit("build-log", line);
            }
        });

        // stderr streaming
        thread::spawn(move || {
            let reader = BufReader::new(stderr);
            for line in reader.lines().flatten() {
                let _ = win_err.emit("build-log", format!("⚠ {}", line));
            }
        });

        let status = child.wait();

        match status {
            Ok(s) if s.success() => {
                let _ = window.emit("build-log", "✅ Build complete (only merged.bin kept)");
                let _ = window.emit("build-finished", "Build successful");
                let _ = window.emit("refresh-project-files", project_path);
            }
            _ => {
                let _ = window.emit("build-finished", "Build failed");
            }
        }
    });

    Ok(())
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

#[tauri::command]
pub fn open_terminal_instantly(window: Window) {
    let _ = window.emit("terminal:force-open", ());
}
