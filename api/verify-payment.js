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
      razorpay_signature
    } = req.body || {};

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment information."
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

    const generatedSignature =
      crypto
        .createHmac("sha256", keySecret)
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    const generatedBuffer =
      Buffer.from(generatedSignature);

    const receivedBuffer =
      Buffer.from(razorpay_signature);

    if (
      generatedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(
        generatedBuffer,
        receivedBuffer
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      paymentId: razorpay_payment_id
    });

  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error during payment verification."
    });
  }
}
