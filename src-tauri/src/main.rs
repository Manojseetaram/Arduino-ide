#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod state;
mod commands;
mod services;
mod utils;
mod models;
mod protocols;

use state::app_state::AppState;

fn main() {
    tauri::Builder::default()
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            commands::project::create_project,
            commands::project::write_recent_projects,
            commands::project::get_recent_file_path,
            commands::project::read_recent_projects,
            commands::build::build_project,
            commands::artifacts::get_build_artifacts,
            commands::upload::upload_bin,
            commands::controllers::select_controllers,
            commands::flash::flash,
            commands::explorer::list_project_files,
            commands::explorer::read_file,
            commands::build::get_project_path,
            commands::editor_state::save_editor_state,
           
            commands::editor_state::load_editor_state,
            commands::explorer::create_folder,
            commands::explorer::create_file,
            commands::editor_state::save_file
        ])
        .run(tauri::generate_context!())
        .expect("error running tauri app");
}
