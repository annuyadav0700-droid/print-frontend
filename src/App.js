import React, { useState } from "react";



function App() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState(0);
  const [copies, setCopies] = useState(1);
  const [colorType, setColorType] = useState("bw");
  const [side, setSide] = useState("single");

  // 📄 File Upload
  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);

    if (selected.type.startsWith("image/")) {
      setPages(1);
    } else if (selected.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = async function () {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        setPages(pdf.numPages);
      };
      reader.readAsArrayBuffer(selected);
    }
  };

  // 💰 Price Calculation
  const getPrice = () => {
    let pricePerPage = colorType === "bw" ? 5 : 10;
    let totalPages = pages * copies;
    if (side === "double") totalPages = Math.ceil(totalPages / 2);
    return totalPages * pricePerPage;
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script =
      document.createElement("script");
      script.src =
      `https://checkout.razorpay.com/v1/checkout.js`;
      script.onload = () => resolve (true);
      script.onerror = () =>
        resolve(false);
      document.body.appendChild(script);
    });
  };
  
  // 💳 Handle Payment
  const handlePayment = async () => {
    const ok = await loadRazorpay();
    if (!ok) return alert("Razorpay load failed");
    const res = await fetch("https://backend-server-9jix.onrender.com/create-order",{
      method : "POST",
      headers : {"Content-Type": "application/json"},
      body: JSON.stringify({amount:price}),
    });
    const data = await res.json();

      // 2️⃣ Razorpay options
      const options = {
        key: "rzp_live_S86JCGSl30lgly", // 🔑 apni live key
        amount: data.order.amount,
        currency: "INR",
        name: "Print Service",
        description: "Document Printing",
        order_id: data.order.id,
        handler: async function (response) {
          const verify = await fetch("https://backend-server-9jix.onrender.com/verify-payment",{
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify(response),
          });
          const result = await verify.json();
          if (result.success) {
          alert("Payment Successful ✅Code:"+ result.orderCode);
          } else {
            alert("Payment verification failed");
          }
        },
      

          
      };

      // 3️⃣ Open Razorpay popup
      const rzp = new window.Razorpay(options);
      rzp.open();
    
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>🖨️ Print Service</h2>

      <input type="file" accept="application/pdf,image/*" onChange={handleFileChange} />

      <br /><br />

      <h3>Detected Pages: {pages}</h3>

      Copies:
      <input
        type="number"
        min="1"
        value={copies}
        onChange={(e) => setCopies(Number(e.target.value))}
      />

      <br /><br />

      Color:
      <select value={colorType} onChange={(e) => setColorType(e.target.value)}>
        <option value="bw">Black & White</option>
        <option value="color">Color</option>
      </select>

      <br /><br />

      Side:
      <select value={side} onChange={(e) => setSide(e.target.value)}>
        <option value="single">Single</option>
        <option value="double">Double</option>
      </select>

      <h3>Total Price: ₹{getPrice()}</h3>

      <br />

      <button onClick={handlePayment} disabled={pages === 0}>
        Pay Now
      </button>
    </div>
  );
}

export default App;