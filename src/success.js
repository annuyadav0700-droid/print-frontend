import { useEffect, useState } from "react";

function Success() {
  const [code, setCode] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id");
    const paymentId = params.get("payment_id");
    const signature = params.get("signature");

    fetch("https://backend-server-9jix.onrender.com/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCode(data.code);
        }
      });
  }, []);

  return (
    <div style={{textAlign:"center", marginTop:"50px"}}>
      <h2>Payment Successful 🎉</h2>
      <h1>Your Print Code: {code}</h1>
      <p>Enter this code on the kiosk machine</p>
    </div>
  );
}

export default Success;