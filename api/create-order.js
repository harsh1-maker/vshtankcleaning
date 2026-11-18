/* =========================================================
   VSH TANK CLEANING
   /api/create-order.js
========================================================= */

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


function getDiscount(quantity) {

  const qty =
    Number(quantity);

  if (qty >= 5) {
    return 15;
  }

  return (
    QUANTITY_DISCOUNTS[qty] ||
    0
  );
}


function getPrice(
  tankType,
  capacity
) {

  return Number(
    PRICES[tankType]?.[capacity] ||
    0
  );
}


function calculateTotal(
  tankType,
  capacity,
  quantity
) {

  const unitPrice =
    getPrice(
      tankType,
      capacity
    );

  const qty =
    Number(quantity);

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

  const onlineDiscount =
    Math.round(
      afterQuantityDiscount *
      ONLINE_PAYMENT_DISCOUNT /
      100
    );

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


function sendJson(
  res,
  status,
  body
) {

  res.status(status)
    .json(body);
}


export default async function handler(
  req,
  res
) {

  /* -------------------------------------------------------
     METHOD
  ------------------------------------------------------- */

  if (
    req.method !== "POST"
  ) {

    return sendJson(
      res,
      405,
      {
        error:
          "Method not allowed."
      }
    );
  }


  /* -------------------------------------------------------
     ENVIRONMENT
  ------------------------------------------------------- */

  const keyId =
    process.env.RAZORPAY_KEY_ID;

  const keySecret =
    process.env.RAZORPAY_KEY_SECRET;


  if (
    !keyId ||
    !keySecret
  ) {

    console.error(
      "Missing Razorpay environment variables."
    );

    return sendJson(
      res,
      500,
      {
        error:
          "Payment system is not configured. Please contact VSH."
      }
    );
  }


  /* -------------------------------------------------------
     BODY
  ------------------------------------------------------- */

  let body =
    req.body;


  if (
    typeof body === "string"
  ) {

    try {

      body =
        JSON.parse(body);

    } catch (_) {

      return sendJson(
        res,
        400,
        {
          error:
            "Invalid request body."
        }
      );
    }
  }


  body =
    body || {};


  /* -------------------------------------------------------
     FIELDS
  ------------------------------------------------------- */

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


  /* -------------------------------------------------------
     VALIDATION
  ------------------------------------------------------- */

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

    return sendJson(
      res,
      400,
      {
        error:
          "Please complete all booking fields."
      }
    );
  }


  if (
    !/^[6-9]\d{9}$/.test(
      String(phone)
    )
  ) {

    return sendJson(
      res,
      400,
      {
        error:
          "Please enter a valid 10-digit Indian mobile number."
      }
    );
  }


  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      String(email)
    )
  ) {

    return sendJson(
      res,
      400,
      {
        error:
          "Please enter a valid email address."
      }
    );
  }


  if (
    !/^110\d{3}$/.test(
      String(pincode)
    )
  ) {

    return sendJson(
      res,
      400,
      {
        error:
          "Online booking is currently available only for Delhi PIN codes beginning with 110."
      }
    );
  }


  if (
    ![
      "overhead",
      "underground"
    ].includes(
      tankType
    )
  ) {

    return sendJson(
      res,
      400,
      {
        error:
          "Invalid tank type."
      }
    );
  }


  const numericCapacity =
    Number(capacity);

  const numericQuantity =
    Number(quantity);


  if (
    !Number.isFinite(
      numericCapacity
    ) ||
    !Number.isFinite(
      numericQuantity
    )
  ) {

    return sendJson(
      res,
      400,
      {
        error:
          "Invalid tank capacity or quantity."
      }
    );
  }


  if (
    numericQuantity < 1 ||
    numericQuantity > 20
  ) {

    return sendJson(
      res,
      400,
      {
        error:
          "Quantity must be between 1 and 20 tanks."
      }
    );
  }


  const unitPrice =
    getPrice(
      tankType,
      numericCapacity
    );


  if (
    unitPrice <= 0
  ) {

    return sendJson(
      res,
      400,
      {
        error:
          "The selected tank size is not available."
      }
    );
  }


  /* -------------------------------------------------------
     PAYMENT METHOD
  ------------------------------------------------------- */

  const method =
    paymentMethod ||
    "online";


  if (
    method !== "online"
  ) {

    return sendJson(
      res,
      400,
      {
        error:
          "Invalid payment method."
      }
    );
  }


  /* -------------------------------------------------------
     PRICE
  ------------------------------------------------------- */

  const pricing =
    calculateTotal(
      tankType,
      numericCapacity,
      numericQuantity
    );


  /* -------------------------------------------------------
     RAZORPAY
  ------------------------------------------------------- */

  try {

    const razorpay =
      new Razorpay({

        key_id:
          keyId,

        key_secret:
          keySecret

      });


    const order =
      await razorpay.orders.create({

        amount:
          Math.round(
            pricing.total * 100
          ),

        currency:
          "INR",

        receipt:
          `vsh_${Date.now()}`,

        notes: {

          name:
            String(name).slice(
              0,
              100
            ),

          phone:
            String(phone),

          email:
            String(email).slice(
              0,
              100
            ),

          pincode:
            String(pincode),

          address:
            String(address).slice(
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

          subtotal:
            String(pricing.subtotal),

          quantityDiscount:
            String(
              pricing.quantityDiscount
            ),

          onlineDiscount:
            String(
              pricing.onlineDiscount
            ),

          total:
            String(
              pricing.total
            )
        }

      });


    /* -----------------------------------------------------
       RESPONSE
    ----------------------------------------------------- */

    return sendJson(
      res,
      200,
      {

        success:
          true,

        orderId:
          order.id,

        keyId,

        amount:
          order.amount,

        currency:
          order.currency,

        pricing

      }
    );

  } catch (error) {

    console.error(
      "Razorpay order creation failed:",
      error
    );


    return sendJson(
      res,
      500,
      {
        error:
          error?.description ||
          error?.error?.description ||
          error?.message ||
          "Unable to create Razorpay order."
      }
    );
  }

}
