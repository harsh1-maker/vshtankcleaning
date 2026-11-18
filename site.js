/* =========================================================
   VSH TANK CLEANING
   COMPLETE SITE JAVASCRIPT
========================================================= */

(() => {
  "use strict";

  /* =======================================================
     CONFIG
  ======================================================= */

  const WHATSAPP_NUMBER = "919599057079";
  const API_CREATE_ORDER = "/api/create-order";
  const API_VERIFY_PAYMENT = "/api/verify-payment";

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

  const QUANTITY_DISCOUNTS = {
    1: 0,
    2: 10,
    3: 12,
    4: 14,
    5: 15
  };

  const ONLINE_PAYMENT_DISCOUNT = 5;


  /* =======================================================
     HELPERS
  ======================================================= */

  function money(amount) {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  }

  function getDiscount(quantity) {
    const qty = Number(quantity);

    if (qty >= 5) {
      return 15;
    }

    return QUANTITY_DISCOUNTS[qty] || 0;
  }

  function getPrice(tankType, capacity) {
    return Number(
      PRICES[tankType]?.[capacity] || 0
    );
  }

  function calculateTotal(
    tankType,
    capacity,
    quantity,
    paymentMethod = "online"
  ) {
    const unitPrice = getPrice(tankType, capacity);
    const qty = Number(quantity);

    const subtotal = unitPrice * qty;

    const quantityDiscountPercent = getDiscount(qty);

    const quantityDiscount = Math.round(
      subtotal * quantityDiscountPercent / 100
    );

    const afterQuantityDiscount =
      subtotal - quantityDiscount;

    const onlineDiscount =
      paymentMethod === "online"
        ? Math.round(
            afterQuantityDiscount *
            ONLINE_PAYMENT_DISCOUNT / 100
          )
        : 0;

    const total =
      afterQuantityDiscount - onlineDiscount;

    return {
      unitPrice,
      quantity: qty,
      subtotal,
      quantityDiscountPercent,
      quantityDiscount,
      onlineDiscount,
      total
    };
  }


  /* =======================================================
     MOBILE MENU
  ======================================================= */

  function setupMobileMenu() {
    const menuButton =
      document.querySelector(".mobile-menu");

    const nav =
      document.querySelector(".nav-links");

    if (!menuButton || !nav) {
      return;
    }

    menuButton.addEventListener("click", () => {
      nav.classList.toggle("mobile-open");

      const opened =
        nav.classList.contains("mobile-open");

      menuButton.setAttribute(
        "aria-expanded",
        opened ? "true" : "false"
      );

      menuButton.innerHTML =
        opened ? "✕" : "☰";
    });

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("mobile-open");

        menuButton.setAttribute(
          "aria-expanded",
          "false"
        );

        menuButton.innerHTML = "☰";
      });
    });
  }


  /* =======================================================
     WHATSAPP LINKS
  ======================================================= */

  function setupWhatsAppLinks() {
    document
      .querySelectorAll("[data-whatsapp]")
      .forEach(link => {

        const message =
          link.getAttribute("data-whatsapp");

        if (!message) {
          return;
        }

        link.href =
          `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

        link.target = "_blank";
      });
  }


  /* =======================================================
     PRICING CALCULATOR
  ======================================================= */

  function setupPricing() {
    const tankTypeButtons =
      document.querySelectorAll(
        "[data-tank-type]"
      );

    const capacityButtons =
      document.querySelectorAll(
        "[data-capacity]"
      );

    const quantityElement =
      document.querySelector(
        "[data-quantity]"
      );

    const quantityMinus =
      document.querySelector(
        "[data-quantity-minus]"
      );

    const quantityPlus =
      document.querySelector(
        "[data-quantity-plus]"
      );

    const selectedTankType =
      document.querySelector(
        "#selectedTankType"
      );

    const selectedCapacity =
      document.querySelector(
        "#selectedCapacity"
      );

    const selectedQuantity =
      document.querySelector(
        "#selectedQuantity"
      );

    const subtotalElement =
      document.querySelector(
        "[data-price-subtotal]"
      );

    const discountElement =
      document.querySelector(
        "[data-discount-amount]"
      );

    const totalElement =
      document.querySelector(
        "[data-price-total]"
      );

    const discountText =
      document.querySelector(
        "[data-discount-text]"
      );

    const addMoreElement =
      document.querySelector(
        "[data-add-more]"
      );

    if (!quantityElement) {
      return;
    }

    let tankType =
      selectedTankType?.value ||
      "overhead";

    let capacity =
      Number(
        selectedCapacity?.value || 500
      );

    let quantity =
      Number(
        selectedQuantity?.value || 1
      );


    function updateCapacityAvailability() {
      capacityButtons.forEach(button => {

        const buttonCapacity =
          Number(
            button.dataset.capacity
          );

        const available =
          getPrice(
            tankType,
            buttonCapacity
          ) > 0;

        button.style.display =
          available ? "" : "none";

      });
    }


    function updatePricing() {
      const result =
        calculateTotal(
          tankType,
          capacity,
          quantity,
          "online"
        );

      if (quantityElement) {
        quantityElement.textContent =
          quantity;
      }

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

      if (subtotalElement) {
        subtotalElement.textContent =
          money(result.subtotal);
      }

      if (discountElement) {

        if (result.quantityDiscount > 0) {
          discountElement.textContent =
            `− ${money(result.quantityDiscount)}`;
        } else {
          discountElement.textContent =
            "₹0";
        }
      }

      if (totalElement) {
        totalElement.textContent =
          money(result.total);
      }

      if (discountText) {

        if (
          result.quantityDiscountPercent === 0
        ) {

          discountText.innerHTML =
            `<strong>${quantity} tank${quantity > 1 ? "s" : ""} • No quantity discount</strong>`;

        } else {

          discountText.innerHTML =
            `<strong>${quantity} tanks • ${result.quantityDiscountPercent}% quantity discount</strong>`;
        }
      }

      if (addMoreElement) {

        if (quantity < 5) {

          const nextQty =
            quantity + 1;

          const nextDiscount =
            getDiscount(nextQty);

          if (nextDiscount > 0) {

            addMoreElement.textContent =
              `Add ${5 - quantity} more tank${5 - quantity > 1 ? "s" : ""} to reach up to ${nextDiscount}% savings.`;

          } else {

            addMoreElement.textContent =
              `Add another tank to unlock a quantity discount.`;
          }

        } else {

          addMoreElement.textContent =
            "Maximum quantity discount unlocked: 15%.";
        }
      }
    }


    tankTypeButtons.forEach(button => {

      button.addEventListener("click", () => {

        tankType =
          button.dataset.tankType;

        tankTypeButtons.forEach(item => {
          item.classList.remove("active");
        });

        button.classList.add("active");

        const currentPrice =
          getPrice(
            tankType,
            capacity
          );

        if (!currentPrice) {

          const availableButton =
            [...capacityButtons]
              .find(item =>
                getPrice(
                  tankType,
                  Number(
                    item.dataset.capacity
                  )
                ) > 0
              );

          if (availableButton) {

            capacity =
              Number(
                availableButton.dataset.capacity
              );
          }
        }

        updateCapacityAvailability();
        updatePricing();
      });
    });


    capacityButtons.forEach(button => {

      button.addEventListener("click", () => {

        const newCapacity =
          Number(
            button.dataset.capacity
          );

        if (
          !getPrice(
            tankType,
            newCapacity
          )
        ) {
          return;
        }

        capacity =
          newCapacity;

        capacityButtons.forEach(item => {
          item.classList.remove("active");
        });

        button.classList.add("active");

        updatePricing();
      });
    });


    if (quantityMinus) {

      quantityMinus.addEventListener(
        "click",
        () => {

          quantity =
            Math.max(
              1,
              quantity - 1
            );

          updatePricing();
        }
      );
    }


    if (quantityPlus) {

      quantityPlus.addEventListener(
        "click",
        () => {

          quantity =
            Math.min(
              20,
              quantity + 1
            );

          updatePricing();
        }
      );
    }


    updateCapacityAvailability();
    updatePricing();
  }


  /* =======================================================
     PIN CODE CHECK
  ======================================================= */

  function setupPinCheck() {
    const pinInput =
      document.querySelector("#areaPin");

    const checkButton =
      document.querySelector("#checkPin");

    const result =
      document.querySelector("#pinResult");

    if (
      !pinInput ||
      !checkButton ||
      !result
    ) {
      return;
    }

    checkButton.addEventListener(
      "click",
      () => {

        const pin =
          pinInput.value.trim();

        if (!/^\d{6}$/.test(pin)) {

          result.innerHTML =
            `<div class="pin-error">Please enter a valid 6-digit PIN code.</div>`;

          return;
        }

        if (!/^110\d{3}$/.test(pin)) {

          result.innerHTML =
            `<div class="pin-error">Sorry, online booking is currently available only for Delhi PIN codes beginning with 110.</div>`;

          return;
        }

        result.innerHTML =
          `<div class="pin-success">✓ Good news! VSH Tank Cleaning serves this Delhi PIN code.</div>`;
      }
    );
  }


  /* =======================================================
     BOOKING FORM
  ======================================================= */

  function setupBookingForm() {
    const form =
      document.querySelector("#bookingForm");

    if (!form) {
      return;
    }

    const errorBox =
      document.querySelector("#bookingError");

    const successBox =
      document.querySelector("#bookingSuccess");

    const submitButton =
      form.querySelector(
        'button[type="submit"]'
      );

    function showError(message) {

      if (errorBox) {

        errorBox.style.display = "block";

        errorBox.innerHTML =
          `<strong>Booking could not be created.</strong><br>${message}`;
      }

      if (successBox) {
        successBox.style.display = "none";
      }
    }


    function clearError() {

      if (errorBox) {
        errorBox.style.display = "none";
        errorBox.innerHTML = "";
      }
    }


    function showSuccess(message) {

      if (errorBox) {
        errorBox.style.display = "none";
        errorBox.innerHTML = "";
      }

      if (successBox) {

        successBox.style.display = "block";

        successBox.innerHTML =
          message;

        successBox.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    }


    form.addEventListener(
      "submit",
      async event => {

        event.preventDefault();

        clearError();

        const formData =
          new FormData(form);

        const tankType =
          formData.get("tankType");

        const capacity =
          Number(
            formData.get("capacity")
          );

        const quantity =
          Number(
            formData.get("quantity")
          );

        const name =
          String(
            formData.get("name") || ""
          ).trim();

        const phone =
          String(
            formData.get("phone") || ""
          ).trim();

        const email =
          String(
            formData.get("email") || ""
          ).trim();

        const pincode =
          String(
            formData.get("pincode") || ""
          ).trim();

        const address =
          String(
            formData.get("address") || ""
          ).trim();

        const date =
          String(
            formData.get("date") || ""
          ).trim();

        const time =
          String(
            formData.get("time") || ""
          ).trim();


        /* -----------------------------------------------
           CLIENT VALIDATION
        ----------------------------------------------- */

        if (!name) {
          showError("Please enter your full name.");
          return;
        }

        if (
          !/^[6-9]\d{9}$/.test(phone)
        ) {
          showError(
            "Please enter a valid 10-digit Indian mobile number."
          );
          return;
        }

        if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
          showError(
            "Please enter a valid email address."
          );
          return;
        }

        if (
          !/^110\d{3}$/.test(pincode)
        ) {
          showError(
            "Online booking is currently available only for Delhi PIN codes beginning with 110."
          );
          return;
        }

        if (!address) {
          showError(
            "Please enter your complete service address."
          );
          return;
        }

        if (!date) {
          showError(
            "Please select your preferred service date."
          );
          return;
        }

        if (!time) {
          showError(
            "Please select your preferred time."
          );
          return;
        }

        if (
          !tankType ||
          !capacity ||
          !quantity
        ) {
          showError(
            "Please select your tank type, capacity and quantity."
          );
          return;
        }


        /* -----------------------------------------------
           DISABLE BUTTON
        ----------------------------------------------- */

        const originalText =
          submitButton
            ? submitButton.innerHTML
            : "";

        if (submitButton) {

          submitButton.disabled =
            true;

          submitButton.innerHTML =
            "Creating booking…";
        }


        try {

          const price =
            calculateTotal(
              tankType,
              capacity,
              quantity,
              "online"
            );


          const payload = {

            name,
            phone,
            email,

            pincode,
            address,

            date,
            time,

            tankType,
            capacity,
            quantity,

            paymentMethod:
              "online",

            amount:
              price.total
          };


          /* ---------------------------------------------
             CREATE RAZORPAY ORDER
          --------------------------------------------- */

          const response =
            await fetch(
              API_CREATE_ORDER,
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


          let data = null;

          try {
            data =
              await response.json();
          } catch (_) {
            data = null;
          }


          if (!response.ok) {

            throw new Error(
              data?.error ||
              data?.message ||
              `Server returned HTTP ${response.status}.`
            );
          }


          if (!data) {

            throw new Error(
              "The booking server returned an empty response."
            );
          }


          if (
            !data.orderId ||
            !data.keyId
          ) {

            throw new Error(
              data.error ||
              "The booking server did not return a Razorpay order."
            );
          }


          /* ---------------------------------------------
             OPEN RAZORPAY
          --------------------------------------------- */

          if (
            typeof Razorpay === "undefined"
          ) {

            throw new Error(
              "Razorpay checkout could not be loaded. Please refresh the page and try again."
            );
          }


          const options = {

            key:
              data.keyId,

            amount:
              data.amount,

            currency:
              data.currency ||
              "INR",

            name:
              "VSH Tank Cleaning",

            description:
              "Water Tank Cleaning Booking",

            order_id:
              data.orderId,


            prefill: {

              name,
              email,
              contact: phone
            },


            notes: {

              bookingName:
                name,

              phone,

              email,

              pincode,

              address,

              date,

              time,

              tankType,

              capacity:
                String(capacity),

              quantity:
                String(quantity)
            },


            theme: {
              color: "#0878f9"
            },


            handler:
              async function (
                paymentResponse
              ) {

                try {

                  if (submitButton) {

                    submitButton.disabled =
                      true;

                    submitButton.innerHTML =
                      "Confirming payment…";
                  }


                  const verifyResponse =
                    await fetch(
                      API_VERIFY_PAYMENT,
                      {
                        method: "POST",

                        headers: {
                          "Content-Type":
                            "application/json"
                        },

                        body:
                          JSON.stringify({

                            razorpay_order_id:
                              paymentResponse
                                .razorpay_order_id,

                            razorpay_payment_id:
                              paymentResponse
                                .razorpay_payment_id,

                            razorpay_signature:
                              paymentResponse
                                .razorpay_signature,

                            booking:
                              payload
                          })
                      }
                    );


                  let verifyData =
                    null;

                  try {

                    verifyData =
                      await verifyResponse.json();

                  } catch (_) {

                    verifyData =
                      null;
                  }


                  if (!verifyResponse.ok) {

                    throw new Error(
                      verifyData?.error ||
                      verifyData?.message ||
                      "Payment verification failed."
                    );
                  }


                  showSuccess(`
                    <div class="success-icon">✓</div>

                    <h3>Booking confirmed!</h3>

                    <p>
                      Thank you, ${escapeHtml(name)}.
                      Your tank cleaning booking has been received.
                    </p>

                    <p>
                      <strong>Booking details</strong><br>
                      ${escapeHtml(tankType)} tank ·
                      ${capacity.toLocaleString("en-IN")} L ·
                      ${quantity} tank${quantity > 1 ? "s" : ""}<br>
                      ${escapeHtml(date)} ·
                      ${escapeHtml(time)}
                    </p>

                    <p>
                      Payment ID:
                      <strong>
                        ${escapeHtml(
                          paymentResponse
                            .razorpay_payment_id
                        )}
                      </strong>
                    </p>

                    <a
                      href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        `Hi VSH Tank Cleaning, I have completed my booking. Payment ID: ${paymentResponse.razorpay_payment_id}`
                      )}"
                      target="_blank"
                      class="btn btn-whatsapp"
                    >
                      WhatsApp VSH
                    </a>
                  `);


                  form.reset();

                } catch (error) {

                  showError(
                    error.message ||
                    "Payment was received, but booking confirmation failed. Please contact VSH with your payment ID."
                  );

                } finally {

                  if (submitButton) {

                    submitButton.disabled =
                      false;

                    submitButton.innerHTML =
                      originalText;
                  }
                }
              },


            modal: {

              ondismiss:
                function () {

                  if (submitButton) {

                    submitButton.disabled =
                      false;

                    submitButton.innerHTML =
                      originalText;
                  }
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

              if (submitButton) {

                submitButton.disabled =
                  false;

                submitButton.innerHTML =
                  originalText;
              }
            }
          );


          razorpay.open();

        } catch (error) {

          console.error(
            "VSH booking error:",
            error
          );

          showError(
            error.message ||
            "Unable to create booking. Please try again."
          );

          if (submitButton) {

            submitButton.disabled =
              false;

            submitButton.innerHTML =
              originalText;
          }
        }
      }
    );
  }


  /* =======================================================
     ESCAPE HTML
  ======================================================= */

  function escapeHtml(value) {

    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  /* =======================================================
     SET MINIMUM BOOKING DATE
  ======================================================= */

  function setupDateInput() {

    const dateInput =
      document.querySelector(
        'input[name="date"]'
      );

    if (!dateInput) {
      return;
    }

    const today =
      new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        today.getDate()
      ).padStart(2, "0");

    dateInput.min =
      `${year}-${month}-${day}`;
  }


  /* =======================================================
     INITIALIZE
  ======================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      setupMobileMenu();
      setupWhatsAppLinks();
      setupPricing();
      setupPinCheck();
      setupBookingForm();
      setupDateInput();

    }
  );

})();
