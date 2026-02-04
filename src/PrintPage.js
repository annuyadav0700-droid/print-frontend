import React, { useState } from "react";
import axios from "axios";

export default function PrintPage() {
  const [file, setFile] = useState([]);
  const [pages, setPages] = useState(1);
  const [orderCode, setOrderCode] = useState("");
  const pricePerPage = 5;

  const totalPrice = pages * pricePerPage;

  const handleFileChange = (e) => {
    setFile([e.target.files].slice(0,20));
  };

  const handlePayment = async () => {
    try {
      // 1️⃣ Create order from backend
      const res = await axios.post("https://backend-server-9jix.onrender.com/create-order", {
        amount: total*100,
        
      });
      const {orderId, orderCode} = res.data;
      setOrderCode(orderCode);
      // 2️⃣ Razorpay payment
      const options = {
        key: "rzp_live_S86JCGSl30lgly",
        amount: totalPrice * 100,
        currency: "INR",
        name: "A4station",
        
        order_id: data.orderId,

        handler:  function (response) {
          alert("Payment Successfull");
          console.log(response);
        },

        theme: { color: "#3399cc" },
      };

      const rzp = new 
      window.Razorpay(options);
      rzp.open();

    } catch (err) {
      alert("Payment failed ❌");
      console.log(err);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>📄 Print Your Files</h2>

      <input type="file" multiple 
      onChange={handleFileChange} />
      <p>Files Selected:{files.length}</p>

      
      <input
        type="number"
        placeholder="Enter Pages"
        value={pages}
        
        onChange={(e) => setPages(e.target.value)}
      />
      <h3>Total Price: ₹{totalPrice}</h3>

      <button onClick={handlePayment}>Pay & Generate Order Code</button>
      {orderCode && (
        <div style={{marginTop:"20px"}}>
          <h2> Order Code: {orderCode}</h2>
          <p>Enter this Code on the kiosk to print</p>
          </div>
      )}
    </div>
  );
}


