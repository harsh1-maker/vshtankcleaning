import {
  getPrice,
  getDiscount
} from "../pricing-config.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const {
      name,
      phone,
      email,
      address,
      pincode,
      tankType,
      capacity,
      quantity,
      date,
      time
    } = req.body || {};

    if (
      !name ||
      !phone ||
      !email ||
      !address ||
      !tankType ||
      !capacity ||
      !quantity ||
      !date ||
      !time
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all booking details."
      });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay is not configured."
      });
    }

    const qty = Number(quantity);
    const unitPrice = getPrice(tankType, capacity);

    if (!unitPrice) {
      return res.status(400).json({
        success: false,
        message: "Invalid tank capacity."
      });
    }

    if (!Number.isInteger(qty) || qty < 1 || qty > 20) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be between 1 and 20."
      });
    }

    const subtotal = unitPrice * qty;
    const discountPercent = getDiscount(qty);

    const discount = Math.round(
      subtotal * discountPercent / 100
    );

    const totalAmount = subtotal - discount;

    const bookingId =
      "VSH-" +
      Date.now().toString().slice(-8) +
      "-" +
      Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();

    const auth = Buffer
      .from(`${keyId}:${keySecret}`)
      .toString("base64");

    const razorpayResponse = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",

        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          amount: totalAmount * 100,
          currency: "INR",
          receipt: bookingId,

          notes: {
            booking_id: bookingId,
            customer_name: String(name),
            customer_phone: String(phone),
            customer_email: String(email),
            customer_address: String(address),
            pincode: String(pincode || ""),
            tank_type: String(tankType),
            tank_capacity: String(capacity),
            quantity: String(qty),
            discount_percent: String(discountPercent),
            booking_date: String(date),
            booking_time: String(time)
          }
        })
      }
    );

    const data = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
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
