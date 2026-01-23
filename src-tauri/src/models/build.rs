use serde::{Serialize , Deserialize};

#[derive(Debug , Serialize , Deserialize)]

pub enum BuildStatus {
    Idle,
    Building,
    Success,
    Failed
}

#[derive(Debug, Serialize , Deserialize)]

pub struct BuildRequest {
    pub project_path : String
}