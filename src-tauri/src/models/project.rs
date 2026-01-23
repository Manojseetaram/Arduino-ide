use serde::{Serialize , Deserialize};

#[derive(Debug , Serialize , Deserialize)]

pub struct Project {
    pub name : String,
    pub path : String,
}

#[derive(Debug , Serialize , Deserialize)]

pub enum ProjectFramework {
    EspIdf
}