use aws_sdk_s3::Client;
use std::path::Path;
use tokio::fs;

pub async fn upload(
    bucket: &str,
    key: &str,
    path: &Path,
) -> Result<(), String> {
    let config =
        aws_config::load_defaults(aws_config::BehaviorVersion::latest()).await;
    let client = Client::new(&config);

    let data = fs::read(path)
        .await
        .map_err(|e| e.to_string())?;

    client
        .put_object()
        .bucket(bucket)
        .key(key)
        .body(data.into())
        .send()
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}
