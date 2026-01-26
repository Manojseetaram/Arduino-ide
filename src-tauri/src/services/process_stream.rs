use tauri::Window;
use std::process::Child;
use std::io::{BufRead, BufReader};

pub fn stream(
    mut child: Child,
    window: Window,
    event_name: &str,
) -> Result<(), String> {
    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to capture stderr")?;

    let out_reader = BufReader::new(stdout);
    let err_reader = BufReader::new(stderr);

  
    let event_out = event_name.to_string();
    let event_err = event_name.to_string();

    let win_out = window.clone();
    std::thread::spawn(move || {
        for line in out_reader.lines() {
            if let Ok(l) = line {
                let _ = win_out.emit(&event_out, l);
            }
        }
    });

    let win_err = window.clone();
    std::thread::spawn(move || {
        for line in err_reader.lines() {
            if let Ok(l) = line {
                let _ = win_err.emit(&event_err, format!(" {}", l));
            }
        }
    });

    let status = child.wait().map_err(|e| e.to_string())?;

    if status.success() {
        Ok(())
    } else {
        Err(format!("Build failed with exit code {:?}", status.code()))
    }
}
