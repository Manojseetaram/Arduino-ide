use tauri::{Menu, Submenu, CustomMenuItem, WindowMenuEvent, Manager};

pub fn build_menu() -> Menu {
    Menu::new()
        .add_submenu(Submenu::new(
            "File",
            Menu::new().add_item(CustomMenuItem::new("quit", "Quit")),
        ))
}

pub fn handle_menu(event: WindowMenuEvent) {
    match event.menu_item_id() {
        "quit" => {
            event.window().app_handle().exit(0);
        }
        _ => {}
    }
}
