use serde::{Serialize , Deserialize};

#[derive(Debug , Serialize , Deserialize)]

pub struct NatsMessage<T> {
    pub event : String ,
    pub payload : T ,
}