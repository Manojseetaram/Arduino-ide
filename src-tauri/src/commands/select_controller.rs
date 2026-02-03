use serde::{Deserialize, Serialize};
use reqwest::StatusCode;

#[derive(Debug, Deserialize, Serialize)]
pub struct SelectControllerRequest {
    pub controller_id: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct SelectControllerResponse {
    pub success: bool,
    pub message: Option<String>,
}

#[tauri::command]
pub async fn select_controller(
    access_token: String,
    controller_id: String,
) -> Result<SelectControllerResponse, String> {
    let client = reqwest::Client::new();

    let res = client
        .post("http://cloud.vm1.vithsutra.com:18083/student/controllers/select")
        .bearer_auth(access_token)
        .json(&SelectControllerRequest { controller_id })
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = res.status();
    let body = res.text().await.map_err(|e| e.to_string())?;

    if status != StatusCode::OK {
        return Err(body);
    }

    serde_json::from_str::<SelectControllerResponse>(&body)
        .map_err(|e| format!("Parse error: {}", e))
}
