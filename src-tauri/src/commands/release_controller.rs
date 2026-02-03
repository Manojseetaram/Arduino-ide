use serde::{Deserialize, Serialize};
use reqwest::StatusCode;

#[derive(Debug, Deserialize, Serialize)]
pub struct ReleaseControllerRequest {
    pub controller_id: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ReleaseControllerResponse {
    pub success: bool,
    pub message: Option<String>,
}

#[tauri::command]
pub async fn release_controller(
    access_token: String,
    controller_id: String,
) -> Result<ReleaseControllerResponse, String> {
    let client = reqwest::Client::new();

    let res = client
        .post("http://cloud.vm1.vithsutra.com:18083/student/controllers/release")
        .bearer_auth(access_token)
        .json(&ReleaseControllerRequest { controller_id })
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = res.status();
    let body = res.text().await.map_err(|e| e.to_string())?;

    if status != StatusCode::OK {
        return Err(body);
    }

    serde_json::from_str::<ReleaseControllerResponse>(&body)
        .map_err(|e| format!("Parse error: {}", e))
}
