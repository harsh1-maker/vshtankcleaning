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


    // ==================================================
    // VALIDATION
    // ==================================================

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


    // Delhi only
    if (
      !/^\d{6}$/.test(String(pincode)) ||
      !String(pincode).startsWith("110")
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Online booking is currently available only for Delhi PIN codes."
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


    // ==================================================
    // PRICING
    // ==================================================

    const qty = Number(quantity);

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


    const subtotal =
      unitPrice * qty;


    const discountPercent =
      getDiscount(qty);


    const discount =
      Math.round(
        subtotal *
        discountPercent /
        100
      );


    const serviceTotal =
      subtotal - discount;


    // ==================================================
    // TRANSPORT
    //
    // The exact road distance should be calculated
    // using a distance/geocoding service before
    // sending a transport amount here.
    //
    // For now the booking API accepts zero transport
    // unless a verified transport amount is supplied.
    // ==================================================

    const transportCharge =
      Number(req.body.transportCharge) || 0;


    const totalAmount =
      serviceTotal +
      transportCharge;


    // ==================================================
    // BOOKING ID
    // ==================================================

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


    // ==================================================
    // RAZORPAY AUTH
    // ==================================================

    const auth =
      Buffer
        .from(
          `${keyId}:${keySecret}`
        )
        .toString("base64");


    // ==================================================
    // CREATE RAZORPAY ORDER
    // ==================================================

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
              Math.round(
                totalAmount * 100
              ),

            currency: "INR",

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

              subtotal:
                String(subtotal),

              discount_percent:
                String(discountPercent),

              discount_amount:
                String(discount),

              service_total:
                String(serviceTotal),

              transport_charge:
                String(transportCharge),

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

      keyId,

      orderId:
        data.id,

      bookingId,

      amount:
        data.amount,

      currency:
        data.currency

    });


  } catch (error) {

    console.error(
      "Create order error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Server error while creating order."
    });

  }

}
