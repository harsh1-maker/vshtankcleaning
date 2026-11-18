// ======================================================
// VSH TANK CLEANING — MAIN SITE JAVASCRIPT
// ======================================================

const VSH_PRICES = {
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


const VSH_DISCOUNTS = {
  1: 0,
  2: 10,
  3: 12,
  4: 14,
  5: 15
};


function getQuantityDiscount(quantity) {
  const qty = Number(quantity);

  if (qty >= 5) {
    return 15;
  }

  return VSH_DISCOUNTS[qty] || 0;
}


function getUnitPrice(tankType, capacity) {
  return Number(
    VSH_PRICES[tankType]?.[capacity] || 0
  );
}


function calculatePricing(tankType, capacity, quantity) {
  const unitPrice = getUnitPrice(tankType, capacity);
  const qty = Number(quantity);

  const subtotal = unitPrice * qty;

  const discountPercent = getQuantityDiscount(qty);

  const discount = Math.round(
    subtotal * discountPercent / 100
  );

  const serviceTotal = subtotal - discount;

  return {
    unitPrice,
    quantity: qty,
    subtotal,
    discountPercent,
    discount,
    serviceTotal
  };
}


// ======================================================
// MOBILE MENU
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

  const menuButton = document.querySelector(".mobile-menu");
  const navLinks = document.querySelector(".nav-links");

  if (menuButton && navLinks) {

    menuButton.addEventListener("click", () => {
      navLinks.classList.toggle("mobile-open");
    });

    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("mobile-open");
      });
    });
  }


  // ====================================================
  // PRICING CALCULATOR
  // ====================================================

  const tankTypeButtons =
    document.querySelectorAll("[data-tank-type]");

  const capacityButtons =
    document.querySelectorAll("[data-capacity]");

  const quantityMinus =
    document.querySelector("[data-quantity-minus]");

  const quantityPlus =
    document.querySelector("[data-quantity-plus]");

  const quantityDisplay =
    document.querySelector("[data-quantity]");

  const priceTotal =
    document.querySelector("[data-price-total]");

  const priceSubtotal =
    document.querySelector("[data-price-subtotal]");

  const discountText =
    document.querySelector("[data-discount-text]");

  const discountAmount =
    document.querySelector("[data-discount-amount]");

  const addMoreText =
    document.querySelector("[data-add-more]");


  let selectedTankType = "overhead";
  let selectedCapacity = 500;
  let quantity = 1;


  function updatePricing() {

    const pricing = calculatePricing(
      selectedTankType,
      selectedCapacity,
      quantity
    );


    if (quantityDisplay) {
      quantityDisplay.textContent = quantity;
    }


    if (priceSubtotal) {
      priceSubtotal.textContent =
        `₹${pricing.subtotal.toLocaleString("en-IN")}`;
    }


    if (priceTotal) {
      priceTotal.textContent =
        `₹${pricing.serviceTotal.toLocaleString("en-IN")}`;
    }


    if (discountAmount) {
      discountAmount.textContent =
        pricing.discount > 0
          ? `Save ₹${pricing.discount.toLocaleString("en-IN")}`
          : "";
    }


    if (discountText) {

      if (pricing.discountPercent > 0) {

        discountText.innerHTML =
          `<strong>${quantity} tank${quantity > 1 ? "s" : ""} • ${pricing.discountPercent}% off</strong>`;

      } else {

        discountText.innerHTML =
          `<strong>1 tank • No discount</strong>`;

      }
    }


    if (addMoreText) {

      if (quantity < 5) {

        const nextQty = quantity + 1;
        const nextDiscount =
          getQuantityDiscount(nextQty);

        if (nextDiscount > pricing.discountPercent) {

          addMoreText.textContent =
            `Add ${nextQty - quantity} more tank${nextQty - quantity > 1 ? "s" : ""} for ${nextDiscount}% off`;

        } else {

          addMoreText.textContent = "";
        }

      } else {

        addMoreText.textContent =
          "You're getting our maximum 15% quantity discount";
      }
    }


    // Update hidden booking values
    const hiddenTankType =
      document.querySelector("#selectedTankType");

    const hiddenCapacity =
      document.querySelector("#selectedCapacity");

    const hiddenQuantity =
      document.querySelector("#selectedQuantity");


    if (hiddenTankType) {
      hiddenTankType.value = selectedTankType;
    }

    if (hiddenCapacity) {
      hiddenCapacity.value = selectedCapacity;
    }

    if (hiddenQuantity) {
      hiddenQuantity.value = quantity;
    }
  }


  tankTypeButtons.forEach(button => {

    button.addEventListener("click", () => {

      tankTypeButtons.forEach(btn =>
        btn.classList.remove("active")
      );

      button.classList.add("active");

      selectedTankType =
        button.dataset.tankType;

      updateCapacityAvailability();

      updatePricing();
    });
  });


  function updateCapacityAvailability() {

    capacityButtons.forEach(button => {

      const capacity =
        Number(button.dataset.capacity);

      const available =
        VSH_PRICES[selectedTankType]?.[capacity];

      button.style.display =
        available ? "" : "none";
    });
  }


  capacityButtons.forEach(button => {

    button.addEventListener("click", () => {

      capacityButtons.forEach(btn =>
        btn.classList.remove("active")
      );

      button.classList.add("active");

      selectedCapacity =
        Number(button.dataset.capacity);

      updatePricing();
    });
  });


  if (quantityMinus) {

    quantityMinus.addEventListener("click", () => {

      if (quantity > 1) {
        quantity--;
        updatePricing();
      }
    });
  }


  if (quantityPlus) {

    quantityPlus.addEventListener("click", () => {

      if (quantity < 20) {
        quantity++;
        updatePricing();
      }
    });
  }


  updateCapacityAvailability();
  updatePricing();


  // ====================================================
  // DELHI PIN CODE CHECKER
  // ====================================================

  const pinInput =
    document.querySelector("#areaPin");

  const pinCheckButton =
    document.querySelector("#checkPin");

  const pinResult =
    document.querySelector("#pinResult");


  function checkDelhiPin() {

    if (!pinInput || !pinResult) {
      return;
    }

    const pin =
      pinInput.value.trim();


    if (!/^\d{6}$/.test(pin)) {

      pinResult.className =
        "pin-result error";

      pinResult.innerHTML =
        "⚠️ Please enter a valid 6-digit PIN code.";

      return;
    }


    // Delhi PIN codes are generally in the 110001–110099 range.
    // We use the 110 prefix as the Delhi-area check.
    if (!pin.startsWith("110")) {

      pinResult.className =
        "pin-result error";

      pinResult.innerHTML =
        "❌ Sorry, we currently provide this service only in Delhi.";

      return;
    }


    pinResult.className =
      "pin-result success";

    pinResult.innerHTML = `
      <strong>✓ Great news!</strong>
      <br>
      Service is available in Delhi for PIN code ${pin}.
      <br>
      <span>Our team will confirm the exact date and time based on availability.</span>
    `;
  }


  if (pinCheckButton) {

    pinCheckButton.addEventListener(
      "click",
      checkDelhiPin
    );
  }


  if (pinInput) {

    pinInput.addEventListener("keydown", event => {

      if (event.key === "Enter") {

        event.preventDefault();

        checkDelhiPin();
      }
    });
  }


  // ====================================================
  // BOOKING FORM
  // ====================================================

  const bookingForm =
    document.querySelector("#bookingForm");

  if (bookingForm) {

    bookingForm.addEventListener("submit", async event => {

      event.preventDefault();


      const submitButton =
        bookingForm.querySelector(
          'button[type="submit"]'
        );


      const errorBox =
        document.querySelector("#bookingError");


      if (errorBox) {
        errorBox.textContent = "";
        errorBox.style.display = "none";
      }


      const formData =
        new FormData(bookingForm);


      const bookingData = {

        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        address: formData.get("address"),
        pincode: formData.get("pincode"),

        tankType:
          formData.get("tankType") ||
          document.querySelector("#selectedTankType")?.value,

        capacity:
          formData.get("capacity") ||
          document.querySelector("#selectedCapacity")?.value,

        quantity:
          formData.get("quantity") ||
          document.querySelector("#selectedQuantity")?.value,

        date: formData.get("date"),
        time: formData.get("time")
      };


      if (!bookingData.name ||
          !bookingData.phone ||
          !bookingData.email ||
          !bookingData.address ||
          !bookingData.pincode ||
          !bookingData.tankType ||
          !bookingData.capacity ||
          !bookingData.quantity ||
          !bookingData.date ||
          !bookingData.time) {

        if (errorBox) {

          errorBox.style.display = "block";

          errorBox.textContent =
            "Please fill in all booking details.";
        }

        return;
      }


      if (
        !/^\d{6}$/.test(
          bookingData.pincode
        )
      ) {

        if (errorBox) {

          errorBox.style.display = "block";

          errorBox.textContent =
            "Please enter a valid 6-digit PIN code.";
        }

        return;
      }


      if (
        !bookingData.pincode.startsWith("110")
      ) {

        if (errorBox) {

          errorBox.style.display = "block";

          errorBox.textContent =
            "Sorry, our online booking is currently available only for Delhi PIN codes.";
        }

        return;
      }


      try {

        if (submitButton) {

          submitButton.disabled = true;

          submitButton.innerHTML =
            "Creating secure payment...";
        }


        const response =
          await fetch("/api/create-order", {

            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify(
              bookingData
            )
          });


        const result =
          await response.json();


        if (!response.ok || !result.success) {

          throw new Error(
            result.message ||
            "Unable to create booking."
          );
        }


        const options = {

          key: result.keyId,

          amount: result.amount,

          currency: result.currency,

          name: "VSH Tank Cleaning",

          description:
            "Professional Water Tank Cleaning",

          order_id:
            result.orderId,


          prefill: {

            name: bookingData.name,

            email: bookingData.email,

            contact: bookingData.phone
          },


          notes: {

            booking_id:
              result.bookingId
          },


          theme: {

            color: "#087cf0"
          },


          handler: async function(payment) {

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

                    body: JSON.stringify({

                      ...payment,

                      bookingId:
                        result.bookingId,

                      booking:
                        bookingData
                    })
                  }
                );


              const verification =
                await verifyResponse.json();


              if (
                !verifyResponse.ok ||
                !verification.success
              ) {

                throw new Error(
                  verification.message ||
                  "Payment verification failed."
                );
              }


              const successBox =
                document.querySelector(
                  "#bookingSuccess"
                );


              if (successBox) {

                successBox.style.display =
                  "block";

                successBox.innerHTML = `
                  <div class="success-icon">✓</div>

                  <h2>Booking confirmed!</h2>

                  <p>
                    Your tank cleaning booking has been
                    successfully received.
                  </p>

                  <strong>
                    Booking ID:
                    ${result.bookingId}
                  </strong>
                `;
              }


              bookingForm.style.display =
                "none";

              window.scrollTo({
                top: 0,
                behavior: "smooth"
              });

            } catch (error) {

              if (errorBox) {

                errorBox.style.display =
                  "block";

                errorBox.textContent =
                  error.message ||
                  "Payment verification failed.";
              }
            }
          },


          modal: {

            ondismiss: function() {

              if (submitButton) {

                submitButton.disabled =
                  false;

                submitButton.innerHTML =
                  "Pay & Book Now →";
              }
            }
          }
        };


        const razorpay =
          new Razorpay(options);

        razorpay.open();


      } catch (error) {

        console.error(error);


        if (errorBox) {

          errorBox.style.display =
            "block";

          errorBox.textContent =
            error.message ||
            "Something went wrong. Please try again.";
        }


        if (submitButton) {

          submitButton.disabled =
            false;

          submitButton.innerHTML =
            "Pay & Book Now →";
        }
      }
    });
  }
});


// ======================================================
// GLOBAL WHATSAPP LINKS
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const whatsappLinks =
      document.querySelectorAll(
        '[data-whatsapp]'
      );


    whatsappLinks.forEach(link => {

      link.addEventListener(
        "click",
        () => {

          const message =
            link.dataset.whatsapp ||
            "Hi, I want to book tank cleaning service.";

          link.href =
            `https://wa.me/919599057079?text=${encodeURIComponent(message)}`;
        }
      );
    });
  }
);
