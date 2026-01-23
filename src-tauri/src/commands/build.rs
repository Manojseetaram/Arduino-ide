use tauri::Window;
use std::process::{Command, Stdio};
use crate::services::process_stream;

#[tauri::command]
pub fn build_project(window: Window) -> Result<(), String> {
    let cmd = Command::new("idf.py")
        .arg("build")
        .stdout(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    process_stream::stream(cmd, window, "build-log")
}
