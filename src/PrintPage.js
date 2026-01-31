import React, { useState } from "react";

function PrintPage() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState(1);
  const pricePerPage = 5;

  const totalPrice = pages * pricePerPage;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handlePayment = async () => {
    try {
      // 1️⃣ Create order from backend
      const res = await fetch("https://backend-server-9jix.onrender.com//create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrice }),
      });

      const data = await res.json();

      // 2️⃣ Razorpay payment
      const options = {
        key: "rzp_live_S86JCGSl30lgly",
        amount: totalPrice * 100,
        currency: "INR",
        name: "Print Service",
        description: "Document Printing",
        order_id: data.orderId,

        handler: async function (response) {
          // 3️⃣ Verify payment
          await fetch("https://backend-server-9jix.onrender.com//verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          // 4️⃣ Generate 6 digit code
          const code = Math.floor(100000 + Math.random() * 900000);

          alert("Payment Successful 🎉\nYour Print Code: " + code);
        },

        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      alert("Payment failed ❌");
      console.log(err);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>📄 Print Service</h2>

      <input type="file" onChange={handleFileChange} /><br /><br />

      <label>Number of Pages: </label>
      <input
        type="number"
        value={pages}
        min="1"
        onChange={(e) => setPages(e.target.value)}
      /><br /><br />

      <h3>Total Price: ₹{totalPrice}</h3>

      <button onClick={handlePayment}>Pay & Print</button>
    </div>
  );
}

export default PrintPage;
