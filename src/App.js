import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import  PDFWorker  from "pdfjs-dist/build/pdf.worker.entry";
pdfjsLib.GlobalWorkerOptions.workerSrc = PDFWorker;

function App() {
   const [file, setFile] = useState(null);
  const [pages, setPages] = useState(0);
  const [copies, setCopies] = useState(1);
  const [colorType, setColorType] = useState("bw");
   const [side, setSide] = useState("single");
   const [orderCode, setOrderCode]=useState("");
 
  // 📄 Handle File Upload
  const handleFileChange = async(e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);

    if (selected.type.startsWith("image/")) {
      setPages(1);
    } else if (selected.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload=async function() {
        const typedarray= new Uint8Array(this.result);
        const pdf = await
        pdfjsLib.getDocument(typedarray).promise;
        setPages(pdf.numPages);
      };
      reader.readAsArrayBuffer(selected);
    }
  };

  // 💰 Price Calculation
  const getPrice = () => {
    let pricePerPage = colorType === "bw" ? 5 : 10;
    let totalPages = pages * copies;

    if (side === "double") {
      totalPages = Math.ceil(totalPages / 2);
    }

    return totalPages * pricePerPage;
  };

  // 💳 Razorpay Payment
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpay();
    if (!res) {
      alert("Razorpay SDK failed to load");
      return;
    }

    const options = {
      key: "rzp_live_S86JCGSl30lgly", // 👈 Replace later with real key
      amount: getPrice() * 100,
      currency: "INR",
      name: "Print Service",
      description: "Printing Payment",
      handler: async function (response) {
  const verifyRes = await fetch("https://backend-server-9jix.onrender.com/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    }),
  });

  const data = await verifyRes.json();

  if (data.success) {
    setOrderCode(data.code); // 👈 backend se aaya 6 digit code
  } else {
    alert("Payment verification failed");
  }
},
      prefill: {
        name: "Customer",
        email: "test@test.com",
      },
      theme: { color: "#3399cc" },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>Print Service</h2>

      <input type="file" 
      accept="application/pdf,image/*"
      onChange={handleFileChange} />

      <br /><br />

      <h3>Detected Pages:{pages}</h3>
      Copies:<input
        type="number"
        min="1"
        value={copies}
        onChange={(e) => setCopies(Number(e.target.value))}
      />

      <br /><br />

      

      Color:
      <select onChange={(e) => setColorType(e.target.value)}>
        <option value="bw">Black & White</option>
        <option value="color">Color</option>
      </select>

      <br /><br />
      Side:
      <select onChange={(e) => setSide(e.target.value)}>
        <option value="single">Single</option>
        <option value="double">Double</option>
      </select>

      <br /><br />

      <h3>Total Price: ₹{getPrice()}</h3>
      {orderCode && (
        <h2 style={{ color:"green"}}>
          Your Order Code : {orderCode}
        </h2>
      )}

      <button onClick={handlePayment}
      disabled={pages===0}>Pay Now</button>
    </div>
  );
}

export default App;