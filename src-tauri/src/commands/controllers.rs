use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Controller {
    pub controller_id: String,
    pub controller_no: i32,
    pub device_id: String,
    pub status: String,
    pub selectable: bool,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ControllersResponse {
    pub controllers: Vec<Controller>,
    pub status: String,
}

#[tauri::command]
pub async fn get_student_controllers(
    access_token: String,
) -> Result<ControllersResponse, String> {
    let client = reqwest::Client::new();

    let res = client
        .get("http://cloud.vm1.vithsutra.com:18083/student/controllers")
        .bearer_auth(access_token)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = res.status();
    let body = res.text().await.map_err(|e| e.to_string())?;

    if !status.is_success() {
        return Err(body);
    }

    serde_json::from_str::<ControllersResponse>(&body)
        .map_err(|e| format!("Parse error: {}", e))
}
