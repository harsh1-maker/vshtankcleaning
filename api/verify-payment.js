import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({success:false,message:"Method not allowed"});

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({success:false,message:"Missing payment information."});
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return res.status(500).json({success:false,message:"Razorpay is not configured."});

    const generated = crypto.createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");

    const a = Buffer.from(generated,"utf8");
    const b = Buffer.from(razorpay_signature,"utf8");
    if (a.length !== b.length || !crypto.timingSafeEqual(a,b)) {
      return res.status(400).json({success:false,message:"Payment verification failed."});
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}`, {
      headers:{Authorization:`Basic ${auth}`}
    });
    const order = await orderResponse.json();
    if (!orderResponse.ok) return res.status(500).json({success:false,message:"Could not retrieve Razorpay order."});

    const notes = order.notes || {};
    const resendApiKey = process.env.RESEND_API_KEY;
    const orderEmail = process.env.ORDER_EMAIL;
    const emailFrom = process.env.EMAIL_FROM || "VSH Tank Cleaning <onboarding@resend.dev>";

    if (!resendApiKey || !orderEmail) {
      return res.status(500).json({success:false,message:"Payment verified, but email notification is not configured."});
    }

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto">
        <h2 style="color:#0b67d8">New VSH Tank Cleaning Booking</h2>
        <table style="width:100%;border-collapse:collapse">
          ${row("Booking ID",notes.booking_id || razorpay_order_id)}
          ${row("Name",notes.customer_name)}
          ${row("Phone",notes.customer_phone)}
          ${row("Email",notes.customer_email)}
          ${row("Address",notes.customer_address)}
          ${row("PIN code",notes.pincode)}
          ${row("Tank type",notes.tank_type)}
          ${row("Capacity",notes.tank_capacity + " L")}
          ${row("Quantity",notes.quantity)}
          ${row("Discount",notes.discount_percent + "%")}
          ${row("Date",notes.booking_date)}
          ${row("Time",notes.booking_time)}
          ${row("Amount","₹" + (Number(order.amount)/100).toLocaleString("en-IN"))}
          ${row("Payment ID",razorpay_payment_id)}
        </table>
      </div>`;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method:"POST",
      headers:{Authorization:`Bearer ${resendApiKey}`,"Content-Type":"application/json"},
      body:JSON.stringify({
        from:emailFrom,
        to:[orderEmail],
        subject:`New VSH Tank Cleaning Order — ${notes.booking_id || razorpay_order_id}`,
        html
      })
    });
    const emailData = await emailResponse.json();
    if (!emailResponse.ok) {
      console.error("Resend error:",emailData);
      return res.status(500).json({success:false,message:"Payment verified, but order email could not be sent."});
    }

    return res.status(200).json({success:true,message:"Payment verified and order notification sent.",bookingId:notes.booking_id,paymentId:razorpay_payment_id});
  } catch(error) {
    console.error("Payment verification error:",error);
    return res.status(500).json({success:false,message:"Server error during payment verification."});
  }
}

function escapeHtml(value) {
  return String(value || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}
function row(label,value) {
  return `<tr><td style="padding:12px 0;border-bottom:1px solid #eee;font-weight:bold">${escapeHtml(label)}</td><td style="padding:12px 0;border-bottom:1px solid #eee">${escapeHtml(value)}</td></tr>`;
}
