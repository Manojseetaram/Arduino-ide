use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::command;

#[derive(Serialize, Deserialize, Clone)]
pub struct EditorTabState {
    pub project_name: String,
    pub tabs: Vec<EditorTab>,
    pub active_tab_id: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct EditorTab {
    pub id: String,
    pub name: String,
    pub path: String,
    pub content: String,
    pub saved: bool,
    pub tab_type: String, // "file" or "postman"
}

fn get_state_file() -> PathBuf {
    let home = dirs::home_dir().expect("Failed to get home dir");
    let state_dir = home.join(".esp-projects");
    fs::create_dir_all(&state_dir).expect("Failed to create state dir");
    state_dir.join("editor_state.json")
}

#[command]
pub fn save_editor_state(state: Vec<EditorTabState>) -> Result<(), String> {
    let file_path = get_state_file();
    let data = serde_json::to_string_pretty(&state).map_err(|e| e.to_string())?;
    fs::write(file_path, data).map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
pub fn load_editor_state() -> Result<Vec<EditorTabState>, String> {
    let file_path = get_state_file();
    if !file_path.exists() {
        return Ok(vec![]);
    }
    let data = fs::read_to_string(file_path).map_err(|e| e.to_string())?;
    let state: Vec<EditorTabState> = serde_json::from_str(&data).map_err(|e| e.to_string())?;
    Ok(state)
}
