import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.entry";
import PrintPage from "./PrintPage";

// ✅ PDF.js worker setup (Render friendly)
pdfjsLib.GlobalWorkerOptions.workerSrc = 
pdfWorker;


function App() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState(0);
  const [copies, setCopies] = useState(1);
  const [colorType, setColorType] = useState("bw");
  const [side, setSide] = useState("single");
  const [orderCode, setOrderCode] = useState("");
  const pricePerPage= colorType === "color" ? 5:10;
  const totalPrice = pages*copies*pricePerPage;

  // 📄 Handle file upload
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

  // 💰 Price calculation
  const getPrice = () => {
    let pricePerPage = colorType === "bw" ? 5 : 10;
    let totalPages = pages * copies;

    if (side === "double") {
      totalPages = Math.ceil(totalPages / 2);
    }

    return totalPages * pricePerPage;
  };
  return<PrintPage/>;

  // 💳 Load Razorpay script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 💳 Handle payment
  const handlePayment = async () => {
    const res = await loadRazorpay();
    if (!res) {
      alert("Razorpay SDK failed to load");
      return;
    }

    // Create order on backend
    const orderRes = await fetch(
      "https://backend-server-9jix.onrender.com/create-order",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: getPrice() }),
      }
    );

    const orderData = await orderRes.json();
    if (!orderData.success) {
      alert("Order creation failed");
      return;
    }

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID, // from .env
      amount: getPrice() * 100,
      currency: "INR",
      name: "Print Service",
      description: "Printing Payment",
      order_id: orderData.orderId,
      handler: async function (response) {
        const verifyRes = await fetch(
          "https://backend-server-9jix.onrender.com/verify-payment",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          }
        );

        const data = await verifyRes.json();
        if (data.success) {
          setOrderCode(data.code || "Your order is successful!"); // backend se code
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

      <input
        type="file"
        accept="application/pdf,image/*"
        onChange={handleFileChange}
      />

      <br />
      <br />

      <h3>Detected Pages: {pages}</h3>

      Copies:
      <input
        type="number"
        min="1"
        value={copies}
        onChange={(e) => setCopies(Number(e.target.value))}
      />

      <br />
      <br />

      Color:
      <select onChange={(e) => setColorType(e.target.value)} value={colorType}>
        <option value="bw">Black & White</option>
        <option value="color">Color</option>
      </select>

      <br />
      <br />

      Side:
      <select onChange={(e) => setSide(e.target.value)} value={side}>
        <option value="single">Single</option>
        <option value="double">Double</option>
      </select>

      <br />
      <br />

      <h3>Total Price: ₹{getPrice()}</h3>

      {orderCode && (
        <h2 style={{ color: "green" }}>Your Order Code: {orderCode}</h2>
      )}

      <button onClick={handlePayment} disabled={pages === 0}>
        Pay Now
      </button>
    </div>
  );
}

export default App;