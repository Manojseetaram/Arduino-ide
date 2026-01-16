use tauri::{command, Window};
use std::{process::{Command, Stdio}, io::{BufRead, BufReader}};
use crate::services::process_store::PROCESS_KILLER;

#[command]
pub async fn run_live_command(
    window: Window,
    command: String,
    args: Vec<String>
) -> Result<(), String> {

    if let Some(mut proc) = PROCESS_KILLER.lock().unwrap().take() {
        let _ = proc.kill();
    }

    let mut child = Command::new(command)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    let stdout = child.stdout.take().unwrap();
    let stderr = child.stderr.take().unwrap();
    *PROCESS_KILLER.lock().unwrap() = Some(child);

    let win = window.clone();
    tauri::async_runtime::spawn(async move {
        for line in BufReader::new(stdout).lines().flatten() {
            let _ = win.emit("terminal-output", line);
        }
    });

    let win = window.clone();
    tauri::async_runtime::spawn(async move {
        for line in BufReader::new(stderr).lines().flatten() {
            let _ = win.emit("terminal-output", format!("[ERR] {}", line));
        }
    });

    Ok(())
}

#[command]
pub fn stop_current_process() {
    if let Some(mut child) = PROCESS_KILLER.lock().unwrap().take() {
        let _ = child.kill();
    }
}
