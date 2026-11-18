import {
  getPrice,
  getDiscount,
  ONLINE_PAYMENT_DISCOUNT
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
      time,
      paymentMethod = "online"
    } = req.body || {};

    if (
      !name ||
      !phone ||
      !email ||
      !address ||
      !pincode ||
      !tankType ||
      !capacity ||
      !quantity ||
      !date ||
      !time
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please fill in all booking details."
      });
    }

    if (!/^110\d{3}$/.test(String(pincode))) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid Delhi PIN code."
      });
    }

    if (
      paymentMethod !== "online" &&
      paymentMethod !== "cash"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment method."
      });
    }

    const qty = Number(quantity);

    if (
      !Number.isInteger(qty) ||
      qty < 1 ||
      qty > 20
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be between 1 and 20."
      });
    }

    const unitPrice =
      getPrice(
        tankType,
        capacity
      );

    if (!unitPrice) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid tank capacity."
      });
    }

    const subtotal =
      unitPrice * qty;

    const quantityDiscountPercent =
      getDiscount(qty);

    const quantityDiscount =
      Math.round(
        subtotal *
        quantityDiscountPercent /
        100
      );

    const afterQuantityDiscount =
      subtotal -
      quantityDiscount;

    const onlineDiscountPercent =
      paymentMethod === "online"
        ? ONLINE_PAYMENT_DISCOUNT
        : 0;

    const onlineDiscount =
      Math.round(
        afterQuantityDiscount *
        onlineDiscountPercent /
        100
      );

    const total =
      afterQuantityDiscount -
      onlineDiscount;

    const bookingId =
      "VSH-" +
      Date.now()
        .toString()
        .slice(-8) +
      "-" +
      Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();

    if (paymentMethod === "cash") {

      return res.status(200).json({
        success: true,
        paymentMethod: "cash",
        bookingId,
        amount: total,
        currency: "INR",

        summary: {
          subtotal,
          quantityDiscount,
          onlineDiscount: 0,
          total
        }
      });
    }

    const keyId =
      process.env.RAZORPAY_KEY_ID;

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({
        success: false,
        message:
          "Razorpay is not configured."
      });
    }

    const auth =
      Buffer
        .from(
          `${keyId}:${keySecret}`
        )
        .toString("base64");

    const razorpayResponse =
      await fetch(
        "https://api.razorpay.com/v1/orders",
        {
          method: "POST",

          headers: {
            Authorization:
              `Basic ${auth}`,

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            amount:
              total * 100,

            currency:
              "INR",

            receipt:
              bookingId,

            notes: {

              booking_id:
                bookingId,

              customer_name:
                String(name),

              customer_phone:
                String(phone),

              customer_email:
                String(email),

              customer_address:
                String(address),

              pincode:
                String(pincode),

              tank_type:
                String(tankType),

              tank_capacity:
                String(capacity),

              quantity:
                String(qty),

              quantity_discount_percent:
                String(
                  quantityDiscountPercent
                ),

              online_discount_percent:
                String(
                  onlineDiscountPercent
                ),

              booking_date:
                String(date),

              booking_time:
                String(time)
            }
          })
        }
      );

    const data =
      await razorpayResponse.json();

    if (!razorpayResponse.ok) {

      console.error(
        "Razorpay error:",
        data
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to create Razorpay order."
      });
    }

    return res.status(200).json({

      success: true,

      paymentMethod: "online",

      keyId,

      orderId:
        data.id,

      bookingId,

      amount:
        data.amount,

      currency:
        data.currency,

      summary: {
        subtotal,
        quantityDiscount,
        onlineDiscount,
        total
      }

    });

  } catch (error) {

    console.error(
      "Create order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating booking."
    });
  }
}
