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


    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

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
        message: "Please fill in all booking details."
      });
    }


    // Delhi PIN validation
    if (!/^110\d{3}$/.test(String(pincode))) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Delhi PIN code."
      });
    }


    // Payment method validation
    if (
      paymentMethod !== "online" &&
      paymentMethod !== "after_service"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method."
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
        message: "Quantity must be between 1 and 20."
      });
    }


    // --------------------------------------------------
    // CALCULATE PRICE
    // --------------------------------------------------

    const unitPrice =
      getPrice(
        tankType,
        capacity
      );


    if (!unitPrice) {
      return res.status(400).json({
        success: false,
        message: "Invalid tank capacity."
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


    // 5% discount ONLY for online payment
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


    // --------------------------------------------------
    // BOOKING ID
    // --------------------------------------------------

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


    // --------------------------------------------------
    // SEND EMAIL THROUGH RESEND
    // --------------------------------------------------

    async function sendBookingEmail() {

      const resendApiKey =
        process.env.RESEND_API_KEY;

      const fromEmail =
        process.env.RESEND_FROM_EMAIL;

      const adminEmail =
        process.env.ADMIN_EMAIL;


      if (!resendApiKey) {

        console.error(
          "RESEND_API_KEY is missing."
        );

        return;

      }


      if (!fromEmail) {

        console.error(
          "RESEND_FROM_EMAIL is missing."
        );

        return;

      }


      const paymentText =
        paymentMethod === "online"
          ? "Paid Online"
          : "Pay After Service";


      const emailHTML = `

        <!DOCTYPE html>

        <html>

        <head>

          <meta charset="UTF-8">

          <meta name="viewport"
            content="width=device-width, initial-scale=1.0">

        </head>


        <body
          style="
            margin:0;
            padding:0;
            background:#f4f7fb;
            font-family:Arial,Helvetica,sans-serif;
            color:#172033;
          "
        >

          <div
            style="
              max-width:620px;
              margin:30px auto;
              background:#ffffff;
              border-radius:16px;
              overflow:hidden;
              box-shadow:0 8px 30px rgba(0,0,0,0.08);
            "
          >

            <div
              style="
                background:#0867ff;
                padding:28px;
                color:#ffffff;
              "
            >

              <h1
                style="
                  margin:0;
                  font-size:26px;
                "
              >
                VSH Tank Cleaning
              </h1>

              <p
                style="
                  margin:8px 0 0;
                  opacity:.9;
                "
              >
                Booking Confirmation
              </p>

            </div>


            <div
              style="
                padding:30px;
              "
            >

              <h2
                style="
                  margin-top:0;
                "
              >
                Booking Confirmed ✓
              </h2>


              <p>
                Hi <strong>${name}</strong>,
              </p>


              <p>
                Your VSH Tank Cleaning booking has been
                successfully confirmed.
              </p>


              <div
                style="
                  background:#f4f7fb;
                  border-radius:12px;
                  padding:20px;
                  margin:24px 0;
                "
              >

                <p>
                  <strong>Booking ID:</strong>
                  ${bookingId}
                </p>

                <p>
                  <strong>Tank Type:</strong>
                  ${tankType}
                </p>

                <p>
                  <strong>Capacity:</strong>
                  ${capacity} L
                </p>

                <p>
                  <strong>Quantity:</strong>
                  ${qty}
                </p>

                <p>
                  <strong>Service Date:</strong>
                  ${date}
                </p>

                <p>
                  <strong>Service Time:</strong>
                  ${time}
                </p>

                <p>
                  <strong>Address:</strong>
                  ${address}
                </p>

                <p>
                  <strong>PIN Code:</strong>
                  ${pincode}
                </p>

                <p>
                  <strong>Payment:</strong>
                  ${paymentText}
                </p>

                <p>
                  <strong>Total Amount:</strong>
                  ₹${total.toLocaleString("en-IN")}
                </p>

              </div>


              ${
                paymentMethod === "online"
                  ? `
                    <div
                      style="
                        background:#eaf8ef;
                        border:1px solid #b8e6c7;
                        border-radius:10px;
                        padding:15px;
                        color:#176b35;
                      "
                    >
                      <strong>
                        Online payment received successfully.
                      </strong>

                      <br>

                      You received an additional
                      5% online payment discount.
                    </div>
                  `
                  : `
                    <div
                      style="
                        background:#fff7e6;
                        border:1px solid #f4d99a;
                        border-radius:10px;
                        padding:15px;
                        color:#795500;
                      "
                    >
                      <strong>
                        Payment will be collected after service.
                      </strong>

                      <br>

                      Please pay ₹${total.toLocaleString("en-IN")}
                      to the VSH Tank Cleaning team after
                      the cleaning is completed.
                    </div>
                  `
              }


              <p
                style="
                  margin-top:28px;
                "
              >
                Thank you for choosing
                <strong>VSH Tank Cleaning</strong>.
              </p>


              <p
                style="
                  color:#667085;
                  font-size:13px;
                "
              >
                Please keep your booking ID for future
                reference.
              </p>

            </div>


            <div
              style="
                padding:20px 30px;
                background:#f8fafc;
                color:#667085;
                font-size:12px;
                text-align:center;
              "
            >

              VSH Tank Cleaning<br>

              Professional Water Tank Cleaning Services

            </div>

          </div>

        </body>

        </html>

      `;


      // -----------------------------------------------
      // CUSTOMER EMAIL
      // -----------------------------------------------

      const customerResponse =
        await fetch(
          "https://api.resend.com/emails",
          {

            method: "POST",

            headers: {

              Authorization:
                `Bearer ${resendApiKey}`,

              "Content-Type":
                "application/json"

            },

            body: JSON.stringify({

              from:
                fromEmail,

              to:
                [email],

              subject:
                `VSH Tank Cleaning — Booking Confirmed (${bookingId})`,

              html:
                emailHTML

            })

          }
        );


      const customerData =
        await customerResponse.json();


      if (!customerResponse.ok) {

        console.error(
          "Resend customer email error:",
          customerData
        );

      }


      // -----------------------------------------------
      // ADMIN EMAIL
      // -----------------------------------------------

      if (adminEmail) {

        const adminResponse =
          await fetch(
            "https://api.resend.com/emails",
            {

              method: "POST",

              headers: {

                Authorization:
                  `Bearer ${resendApiKey}`,

                "Content-Type":
                  "application/json"

              },

              body: JSON.stringify({

                from:
                  fromEmail,

                to:
                  [adminEmail],

                subject:
                  `New VSH Booking — ${bookingId}`,

                html: `

                  <h2>
                    New VSH Tank Cleaning Booking
                  </h2>

                  <p>
                    <strong>Booking ID:</strong>
                    ${bookingId}
                  </p>

                  <p>
                    <strong>Name:</strong>
                    ${name}
                  </p>

                  <p>
                    <strong>Phone:</strong>
                    ${phone}
                  </p>

                  <p>
                    <strong>Email:</strong>
                    ${email}
                  </p>

                  <p>
                    <strong>Address:</strong>
                    ${address}
                  </p>

                  <p>
                    <strong>PIN:</strong>
                    ${pincode}
                  </p>

                  <p>
                    <strong>Tank Type:</strong>
                    ${tankType}
                  </p>

                  <p>
                    <strong>Capacity:</strong>
                    ${capacity} L
                  </p>

                  <p>
                    <strong>Quantity:</strong>
                    ${qty}
                  </p>

                  <p>
                    <strong>Date:</strong>
                    ${date}
                  </p>

                  <p>
                    <strong>Time:</strong>
                    ${time}
                  </p>

                  <p>
                    <strong>Payment:</strong>
                    ${paymentText}
                  </p>

                  <p>
                    <strong>Subtotal:</strong>
                    ₹${subtotal.toLocaleString("en-IN")}
                  </p>

                  <p>
                    <strong>Quantity Discount:</strong>
                    ${quantityDiscountPercent}% OFF
                  </p>

                  <p>
                    <strong>Online Discount:</strong>
                    ${onlineDiscountPercent}% OFF
                  </p>

                  <p>
                    <strong>Total:</strong>
                    ₹${total.toLocaleString("en-IN")}
                  </p>

                `

              })

            }
          );


        const adminData =
          await adminResponse.json();


        if (!adminResponse.ok) {

          console.error(
            "Resend admin email error:",
            adminData
          );

        }

      }

    }


    // =================================================
    // PAY AFTER SERVICE
    // =================================================

    if (
      paymentMethod === "after_service"
    ) {

      // Send confirmation email
      await sendBookingEmail();


      return res.status(200).json({

        success: true,

        paymentMethod:
          "after_service",

        bookingId,

        amount:
          total,

        currency:
          "INR",

        summary: {

          subtotal,

          quantityDiscount,

          onlineDiscount: 0,

          total

        }

      });

    }


    // =================================================
    // ONLINE PAYMENT
    // =================================================

    const keyId =
      process.env.RAZORPAY_KEY_ID;

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET;


    if (
      !keyId ||
      !keySecret
    ) {

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


    // IMPORTANT:
    // Do NOT send the confirmation email here.
    // For online payments it will be sent only after
    // Razorpay payment verification succeeds.

    return res.status(200).json({

      success: true,

      paymentMethod:
        "online",

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

  }

  catch (error) {

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
