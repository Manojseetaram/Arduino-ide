use tauri::command;
use std::fs;
use std::process::Command;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Clone , Debug)]
pub struct Project {
    pub name: String,
    pub path: String,
}

// Helper: get the JSON file path for recent projects
#[command]
pub fn get_recent_file_path() -> PathBuf {
    let mut dir = tauri::api::path::app_data_dir(&tauri::Config::default()).unwrap();
    dir.push("recent_projects.json");
    dir
}

// Helper: read recent projects
#[command]
pub fn read_recent_projects() -> Vec<Project> {
    let path = get_recent_file_path();
    if path.exists() {
        let data = fs::read_to_string(&path).unwrap_or_default();
        serde_json::from_str(&data).unwrap_or_default()
    } else {
        vec![]
    }
}
#[command]
pub fn write_recent_projects(projects: Vec<Project>) -> bool {
    println!("Received projects: {:?}", projects);
    let path = get_recent_file_path();
    if let Ok(json) = serde_json::to_string_pretty(&projects) {
        if let Err(e) = fs::write(&path, json) {
            eprintln!("Failed to write recent projects: {}", e);
            return false;
        }
        true
    } else {
        false
    }
}



#[command]
pub fn create_project(name: String) -> Result<String, String> {
    if name.trim().is_empty() {
        return Err("Project name cannot be empty".into());
    }

    let home = dirs::home_dir().ok_or("Failed to find home directory")?;
    let base_path = home.join("esp-projects");
    fs::create_dir_all(&base_path)
        .map_err(|e| format!("Failed to create base path: {}", e))?;

    let project_path = base_path.join(&name);
    fs::create_dir_all(&project_path)
        .map_err(|e| format!("Failed to create project folder: {}", e))?;

    println!("Creating project at: {}", project_path.display());

    let idf_path = home.join("esp/esp-idf");
    let python = home.join(".espressif/python_env/idf6.0_py3.14_env/bin/python");
    let idf_py = idf_path.join("tools/idf.py");

    if !python.exists() {
        return Err("ESP-IDF python environment not found".into());
    }

    let status = Command::new(&python)
        .arg(idf_py)
        .arg("create-project")
        .arg(&name)
        .current_dir(&base_path)
        .env("IDF_PATH", &idf_path)
        .env("PYTHONPATH", "")
        .status()
        .map_err(|e| format!("Failed to run idf.py: {}", e))?;

    if !status.success() {
        return Err(format!(
            "idf.py create-project failed with exit code: {}",
            status.code().unwrap_or(-1)
        ));
    }

    // ------------------- Update recent projects -------------------
    let mut recent = read_recent_projects();
    // Remove duplicates
    recent.retain(|p| p.name != name);
    // Insert new project at the beginning
    recent.insert(0, Project {
        name: name.clone(),
        path: project_path.to_string_lossy().to_string(),
    });
    // Keep top 5 recent
    if recent.len() > 5 {
        recent.truncate(5);
    }
    write_recent_projects(recent);

    Ok(project_path.to_string_lossy().to_string())
}
