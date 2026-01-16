use std::{
    io::{BufRead, BufReader},
    process::{Command, Stdio},
};
use tauri::{command, AppHandle, Manager}; // 👈 IMPORTANT

#[command]
pub fn compile_and_flash(app: AppHandle) {
    app.emit_all("terminal-output", "🔥 compile_and_flash() CALLED")
        .ok();

    std::thread::spawn(move || {
        let mut child = Command::new("ping")
            .arg("google.com")
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .expect("Failed to start flash command");

        let stdout = child.stdout.take().unwrap();
        let stderr = child.stderr.take().unwrap();

        let app_out = app.clone();
        std::thread::spawn(move || {
            for line in BufReader::new(stdout).lines().flatten() {
                let _ = app_out.emit_all("terminal-output", line);
            }
        });

        let app_err = app.clone();
        std::thread::spawn(move || {
            for line in BufReader::new(stderr).lines().flatten() {
                let _ = app_err.emit_all(
                    "terminal-output",
                    format!("[ERR] {}", line),
                );
            }
        });

        child.wait().ok();
    });
}
