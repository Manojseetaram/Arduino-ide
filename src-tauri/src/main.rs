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
            commands::build::build_project,
            commands::artifacts::get_build_artifacts,
            commands::upload::upload_bin,
            commands::controllers::select_controllers,
            commands::flash::flash,
            commands::explorer::list_project_files
        ])
        .run(tauri::generate_context!())
        .expect("error running tauri app");
}
