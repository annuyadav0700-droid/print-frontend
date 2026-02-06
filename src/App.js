import React, { useState } from "react";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

function App() {
  const [files, setFiles] = useState([]);
  const [pages, setPages] = useState(0);
  const [copies, setCopies] = useState(1);
  const [printType, setPrintType] = useState("bw");
  const [paid, setPaid] = useState(false);
  const [printCode, setPrintCode] = useState("");
// 🎨 Prices
  const bwPrice = 5;
  const colorPrice = 10;

  const pricePerPage =  printType === "color" ? colorPrice : bwPrice;

  // 💰 Total calculation
  const totalAmount = Number(pages) * Number(copies) * pricePerPage;

  // FILE UPLOAD
  const handleFileChange = async (e) => {
    const uploadedFiles = Array.from(e.target.files).slice(0, 20);
    setFiles(uploadedFiles);

    let totalPages = 0;

    for (let file of uploadedFiles) {
      if (file.type === "application/pdf") {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        await new Promise((resolve) => {
          reader.onload = async () => {
            const pdf = await pdfjsLib.getDocument({ data: reader.result }).promise;
            totalPages += pdf.numPages;
            resolve();
          };
        });
      } else {
        totalPages += 1;
      }
    }

    setPages(totalPages);
  };

 const handlePayment = async (totalAmount) => {
  try {
    // 1️⃣ Create Order via backend
    const res = await axios.post(
      "https://backend-server-9jix.onrender.com/create-order",
      { pages: Number(pages),
        copies: Number(copies),
        printType
       } // Rupees, backend will multiply by 100
    );

    const order = res.data; // order object from backend
    console.log("Order received from backend:", order);

    // 2️⃣ Razorpay options
    const options = {
      key: "rzp_live_S86JCGSl30lgly", // use your Razorpay LIVE or TEST key
      amount: order.amount, // backend multiplied paise
      currency: order.currency,
      name: "A4Station",
      description: "Printing Payment",
      order_id: order.id,
      handler: async function (response) {
        // 3️⃣ Payment successful, verify on backend
        console.log("Payment Success:", response);

        try {
          const verifyRes = await axios.post(
            "https://backend-server-9jix.onrender.com/verify-payment",
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response,razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }
          );
          console.log("Payment Verification Response:", verifyRes.data);

          if (verifyRes.data.success) {
            alert("Payment Successful ✅");
            // 🔹 You can trigger print or generate invoice here
          } else {
            alert("Payment verification failed ❌");
          }
        } catch (err) {
          console.log("Verify API Error:", err);
          alert("Payment verification failed ❌");
        }
      },
      theme: { color: "#3399cc" },
    };

    // 4️⃣ Open Razorpay popup
    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.log("Create Order API Error:", err);
    alert("Payment failed ❌");
  }

};
  return (
    <div style={{ textAlign: "center", padding: "30px" }}>
      {!paid ? (
        <>
          <h1>A4Station Print</h1>

          <input type="file" multiple accept=".pdf,image/*" onChange={handleFileChange} />

          <h3>Total Pages: {pages}</h3>

          <label>Copies: </label>
          <input
            type="number"
            min="1"
            value={copies}
            onChange={(e) => setCopies(e.target.value)}
          />

          <br /><br />

          <button onClick={() => setPrintType("bw")} style={btn}>B/W ₹5</button>
          <button onClick={() => setPrintType("color")} style={btn}>Color ₹10</button>

          <h2>Total Amount: ₹{totalAmount}</h2>

          {files.length > 0 && (
            <button onClick={()=>
              handlePayment(totalAmount)
            }>
              Pay Now
            </button>
          )}
        </>
      ) : (
        <div>
          <h2>✅ Payment Successful</h2>
          <h1>Your Print Code</h1>
          <h1 style={{ color: "green", fontSize: "50px" }}>{printCode}</h1>
          <p>Enter this code on A4Station Kiosk Screen</p>
        </div>
      )}
    </div>
  );
}

const btn = { padding: "10px", margin: "10px" };
const payBtn = {
  padding: "12px 25px",
  fontSize: "18px",
  background: "green",
  color: "white",
  border: "none",
  borderRadius: "5px",
};

export default App;