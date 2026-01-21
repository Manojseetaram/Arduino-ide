// components/postman-editor.tsx
"use client";

import { useState, useEffect } from "react";
import { IconX, IconTerminal2, IconSend } from "@tabler/icons-react";
import { EditorTab } from "./types";
import TerminalWrapper from "../terminal-wrapper";


interface PostmanEditorProps {
  projectName: string;
  theme: "light" | "dark";
  tabs: EditorTab[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  showTerminal?: boolean;
  onToggleTerminal?: () => void;
}

function parseCoapUrl(url: string) {
  const clean = url.replace(/^coap:\/\//, "");
  const [hostPort, ...pathParts] = clean.split("/");
  return { host: hostPort, path: pathParts.join("/") };
}

export function PostmanEditor({ 
  projectName,
  theme, 
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  showTerminal: externalShowTerminal,
  onToggleTerminal
}: PostmanEditorProps) {
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
  
  const [internalShowTerminal, setInternalShowTerminal] = useState(false);
  
  // Use external terminal control if provided, otherwise use internal state
  const showTerminal = externalShowTerminal !== undefined ? externalShowTerminal : internalShowTerminal;
  const toggleTerminal = onToggleTerminal || (() => setInternalShowTerminal(!showTerminal));

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
      // Replace with your actual backend call
      // const res = await invoke("send_universal", { payload });
      const res = { 
        status: 200, 
        message: "Request sent successfully", 
        timestamp: new Date().toISOString(),
        payload,
        data: protocol === "HTTP" ? { sample: "response data" } : null
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

  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    onTabClose(tabId);
  };

  // Calculate editor height based on terminal visibility
  const postmanHeight = showTerminal ? '70%' : '100%';
  const terminalHeight = '30%';

  return (
    <div className="h-full flex flex-col">
      {/* Tabs header - Same style as MonacoEditor */}
      <div className="bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
        {/* Project title with terminal toggle */}
        <div className="px-4 py-2 border-b border-gray-300 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconSend size={18} />
            <span className="font-semibold">Postman - {projectName}</span>
          </div>
          
          {/* Terminal toggle button */}
          <button
            onClick={toggleTerminal}
            className={`flex items-center gap-2 px-3 py-1 rounded text-sm ${
              showTerminal
                ? theme === "dark"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white"
                : theme === "dark"
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            title={showTerminal ? "Hide Terminal" : "Show Terminal"}
          >
            <IconTerminal2 size={16} />
            <span>Terminal</span>
          </button>
        </div>
        
        {/* File tabs */}
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`
                flex items-center gap-2 px-4 py-2 border-r border-gray-300 dark:border-gray-700
                min-w-[160px] max-w-[200px] cursor-pointer whitespace-nowrap
                ${activeTabId === tab.id 
                  ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                }
              `}
              onClick={() => onTabSelect(tab.id)}
            >
              {tab.name === "Postman" ? (
                <IconSend size={14} />
              ) : null}
              <span className="truncate flex-1">{tab.name}</span>
              {!tab.saved && <span className="w-2 h-2 rounded-full bg-yellow-500"></span>}
              <button
                onClick={(e) => handleTabClose(e, tab.id)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                <IconX size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Postman content area */}
      <div className="flex-1 flex flex-col">
        {/* Postman UI - Dynamic height based on terminal visibility */}
        <div style={{ height: postmanHeight, minHeight: '0' }} className="overflow-auto">
          <div className={`h-full p-4 ${dark ? "bg-gray-900 text-gray-200" : "bg-gray-50 text-gray-800"}`}>
            <div className="max-w-6xl mx-auto h-full flex flex-col gap-4">
              {/* ---------- Top Bar ---------- */}
              <div className={`p-4 rounded-lg ${dark ? "bg-gray-800" : "bg-white border"}`}>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <select 
                      value={protocol} 
                      onChange={e => setProtocol(e.target.value as any)} 
                      className={`px-3 py-2 rounded flex-1 ${dark ? "bg-gray-700" : "bg-gray-100"}`}
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
                      } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
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
                        className={`px-3 py-2 rounded ${dark ? "bg-gray-700" : "bg-gray-100"}`}
                      >
                        {["GET","POST","PUT","PATCH","DELETE"].map(m => <option key={m}>{m}</option>)}
                      </select>
                      <input 
                        placeholder="https://api.example.com" 
                        value={url} 
                        onChange={e => setUrl(e.target.value)} 
                        className={`px-3 py-2 rounded flex-1 ${dark ? "bg-gray-700" : "bg-gray-100"}`}
                      />
                    </div>
                  )}

                  {(protocol === "MQTT" || protocol === "MQTT-SN") && (
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        placeholder="Broker/Gateway" 
                        value={broker} 
                        onChange={e => setBroker(e.target.value)} 
                        className={`px-3 py-2 rounded ${dark ? "bg-gray-700" : "bg-gray-100"}`}
                      />
                      <input 
                        type="number" 
                        placeholder="Port" 
                        value={port} 
                        onChange={e => setPort(+e.target.value)} 
                        className={`px-3 py-2 rounded ${dark ? "bg-gray-700" : "bg-gray-100"}`}
                      />
                      {protocol === "MQTT" && (
                        <>
                          <input 
                            placeholder="Topic" 
                            value={topic} 
                            onChange={e => setTopic(e.target.value)} 
                            className={`px-3 py-2 rounded ${dark ? "bg-gray-700" : "bg-gray-100"}`}
                          />
                          <select 
                            value={qos} 
                            onChange={e => setQos(+e.target.value)} 
                            className={`px-3 py-2 rounded ${dark ? "bg-gray-700" : "bg-gray-100"}`}
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
                        className={`px-3 py-2 rounded ${dark ? "bg-gray-700" : "bg-gray-100"}`}
                      >
                        {["GET","POST","PUT","DELETE"].map(m => <option key={m}>{m}</option>)}
                      </select>
                      <input 
                        placeholder="coap://host:port/path" 
                        value={coapUrl} 
                        onChange={e => setCoapUrl(e.target.value)} 
                        className={`px-3 py-2 rounded flex-1 ${dark ? "bg-gray-700" : "bg-gray-100"}`}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ---------- HTTP Tabs ---------- */}
              {protocol === "HTTP" && (
                <div className={`p-4 rounded-lg ${dark ? "bg-gray-800" : "bg-white border"}`}>
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setActiveTab("params")}
                      className={`px-3 py-1 rounded ${activeTab === "params" ? (dark ? "bg-blue-600" : "bg-blue-500 text-white") : (dark ? "bg-gray-700" : "bg-gray-200")}`}
                    >
                      Params
                    </button>
                    <button
                      onClick={() => setActiveTab("headers")}
                      className={`px-3 py-1 rounded ${activeTab === "headers" ? (dark ? "bg-blue-600" : "bg-blue-500 text-white") : (dark ? "bg-gray-700" : "bg-gray-200")}`}
                    >
                      Headers
                    </button>
                    <button
                      onClick={() => setActiveTab("body")}
                      className={`px-3 py-1 rounded ${activeTab === "body" ? (dark ? "bg-blue-600" : "bg-blue-500 text-white") : (dark ? "bg-gray-700" : "bg-gray-200")}`}
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
                            className={`px-3 py-1 rounded flex-1 ${dark ? "bg-gray-700" : "bg-gray-100"}`}
                          />
                          <input
                            placeholder="Value"
                            value={param.value}
                            onChange={e => updateQueryParam(index, "value", e.target.value)}
                            className={`px-3 py-1 rounded flex-1 ${dark ? "bg-gray-700" : "bg-gray-100"}`}
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
                            className={`px-3 py-1 rounded flex-1 ${dark ? "bg-gray-700" : "bg-gray-100"}`}
                          />
                          <input
                            placeholder="Value"
                            value={header.value}
                            onChange={e => updateHeader(index, "value", e.target.value)}
                            className={`px-3 py-1 rounded flex-1 ${dark ? "bg-gray-700" : "bg-gray-100"}`}
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
              <div className={`p-4 rounded-lg flex-1 ${dark ? "bg-gray-800" : "bg-white border"}`}>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder={
                    protocol.includes("MQTT") ? "MQTT Payload (JSON or text)" :
                    protocol === "COAP" ? "CoAP Payload" :
                    "Request Body (JSON, XML, etc.)"
                  }
                  className={`w-full h-64 p-3 rounded font-mono ${dark ? "bg-gray-900" : "bg-gray-100"}`}
                />
              </div>

              {/* ---------- Response ---------- */}
              <div className={`p-4 rounded-lg ${dark ? "bg-gray-800" : "bg-white border"}`}>
                <h3 className="font-semibold mb-2">Response</h3>
                <pre className={`p-3 rounded overflow-auto max-h-64 ${dark ? "bg-gray-900" : "bg-gray-100"}`}>
                  {response ? JSON.stringify(response, null, 2) : "No response yet"}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Terminal - Only shown when toggled */}
        {showTerminal && (
          <div style={{ height: terminalHeight, minHeight: '0' }}>
            <TerminalWrapper
              theme={theme}
              onClose={toggleTerminal}
            />
          </div>
        )}
      </div>
    </div>
  );
}