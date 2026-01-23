use std::sync::Mutex;

#[derive(Default)]

pub struct AppState {
    pub active_project : Mutex <Option<String>>,
    pub selected_controllers : Mutex<Vec<String>>,

}
