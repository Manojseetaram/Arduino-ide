use serde::Serialize;

#[derive(Serialize)]
pub struct ProjectResult {
    pub success: bool,
    pub path: String,
    pub message: String,
}
