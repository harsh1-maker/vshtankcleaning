import Razorpay from "razorpay";

const PRICES = {
  overhead: {
    500: 499,
    1000: 599,
    1500: 799,
    2000: 999,
    5000: 1999
  },

  underground: {
    500: 799,
    1000: 899,
    1500: 999,
    2000: 1099,
    3000: 1299,
    5000: 1999
  }
};

const QUANTITY_DISCOUNTS = {
  1: 0,
  2: 10,
  3: 12,
  4: 14,
  5: 15
};

const ONLINE_PAYMENT_DISCOUNT = 5;


/*
=========================================================
DELHI NCR PIN CODES

110xxx = Delhi
121xxx = Faridabad
122xxx = Gurgaon / Gurugram
201xxx = Noida / Greater Noida / Ghaziabad
=========================================================
*/

function isServiceablePin(pin) {
  const value = String(pin || "").trim();

  if (!/^\d{6}$/.test(value)) {
    return false;
  }

  const prefix = value.substring(0, 3);

  return [
    "110",
    "121",
    "122",
    "201"
  ].includes(prefix);
}


/*
=========================================================
PRICE
=========================================================
*/

function getPrice(tankType, capacity) {
  return Number(
    PRICES[tankType]?.[capacity] || 0
  );
}


/*
=========================================================
QUANTITY DISCOUNT
=========================================================
*/

function getQuantityDiscount(quantity) {
  const qty = Number(quantity);

  if (qty >= 5) {
    return 15;
  }

  return QUANTITY_DISCOUNTS[qty] || 0;
}


/*
=========================================================
CALCULATE TOTAL

ONLINE:
- Quantity discount
- Additional 5% online payment discount

AFTER SERVICE:
- Quantity discount
- NO 5% online discount
=========================================================
*/

function calculateTotal(
  tankType,
  capacity,
  quantity,
  paymentMethod
) {
  const unitPrice =
    getPrice(tankType, capacity);

  const qty =
    Number(quantity);

  const subtotal =
    unitPrice * qty;

  const quantityDiscountPercent =
    getQuantityDiscount(qty);

  const quantityDiscount =
    Math.round(
      subtotal *
      quantityDiscountPercent /
      100
    );

  const afterQuantityDiscount =
    subtotal - quantityDiscount;

  const onlineDiscount =
    paymentMethod === "online"
      ? Math.round(
          afterQuantityDiscount *
          ONLINE_PAYMENT_DISCOUNT /
          100
        )
      : 0;

  const total =
    afterQuantityDiscount -
    onlineDiscount;

  return {
    unitPrice,
    quantity: qty,
    subtotal,
    quantityDiscountPercent,
    quantityDiscount,
    onlineDiscount,
    total
  };
}


/*
=========================================================
HANDLER
=========================================================
*/

export default async function handler(req, res) {

  /*
  ========================================================
  METHOD
  ========================================================
  */

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed."
    });
  }


  /*
  ========================================================
  BODY
  ========================================================
  */

  let body = req.body;

  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (error) {
      return res.status(400).json({
        error: "Invalid JSON request."
      });
    }
  }

  body = body || {};


  /*
  ========================================================
  BOOKING DATA
  ========================================================
  */

  const {
    name,
    phone,
    email,
    pincode,
    address,
    date,
    time,
    tankType,
    capacity,
    quantity,
    paymentMethod
  } = body;


  /*
  ========================================================
  BASIC VALIDATION
  ========================================================
  */

  if (
    !name ||
    !phone ||
    !email ||
    !pincode ||
    !address ||
    !date ||
    !time ||
    !tankType ||
    !capacity ||
    !quantity
  ) {
    return res.status(400).json({
      error:
        "Please complete all required booking fields."
    });
  }


  /*
  ========================================================
  PHONE
  ========================================================
  */

  const cleanPhone =
    String(phone).trim();

  if (
    !/^[6-9]\d{9}$/.test(cleanPhone)
  ) {
    return res.status(400).json({
      error:
        "Please enter a valid 10-digit Indian mobile number."
    });
  }


  /*
  ========================================================
  EMAIL
  ========================================================
  */

  const cleanEmail =
    String(email).trim();

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      cleanEmail
    )
  ) {
    return res.status(400).json({
      error:
        "Please enter a valid email address."
    });
  }


  /*
  ========================================================
  PIN CODE
  ========================================================
  */

  const cleanPin =
    String(pincode).trim();


  if (!/^\d{6}$/.test(cleanPin)) {
    return res.status(400).json({
      error:
        "Please enter a valid 6-digit PIN code."
    });
  }


  if (!isServiceablePin(cleanPin)) {
    return res.status(400).json({
      error:
        "This PIN code is outside our current Delhi NCR service area. We currently serve Delhi, Gurgaon, Faridabad, Noida, Greater Noida and Ghaziabad."
    });
  }


  /*
  ========================================================
  TANK TYPE
  ========================================================
  */

  if (
    ![
      "overhead",
      "underground"
    ].includes(tankType)
  ) {
    return res.status(400).json({
      error:
        "Invalid tank type selected."
    });
  }


  /*
  ========================================================
  CAPACITY + QUANTITY
  ========================================================
  */

  const numericCapacity =
    Number(capacity);

  const numericQuantity =
    Number(quantity);


  if (
    !Number.isFinite(numericCapacity) ||
    !Number.isFinite(numericQuantity)
  ) {
    return res.status(400).json({
      error:
        "Invalid tank capacity or quantity."
    });
  }


  if (
    numericQuantity < 1 ||
    numericQuantity > 20
  ) {
    return res.status(400).json({
      error:
        "Quantity must be between 1 and 20."
    });
  }


  /*
  ========================================================
  CHECK PRICE
  ========================================================
  */

  const unitPrice =
    getPrice(
      tankType,
      numericCapacity
    );


  if (unitPrice <= 0) {
    return res.status(400).json({
      error:
        "The selected tank size is not available."
    });
  }


  /*
  ========================================================
  PAYMENT METHOD
  ========================================================

  online       = Pay online + 5% additional discount

  after_service = Pay after service + NO online discount
  ========================================================
  */

  const selectedPaymentMethod =
    paymentMethod || "online";


  if (
    ![
      "online",
      "after_service"
    ].includes(selectedPaymentMethod)
  ) {
    return res.status(400).json({
      error:
        "Invalid payment method."
    });
  }


  /*
  ========================================================
  CALCULATE FINAL PRICE
  ========================================================
  */

  const pricing =
    calculateTotal(
      tankType,
      numericCapacity,
      numericQuantity,
      selectedPaymentMethod
    );


  /*
  ========================================================
  PAY AFTER SERVICE
  ========================================================

  No Razorpay order is created.

  The booking is accepted and the customer
  can pay after the cleaning service.
  ========================================================
  */

  if (
    selectedPaymentMethod === "after_service"
  ) {

    console.log(
      "PAY AFTER SERVICE BOOKING:",
      {
        name: String(name),
        phone: cleanPhone,
        email: cleanEmail,
        pincode: cleanPin,
        address: String(address),
        date: String(date),
        time: String(time),
        tankType: String(tankType),
        capacity: numericCapacity,
        quantity: numericQuantity,
        paymentMethod:
          "after_service",
        total: pricing.total
      }
    );


    return res.status(200).json({

      success: true,

      paymentMethod:
        "after_service",

      bookingConfirmed:
        true,

      message:
        "Booking confirmed. You can pay after the tank cleaning service.",

      pricing:
        pricing

    });
  }


  /*
  ========================================================
  RAZORPAY ENVIRONMENT VARIABLES
  ========================================================
  */

  const keyId =
    process.env.RAZORPAY_KEY_ID;

  const keySecret =
    process.env.RAZORPAY_KEY_SECRET;


  if (!keyId || !keySecret) {

    console.error(
      "Razorpay environment variables are missing."
    );

    return res.status(500).json({
      error:
        "Payment system is not configured. Please contact VSH Tank Cleaning."
    });
  }


  /*
  ========================================================
  CREATE RAZORPAY ORDER
  ========================================================
  */

  try {

    const razorpay =
      new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });


    const order =
      await razorpay.orders.create({

        amount:
          Math.round(
            pricing.total * 100
          ),

        currency: "INR",

        receipt:
          `vsh_${Date.now()}`,

        notes: {

          name:
            String(name).substring(
              0,
              100
            ),

          phone:
            cleanPhone,

          email:
            cleanEmail,

          pincode:
            cleanPin,

          address:
            String(address).substring(
              0,
              250
            ),

          date:
            String(date),

          time:
            String(time),

          tankType:
            String(tankType),

          capacity:
            String(numericCapacity),

          quantity:
            String(numericQuantity),

          paymentMethod:
            "online"

        }
      });


    /*
    ======================================================
    SUCCESS
    ======================================================
    */

    return res.status(200).json({

      success: true,

      paymentMethod:
        "online",

      orderId:
        order.id,

      keyId:
        keyId,

      amount:
        order.amount,

      currency:
        order.currency,

      pricing:
        pricing

    });


  } catch (error) {

    console.error(
      "RAZORPAY ERROR:",
      error
    );


    return res.status(500).json({

      error:
        error?.error?.description ||
        error?.description ||
        error?.message ||
        "Unable to create Razorpay order."

    });
  }
}
