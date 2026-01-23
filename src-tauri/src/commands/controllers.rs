use crate::services::nats;

#[tauri::command]
pub async fn select_controllers(
    payload: serde_json::Value,
) -> Result<(), String> {
    let data =
        serde_json::to_vec(&payload).map_err(|e| e.to_string())?;

    nats::publish("controllers.select".to_string(), data).await
}
