// =====================================================
// VSH TANK CLEANING — GLOBAL SITE JS
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

  // ===================================================
  // MOBILE MENU
  // ===================================================

  const mobileMenu =
    document.querySelector(".mobile-menu");

  const navLinks =
    document.querySelector(".nav-links");

  const navActions =
    document.querySelector(".nav-actions");

  if (mobileMenu) {

    mobileMenu.addEventListener("click", function () {

      const isOpen =
        document.body.classList.toggle("mobile-nav-open");

      mobileMenu.setAttribute(
        "aria-expanded",
        isOpen ? "true" : "false"
      );

      mobileMenu.innerHTML =
        isOpen ? "✕" : "☰";

    });

  }


  // Close mobile menu when clicking a link
  document
    .querySelectorAll(".nav-links a, .nav-actions a")
    .forEach(function (link) {

      link.addEventListener("click", function () {

        document.body.classList.remove(
          "mobile-nav-open"
        );

        if (mobileMenu) {

          mobileMenu.innerHTML = "☰";

          mobileMenu.setAttribute(
            "aria-expanded",
            "false"
          );

        }

      });

    });


  // ===================================================
  // WHATSAPP LINKS
  // ===================================================

  document
    .querySelectorAll("[data-whatsapp]")
    .forEach(function (element) {

      const message =
        element.dataset.whatsapp;

      if (message) {

        element.href =
          "https://wa.me/919599057079?text=" +
          encodeURIComponent(message);

      }

    });


  // ===================================================
  // PRICING SYSTEM
  // ===================================================

  const PRICES = {

    overhead: {

      500: 499,
      1000: 599,
      1500: 799,
      2000: 999,
      5000: 1999

    },

    underground: {

      500: 799,
      1000: 899,
      1500: 999,
      2000: 1099,
      3000: 1299,
      5000: 1999

    }

  };


  function getQuantityDiscount(quantity) {

    quantity =
      Number(quantity);

    if (quantity >= 5) return 15;

    if (quantity === 4) return 14;

    if (quantity === 3) return 12;

    if (quantity === 2) return 10;

    return 0;

  }


  // ===================================================
  // PRICING PAGE ELEMENTS
  // ===================================================

  const form =
    document.getElementById("bookingForm");

  const tankTypeButtons =
    document.querySelectorAll(
      "[data-tank-type]"
    );

  const capacityGrid =
    document.querySelector(
      ".capacity-grid"
    );

  const quantityMinus =
    document.querySelector(
      "[data-quantity-minus]"
    );

  const quantityPlus =
    document.querySelector(
      "[data-quantity-plus]"
    );

  const quantityDisplay =
    document.querySelector(
      "[data-quantity]"
    );

  const selectedTankType =
    document.getElementById(
      "selectedTankType"
    );

  const selectedCapacity =
    document.getElementById(
      "selectedCapacity"
    );

  const selectedQuantity =
    document.getElementById(
      "selectedQuantity"
    );

  const subtotalDisplay =
    document.querySelector(
      "[data-price-subtotal]"
    );

  const discountAmountDisplay =
    document.querySelector(
      "[data-discount-amount]"
    );

  const totalDisplay =
    document.querySelector(
      "[data-price-total]"
    );

  const discountText =
    document.querySelector(
      "[data-discount-text]"
    );

  const addMoreText =
    document.querySelector(
      "[data-add-more]"
    );

  const bookingError =
    document.getElementById(
      "bookingError"
    );

  const bookingSuccess =
    document.getElementById(
      "bookingSuccess"
    );

  const submitButton =
    form
      ? form.querySelector(
          'button[type="submit"]'
        )
      : null;


  // ===================================================
  // PAYMENT METHOD
  // ===================================================

  const paymentOptions =
    document.querySelectorAll(
      'input[name="paymentMethod"]'
    );


  let paymentMethod =
    document.querySelector(
      'input[name="paymentMethod"]:checked'
    )?.value || "online";


  // ===================================================
  // STATE
  // ===================================================

  let tankType =
    selectedTankType
      ? selectedTankType.value
      : "overhead";

  let capacity =
    selectedCapacity
      ? Number(
          selectedCapacity.value
        )
      : 500;

  let quantity =
    selectedQuantity
      ? Number(
          selectedQuantity.value
        )
      : 1;


  function money(value) {

    return (
      "₹" +
      Number(value)
        .toLocaleString("en-IN")
    );

  }


  // ===================================================
  // PAYMENT OPTIONS
  // ===================================================

  function updatePaymentOptions() {

    document
      .querySelectorAll(
        ".payment-option"
      )
      .forEach(function (option) {

        const radio =
          option.querySelector(
            'input[name="paymentMethod"]'
          );

        option.classList.toggle(
          "active",
          radio &&
          radio.checked
        );

      });

  }


  paymentOptions.forEach(
    function (radio) {

      radio.addEventListener(
        "change",
        function () {

          paymentMethod =
            this.value;

          updatePaymentOptions();

          updatePrice();

        }
      );

    }
  );


  // ===================================================
  // TANK TYPE
  // ===================================================

  function updateTankTypeButtons() {

    tankTypeButtons.forEach(
      function (button) {

        button.classList.toggle(
          "active",
          button.dataset.tankType ===
            tankType
        );

      }
    );

  }


  // ===================================================
  // CAPACITY BUTTONS
  // ===================================================

  function buildCapacityButtons() {

    if (!capacityGrid) return;


    const otherSize =
      capacityGrid.querySelector(
        ".other-size-card"
      );


    capacityGrid
      .querySelectorAll(
        ".capacity-card"
      )
      .forEach(
        function (button) {

          button.remove();

        }
      );


    const available =
      Object.keys(
        PRICES[tankType]
      );


    available.forEach(
      function (capacityValue) {

        const price =
          PRICES[tankType][
            capacityValue
          ];


        let label;


        if (
          Number(capacityValue) === 500
        ) {

          label =
            "Up to 500 L";

        }

        else if (
          Number(capacityValue) === 1000
        ) {

          label =
            "501–1,000 L";

        }

        else if (
          Number(capacityValue) === 1500
        ) {

          label =
            "1,001–1,500 L";

        }

        else if (
          Number(capacityValue) === 2000
        ) {

          label =
            "1,501–2,000 L";

        }

        else if (
          Number(capacityValue) === 3000
        ) {

          label =
            "2,001–3,000 L";

        }

        else if (
          Number(capacityValue) === 5000
        ) {

          label =
            "3,001–5,000 L";

        }

        else {

          label =
            `Up to ${Number(
              capacityValue
            ).toLocaleString(
              "en-IN"
            )} L`;

        }


        let originalPrice = 0;


        if (price === 499)
          originalPrice = 599;

        else if (price === 599)
          originalPrice = 719;

        else if (price === 799)
          originalPrice = 934;

        else if (price === 999)
          originalPrice = 1199;

        else if (price === 1099)
          originalPrice = 1299;

        else if (price === 1299)
          originalPrice = 1499;

        else if (price === 1999)
          originalPrice = 2499;


        const button =
          document.createElement(
            "button"
          );


        button.type = "button";

        button.className =
          "capacity-card";

        button.dataset.capacity =
          capacityValue;


        button.innerHTML = `

          <span>
            ${label}
          </span>

          <strong>
            ${money(price)}
          </strong>

          ${
            originalPrice > price
              ? `
                <del>
                  ${money(
                    originalPrice
                  )}
                </del>

                <small>
                  Save ${money(
                    originalPrice -
                    price
                  )}
                </small>
              `
              : ""
          }

        `;


        button.addEventListener(
          "click",
          function () {

            capacity =
              Number(
                capacityValue
              );

            updateCapacityButtons();

            syncInputs();

            updatePrice();

          }
        );


        if (otherSize) {

          capacityGrid.insertBefore(
            button,
            otherSize
          );

        }

        else {

          capacityGrid.appendChild(
            button
          );

        }

      }
    );


    if (
      !available.includes(
        String(capacity)
      )
    ) {

      capacity =
        Number(
          available[0]
        );

    }


    updateCapacityButtons();

  }


  function updateCapacityButtons() {

    if (!capacityGrid)
      return;


    capacityGrid
      .querySelectorAll(
        ".capacity-card"
      )
      .forEach(function (button) {

        button.classList.toggle(
          "active",
          Number(
            button.dataset.capacity
          ) === capacity
        );

      });

  }


  tankTypeButtons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          tankType =
            button.dataset.tankType;

          updateTankTypeButtons();

          buildCapacityButtons();

          syncInputs();

          updatePrice();

        }
      );

    }
  );


  // ===================================================
  // QUANTITY
  // ===================================================

  if (quantityMinus) {

    quantityMinus.addEventListener(
      "click",
      function () {

        if (quantity > 1) {

          quantity--;

          updateQuantity();

        }

      }
    );

  }


  if (quantityPlus) {

    quantityPlus.addEventListener(
      "click",
      function () {

        if (quantity < 20) {

          quantity++;

          updateQuantity();

        }

      }
    );

  }


  function updateQuantity() {

    quantity =
      Math.max(
        1,
        Math.min(
          20,
          quantity
        )
      );


    if (quantityDisplay) {

      quantityDisplay.textContent =
        quantity;

    }


    syncInputs();

    updatePrice();

  }


  function syncInputs() {

    if (selectedTankType)
      selectedTankType.value =
        tankType;

    if (selectedCapacity)
      selectedCapacity.value =
        capacity;

    if (selectedQuantity)
      selectedQuantity.value =
        quantity;

  }


  // ===================================================
  // PRICE CALCULATION
  // ===================================================

  function updatePrice() {

    const unitPrice =
      Number(
        PRICES[tankType]?.[
          capacity
        ] || 0
      );


    const subtotal =
      unitPrice *
      quantity;


    const quantityDiscountPercent =
      getQuantityDiscount(
        quantity
      );


    const quantityDiscount =
      Math.round(
        subtotal *
        quantityDiscountPercent /
        100
      );


    const afterQuantityDiscount =
      subtotal -
      quantityDiscount;


    const onlineDiscount =
      paymentMethod === "online"
        ? Math.round(
            afterQuantityDiscount *
            5 /
            100
          )
        : 0;


    const finalTotal =
      afterQuantityDiscount -
      onlineDiscount;


    if (subtotalDisplay) {

      subtotalDisplay.textContent =
        money(subtotal);

    }


    if (discountAmountDisplay) {

      discountAmountDisplay.textContent =
        quantityDiscount > 0
          ? `− ${money(
              quantityDiscount
            )}`
          : "₹0";

    }


    if (totalDisplay) {

      totalDisplay.textContent =
        money(finalTotal);

    }


    if (discountText) {

      if (
        paymentMethod === "online"
      ) {

        discountText.innerHTML = `

          <strong>
            ${quantity} tank${
              quantity > 1
                ? "s"
                : ""
            }
            •
            ${
              quantityDiscountPercent
            }% quantity discount
            +
            5% online discount
          </strong>

        `;

      }

      else {

        discountText.innerHTML = `

          <strong>
            ${quantity} tank${
              quantity > 1
                ? "s"
                : ""
            }
            •
            ${
              quantityDiscountPercent
            }% quantity discount
            • Pay after service
          </strong>

        `;

      }

    }


    if (addMoreText) {

      if (quantity === 1) {

        addMoreText.textContent =
          "Add 1 more tank → unlock 10% OFF";

      }

      else if (quantity === 2) {

        addMoreText.textContent =
          "Add 1 more tank → unlock 12% OFF";

      }

      else if (quantity === 3) {

        addMoreText.textContent =
          "Add 1 more tank → unlock 14% OFF";

      }

      else if (quantity === 4) {

        addMoreText.textContent =
          "Add 1 more tank → unlock 15% OFF";

      }

      else {

        addMoreText.textContent =
          "Maximum quantity discount unlocked ✓";

      }

    }


    if (submitButton) {

      submitButton.textContent =
        paymentMethod === "online"
          ? `Pay Online & Save 5% — ${money(
              finalTotal
            )}`
          : `Book Now — Pay After Service — ${money(
              finalTotal
            )}`;

    }


    window.vshPricing = {

      tankType,
      capacity,
      quantity,

      unitPrice,

      subtotal,

      quantityDiscountPercent,

      quantityDiscount,

      onlineDiscount,

      finalTotal,

      paymentMethod

    };

  }


  // ===================================================
  // BOOKING FORM
  // ===================================================

  if (form) {

    form.addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();


        syncInputs();

        updatePrice();


        if (bookingError) {

          bookingError.style.display =
            "none";

          bookingError.textContent =
            "";

        }


        if (submitButton) {

          submitButton.disabled =
            true;

          submitButton.textContent =
            paymentMethod === "online"
              ? "Creating secure payment..."
              : "Confirming booking...";

        }


        const formData =
          new FormData(form);


        const payload =
          Object.fromEntries(
            formData.entries()
          );


        payload.tankType =
          tankType;

        payload.capacity =
          capacity;

        payload.quantity =
          quantity;

        payload.paymentMethod =
          paymentMethod;


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
                  JSON.stringify(
                    payload
                  )

              }
            );


          const data =
            await response.json();


          if (
            !response.ok ||
            !data.success
          ) {

            throw new Error(
              data.message ||
              "Unable to create booking."
            );

          }


          // PAY AFTER SERVICE
          if (
            paymentMethod ===
            "after_service"
          ) {

            showSuccess(
              data.bookingId,
              data.amount,
              "Pay After Service"
            );

            return;

          }


          // ONLINE PAYMENT
          if (!window.Razorpay) {

            throw new Error(
              "Razorpay checkout could not be loaded."
            );

          }


          const options = {

            key:
              data.keyId,

            amount:
              data.amount,

            currency:
              data.currency,

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

              color:
                "#0867ff"

            },


            handler:
              async function (
                paymentResponse
              ) {

                try {

                  const verifyResponse =
                    await fetch(
                      "/api/verify-payment",
                      {

                        method:
                          "POST",

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
                    await verifyResponse.json();


                  if (
                    !verifyResponse.ok ||
                    !verifyData.success
                  ) {

                    throw new Error(
                      verifyData.message ||
                      "Payment verification failed."
                    );

                  }


                  showSuccess(
                    data.bookingId,
                    data.amount / 100,
                    "Paid Online"
                  );

                }

                catch (error) {

                  showError(
                    error.message
                  );

                }

              },


            modal: {

              ondismiss:
                function () {

                  if (submitButton) {

                    submitButton.disabled =
                      false;

                    updatePrice();

                  }

                }

            }

          };


          const razorpay =
            new window.Razorpay(
              options
            );


          razorpay.on(
            "payment.failed",
            function (
              response
            ) {

              showError(
                response.error?.description ||
                "Payment failed. Please try again."
              );


              if (submitButton) {

                submitButton.disabled =
                  false;

                updatePrice();

              }

            }
          );


          razorpay.open();

        }

        catch (error) {

          showError(
            error.message ||
            "Something went wrong. Please try again."
          );


          if (submitButton) {

            submitButton.disabled =
              false;

            updatePrice();

          }

        }

      }
    );

  }


  function showError(message) {

    if (!bookingError)
      return;


    bookingError.style.display =
      "block";


    bookingError.textContent =
      "✕ " + message;

  }


  function showSuccess(
    bookingId,
    amount,
    paymentType
  ) {

    if (form) {

      form.style.display =
        "none";

    }


    if (!bookingSuccess)
      return;


    bookingSuccess.innerHTML = `

      <div class="success-icon">
        ✓
      </div>

      <h2>
        Booking Confirmed!
      </h2>

      <p>
        ${
          paymentType ===
          "Paid Online"
            ? "Your online payment has been received successfully."
            : "Your booking has been confirmed. Payment will be collected after the service."
        }
      </p>


      <div class="booking-confirmation">

        <div>

          <span>
            Booking ID
          </span>

          <strong>
            ${bookingId}
          </strong>

        </div>


        <div>

          <span>
            Total Amount
          </span>

          <strong>
            ${money(amount)}
          </strong>

        </div>


        <div>

          <span>
            Payment
          </span>

          <strong>
            ${paymentType}
          </strong>

        </div>

      </div>


      <p class="success-note">

        ${
          paymentType ===
          "Paid Online"
            ? "Keep your booking ID for reference."
            : `Please pay ${money(
                amount
              )} to the VSH Tank Cleaning team after the service is completed.`
        }

      </p>


      <div class="cta-trio">

        <a
          href="https://wa.me/919599057079?text=${encodeURIComponent(
            `Hi VSH Tank Cleaning, my booking ID is ${bookingId}.`
          )}"
          target="_blank"
          rel="noopener"
          class="cta-whatsapp"
        >
          WhatsApp
        </a>

        <a
          href="tel:+919599057079"
          class="cta-call"
        >
          Call
        </a>

        <a
          href="index.html"
          class="cta-book"
        >
          Home
        </a>

      </div>

    `;


    bookingSuccess.style.display =
      "block";

  }


  // ===================================================
  // PIN CHECK
  // ===================================================

  const checkPin =
    document.getElementById(
      "checkPin"
    );

  const areaPin =
    document.getElementById(
      "areaPin"
    );

  const pinResult =
    document.getElementById(
      "pinResult"
    );


  if (
    checkPin &&
    areaPin &&
    pinResult
  ) {

    checkPin.addEventListener(
      "click",
      function () {

        const pin =
          areaPin.value.trim();


        if (
          !/^110\d{3}$/.test(
            pin
          )
        ) {

          pinResult.innerHTML = `

            <div class="pin-error">

              ✕ Please enter a valid
              6-digit Delhi PIN code.

            </div>

          `;

          return;

        }


        pinResult.innerHTML = `

          <div class="pin-success">

            <strong>
              ✓ VSH serves your area
            </strong>

            <span>
              PIN ${pin} is within
              our current Delhi service zone.
            </span>

          </div>

        `;

      }
    );

  }


  // ===================================================
  // INITIALIZE PRICING
  // ===================================================

  updateTankTypeButtons();

  buildCapacityButtons();

  updatePaymentOptions();

  updateQuantity();

  syncInputs();

  updatePrice();

});
