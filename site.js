import {
  PRICES,
  calculateTotal
} from "./pricing-config.js";

document.addEventListener("DOMContentLoaded", function () {

  // =========================
  // PRICE CALCULATOR
  // =========================

  const money = (value) =>
    "₹" + Number(value).toLocaleString("en-IN");

  let selectedType = "overhead";
  let selectedCapacity = "5000";
  let quantity = 1;

  const capacityNames = {
    500: "Up to 500 L",
    1000: "501–1,000 L",
    1500: "1,001–1,500 L",
    2000: "1,501–2,000 L",
    3000: "2,001–3,000 L",
    5000: "2,500–5,000 L"
  };

  const capacityGrid =
    document.getElementById("capacityGrid");

  function renderPrices(type) {

    if (!capacityGrid) return;

    const prices = PRICES[type];

    capacityGrid.innerHTML = "";

    Object.entries(prices).forEach(
      ([capacity, price]) => {

        const button =
          document.createElement("button");

        button.type = "button";

        button.className =
          "capacity" +
          (String(capacity) === String(selectedCapacity)
            ? " active"
            : "");

        button.dataset.cap = capacity;

        button.innerHTML = `
          <b>${capacityNames[capacity] || capacity + " L"}</b><br>

          <span class="cost">
            ${money(price)}
          </span>

          <span class="old">
            ${money(Math.round(price * 1.2))}
          </span>

          <span class="save">
            Save ${money(Math.round(price * 0.2))}
          </span>
        `;

        button.addEventListener(
          "click",
          function () {

            selectedCapacity =
              String(capacity);

            renderPrices(selectedType);
            updateCalculator();
          }
        );

        capacityGrid.appendChild(button);
      }
    );
  }

  function updateCalculator() {

    const result =
      calculateTotal(
        selectedType,
        selectedCapacity,
        quantity
      );

    const qtyElement =
      document.getElementById("qty");

    const totalElement =
      document.getElementById("total");

    if (qtyElement) {
      qtyElement.textContent = quantity;
    }

    if (totalElement) {
      totalElement.textContent =
        money(result.total);
    }
  }

  // Tank type buttons

  document
    .querySelectorAll(".tab")
    .forEach(function (tab) {

      tab.addEventListener(
        "click",
        function () {

          document
            .querySelectorAll(".tab")
            .forEach(function (item) {
              item.classList.remove("active");
            });

          tab.classList.add("active");

          selectedType =
            tab.dataset.type;

          selectedCapacity =
            Object.keys(
              PRICES[selectedType]
            )[0];

          renderPrices(selectedType);
          updateCalculator();
        }
      );
    });

  // Quantity buttons

  const minus =
    document.getElementById("minus");

  const plus =
    document.getElementById("plus");

  if (minus) {

    minus.addEventListener(
      "click",
      function () {

        quantity =
          Math.max(1, quantity - 1);

        updateCalculator();
      }
    );
  }

  if (plus) {

    plus.addEventListener(
      "click",
      function () {

        quantity =
          Math.min(20, quantity + 1);

        updateCalculator();
      }
    );
  }

  renderPrices(selectedType);
  updateCalculator();


  // =========================
  // BOOK NOW BUTTON
  // =========================

  const bookPrice =
    document.getElementById("bookPrice");

  if (bookPrice) {

    bookPrice.addEventListener(
      "click",
      function () {

        window.location.href =
          "pricing.html#book";

      }
    );
  }


  // =========================
  // BOOKING FORM
  // =========================

  const form =
    document.getElementById("bookingForm");

  if (!form) return;


  // IMPORTANT:
  // Prevent the browser from refreshing
  // the page when the form is submitted.

  form.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();
      event.stopPropagation();

      const button =
        form.querySelector(
          'button[type="submit"]'
        );

      if (button) {
        button.disabled = true;
        button.textContent =
          "Creating payment...";
      }

      try {

        const formData =
          new FormData(form);

        const bookingData = {
          name: formData.get("name"),
          phone: formData.get("phone"),
          email: formData.get("email"),
          address: formData.get("address"),
          pincode: formData.get("pincode"),
          tankType: formData.get("tankType"),
          capacity: formData.get("capacity"),
          quantity:
            Number(formData.get("quantity")),
          date: formData.get("date"),
          time: formData.get("time")
        };


        // =========================
        // CREATE RAZORPAY ORDER
        // =========================

        const response =
          await fetch(
            "/api/create-order.js",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify(
                  bookingData
                )
            }
          );


        // Read response as text first.
        // This prevents the
        // "Unexpected token A" error.

        const responseText =
          await response.text();

        let order;

        try {

          order =
            JSON.parse(
              responseText
            );

        } catch (parseError) {

          console.error(
            "Server returned:",
            responseText
          );

          throw new Error(
            "Server error. Razorpay order could not be created."
          );
        }


        if (
          !response.ok ||
          !order.success
        ) {

          throw new Error(
            order.message ||
            "Unable to create payment."
          );
        }


        // =========================
        // OPEN RAZORPAY
        // =========================

        if (
          typeof Razorpay ===
          "undefined"
        ) {

          throw new Error(
            "Razorpay checkout could not be loaded."
          );
        }


        const options = {

          key: order.keyId,

          amount: order.amount,

          currency:
            order.currency || "INR",

          order_id:
            order.orderId,

          name:
            "VSH Tank Cleaning",

          description:
            "Water Tank Cleaning Booking",

          prefill: {

            name:
              bookingData.name,

            email:
              bookingData.email,

            contact:
              bookingData.phone
          },

          theme: {
            color: "#0877f9"
          },


          handler:
            async function (
              payment
            ) {

              try {

                const verifyResponse =
                  await fetch(
                    "/api/verify-payment.js",
                    {
                      method: "POST",

                      headers: {
                        "Content-Type":
                          "application/json"
                      },

                      body:
                        JSON.stringify(
                          payment
                        )
                    }
                  );


                const verifyText =
                  await verifyResponse.text();

                let verification;

                try {

                  verification =
                    JSON.parse(
                      verifyText
                    );

                } catch (e) {

                  throw new Error(
                    "Payment verification server returned an invalid response."
                  );
                }


                if (
                  !verifyResponse.ok ||
                  !verification.success
                ) {

                  throw new Error(
                    verification.message ||
                    "Payment verification failed."
                  );
                }


                const success =
                  document.getElementById(
                    "success"
                  );

                if (success) {

                  success.style.display =
                    "block";

                  success.innerHTML = `
                    <b>Booking confirmed!</b><br>
                    Booking ID:
                    ${verification.bookingId || order.bookingId}
                  `;
                }

                form.reset();

                if (button) {

                  button.disabled =
                    false;

                  button.textContent =
                    "Pay & Book Cleaning";
                }

              } catch (error) {

                alert(
                  error.message
                );

                if (button) {

                  button.disabled =
                    false;

                  button.textContent =
                    "Pay & Book Cleaning";
                }
              }
            }
        };


        const razorpay =
          new Razorpay(options);


        razorpay.on(
          "payment.failed",
          function () {

            alert(
              "Payment failed. Please try again."
            );

            if (button) {

              button.disabled =
                false;

              button.textContent =
                "Pay & Book Cleaning";
            }
          }
        );


        razorpay.open();

      } catch (error) {

        console.error(
          "Booking error:",
          error
        );

        alert(
          error.message ||
          "Something went wrong while starting payment."
        );

        if (button) {

          button.disabled =
            false;

          button.textContent =
            "Pay & Book Cleaning";
        }
      }

    }
  );

});
