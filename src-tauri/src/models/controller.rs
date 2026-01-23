

use serde::{Serialize , Deserialize };

#[derive(Debug , Serialize , Deserialize)]

pub enum ControllerStatus {
    Available , 
    Reserved,
    Flashing ,
    Success,
    Error,
}

#[derive(Debug , Serialize , Deserialize)]

pub struct controller {
    pub id : String,
    pub model : String,
    pub status : ControllerStatus
}