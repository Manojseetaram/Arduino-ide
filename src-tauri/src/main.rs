
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod state;
mod commands;
mod services;
mod utils;
mod models;
mod protocols;
use state::app_state::AppState;
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu , Manager};
use uuid::Uuid;
fn main() {
    
    let new_project = CustomMenuItem::new("new_project".to_string(), "New Project");
    let open_project = CustomMenuItem::new("open_project".to_string(), "Open Project");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");

    let file_menu = Menu::new()
        .add_item(new_project)
        .add_item(open_project)
        .add_native_item(MenuItem::Separator)
        .add_item(quit);

    let edit_menu = Menu::new()
        .add_native_item(MenuItem::Undo)
        .add_native_item(MenuItem::Redo)
        .add_native_item(MenuItem::Cut)
        .add_native_item(MenuItem::Copy)
        .add_native_item(MenuItem::Paste);

    let view_menu = Menu::new()
        .add_native_item(MenuItem::EnterFullScreen);

    let window_menu = Menu::new()
        .add_native_item(MenuItem::Minimize)
        .add_native_item(MenuItem::Zoom);

    let menu = Menu::new()
        .add_submenu(Submenu::new("File", file_menu))
        .add_submenu(Submenu::new("Edit", edit_menu))
        .add_submenu(Submenu::new("View", view_menu))
        .add_submenu(Submenu::new("Window", window_menu));

    tauri::Builder::default()
        .menu(menu)
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
            commands::editor_state::save_file,
            commands::explorer::delete_path,
            commands::explorer::rename_path,
            commands::build::open_terminal_instantly,
            commands::project::open_project_dialog,

        ])
       .on_menu_event(|event| {
    let window = event.window();

    match event.menu_item_id() {


"new_project" => {
    let window_label = format!("dashboard-{}", Uuid::new_v4());
    tauri::WindowBuilder::new(
        
        &event.window().app_handle(),
        window_label,
        tauri::WindowUrl::App("/dashboard".into()),
    )
    .title("Create Project")
    .inner_size(900.0, 600.0)
    .build()
    .ok();
}

        "open_project" => {
            println!("Open Project clicked");
            let _ = window.emit("menu-open-project", ());
        }
        "quit" => {
            std::process::exit(0);
        }
        _ => {}
    }
})

        .run(tauri::generate_context!())
        .expect("error running tauri app");
}
