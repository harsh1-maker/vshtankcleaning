import express from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import Razorpay from "razorpay";
import "dotenv/config";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// ======================================================
// RAZORPAY
// ======================================================

function getRazorpay() {
  if (
    !process.env.RAZORPAY_KEY_ID ||
    !process.env.RAZORPAY_KEY_SECRET
  ) {
    throw new Error("Razorpay environment variables are missing.");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// ======================================================
// PRICES
// ======================================================

const PRICES = {
  "Up to 500 L": 499,
  "501–1,000 L": 599,
  "1,001–1,500 L": 799,
  "1,501–2,000 L": 999,
  "2,500–5,000 L": 1999,
};

// ======================================================
// BOOKING STORAGE
// ======================================================

// Vercel does not allow writing to /var/task.
// /tmp is writable in Vercel serverless functions.

const DATA_DIR = path.join(os.tmpdir(), "vsh-tank-cleaning");

const dbPath = path.join(DATA_DIR, "bookings.json");

try {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, "[]", "utf8");
  }
} catch (error) {
  console.error("Could not initialize booking storage:", error);
}

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(express.json());

app.use(
  express.static(path.join(__dirname, "public"))
);

// ======================================================
// BOOKING FUNCTIONS
// ======================================================

function readBookings() {
  try {
    if (!fs.existsSync(dbPath)) {
      return [];
    }

    return JSON.parse(
      fs.readFileSync(dbPath, "utf8")
    );
  } catch (error) {
    console.error("Could not read bookings:", error);
    return [];
  }
}

function writeBookings(rows) {
  try {
    fs.writeFileSync(
      dbPath,
      JSON.stringify(rows, null, 2),
      "utf8"
    );
  } catch (error) {
    console.error("Could not write bookings:", error);
    throw error;
  }
}

function newBookingId() {
  return (
    "VSH-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    crypto.randomBytes(2).toString("hex").toUpperCase()
  );
}

// ======================================================
// CREATE RAZORPAY ORDER
// ======================================================

app.post("/api/create-order", async (req, res) => {
  try {
    // Check required fields
    const b = req.body;

    if (
      !b.name ||
      !b.phone ||
      !b.email ||
      !b.date ||
      !b.time ||
      !b.tankType ||
      !b.capacity ||
      !b.quantity ||
      !b.address
    ) {
      return res.status(400).json({
        error: "Please complete all required fields.",
      });
    }

    // Validate quantity
    const quantity = Number(b.quantity);

    // Validate price
    const unitPrice = PRICES[b.capacity];

    if (
      !unitPrice ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 20
    ) {
      return res.status(400).json({
        error: "Invalid tank capacity or quantity.",
      });
    }

    // Check Razorpay credentials only when payment is requested
    if (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      return res.status(503).json({
        error:
          "Online payment is currently unavailable. Razorpay has not been configured yet.",
      });
    }

    const bookingId = newBookingId();

    const amount = unitPrice * quantity;

    // Create Razorpay order
    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: bookingId,

      notes: {
        booking_id: bookingId,
        capacity: b.capacity,
        quantity: String(quantity),
      },
    });

    // Save booking
    const rows = readBookings();

    rows.push({
      bookingId,
      razorpayOrderId: order.id,
      status: "payment_pending",

      name: b.name,
      phone: b.phone,
      email: b.email,

      date: b.date,
      time: b.time,

      tankType: b.tankType,
      capacity: b.capacity,
      quantity: quantity,

      address: b.address,

      amount: amount,

      createdAt: new Date().toISOString(),
    });

    writeBookings(rows);

    // Send order information to frontend
    return res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      error: "Could not create Razorpay order.",
    });
  }
});

// ======================================================
// VERIFY RAZORPAY PAYMENT
// ======================================================

app.post("/api/verify-payment", (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !bookingId
    ) {
      return res.status(400).json({
        error: "Missing payment information.",
      });
    }

    // Check Razorpay secret
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({
        error:
          "Payment verification is currently unavailable.",
      });
    }

    const rows = readBookings();

    const booking = rows.find(
      (x) =>
        x.bookingId === bookingId &&
        x.razorpayOrderId === razorpay_order_id
    );

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found.",
      });
    }

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        razorpay_order_id +
          "|" +
          razorpay_payment_id
      )
      .digest("hex");

    // Compare signatures
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        error:
          "Payment signature verification failed.",
      });
    }

    // Mark booking as paid
    booking.status = "paid";

    booking.razorpayPaymentId =
      razorpay_payment_id;

    booking.paidAt =
      new Date().toISOString();

    writeBookings(rows);

    return res.json({
      ok: true,
      bookingId,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      error: "Payment verification failed.",
    });
  }
});

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "VSH Tank Cleaning",
  });
});

// ======================================================
// FRONTEND FALLBACK
// ======================================================

app.get("/{*splat}", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "public",
      "index.html"
    )
  );
});

// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {
  console.log(
    `VSH Tank Cleaning running at http://localhost:${PORT}`
  );
});
