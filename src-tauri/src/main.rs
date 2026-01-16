#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod commands;
mod services;
mod models;
mod protocols;
mod menu;

use menu::app_menu::{build_menu, handle_menu};

fn main() {
    tauri::Builder::default()
        .menu(build_menu())
        .on_menu_event(handle_menu)
        .invoke_handler(tauri::generate_handler![
            commands::project::create_esp_idf_project,
            commands::filesystem::read_folder,
            commands::filesystem::create_folder,
            commands::filesystem::create_file,
            commands::process::run_live_command,
            commands::process::stop_current_process,
            commands::flash::compile_and_flash,
            commands::universal::send_universal
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
