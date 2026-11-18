import {
  PRICES,
  calculateTotal,
  getDiscount
} from "./pricing-config.js";

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("bookingForm");

  if (!form) return;

  // =====================================================
  // ELEMENTS
  // =====================================================

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

  const discountText =
    document.querySelector("[data-discount-text]");

  const addMoreText =
    document.querySelector("[data-add-more]");

  const subtotalDisplay =
    document.querySelector("[data-price-subtotal]");

  const discountAmountDisplay =
    document.querySelector("[data-discount-amount]");

  const totalDisplay =
    document.querySelector("[data-price-total]");

  const selectedTankType =
    document.getElementById("selectedTankType");

  const selectedCapacity =
    document.getElementById("selectedCapacity");

  const selectedQuantity =
    document.getElementById("selectedQuantity");

  const bookingError =
    document.getElementById("bookingError");

  const bookingSuccess =
    document.getElementById("bookingSuccess");

  const submitButton =
    form.querySelector('button[type="submit"]');


  // =====================================================
  // STATE
  // =====================================================

  let currentTankType =
    selectedTankType?.value || "overhead";

  let currentCapacity =
    Number(selectedCapacity?.value || 500);

  let currentQuantity =
    Number(selectedQuantity?.value || 1);


  // =====================================================
  // HELPERS
  // =====================================================

  function money(amount) {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  }


  function syncHiddenFields() {

    if (selectedTankType) {
      selectedTankType.value =
        currentTankType;
    }

    if (selectedCapacity) {
      selectedCapacity.value =
        currentCapacity;
    }

    if (selectedQuantity) {
      selectedQuantity.value =
        currentQuantity;
    }

  }


  // =====================================================
  // BUILD CAPACITY BUTTONS
  // =====================================================

  function buildCapacityButtons() {

    if (!capacityGrid) return;

    const otherSizeCard =
      capacityGrid.querySelector(
        ".other-size-card"
      );

    capacityGrid
      .querySelectorAll(
        ".capacity-card"
      )
      .forEach(card => card.remove());


    const capacities =
      Object.keys(
        PRICES[currentTankType] || {}
      );


    capacities.forEach(capacity => {

      const price =
        Number(
          PRICES[currentTankType][capacity]
        );


      const card =
        document.createElement("button");

      card.type = "button";

      card.className =
        "capacity-card";

      card.dataset.capacity =
        capacity;


      let label = "";

      const litres =
        Number(capacity);


      if (litres === 500) {

        label = "Up to 500 L";

      } else if (litres === 1000) {

        label = "501–1,000 L";

      } else if (litres === 1500) {

        label = "1,001–1,500 L";

      } else if (litres === 2000) {

        label = "1,501–2,000 L";

      } else if (litres === 3000) {

        label = "2,001–3,000 L";

      } else if (litres === 5000) {

        label = "3,001–5,000 L";

      } else {

        label =
          `Up to ${litres.toLocaleString("en-IN")} L`;

      }


      // Keep the old displayed MRP style
      // where possible.

      let mrp = 0;

      if (price === 499) mrp = 599;
      else if (price === 599) mrp = 719;
      else if (price === 799) mrp = 934;
      else if (price === 999) mrp = 1199;
      else if (price === 1099) mrp = 1299;
      else if (price === 1299) mrp = 1499;
      else if (price === 1999) mrp = 2499;


      let savingHTML = "";

      if (mrp > price) {

        savingHTML = `
          <del>${money(mrp)}</del>
          <small>Save ${money(mrp - price)}</small>
        `;

      }


      card.innerHTML = `
        <span>
          ${label}
        </span>

        <strong>
          ${money(price)}
        </strong>

        ${savingHTML}
      `;


      card.addEventListener(
        "click",
        () => {

          currentCapacity =
            Number(capacity);

          updateCapacityButtons();

          syncHiddenFields();

          updatePrice();

        }
      );


      capacityGrid.insertBefore(
        card,
        otherSizeCard
      );

    });


    // Make sure selected capacity exists
    // for the selected tank type.

    const validCapacity =
      capacities.includes(
        String(currentCapacity)
      );


    if (!validCapacity) {

      currentCapacity =
        Number(capacities[0]);

    }


    updateCapacityButtons();

  }


  // =====================================================
  // CAPACITY ACTIVE STATE
  // =====================================================

  function updateCapacityButtons() {

    if (!capacityGrid) return;

    capacityGrid
      .querySelectorAll(
        ".capacity-card"
      )
      .forEach(card => {

        card.classList.toggle(
          "active",
          Number(card.dataset.capacity) ===
          currentCapacity
        );

      });

  }


  // =====================================================
  // TANK TYPE
  // =====================================================

  tankTypeButtons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        currentTankType =
          button.dataset.tankType;


        tankTypeButtons.forEach(
          item => {

            item.classList.toggle(
              "active",
              item === button
            );

          }
        );


        buildCapacityButtons();

        syncHiddenFields();

        updatePrice();

      }
    );

  });


  // =====================================================
  // QUANTITY MINUS
  // =====================================================

  if (quantityMinus) {

    quantityMinus.addEventListener(
      "click",
      () => {

        if (currentQuantity > 1) {

          currentQuantity--;

          updateQuantity();

        }

      }
    );

  }


  // =====================================================
  // QUANTITY PLUS
  // =====================================================

  if (quantityPlus) {

    quantityPlus.addEventListener(
      "click",
      () => {

        if (currentQuantity < 20) {

          currentQuantity++;

          updateQuantity();

        }

      }
    );

  }


  // =====================================================
  // QUANTITY UPDATE
  // =====================================================

  function updateQuantity() {

    if (currentQuantity < 1) {
      currentQuantity = 1;
    }

    if (currentQuantity > 20) {
      currentQuantity = 20;
    }


    if (quantityDisplay) {

      quantityDisplay.textContent =
        currentQuantity;

    }


    syncHiddenFields();

    updatePrice();

  }


  // =====================================================
  // PRICE UPDATE
  // =====================================================

  function updatePrice() {

    const result =
      calculateTotal(
        currentTankType,
        currentCapacity,
        currentQuantity,
        "online"
      );


    // Subtotal

    if (subtotalDisplay) {

      subtotalDisplay.textContent =
        money(result.subtotal);

    }


    // Quantity discount

    if (discountAmountDisplay) {

      if (
        result.quantityDiscount > 0
      ) {

        discountAmountDisplay.textContent =
          `− ${money(
            result.quantityDiscount
          )}`;

      } else {

        discountAmountDisplay.textContent =
          "₹0";

      }

    }


    // Total

    if (totalDisplay) {

      totalDisplay.textContent =
        money(result.total);

    }


    // Discount text

    const discountPercent =
      getDiscount(
        currentQuantity
      );


    if (discountText) {

      if (discountPercent === 0) {

        discountText.innerHTML = `
          <strong>
            ${currentQuantity} tank • No discount
          </strong>
        `;

      } else {

        discountText.innerHTML = `
          <strong>
            ${currentQuantity} tanks • ${discountPercent}% OFF
          </strong>
        `;

      }

    }


    // Next discount

    if (addMoreText) {

      if (currentQuantity === 1) {

        addMoreText.textContent =
          "Add 1 more tank → unlock 10% OFF";

      } else if (currentQuantity === 2) {

        addMoreText.textContent =
          "Add 1 more tank → unlock 12% OFF";

      } else if (currentQuantity === 3) {

        addMoreText.textContent =
          "Add 1 more tank → unlock 14% OFF";

      } else if (currentQuantity === 4) {

        addMoreText.textContent =
          "Add 1 more tank → unlock 15% OFF";

      } else {

        addMoreText.textContent =
          "Maximum quantity discount unlocked ✓";

      }

    }


    // Button

    if (submitButton) {

      submitButton.textContent =
        `Pay Online & Save 5% — ${money(
          result.total
        )}`;

    }

  }


  // =====================================================
  // FORM SUBMIT
  // =====================================================

  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      syncHiddenFields();

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
        currentTankType;

      payload.capacity =
        currentCapacity;

      payload.quantity =
        currentQuantity;

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
                JSON.stringify(payload)

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
            async function(
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


              } catch (error) {

                showError(
                  error.message
                );

              }

            },


          modal: {

            ondismiss:
              function() {

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
          function(response) {

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


      } catch (error) {

        showError(
          error.message ||
          "Something went wrong."
        );


        if (submitButton) {

          submitButton.disabled =
            false;

          updatePrice();

        }

      }

    }
  );


  // =====================================================
  // ERROR
  // =====================================================

  function showError(message) {

    if (!bookingError) return;

    bookingError.style.display =
      "block";

    bookingError.textContent =
      `✕ ${message}`;

  }


  // =====================================================
  // SUCCESS
  // =====================================================

  function showSuccess(
    bookingId,
    amount
  ) {

    form.style.display =
      "none";


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


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  buildCapacityButtons();

  updateQuantity();

  syncHiddenFields();

  updatePrice();

});
