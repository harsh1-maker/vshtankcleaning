import express from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";
import Razorpay from "razorpay";
import "dotenv/config";

const app=express();
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const PORT=process.env.PORT||3000;

const razorpay=new Razorpay({
  key_id:process.env.RAZORPAY_KEY_ID,
  key_secret:process.env.RAZORPAY_KEY_SECRET
});

const PRICES={
  "Up to 500 L":499,
  "501–1,000 L":599,
  "1,001–1,500 L":799,
  "1,501–2,000 L":999,
  "2,500–5,000 L":1999
};

const dbPath=path.join(__dirname,"data","bookings.json");
fs.mkdirSync(path.dirname(dbPath),{recursive:true});
if(!fs.existsSync(dbPath)) fs.writeFileSync(dbPath,"[]");

app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

function readBookings(){return JSON.parse(fs.readFileSync(dbPath,"utf8"))}
function writeBookings(rows){fs.writeFileSync(dbPath,JSON.stringify(rows,null,2))}
function newBookingId(){return "VSH-"+Date.now().toString(36).toUpperCase()+"-"+crypto.randomBytes(2).toString("hex").toUpperCase()}

app.post("/api/create-order",async(req,res)=>{
  try{
    const b=req.body;
    if(!b.name||!b.phone||!b.email||!b.date||!b.time||!b.tankType||!b.capacity||!b.quantity||!b.address)
      return res.status(400).json({error:"Please complete all required fields."});

    const quantity=Number(b.quantity);
    const unitPrice=PRICES[b.capacity];
    if(!unitPrice||!Number.isInteger(quantity)||quantity<1||quantity>20)
      return res.status(400).json({error:"Invalid tank capacity or quantity."});

    const bookingId=newBookingId();
    const amount=unitPrice*quantity;

    const order=await razorpay.orders.create({
      amount:amount*100,
      currency:"INR",
      receipt:bookingId,
      notes:{booking_id:bookingId,capacity:b.capacity,quantity:String(quantity)}
    });

    const rows=readBookings();
    rows.push({
      bookingId,razorpayOrderId:order.id,status:"payment_pending",
      name:b.name,phone:b.phone,email:b.email,date:b.date,time:b.time,
      tankType:b.tankType,capacity:b.capacity,quantity,address:b.address,
      amount,createdAt:new Date().toISOString()
    });
    writeBookings(rows);

    res.json({
      keyId:process.env.RAZORPAY_KEY_ID,
      orderId:order.id,
      amount:order.amount,
      currency:order.currency,
      bookingId
    });
  }catch(error){
    console.error(error);
    res.status(500).json({error:"Could not create Razorpay order."});
  }
});

app.post("/api/verify-payment",(req,res)=>{
  try{
    const {razorpay_order_id,razorpay_payment_id,razorpay_signature,bookingId}=req.body;
    const rows=readBookings();
    const booking=rows.find(x=>x.bookingId===bookingId && x.razorpayOrderId===razorpay_order_id);
    if(!booking)return res.status(404).json({error:"Booking not found."});

    const expected=crypto
      .createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id+"|"+razorpay_payment_id)
      .digest("hex");

    if(expected!==razorpay_signature)
      return res.status(400).json({error:"Payment signature verification failed."});

    booking.status="paid";
    booking.razorpayPaymentId=razorpay_payment_id;
    booking.paidAt=new Date().toISOString();
    writeBookings(rows);

    res.json({ok:true,bookingId});
  }catch(error){
    console.error(error);
    res.status(500).json({error:"Payment verification failed."});
  }
});

app.get("*",(req,res)=>{
  res.sendFile(path.join(__dirname,"public","index.html"));
});

app.listen(PORT,()=>console.log(`VSH Tank Cleaning running at http://localhost:${PORT}`));
