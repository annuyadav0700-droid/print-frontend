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

  const handlePayment = async () => {
  if (!pages || !copies) {
    alert("Enter pages and copies");
    return;
  }

  // 🎨 Prices
  const bwPrice = 5;
  const colorPrice = 10;

  // 🧮 Decide price per page
  const pricePerPage = printType === "color" ? colorPrice : bwPrice;

  // 💰 Total calculation
  const totalAmount = Number(pages) * Number(copies) * pricePerPage;

  console.log("Pages:", pages);
  console.log("Copies:", copies);
  console.log("Type:", printType);
  console.log("Total ₹:", totalAmount);
  console.log("Sending to backend:", totalAmount * 100);

  try {
    const res = await axios.post("https://backend-server-9jix.onrender.com/create-order", {
      amount: totalAmount * 100, // 🔥 Razorpay wants paise
    });

    const order = res.data;

    const options = {
      key: "rzp_live_S86JCGSl30lgly",
      amount: order.amount,
      currency: "INR",
      name: "A4Station",
      description: "Printing Payment",
      order_id: order.id,
      handler: function (response) {
        console.log(response);
        setPaymentSuccess(true);
        generateCode(); // your 6 digit print code
      },
      theme: { color: "#3399cc" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.log(err);
    alert("Payment failed");
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
            <button onClick={handlePayment} style={payBtn}>
              Pay & Print
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