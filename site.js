// =====================================================
// VSH TANK CLEANING — PRICING + BOOKING
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

  // ---------------------------------------------------
  // PRICES
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // QUANTITY DISCOUNTS
  // ---------------------------------------------------

  function getQuantityDiscount(quantity) {

    quantity = Number(quantity);

    if (quantity >= 5) return 15;
    if (quantity === 4) return 14;
    if (quantity === 3) return 12;
    if (quantity === 2) return 10;

    return 0;
  }


  // ---------------------------------------------------
  // ELEMENTS
  // ---------------------------------------------------

  const form =
    document.getElementById("bookingForm");

  const tankTypeButtons =
    document.querySelectorAll("[data-tank-type]");

  const capacityGrid =
    document.querySelector(".capacity-grid");

  const quantityMinus =
    document.querySelector("[data-quantity-minus]");

  const quantityPlus =
    document.querySelector("[data-quantity-plus]");

  const quantityDisplay =
    document.querySelector("[data-quantity]");

  const selectedTankType =
    document.getElementById("selectedTankType");

  const selectedCapacity =
    document.getElementById("selectedCapacity");

  const selectedQuantity =
    document.getElementById("selectedQuantity");

  const subtotalDisplay =
    document.querySelector("[data-price-subtotal]");

  const discountAmountDisplay =
    document.querySelector("[data-discount-amount]");

  const totalDisplay =
    document.querySelector("[data-price-total]");

  const discountText =
    document.querySelector("[data-discount-text]");

  const addMoreText =
    document.querySelector("[data-add-more]");

  const bookingError =
    document.getElementById("bookingError");

  const bookingSuccess =
    document.getElementById("bookingSuccess");

  const submitButton =
    form
      ? form.querySelector('button[type="submit"]')
      : null;


  // ---------------------------------------------------
  // STATE
  // ---------------------------------------------------

  let tankType =
    selectedTankType
      ? selectedTankType.value
      : "overhead";

  let capacity =
    selectedCapacity
      ? Number(selectedCapacity.value)
      : 500;

  let quantity =
    selectedQuantity
      ? Number(selectedQuantity.value)
      : 1;


  // ---------------------------------------------------
  // MONEY FORMAT
  // ---------------------------------------------------

  function money(value) {

    return (
      "₹" +
      Number(value).toLocaleString("en-IN")
    );

  }


  // ---------------------------------------------------
  // SYNC HIDDEN INPUTS
  // ---------------------------------------------------

  function syncInputs() {

    if (selectedTankType) {
      selectedTankType.value =
        tankType;
    }

    if (selectedCapacity) {
      selectedCapacity.value =
        capacity;
    }

    if (selectedQuantity) {
      selectedQuantity.value =
        quantity;
    }

  }


  // ---------------------------------------------------
  // UPDATE TANK TYPE BUTTONS
  // ---------------------------------------------------

  function updateTankTypeButtons() {

    tankTypeButtons.forEach(function (button) {

      const isActive =
        button.dataset.tankType === tankType;

      button.classList.toggle(
        "active",
        isActive
      );

    });

  }


  // ---------------------------------------------------
  // BUILD CAPACITY BUTTONS
  // ---------------------------------------------------

  function buildCapacityButtons() {

    if (!capacityGrid) return;

    const otherSize =
      capacityGrid.querySelector(
        ".other-size-card"
      );

    // Remove old generated capacity buttons
    capacityGrid
      .querySelectorAll(
        ".capacity-card"
      )
      .forEach(function (button) {

        button.remove();

      });


    const availableCapacities =
      Object.keys(
        PRICES[tankType]
      );


    availableCapacities.forEach(
      function (capacityValue) {

        const price =
          PRICES[tankType][capacityValue];


        let label;


        if (Number(capacityValue) === 500) {

          label = "Up to 500 L";

        }

        else if (
          Number(capacityValue) === 1000
        ) {

          label = "501–1,000 L";

        }

        else if (
          Number(capacityValue) === 1500
        ) {

          label = "1,001–1,500 L";

        }

        else if (
          Number(capacityValue) === 2000
        ) {

          label = "1,501–2,000 L";

        }

        else if (
          Number(capacityValue) === 3000
        ) {

          label = "2,001–3,000 L";

        }

        else if (
          Number(capacityValue) === 5000
        ) {

          label = "3,001–5,000 L";

        }

        else {

          label =
            `Up to ${Number(capacityValue).toLocaleString("en-IN")} L`;

        }


        // Original/reference price
        let originalPrice = 0;


        if (price === 499) {
          originalPrice = 599;
        }

        else if (price === 599) {
          originalPrice = 719;
        }

        else if (price === 799) {
          originalPrice = 934;
        }

        else if (price === 999) {
          originalPrice = 1199;
        }

        else if (price === 1099) {
          originalPrice = 1299;
        }

        else if (price === 1299) {
          originalPrice = 1499;
        }

        else if (price === 1999) {
          originalPrice = 2499;
        }


        const button =
          document.createElement("button");

        button.type = "button";

        button.className =
          "capacity-card";

        button.dataset.capacity =
          capacityValue;


        let savingHTML = "";


        if (originalPrice > price) {

          savingHTML = `

            <del>
              ${money(originalPrice)}
            </del>

            <small>
              Save ${money(originalPrice - price)}
            </small>

          `;

        }


        button.innerHTML = `

          <span>
            ${label}
          </span>

          <strong>
            ${money(price)}
          </strong>

          ${savingHTML}

        `;


        button.addEventListener(
          "click",
          function () {

            capacity =
              Number(capacityValue);

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

      });


    // Make sure selected capacity exists
    if (
      !availableCapacities.includes(
        String(capacity)
      )
    ) {

      capacity =
        Number(
          availableCapacities[0]
        );

    }


    updateCapacityButtons();

  }


  // ---------------------------------------------------
  // UPDATE CAPACITY ACTIVE STATE
  // ---------------------------------------------------

  function updateCapacityButtons() {

    if (!capacityGrid) return;


    capacityGrid
      .querySelectorAll(
        ".capacity-card"
      )
      .forEach(function (button) {

        const buttonCapacity =
          Number(
            button.dataset.capacity
          );


        button.classList.toggle(
          "active",
          buttonCapacity === capacity
        );

      });

  }


  // ---------------------------------------------------
  // TANK TYPE CLICK
  // ---------------------------------------------------

  tankTypeButtons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function (event) {

          event.preventDefault();

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


  // ---------------------------------------------------
  // QUANTITY MINUS
  // ---------------------------------------------------

  if (quantityMinus) {

    quantityMinus.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        if (quantity > 1) {

          quantity--;

          updateQuantity();

        }

      }
    );

  }


  // ---------------------------------------------------
  // QUANTITY PLUS
  // ---------------------------------------------------

  if (quantityPlus) {

    quantityPlus.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        if (quantity < 20) {

          quantity++;

          updateQuantity();

        }

      }
    );

  }


  // ---------------------------------------------------
  // UPDATE QUANTITY
  // ---------------------------------------------------

  function updateQuantity() {

    if (quantity < 1) {
      quantity = 1;
    }

    if (quantity > 20) {
      quantity = 20;
    }


    if (quantityDisplay) {

      quantityDisplay.textContent =
        quantity;

    }


    syncInputs();

    updatePrice();

  }


  // ---------------------------------------------------
  // UPDATE PRICE
  // ---------------------------------------------------

  function updatePrice() {

    const unitPrice =
      Number(
        PRICES[tankType]?.[capacity] || 0
      );


    const subtotal =
      unitPrice * quantity;


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


    // 5% online payment discount
    const onlineDiscount =
      Math.round(
        afterQuantityDiscount *
        5 /
        100
      );


    const onlineTotal =
      afterQuantityDiscount -
      onlineDiscount;


    // -----------------------------------------------
    // SUBTOTAL
    // -----------------------------------------------

    if (subtotalDisplay) {

      subtotalDisplay.textContent =
        money(subtotal);

    }


    // -----------------------------------------------
    // DISCOUNT DISPLAY
    // -----------------------------------------------

    if (discountAmountDisplay) {

      if (quantityDiscount > 0) {

        discountAmountDisplay.textContent =
          `− ${money(quantityDiscount)}`;

      }

      else {

        discountAmountDisplay.textContent =
          "₹0";

      }

    }


    // -----------------------------------------------
    // TOTAL
    // -----------------------------------------------

    if (totalDisplay) {

      totalDisplay.textContent =
        money(onlineTotal);

    }


    // -----------------------------------------------
    // DISCOUNT MESSAGE
    // -----------------------------------------------

    if (discountText) {

      if (
        quantityDiscountPercent === 0
      ) {

        discountText.innerHTML = `

          <strong>
            ${quantity} tank • No quantity discount
          </strong>

        `;

      }

      else {

        discountText.innerHTML = `

          <strong>
            ${quantity} tanks •
            ${quantityDiscountPercent}% OFF
          </strong>

        `;

      }

    }


    // -----------------------------------------------
    // ADD MORE MESSAGE
    // -----------------------------------------------

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


    // -----------------------------------------------
    // BOOKING BUTTON
    // -----------------------------------------------

    if (submitButton) {

      submitButton.textContent =
        `Pay Online & Save 5% — ${money(onlineTotal)}`;

    }


    // Store current calculation
    window.vshPricing = {

      tankType,
      capacity,
      quantity,
      unitPrice,
      subtotal,
      quantityDiscountPercent,
      quantityDiscount,
      onlineDiscount,
      onlineTotal

    };

  }


  // ---------------------------------------------------
  // FORM SUBMIT
  // ---------------------------------------------------

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
            "Creating secure payment...";

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
          "online";


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
                    data.amount / 100
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
            function (response) {

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


  // ---------------------------------------------------
  // SHOW ERROR
  // ---------------------------------------------------

  function showError(message) {

    if (!bookingError) return;


    bookingError.style.display =
      "block";


    bookingError.textContent =
      "✕ " + message;

  }


  // ---------------------------------------------------
  // SHOW SUCCESS
  // ---------------------------------------------------

  function showSuccess(
    bookingId,
    amount
  ) {

    if (form) {

      form.style.display =
        "none";

    }


    if (!bookingSuccess) return;


    bookingSuccess.innerHTML = `

      <div class="success-icon">
        ✓
      </div>

      <h2>
        Booking Confirmed!
      </h2>

      <p>
        Your online payment has been
        received successfully.
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
            Total Paid
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
            Paid Online
          </strong>

        </div>

      </div>


      <p class="success-note">
        Keep your booking ID for reference.
      </p>


      <a
        class="btn btn-primary"
        href="https://wa.me/919599057079?text=${encodeURIComponent(
          `Hi VSH Tank Cleaning, my booking ID is ${bookingId}.`
        )}"
        target="_blank"
        rel="noopener"
      >
        WhatsApp VSH
      </a>

    `;


    bookingSuccess.style.display =
      "block";

  }


  // ---------------------------------------------------
  // INITIALIZE
  // ---------------------------------------------------

  updateTankTypeButtons();

  buildCapacityButtons();

  updateQuantity();

  syncInputs();

  updatePrice();

});
