use std::{path::Path, process::{Command, Stdio}};
use tauri::command;
use crate::models::project::ProjectResult;

#[command]
pub fn create_esp_idf_project(project_name: &str) -> tauri::Result<ProjectResult> {
    let base = "/Users/manojseetaramgowda/Desktop";
    let project_path = Path::new(base).join(project_name);

    if project_path.exists() {
        return Ok(ProjectResult {
            success: false,
            path: project_path.display().to_string(),
            message: "Project already exists".into(),
        });
    }

    let status = Command::new("idf.py")
        .arg("create-project")
        .arg(project_name)
        .current_dir(base)
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .status()?;

    Ok(ProjectResult {
        success: status.success(),
        path: project_path.display().to_string(),
        message: if status.success() {
            "Project created".into()
        } else {
            "Failed to create project".into()
        },
    })
}
