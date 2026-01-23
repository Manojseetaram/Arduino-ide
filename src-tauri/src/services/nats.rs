pub async fn publish(
    subject: String,
    payload: Vec<u8>,
) -> Result<(), String> {
    let client = async_nats::connect("127.0.0.1:4222")
        .await
        .map_err(|e| e.to_string())?;

    client
        .publish(subject, payload.into())
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}
