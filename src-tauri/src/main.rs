#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod commands;
mod services;
mod models;
mod protocols;
mod menu;
mod utils;
mod state;
use menu::app_menu::{build_menu, handle_menu};

fn main() {
    tauri::Builder::default()
        .menu(build_menu())
        .on_menu_event(handle_menu)
        .invoke_handler(tauri::generate_handler![
           
            commands::universal::send_universal
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
