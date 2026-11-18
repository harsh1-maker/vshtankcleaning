/* =========================================================
   VSH TANK CLEANING - SITE JS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     MOBILE MENU
  ======================================================= */

  const menuButton = document.querySelector(".mobile-menu-btn");
  const navbar = document.querySelector(".navbar");

  if (menuButton && navbar) {

    menuButton.addEventListener("click", () => {

      navbar.classList.toggle("mobile-open");

      const open =
        navbar.classList.contains("mobile-open");

      menuButton.textContent = open ? "✕" : "☰";

    });

  }


  /* =======================================================
     FAQ
  ======================================================= */

  document
    .querySelectorAll(".faq-question")
    .forEach((button) => {

      button.addEventListener("click", () => {

        const item =
          button.closest(".faq-item");

        if (!item) return;

        item.classList.toggle("open");

        const symbol =
          button.querySelector("span");

        if (symbol) {
          symbol.textContent =
            item.classList.contains("open")
              ? "−"
              : "+";
        }

      });

    });


  /* =======================================================
     PRICING CONFIG
  ======================================================= */

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


  function getQuantityDiscount(quantity) {

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
    paymentMethod
  ) {

    const unitPrice =
      getPrice(tankType, capacity);

    const qty =
      Number(quantity);

    const subtotal =
      unitPrice * qty;

    const quantityDiscountPercent =
      getQuantityDiscount(qty);

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
            ONLINE_PAYMENT_DISCOUNT /
            100
          )
        : 0;

    const total =
      afterQuantityDiscount -
      onlineDiscount;

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
     PRICING PAGE
  ======================================================= */

  const pricingPage =
    document.querySelector(".pricing-shell");

  if (pricingPage) {

    let tankType =
      document.querySelector("#selectedTankType")
        ?.value || "overhead";

    let capacity =
      Number(
        document.querySelector("#selectedCapacity")
          ?.value || 500
      );

    let quantity =
      Number(
        document.querySelector("#selectedQuantity")
          ?.value || 1
      );

    let paymentMethod =
      document.querySelector(
        'input[name="paymentMethod"]:checked'
      )?.value || "online";


    /* -----------------------------------------------
       TANK TYPE
    ----------------------------------------------- */

    document
      .querySelectorAll(".tank-type")
      .forEach((button) => {

        button.addEventListener("click", () => {

          document
            .querySelectorAll(".tank-type")
            .forEach((item) => {
              item.classList.remove("active");
            });

          button.classList.add("active");

          tankType =
            button.dataset.tankType;

          const hidden =
            document.querySelector(
              "#selectedTankType"
            );

          if (hidden) {
            hidden.value = tankType;
          }

          updatePricing();

        });

      });


    /* -----------------------------------------------
       CAPACITY
    ----------------------------------------------- */

    document
      .querySelectorAll(".capacity-card")
      .forEach((button) => {

        button.addEventListener("click", () => {

          document
            .querySelectorAll(".capacity-card")
            .forEach((item) => {
              item.classList.remove("active");
            });

          button.classList.add("active");

          capacity =
            Number(button.dataset.capacity);

          const hidden =
            document.querySelector(
              "#selectedCapacity"
            );

          if (hidden) {
            hidden.value = capacity;
          }

          updatePricing();

        });

      });


    /* -----------------------------------------------
       QUANTITY
    ----------------------------------------------- */

    const quantityDisplay =
      document.querySelector(
        "[data-quantity]"
      );

    const quantityHidden =
      document.querySelector(
        "#selectedQuantity"
      );


    const minusButton =
      document.querySelector(
        "[data-quantity-minus]"
      );

    const plusButton =
      document.querySelector(
        "[data-quantity-plus]"
      );


    function setQuantity(value) {

      quantity =
        Math.max(
          1,
          Math.min(
            20,
            Number(value)
          )
        );

      if (quantityDisplay) {
        quantityDisplay.textContent =
          quantity;
      }

      if (quantityHidden) {
        quantityHidden.value =
          quantity;
      }

      updatePricing();

    }


    if (minusButton) {

      minusButton.addEventListener(
        "click",
        () => {
          setQuantity(quantity - 1);
        }
      );

    }


    if (plusButton) {

      plusButton.addEventListener(
        "click",
        () => {
          setQuantity(quantity + 1);
        }
      );

    }


    /* -----------------------------------------------
       PAYMENT METHOD
    ----------------------------------------------- */

    document
      .querySelectorAll(
        "[data-payment-option]"
      )
      .forEach((option) => {

        option.addEventListener(
          "click",
          () => {

            const radio =
              option.querySelector(
                'input[type="radio"]'
              );

            if (!radio) return;

            radio.checked = true;

            paymentMethod =
              radio.value;

            document
              .querySelectorAll(
                "[data-payment-option]"
              )
              .forEach((item) => {
                item.classList.remove(
                  "active"
                );
              });

            option.classList.add(
              "active"
            );

            updatePricing();

          }
        );

      });


    /* -----------------------------------------------
       UPDATE PRICING
    ----------------------------------------------- */

    function updatePricing() {

      const result =
        calculateTotal(
          tankType,
          capacity,
          quantity,
          paymentMethod
        );


      const subtotal =
        document.querySelector(
          "[data-price-subtotal]"
        );

      const discount =
        document.querySelector(
          "[data-discount-amount]"
        );

      const total =
        document.querySelector(
          "[data-price-total]"
        );


      if (subtotal) {

        subtotal.textContent =
          formatMoney(
            result.subtotal
          );

      }


      if (discount) {

        discount.textContent =
          result.quantityDiscount > 0
            ? "- " +
              formatMoney(
                result.quantityDiscount
              )
            : "₹0";

      }


      const onlineRow =
        document.querySelector(
          "#onlineDiscountRow"
        );

      const onlineAmount =
        document.querySelector(
          "#onlineDiscountAmount"
        );


      if (onlineRow) {

        onlineRow.style.display =
          paymentMethod === "online"
            ? "flex"
            : "none";

      }


      if (onlineAmount) {

        onlineAmount.textContent =
          paymentMethod === "online"
            ? "- " +
              formatMoney(
                result.onlineDiscount
              )
            : "₹0";

      }


      if (total) {

        total.textContent =
          formatMoney(
            result.total
          );

      }


      const discountText =
        document.querySelector(
          "[data-discount-text]"
        );


      if (discountText) {

        if (
          paymentMethod === "online"
        ) {

          if (
            result.quantityDiscountPercent > 0
          ) {

            discountText.textContent =
              `${result.quantityDiscountPercent}% quantity saving + 5% online discount applied.`;

          } else {

            discountText.textContent =
              "Pay online and save 5%.";

          }

        } else {

          if (
            result.quantityDiscountPercent > 0
          ) {

            discountText.textContent =
              `${result.quantityDiscountPercent}% quantity saving applied. Pay after service has no 5% online discount.`;

          } else {

            discountText.textContent =
              "Pay after service. No online payment discount.";

          }

        }

      }


      const addMore =
        document.querySelector(
          "[data-add-more]"
        );

      if (addMore) {

        if (
          quantity < 5
        ) {

          const nextQty =
            quantity + 1;

          const nextDiscount =
            getQuantityDiscount(
              nextQty
            );

          addMore.textContent =
            `Add ${5 - quantity} more tank${5 - quantity === 1 ? "" : "s"} to unlock up to ${nextDiscount}% quantity savings.`;

        } else {

          addMore.textContent =
            "Maximum 15% quantity saving unlocked.";

        }

      }

    }


    function formatMoney(amount) {

      return (
        "₹" +
        Number(amount).toLocaleString(
          "en-IN"
        )
      );

    }


    updatePricing();


    /* =====================================================
       BOOKING FORM
    ===================================================== */

    const bookingForm =
      document.querySelector(
        "#bookingForm"
      );


    if (bookingForm) {

      bookingForm.addEventListener(
        "submit",
        async (event) => {

          event.preventDefault();


          const errorBox =
            document.querySelector(
              "#bookingError"
            );

          if (errorBox) {
            errorBox.classList.remove(
              "show"
            );
            errorBox.textContent = "";
          }


          const name =
            document.querySelector(
              "#customerName"
            )?.value.trim();


          const phone =
            document.querySelector(
              "#customerPhone"
            )?.value.trim();


          const email =
            document.querySelector(
              "#customerEmail"
            )?.value.trim();


          const pin =
            document.querySelector(
              "#customerPin"
            )?.value.trim();


          const address =
            document.querySelector(
              "#customerAddress"
            )?.value.trim();


          if (!name || !phone || !pin || !address) {

            showBookingError(
              "Please fill in all required fields."
            );

            return;

          }


          if (!/^[6-9]\d{9}$/.test(phone)) {

            showBookingError(
              "Please enter a valid 10-digit Indian mobile number."
            );

            return;

          }


          if (!/^110\d{3}$/.test(pin)) {

            showBookingError(
              "Please enter a valid Delhi PIN code starting with 110."
            );

            return;

          }


          const result =
            calculateTotal(
              tankType,
              capacity,
              quantity,
              paymentMethod
            );


          const button =
            bookingForm.querySelector(
              'button[type="submit"]'
            );


          const originalText =
            button
              ? button.textContent
              : "";


          if (button) {

            button.disabled = true;

            button.textContent =
              "Processing...";

          }


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

                  body: JSON.stringify({

                    name,

                    phone,

                    email,

                    pin,

                    address,

                    tankType,

                    capacity,

                    quantity,

                    paymentMethod,

                    amount:
                      result.total

                  })

                }
              );


            const data =
              await response.json();


            if (!response.ok) {

              throw new Error(
                data.error ||
                "Unable to create booking."
              );

            }


            /* -------------------------------------------
               PAY AFTER SERVICE
            ------------------------------------------- */

            if (
              paymentMethod ===
              "after_service"
            ) {

              showBookingSuccess();

              return;

            }


            /* -------------------------------------------
               RAZORPAY
            ------------------------------------------- */

            if (
              !data.order
            ) {

              throw new Error(
                "Payment order was not created."
              );

            }


            if (
              typeof Razorpay ===
              "undefined"
            ) {

              throw new Error(
                "Razorpay failed to load."
              );

            }


            const options = {

              key:
                data.key,

              amount:
                data.order.amount,

              currency:
                data.order.currency ||
                "INR",

              name:
                "VSH Tank Cleaning",

              description:
                "Water Tank Cleaning Booking",

              order_id:
                data.order.id,


              prefill: {

                name,

                email,

                contact:
                  phone

              },


              theme: {

                color:
                  "#0878f9"

              },


              handler:
                async function (
                  payment
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

                              razorpay_order_id:
                                payment.razorpay_order_id,

                              razorpay_payment_id:
                                payment.razorpay_payment_id,

                              razorpay_signature:
                                payment.razorpay_signature

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
                        verifyData.error ||
                        "Payment verification failed."
                      );

                    }


                    showBookingSuccess();

                  } catch (error) {

                    showBookingError(
                      error.message ||
                      "Payment verification failed."
                    );

                    if (button) {

                      button.disabled =
                        false;

                      button.textContent =
                        originalText;

                    }

                  }

                }

            };


            const razorpay =
              new Razorpay(
                options
              );


            razorpay.on(
              "payment.failed",
              function (
                response
              ) {

                showBookingError(
                  response.error?.description ||
                  "Payment failed. Please try again."
                );

                if (button) {

                  button.disabled =
                    false;

                  button.textContent =
                    originalText;

                }

              }
            );


            razorpay.open();


          } catch (error) {

            showBookingError(
              error.message ||
              "Something went wrong. Please try again."
            );


            if (button) {

              button.disabled =
                false;

              button.textContent =
                originalText;

            }

          }

        }
      );

    }


    function showBookingError(message) {

      const errorBox =
        document.querySelector(
          "#bookingError"
        );

      if (!errorBox) return;

      errorBox.textContent =
        message;

      errorBox.classList.add(
        "show"
      );

      errorBox.style.display =
        "block";

      errorBox.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    }


    function showBookingSuccess() {

      const form =
        document.querySelector(
          "#bookingForm"
        );

      const success =
        document.querySelector(
          "#bookingSuccess"
        );

      if (form) {
        form.style.display =
          "none";
      }

      if (success) {

        success.style.display =
          "block";

        success.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

      }

    }

  }


  /* =======================================================
     SERVICE AREA SEARCH
  ======================================================= */

  const checkPinButton =
    document.querySelector(
      "#checkPin"
    );

  const areaInput =
    document.querySelector(
      "#areaPin"
    );

  const areaResult =
    document.querySelector(
      "#pinResult"
    );


  const serviceAreas = [

    "Delhi",
    "North Delhi",
    "South Delhi",
    "West Delhi",

    "Janakpuri",
    "Kirti Nagar",
    "Mayapuri",
    "Naraina",
    "Paschim Vihar",
    "Punjabi Bagh",
    "Rajouri Garden",
    "Uttam Nagar",

    "Karol Bagh",
    "Patel Nagar",

    "Saket",
    "Vasant Kunj",

    "Delhi Cantt",
    "Dwarka",

    "Pitampura",
    "Rohini",

    "Ghaziabad",
    "Greater Noida",
    "Noida",

    "Faridabad",
    "Gurgaon"

  ];


  function checkServiceArea() {

    if (!areaInput || !areaResult) {
      return;
    }


    const value =
      areaInput.value
        .trim()
        .toLowerCase();


    if (!value) {

      areaResult.className =
        "area-result show error";

      areaResult.textContent =
        "Please enter a PIN code or area name.";

      return;

    }


    /* PIN */
    if (
      /^\d{6}$/.test(value)
    ) {

      if (
        value.startsWith("110")
      ) {

        areaResult.className =
          "area-result show success";

        areaResult.textContent =
          "✓ This PIN is within our Delhi service-check area. Please continue to booking or contact us to confirm your exact locality.";

      } else {

        areaResult.className =
          "area-result show error";

        areaResult.textContent =
          "We currently focus on Delhi NCR service areas. Please WhatsApp us to check your exact location.";

      }

      return;

    }


    const match =
      serviceAreas.find(
        (area) =>
          area.toLowerCase() ===
          value
      );


    if (match) {

      areaResult.className =
        "area-result show success";

      areaResult.textContent =
        `✓ Yes, we serve ${match}. You can continue to booking.`;

      return;

    }


    const partialMatch =
      serviceAreas.find(
        (area) =>
          area
            .toLowerCase()
            .includes(value)
      );


    if (partialMatch) {

      areaResult.className =
        "area-result show success";

      areaResult.textContent =
        `✓ ${partialMatch} is in our listed service coverage.`;

      return;

    }


    areaResult.className =
      "area-result show error";

    areaResult.textContent =
      "We couldn't find that area in our listed service areas. WhatsApp us with your location and we'll check.";

  }


  if (checkPinButton) {

    checkPinButton.addEventListener(
      "click",
      checkServiceArea
    );

  }


  if (areaInput) {

    areaInput.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Enter"
        ) {

          event.preventDefault();

          checkServiceArea();

        }

      }
    );

  }


});
