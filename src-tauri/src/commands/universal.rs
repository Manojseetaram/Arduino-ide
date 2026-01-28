use tauri::command;
use crate::models::payloads::UniversalPayload;
use crate::protocols::{http, mqtt, mqtt_sn, coap};

#[command]
pub async fn send_universal(
    payload: UniversalPayload
) -> Result<serde_json::Value, String> {

    println!("📥 Received payload from UI:");
    // println!("{:#?}", payload);

    let result = match payload {
        UniversalPayload::HTTP { method, url, headers, body } => {
            println!("🌐 HTTP Request");
            println!("➡ Method: {}", method);
            println!("➡ URL: {}", url);
            println!("➡ Headers: {:?}", headers);
            println!("➡ Body: {:?}", body);

            http::send(method, url, headers, body).await
        }

        UniversalPayload::MQTT { broker, port, topic, qos, message } => {
            println!("📡 MQTT Publish");
            println!("➡ Broker: {}:{}", broker, port);
            println!("➡ Topic: {}", topic);
            println!("➡ QoS: {}", qos);
            println!("➡ Message: {:?}", message);

            mqtt::publish(broker, port, topic, qos, message)
        }

        UniversalPayload::Mqttsn { gateway, port, data } => {
            println!("📡 MQTT-SN Send");
            println!("➡ Gateway: {}:{}", gateway, port);
            println!("➡ Data: {:?}", data);

            mqtt_sn::send(gateway, port, data)
        }

        UniversalPayload::COAP { method, host, path, payload } => {
            println!("📡 CoAP Request");
            println!("➡ Method: {}", method);
            println!("➡ Host: {}", host);
            println!("➡ Path: {}", path);
            println!("➡ Payload: {:?}", payload);

            coap::send(method, host, path, payload)
        }
    };

    match &result {
        Ok(res) => {
            println!("✅ Response:");
            println!("{:#?}", res);
        }
        Err(err) => {
            println!(" Error:");
            println!("{}", err);
        }
    }

    result
}
