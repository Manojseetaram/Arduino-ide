use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct LoginRequest {
    email: String,
    password: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct LoginResponse {
    pub refresh_token: Option<String>, 
    pub message: Option<String>,
}

#[tauri::command]
pub async fn student_login(
    email: String,
    password: String,
) -> Result<LoginResponse, String> {
    let client = reqwest::Client::new();

    let res = client
        .post("http://cloud.vm1.vithsutra.com:18083/auth/student/login")
        .json(&LoginRequest { email, password })
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = res.status();
    let body = res.text().await.map_err(|e| e.to_string())?;

    if !status.is_success() {
        return Err(body);
    }

    serde_json::from_str::<LoginResponse>(&body)
        .map_err(|e| format!("Login parse error: {}", e))
}
