import crypto from "crypto";

export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  }


  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId
    } = req.body || {};


    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !bookingId
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Missing payment verification details."
      });

    }


    const secret =
      process.env.RAZORPAY_KEY_SECRET;


    if (!secret) {

      return res.status(500).json({
        success: false,
        message:
          "Razorpay is not configured."
      });

    }


    // ------------------------------------------------
    // VERIFY RAZORPAY SIGNATURE
    // ------------------------------------------------

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          secret
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");


    const isValid =
      crypto.timingSafeEqual(
        Buffer.from(
          generatedSignature
        ),
        Buffer.from(
          razorpay_signature
        )
      );


    if (!isValid) {

      return res.status(400).json({

        success: false,

        message:
          "Payment verification failed."

      });

    }


    // ------------------------------------------------
    // PAYMENT VERIFIED
    // ------------------------------------------------

    // NOTE:
    // This endpoint currently only receives the booking ID
    // from the frontend. To send the complete customer
    // booking email here, the booking details must also be
    // stored server-side when the Razorpay order is created.
    //
    // The payment is successfully verified below.


    return res.status(200).json({

      success: true,

      bookingId,

      paymentId:
        razorpay_payment_id,

      message:
        "Payment verified successfully."

    });

  }

  catch (error) {

    console.error(
      "Payment verification error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Unable to verify payment."

    });

  }

}
