import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment information." });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({ success: false, message: "Razorpay is not configured." });
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const generatedBuffer = Buffer.from(generatedSignature, "utf8");
    const receivedBuffer = Buffer.from(razorpay_signature, "utf8");

    if (
      generatedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(generatedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({ success: false, message: "Payment verification failed." });
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const orderResponse = await fetch(
      `https://api.razorpay.com/v1/orders/${razorpay_order_id}`,
      {
        method: "GET",
        headers: { Authorization: `Basic ${auth}` }
      }
    );

    const order = await orderResponse.json();

    if (!orderResponse.ok) {
      console.error("Razorpay order fetch error:", order);
      return res.status(500).json({
        success: false,
        message: "Could not retrieve Razorpay order."
      });
    }

    const notes = order.notes || {};
    const amount = Number(order.amount) / 100;

    const resendApiKey = process.env.RESEND_API_KEY;
    const orderEmail = process.env.ORDER_EMAIL;
    const emailFrom =
      process.env.EMAIL_FROM || "VSH Tank Cleaning <onboarding@resend.dev>";

    if (!resendApiKey || !orderEmail) {
      return res.status(500).json({
        success: false,
        message: "Payment verified, but email notification is not configured."
      });
    }

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>New VSH Tank Cleaning Order</title></head>
<body style="margin:0;background:#f4f8fc;font-family:Arial,Helvetica,sans-serif;color:#172033">
<div style="max-width:700px;margin:30px auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb">
<div style="background:#0866d6;padding:28px;color:#fff">
<h1 style="margin:0">VSH Tank Cleaning</h1>
<p style="margin:8px 0 0">New Paid Booking</p>
</div>
<div style="padding:30px">
<div style="background:#ecfdf5;border:1px solid #a7f3d0;padding:15px;border-radius:8px;color:#065f46;font-weight:bold;margin-bottom:25px">
✓ Payment successfully verified
</div>
<h2 style="color:#0866d6">Booking Details</h2>
<table style="width:100%;border-collapse:collapse">
${row("Booking ID", notes.booking_id)}
${row("Customer Name", notes.customer_name)}
${row("Phone", notes.customer_phone)}
${row("Email", notes.customer_email)}
${row("Address", notes.customer_address)}
${row("Tank Type", notes.tank_type)}
${row("Tank Capacity", `${notes.tank_capacity || "-"} L`)}
${row("Quantity", notes.quantity)}
${row("Service Date", notes.booking_date)}
${row("Preferred Time", notes.booking_time)}
<tr>
<td style="padding:15px 0;font-weight:bold;font-size:18px">Amount Paid</td>
<td style="padding:15px 0;color:#0866d6;font-weight:bold;font-size:22px">
₹${amount.toLocaleString("en-IN")}
</td>
</tr>
</table>
<div style="margin-top:25px;padding:18px;background:#f8fafc;border-radius:8px">
<p style="margin:0 0 8px"><strong>Razorpay Order ID:</strong> ${escapeHtml(razorpay_order_id)}</p>
<p style="margin:0"><strong>Razorpay Payment ID:</strong> ${escapeHtml(razorpay_payment_id)}</p>
</div>
</div>
<div style="background:#f8fafc;padding:20px 30px;color:#64748b;font-size:13px">
VSH Tank Cleaning — New booking notification
</div>
</div>
</body>
</html>`;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [orderEmail],
        subject: `New VSH Tank Cleaning Order — ${notes.booking_id || razorpay_order_id}`,
        html
      })
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend error:", emailData);
      return res.status(500).json({
        success: false,
        message: "Payment verified, but order email could not be sent."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and order notification sent.",
      bookingId: notes.booking_id,
      paymentId: razorpay_payment_id
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during payment verification."
    });
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function row(label, value) {
  return `<tr>
<td style="padding:12px 0;border-bottom:1px solid #eee;font-weight:bold">${escapeHtml(label)}</td>
<td style="padding:12px 0;border-bottom:1px solid #eee">${escapeHtml(value)}</td>
</tr>`;
}
