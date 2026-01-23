use serde::{Serialize , Deserialize};

#[derive(Debug , Serialize , Deserialize)]


pub struct Artifact {
    pub name : String ,
    pub path : String,
    pub size_bytes : u64 ,
}
