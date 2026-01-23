use std::io::{BufRead, BufReader};
use std::process::{Child, Stdio};
use tauri::Window;

pub fn stream(
    mut child: Child,
    window: Window,
    event: &str,
) -> Result<(), String> {
    let stdout = child.stdout.take().ok_or("No stdout")?;
    let event = event.to_string();

    std::thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines().flatten() {
            let _ = window.emit(&event, line);
        }
    });

    Ok(())
}
