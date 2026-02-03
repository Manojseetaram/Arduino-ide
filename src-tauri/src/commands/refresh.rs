use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
struct RefreshRequest {
    refresh_token: String,
}

#[derive(Debug, Deserialize , Serialize)]
pub struct RefreshResponse {
    pub access_token: String,
}

#[tauri::command]
pub async fn refresh_token(
    refresh_token: String,
) -> Result<RefreshResponse, String> {
    let client = reqwest::Client::new();

    let res = client
        .post("http://cloud.vm1.vithsutra.com:18083/auth/token/refresh")
        .json(&RefreshRequest {
            refresh_token,
        })
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let status = res.status();
    let body = res.text().await.map_err(|e| e.to_string())?;

    // 🔍 Debug once if needed
    // println!("REFRESH RESPONSE: {}", body);

    if !status.is_success() {
        return Err(body);
    }

    serde_json::from_str::<RefreshResponse>(&body)
        .map_err(|e| format!("Parse error: {}", e))
}