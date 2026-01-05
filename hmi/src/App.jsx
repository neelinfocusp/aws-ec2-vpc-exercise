import React, { useState } from "react";

function App() {
  const [loadFactor, setLoadFactor] = useState(10);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to call the CPU Load endpoint
  const handleCpuLoad = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/load/${loadFactor}`);
      const data = await response.json();
      alert(data.message);
    } catch (err) {
      alert("Error triggering CPU load", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to call the Upload endpoint
  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      alert(data.message || data.error);
    } catch (err) {
      alert("Error uploading file", err);
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

      <hr />
      <br />

      {/* Section 1: CPU Load */}
      <div
        style={{
          marginBottom: "40px",
          padding: "20px",
          border: "1px solid #ddd",
        }}
      >
        <h2>1. CPU Load Test</h2>
        <p>Enter load factor to spike CPU:</p>
        <input
          type="number"
          value={loadFactor}
          onChange={(e) => setLoadFactor(e.target.value)}
          style={{ padding: "8px", width: "80%" }}
        />
        <br />
        <button
          onClick={handleCpuLoad}
          style={{
            padding: "8px 15px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            marginTop: "10px",
          }}
        >
          Start Load
        </button>
        {loading && <p style={{ color: "blue" }}>Processing request...</p>}
      </div>

      {/* Section 2: S3 Upload */}
      <div style={{ padding: "20px", border: "1px solid #ddd" }}>
        <h2>2. S3 File Upload</h2>
        <p>Choose an image to upload via VPC Endpoint:</p>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: "10px" }}
        />
        <br />
        <button
          onClick={handleUpload}
          style={{
            padding: "8px 15px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
          }}
        >
          Upload to S3
        </button>
      </div>
    </div>
  );
}

export default App;
