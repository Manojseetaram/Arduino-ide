use crate::services::nats;

#[tauri::command]
pub async fn flash(msg: serde_json::Value) -> Result<(), String> {
    let payload =
        serde_json::to_vec(&msg).map_err(|e| e.to_string())?;

    nats::publish("controller.flash".to_string(), payload).await
}
