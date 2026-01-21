// components/explorer/postman-panel.tsx
"use client";

import { useState, useEffect } from "react";
import { IconSend } from "@tabler/icons-react";

interface PostmanPanelProps {
  theme: "light" | "dark";
}

function parseCoapUrl(url: string) {
  const clean = url.replace(/^coap:\/\//, "");
  const [hostPort, ...pathParts] = clean.split("/");
  return { host: hostPort, path: pathParts.join("/") };
}

export function PostmanPanel({ theme }: PostmanPanelProps) {
  const dark = theme === "dark";
  const [protocol, setProtocol] = useState<"HTTP" | "MQTT" | "MQTT-SN" | "COAP">("HTTP");

  // HTTP
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);
  const [queryParams, setQueryParams] = useState([{ key: "", value: "" }]);
  const [body, setBody] = useState("");

  // MQTT / MQTT-SN
  const [broker, setBroker] = useState("");
  const [port, setPort] = useState(1883);
  const [topic, setTopic] = useState("");
  const [qos, setQos] = useState(0);

  // COAP
  const [coapMethod, setCoapMethod] = useState("GET");
  const [coapUrl, setCoapUrl] = useState("");

  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"params" | "headers" | "body">("body");

  /* ---------- Reset UI on protocol change ---------- */
  useEffect(() => {
    setBody("");
    setResponse(null);
    setActiveTab(protocol === "HTTP" ? "params" : "body");

    if (protocol !== "HTTP") {
      setHeaders([{ key: "", value: "" }]);
      setQueryParams([{ key: "", value: "" }]);
    }
  }, [protocol]);

  /* ---------- Send Payload ---------- */
  const sendToBackend = async () => {
    setLoading(true);
    setResponse(null);

    let payload: any;

    if (protocol === "COAP") {
      const { host, path } = parseCoapUrl(coapUrl.trim());
      if (!host || !host.includes(":")) {
        setResponse({ error: "Invalid CoAP URL. Use coap://host:port/path" });
        setLoading(false);
        return;
      }
      payload = {
        protocol: "COAP",
        method: coapMethod,
        host,
        path: path || "test",
        payload: body || null,
      };
    }

    if (protocol === "MQTT") {
      payload = {
        protocol: "MQTT",
        broker,
        port,
        topic,
        qos,
        message: body || "",
      };
    }

    if (protocol === "MQTT-SN") {
      // Validate gateway
      if (!broker.trim()) {
        setResponse({ error: "Gateway cannot be empty" });
        setLoading(false);
        return;
      }

      if (!port || port <= 0) {
        setResponse({ error: "Invalid port number" });
        setLoading(false);
        return;
      }

      let mqttsnData: string;
      try {
        mqttsnData = JSON.stringify(JSON.parse(body));
      } catch {
        mqttsnData = body || "";
      }

      payload = {
        protocol: "Mqttsn",
        gateway: broker.trim(),
        port,
        data: mqttsnData
      };

      console.log("📡 MQTT-SN Payload:", payload);
    }

    if (protocol === "HTTP") {
      payload = {
        protocol: "HTTP",
        method,
        url,
        headers: headers.reduce((acc, h) => {
          if (h.key && h.value) acc[h.key] = h.value;
          return acc;
        }, {} as Record<string, string>),
        params: queryParams.reduce((acc, p) => {
          if (p.key && p.value) acc[p.key] = p.value;
          return acc;
        }, {} as Record<string, string>),
        body: body || null,
      };
    }

    try {
      // Note: You'll need to replace this with your actual backend call
      // const res = await invoke("send_universal", { payload });
      // For now, we'll simulate a response
      const res = { 
        status: 200, 
        message: "Request sent successfully", 
        timestamp: new Date().toISOString(),
        payload 
      };
      setResponse(res);
    } catch (e) {
      setResponse({ error: String(e) });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Add/Remove Header/Param Rows ---------- */
  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: "", value: "" }]);
  };

  const removeQueryParam = (index: number) => {
    setQueryParams(queryParams.filter((_, i) => i !== index));
  };

  const updateQueryParam = (index: number, field: "key" | "value", value: string) => {
    const newParams = [...queryParams];
    newParams[index][field] = value;
    setQueryParams(newParams);
  };

  return (
    <div className={`h-full overflow-auto p-4 ${dark ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-gray-800"}`}>
      <div className="flex flex-col gap-4">
        {/* ---------- Top Bar ---------- */}
        <div className={`p-4 rounded-lg ${dark ? "bg-gray-800" : "bg-gray-300"}`}>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <select 
                value={protocol} 
                onChange={e => setProtocol(e.target.value as any)} 
                className={`px-3 py-2 rounded flex-1 ${dark ? "bg-gray-700" : "bg-gray-200"}`}
              >
                <option>HTTP</option>
                <option>MQTT</option>
                <option>MQTT-SN</option>
                <option>COAP</option>
              </select>

              <button 
                onClick={sendToBackend} 
                disabled={loading}
                className={`px-4 py-2 rounded font-semibold flex items-center gap-2 ${
                  dark 
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white" 
                    : "bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                }`}
              >
                <IconSend size={16} />
                {loading ? "Sending…" : "Send"}
              </button>
            </div>

            {protocol === "HTTP" && (
              <div className="flex gap-2">
                <select 
                  value={method} 
                  onChange={e => setMethod(e.target.value)} 
                  className={`px-3 py-2 rounded ${dark ? "bg-gray-700" : "bg-gray-200"}`}
                >
                  {["GET","POST","PUT","PATCH","DELETE"].map(m => <option key={m}>{m}</option>)}
                </select>
                <input 
                  placeholder="https://api.example.com" 
                  value={url} 
                  onChange={e => setUrl(e.target.value)} 
                  className={`px-3 py-2 rounded flex-1 ${dark ? "bg-gray-700" : "bg-gray-200"}`}
                />
              </div>
            )}

            {(protocol === "MQTT" || protocol === "MQTT-SN") && (
              <div className="grid grid-cols-2 gap-2">
                <input 
                  placeholder="Broker/Gateway" 
                  value={broker} 
                  onChange={e => setBroker(e.target.value)} 
                  className={`px-3 py-2 rounded ${dark ? "bg-gray-700" : "bg-gray-200"}`}
                />
                <input 
                  type="number" 
                  placeholder="Port" 
                  value={port} 
                  onChange={e => setPort(+e.target.value)} 
                  className={`px-3 py-2 rounded ${dark ? "bg-gray-700" : "bg-gray-200"}`}
                />
                {protocol === "MQTT" && (
                  <>
                    <input 
                      placeholder="Topic" 
                      value={topic} 
                      onChange={e => setTopic(e.target.value)} 
                      className={`px-3 py-2 rounded ${dark ? "bg-gray-700" : "bg-gray-200"}`}
                    />
                    <select 
                      value={qos} 
                      onChange={e => setQos(+e.target.value)} 
                      className={`px-3 py-2 rounded ${dark ? "bg-gray-700" : "bg-gray-200"}`}
                    >
                      <option value={0}>QoS 0</option>
                      <option value={1}>QoS 1</option>
                      <option value={2}>QoS 2</option>
                    </select>
                  </>
                )}
              </div>
            )}

            {protocol === "COAP" && (
              <div className="flex gap-2">
                <select 
                  value={coapMethod} 
                  onChange={e => setCoapMethod(e.target.value)} 
                  className={`px-3 py-2 rounded ${dark ? "bg-gray-700" : "bg-gray-200"}`}
                >
                  {["GET","POST","PUT","DELETE"].map(m => <option key={m}>{m}</option>)}
                </select>
                <input 
                  placeholder="coap://host:port/path" 
                  value={coapUrl} 
                  onChange={e => setCoapUrl(e.target.value)} 
                  className={`px-3 py-2 rounded flex-1 ${dark ? "bg-gray-700" : "bg-gray-200"}`}
                />
              </div>
            )}
          </div>
        </div>

        {/* ---------- HTTP Tabs ---------- */}
        {protocol === "HTTP" && (
          <div className={`p-4 rounded-lg ${dark ? "bg-gray-800" : "bg-gray-300"}`}>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab("params")}
                className={`px-3 py-1 rounded ${activeTab === "params" ? (dark ? "bg-blue-600" : "bg-blue-500") : (dark ? "bg-gray-700" : "bg-gray-400")}`}
              >
                Params
              </button>
              <button
                onClick={() => setActiveTab("headers")}
                className={`px-3 py-1 rounded ${activeTab === "headers" ? (dark ? "bg-blue-600" : "bg-blue-500") : (dark ? "bg-gray-700" : "bg-gray-400")}`}
              >
                Headers
              </button>
              <button
                onClick={() => setActiveTab("body")}
                className={`px-3 py-1 rounded ${activeTab === "body" ? (dark ? "bg-blue-600" : "bg-blue-500") : (dark ? "bg-gray-700" : "bg-gray-400")}`}
              >
                Body
              </button>
            </div>

            {activeTab === "params" && (
              <div className="space-y-2">
                {queryParams.map((param, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      placeholder="Key"
                      value={param.key}
                      onChange={e => updateQueryParam(index, "key", e.target.value)}
                      className={`px-3 py-1 rounded flex-1 ${dark ? "bg-gray-700" : "bg-gray-200"}`}
                    />
                    <input
                      placeholder="Value"
                      value={param.value}
                      onChange={e => updateQueryParam(index, "value", e.target.value)}
                      className={`px-3 py-1 rounded flex-1 ${dark ? "bg-gray-700" : "bg-gray-200"}`}
                    />
                    <button
                      onClick={() => removeQueryParam(index)}
                      className={`px-3 py-1 rounded ${dark ? "bg-red-700 hover:bg-red-800" : "bg-red-500 hover:bg-red-600"} text-white`}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={addQueryParam}
                  className={`px-3 py-1 rounded ${dark ? "bg-green-700 hover:bg-green-800" : "bg-green-500 hover:bg-green-600"} text-white`}
                >
                  Add Param
                </button>
              </div>
            )}

            {activeTab === "headers" && (
              <div className="space-y-2">
                {headers.map((header, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      placeholder="Key"
                      value={header.key}
                      onChange={e => updateHeader(index, "key", e.target.value)}
                      className={`px-3 py-1 rounded flex-1 ${dark ? "bg-gray-700" : "bg-gray-200"}`}
                    />
                    <input
                      placeholder="Value"
                      value={header.value}
                      onChange={e => updateHeader(index, "value", e.target.value)}
                      className={`px-3 py-1 rounded flex-1 ${dark ? "bg-gray-700" : "bg-gray-200"}`}
                    />
                    <button
                      onClick={() => removeHeader(index)}
                      className={`px-3 py-1 rounded ${dark ? "bg-red-700 hover:bg-red-800" : "bg-red-500 hover:bg-red-600"} text-white`}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={addHeader}
                  className={`px-3 py-1 rounded ${dark ? "bg-green-700 hover:bg-green-800" : "bg-green-500 hover:bg-green-600"} text-white`}
                >
                  Add Header
                </button>
              </div>
            )}
          </div>
        )}

        {/* ---------- Body ---------- */}
        <div className={`p-4 rounded-lg flex-1 ${dark ? "bg-gray-800" : "bg-gray-300"}`}>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder={
              protocol.includes("MQTT") ? "MQTT Payload (JSON or text)" :
              protocol === "COAP" ? "CoAP Payload" :
              "Request Body (JSON, XML, etc.)"
            }
            className={`w-full h-64 p-3 rounded font-mono ${dark ? "bg-gray-900" : "bg-gray-200"}`}
          />
        </div>

        {/* ---------- Response ---------- */}
        <div className={`p-4 rounded-lg ${dark ? "bg-gray-800" : "bg-gray-300"}`}>
          <h3 className="font-semibold mb-2">Response</h3>
          <pre className={`p-3 rounded overflow-auto max-h-64 ${dark ? "bg-gray-900" : "bg-gray-200"}`}>
            {response ? JSON.stringify(response, null, 2) : "No response yet"}
          </pre>
        </div>
      </div>
    </div>
  );
}