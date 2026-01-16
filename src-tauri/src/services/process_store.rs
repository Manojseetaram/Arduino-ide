use std::process::Child;
use std::sync::{Arc, Mutex};
use once_cell::sync::Lazy;

pub static PROCESS_KILLER: Lazy<Arc<Mutex<Option<Child>>>> =
    Lazy::new(|| Arc::new(Mutex::new(None)));
