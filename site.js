import {
  PRICES,
  calculateTotal
} from "./pricing-config.js";

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("bookingForm");

  if (!form) return;

  const tankType =
    document.getElementById("tankType");

  const capacity =
    document.getElementById("capacity");

  const quantity =
    document.getElementById("quantity");

  const unitPrice =
    document.getElementById("unitPrice");

  const subtotal =
    document.getElementById("subtotal");

  const quantityDiscount =
    document.getElementById("quantityDiscount");

  const onlineDiscount =
    document.getElementById("onlineDiscount");

  const total =
    document.getElementById("total");

  const payButton =
    document.getElementById("payButton");

  const cashButton =
    document.getElementById("cashButton");

  const bookingError =
    document.getElementById("bookingError");

  const success =
    document.getElementById("success");

  function money(amount) {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  }

  function populateCapacity() {

    const type = tankType.value;

    const prices =
      PRICES[type] || {};

    capacity.innerHTML = "";

    Object.keys(prices).forEach(value => {

      const option =
        document.createElement("option");

      option.value = value;

      option.textContent =
        `${Number(value).toLocaleString("en-IN")} litres`;

      capacity.appendChild(option);
    });

    calculatePrice();
  }

  function getPaymentMethod() {

    const selected =
      document.querySelector(
        'input[name="paymentMethod"]:checked'
      );

    return selected
      ? selected.value
      : "online";
  }

  function calculatePrice() {

    const result =
      calculateTotal(
        tankType.value,
        capacity.value,
        Number(quantity.value || 1),
        getPaymentMethod()
      );

    unitPrice.textContent =
      money(result.unitPrice);

    subtotal.textContent =
      money(result.subtotal);

    quantityDiscount.textContent =
      result.quantityDiscount > 0
        ? `− ${money(result.quantityDiscount)}`
        : "₹0";

    onlineDiscount.textContent =
      result.onlineDiscount > 0
        ? `− ${money(result.onlineDiscount)}`
        : "₹0";

    total.textContent =
      money(result.total);

    if (getPaymentMethod() === "online") {

      payButton.textContent =
        `Pay Online & Save 5% — ${money(result.total)}`;

      cashButton.textContent =
        `Pay Cash — ${money(
          calculateTotal(
            tankType.value,
            capacity.value,
            Number(quantity.value || 1),
            "cash"
          ).total
        )}`;

    } else {

      payButton.textContent =
        `Pay Online & Save 5%`;

      cashButton.textContent =
        `Book & Pay Cash — ${money(result.total)}`;
    }
  }

  document
    .querySelectorAll(
      'input[name="paymentMethod"]'
    )
    .forEach(input => {

      input.addEventListener(
        "change",
        calculatePrice
      );

    });

  tankType.addEventListener(
    "change",
    populateCapacity
  );

  capacity.addEventListener(
    "change",
    calculatePrice
  );

  quantity.addEventListener(
    "change",
    calculatePrice
  );

  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      bookingError.style.display = "none";

      const paymentMethod =
        getPaymentMethod();

      const formData =
        new FormData(form);

      const payload =
        Object.fromEntries(formData.entries());

      payload.paymentMethod =
        paymentMethod;

      payload.quantity =
        Number(payload.quantity);

      const submitButton =
        paymentMethod === "online"
          ? payButton
          : cashButton;

      submitButton.disabled = true;

      submitButton.textContent =
        paymentMethod === "online"
          ? "Creating secure payment..."
          : "Confirming booking...";

      try {

        const response =
          await fetch(
            "/api/create-order",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify(payload)
            }
          );

        const data =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
            "Unable to create booking."
          );
        }

        if (paymentMethod === "cash") {

          showSuccess(
            data.bookingId,
            "Cash",
            data.amount
          );

          return;
        }

        const options = {

          key: data.keyId,

          amount: data.amount,

          currency: data.currency,

          name:
            "VSH Tank Cleaning",

          description:
            "Professional Water Tank Cleaning",

          order_id:
            data.orderId,

          prefill: {
            name:
              payload.name,

            email:
              payload.email,

            contact:
              payload.phone
          },

          theme: {
            color: "#0867ff"
          },

          handler:
            async function (
              paymentResponse
            ) {

              try {

                const verify =
                  await fetch(
                    "/api/verify-payment",
                    {
                      method: "POST",

                      headers: {
                        "Content-Type":
                          "application/json"
                      },

                      body:
                        JSON.stringify({
                          ...paymentResponse,
                          bookingId:
                            data.bookingId
                        })
                    }
                  );

                const verifyData =
                  await verify.json();

                if (
                  !verify.ok ||
                  !verifyData.success
                ) {
                  throw new Error(
                    verifyData.message ||
                    "Payment verification failed."
                  );
                }

                showSuccess(
                  data.bookingId,
                  "Online Payment",
                  data.amount / 100
                );

              } catch (error) {

                showError(
                  error.message
                );

              }
            },

          modal: {
            ondismiss: function () {
              calculatePrice();
            }
          }
        };

        const razorpay =
          new Razorpay(options);

        razorpay.on(
          "payment.failed",
          function (response) {

            showError(
              response.error?.description ||
              "Payment failed. Please try again."
            );

            calculatePrice();
          }
        );

        razorpay.open();

      } catch (error) {

        showError(
          error.message ||
          "Something went wrong."
        );

        calculatePrice();
      }

    }
  );

  function showError(message) {

    bookingError.style.display =
      "block";

    bookingError.textContent =
      `✕ ${message}`;
  }

  function showSuccess(
    bookingId,
    paymentMethod,
    amount
  ) {

    form.style.display =
      "none";

    success.style.display =
      "block";

    success.innerHTML = `

      <div class="success-icon">
        ✓
      </div>

      <h2>
        Booking Confirmed!
      </h2>

      <p>
        ${
          paymentMethod === "Online Payment"
            ? "Your online payment has been received successfully."
            : "Your booking is confirmed. Please pay cash after the service is completed."
        }
      </p>

      <div class="booking-confirmation">

        <div>
          <span>Booking ID</span>
          <strong>
            ${bookingId}
          </strong>
        </div>

        <div>
          <span>Total</span>
          <strong>
            ${money(amount)}
          </strong>
        </div>

        <div>
          <span>Payment</span>
          <strong>
            ${paymentMethod}
          </strong>
        </div>

      </div>

      <p>
        Keep your booking ID for reference.
      </p>

      <a
        class="btn btn-primary"
        href="https://wa.me/919599057079?text=${encodeURIComponent(
          `Hi VSH Tank Cleaning, my booking ID is ${bookingId}.`
        )}"
        target="_blank"
      >
        WhatsApp VSH
      </a>
    `;
  }

  populateCapacity();
  calculatePrice();

});
