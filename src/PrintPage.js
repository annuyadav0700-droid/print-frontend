import React, { useState } from "react";

function PrintPage() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const verifyCode = async () => {
    const res = await fetch("https://backend-server-9jix.onrender.com/verify-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();

    if (data.status === "OK") setMessage("🖨 Printing Started...");
    else if (data.status === "USED") setMessage("⚠ Already Printed");
    else setMessage("❌ Invalid Code");
  };

  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <h1>Operator Panel</h1>

      <input
        placeholder="Enter Order Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{ padding: 10, fontSize: 18 }}
      />

      <br /><br />

      <button onClick={verifyCode}>Start Printing</button>

      <h2>{message}</h2>
    </div>
  );
}

export default PrintPage;
