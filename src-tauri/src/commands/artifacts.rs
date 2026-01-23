use tauri::command;
use std::path::Path;
use crate::utils::fs::find_bins;

#[command]
pub fn get_build_artifacts(project_path: String) -> Vec<crate::models::artifact::Artifact> {
    let build_dir = Path::new(&project_path).join("build");
    find_bins(&build_dir)
}
