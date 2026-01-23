use std::path::Path;
use crate::services::s3;

#[tauri::command]
pub async fn upload_bin(
    bucket: String,
    key: String,
    bin_path: String,
) -> Result<String, String> {
    s3::upload(&bucket, &key, Path::new(&bin_path)).await?;
    Ok("Upload successful".into())
}
