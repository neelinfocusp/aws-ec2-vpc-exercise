import React, { useEffect, useState } from "react";

// This is the key change:
// It checks for an environment variable injected during build,
// but defaults to '/api' which works perfectly with ALB path-based routing.
const API_BASE = import.meta.env.VITE_API_URL || "/api";

console.log("---------", API_BASE);

function App() {
  const [loadFactor, setLoadFactor] = useState(10);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [serverInfo, setServerInfo] = useState({
    az: "Loading...",
    instanceId: "",
  });

  useEffect(() => {
    // Relative call: /api/metadata
    fetch(`${API_BASE}/metadata`)
      .then((res) => res.json())
      .then((data) => setServerInfo(data))
      .catch((err) => console.error("Metadata fetch failed", err));
  }, []);

  const handleCpuLoad = async () => {
    setLoading(true);
    try {
      // Relative call: /api/load/10
      const response = await fetch(`${API_BASE}/load/${loadFactor}`);
      const data = await response.json();
      alert(data.message);
    } catch (err) {
      alert("Error triggering CPU load");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");

    const formData = new FormData();
    formData.append("image", file);

    setImageUploadLoading(true);
    try {
      // Relative call: /api/upload
      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      alert(data.message || data.error);
    } catch (err) {
      alert("Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "600px",
        margin: "auto",
        fontFamily: "Arial",
      }}
    >
      <h1>AWS EC2 Load & S3 Tester</h1>
      <div
        style={{ background: "#f4f4f4", padding: "10px", borderRadius: "8px" }}
      >
        <p>
          📍 Server Zone: <strong>{serverInfo.az}</strong>
        </p>
        <p>
          🆔 Instance ID: <code>{serverInfo.instanceId}</code>
        </p>
      </div>

      <hr style={{ margin: "20px 0" }} />

      {/* Section 1: CPU Load */}
      <div
        style={{
          marginBottom: "20px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>1. CPU Load Test</h2>
        <p>Enter load factor to spike CPU:</p>
        <input
          type="number"
          value={loadFactor}
          onChange={(e) => setLoadFactor(e.target.value)}
          style={{
            padding: "8px",
            width: "100%",
            marginBottom: "10px",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={handleCpuLoad}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: loading ? "#ccc" : "#28a745",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            width: "100%",
          }}
        >
          {loading ? "Processing..." : "Start Load"}
        </button>
      </div>

      {/* Section 2: S3 Upload */}
      <div
        style={{
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>2. S3 File Upload</h2>
        <p>Choose an image to upload via VPC Endpoint:</p>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: "15px", width: "100%" }}
        />
        <button
          onClick={handleUpload}
          disabled={imageUploadLoading}
          style={{
            padding: "10px 20px",
            backgroundColor: imageUploadLoading ? "#ccc" : "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            width: "100%",
          }}
        >
          {imageUploadLoading ? "Uploading..." : "Upload to S3"}
        </button>
      </div>
    </div>
  );
}

export default App;
