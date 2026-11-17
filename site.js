import { PRICES, getQuantityDiscount, getUnitPrice, calculateTotal } from "./pricing-config.js";

const capacityLabels = {
  500: "Up to 500 L",
  1000: "501–1,000 L",
  1500: "1,001–1,500 L",
  2000: "1,501–2,000 L",
  3000: "2,001–3,000 L",
  5000: "2,500–5,000 L"
};

export function formatINR(value){
  return "₹" + Number(value).toLocaleString("en-IN");
}

export function renderPricingTable(container, type="overhead"){
  const prices = PRICES[type];
  container.innerHTML = Object.entries(prices).map(([capacity, price]) => `
    <div class="price-row">
      <div><strong>${capacityLabels[capacity] || `${capacity} L`}</strong><div class="small">${type === "overhead" ? "Overhead tank" : "Underground tank"}</div></div>
      <div class="price">${formatINR(price)}</div>
      <div class="save">Online booking</div>
    </div>
  `).join("");
}

export function setupPriceTabs(){
  document.querySelectorAll("[data-price-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-price-tab]").forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      renderPricingTable(document.querySelector("#pricing-table"), btn.dataset.priceTab);
    });
  });
  renderPricingTable(document.querySelector("#pricing-table"), "overhead");
}

export function setupCalculator(){
  const type = document.querySelector("#tankType");
  const capacity = document.querySelector("#capacity");
  const quantity = document.querySelector("#quantity");
  const total = document.querySelector("#calcTotal");
  const discount = document.querySelector("#calcDiscount");

  function update(){
    const qty = Math.max(1, Number(quantity.value || 1));
    const tanks = Array.from({length:qty}, () => ({tankType:type.value, capacity:capacity.value}));
    const result = calculateTotal(tanks);
    total.textContent = formatINR(result.total);
    discount.textContent = result.discountPercent ? `${result.discountPercent}% quantity discount included` : "No quantity discount";
  }
  [type, capacity, quantity].forEach(el => el.addEventListener("change", update));
  update();
}

export function setupBooking(){
  const form = document.querySelector("#bookingForm");
  if(!form) return;

  const type = document.querySelector("#tankType");
  const capacity = document.querySelector("#capacity");
  const quantity = document.querySelector("#quantity");
  const amount = document.querySelector("#bookingAmount");

  function refresh(){
    const qty = Math.max(1, Number(quantity.value || 1));
    const tanks = Array.from({length:qty}, () => ({tankType:type.value, capacity:capacity.value}));
    amount.textContent = formatINR(calculateTotal(tanks).total);
  }
  [type,capacity,quantity].forEach(el => el.addEventListener("change",refresh));
  refresh();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    button.textContent = "Creating secure payment…";

    const payload = Object.fromEntries(new FormData(form).entries());
    payload.quantity = Number(payload.quantity);

    try{
      const orderRes = await fetch("/api/create-order.js", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(payload)
      });
      const order = await orderRes.json();
      if(!orderRes.ok || !order.success) throw new Error(order.message || "Unable to create order.");

      if(typeof Razorpay === "undefined") throw new Error("Razorpay checkout did not load.");

      const rzp = new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "VSH Tank Cleaning",
        description: "Water tank cleaning booking",
        order_id: order.orderId,
        prefill: {
          name: payload.name,
          email: payload.email,
          contact: payload.phone
        },
        notes: {booking_id: order.bookingId},
        theme: {color:"#0b67d8"},
        handler: async function(response){
          button.textContent = "Verifying payment…";
          const verifyRes = await fetch("/api/verify-payment.js", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(response)
          });
          const verify = await verifyRes.json();
          if(!verifyRes.ok || !verify.success) throw new Error(verify.message || "Payment verification failed.");
          document.querySelector("#bookingSuccess").style.display = "block";
          document.querySelector("#bookingSuccess").innerHTML = `<strong>Booking confirmed.</strong><br>Booking ID: ${verify.bookingId || order.bookingId}`;
          form.reset();
          refresh();
          button.disabled = false;
          button.textContent = "Pay & Book Cleaning";
        }
      });
      rzp.on("payment.failed", function(resp){
        alert(resp.error?.description || "Payment failed. Please try again.");
        button.disabled = false;
        button.textContent = "Pay & Book Cleaning";
      });
      rzp.open();
    }catch(err){
      alert(err.message || "Something went wrong.");
      button.disabled = false;
      button.textContent = "Pay & Book Cleaning";
    }
  });
}
