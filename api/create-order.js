export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { name, phone, email, address, tankType, capacity, quantity, date, time } = req.body || {};

    if (!name || !phone || !email || !address || !tankType || !capacity || !quantity || !date || !time) {
      return res.status(400).json({ success: false, message: "Please fill in all booking details." });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({ success: false, message: "Razorpay is not configured." });
    }

    const prices = { "500": 499, "1000": 599, "1500": 799, "2000": 999, "5000": 1999 };
    const unitPrice = prices[String(capacity)];
    const qty = Number(quantity);

    if (!unitPrice) {
      return res.status(400).json({ success: false, message: "Invalid tank capacity." });
    }

    if (!Number.isInteger(qty) || qty < 1 || qty > 20) {
      return res.status(400).json({ success: false, message: "Quantity must be between 1 and 20." });
    }

    const totalAmount = unitPrice * qty;
    const bookingId =
      "VSH-" + Date.now().toString().slice(-8) + "-" +
      Math.random().toString(36).substring(2, 6).toUpperCase();

    const notes = {
      booking_id: bookingId,
      customer_name: String(name).slice(0, 200),
      customer_phone: String(phone).slice(0, 50),
      customer_email: String(email).slice(0, 200),
      customer_address: String(address).slice(0, 500),
      tank_type: String(tankType).slice(0, 100),
      tank_capacity: String(capacity),
      quantity: String(qty),
      booking_date: String(date),
      booking_time: String(time)
    };

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: totalAmount * 100,
        currency: "INR",
        receipt: bookingId,
        notes
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Razorpay error:", data);
      return res.status(500).json({
        success: false,
        message: "Unable to create Razorpay order."
      });
    }

    return res.status(200).json({
      success: true,
      keyId,
      orderId: data.id,
      bookingId,
      amount: data.amount,
      currency: data.currency
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating order."
    });
  }
}
