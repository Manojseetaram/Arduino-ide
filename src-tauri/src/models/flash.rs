use serde::{Serialize , Deserialize };

#[derive(Debug, Serialize , Deserialize)]

pub struct FlashRequest {
    pub controller_id : String,
    pub firmware_url : String,
    pub timeout_minutes : u32 
}
