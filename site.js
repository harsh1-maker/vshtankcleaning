"use strict";


/* =========================================================
   VSH TANK CLEANING
   GLOBAL SITE JAVASCRIPT
========================================================= */


const VSH_CONFIG = {
  whatsapp: "919599057079",
  phone: "+919599057079",
  createOrderEndpoint: "/api/create-order.js",
  verifyPaymentEndpoint: "/api/verify-payment.js"
};


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


/* =========================================================
   HELPERS
========================================================= */

function money(value) {

  return "₹" + Number(value || 0).toLocaleString("en-IN");

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

  const unitPrice = getPrice(
    tankType,
    capacity
  );

  const qty = Number(quantity);

  const subtotal =
    unitPrice * qty;

  const quantityDiscountPercent =
    getDiscount(qty);

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


function setText(selector, value) {

  const el =
    document.querySelector(selector);

  if (el) {
    el.textContent = value;
  }

}


function showError(message) {

  const box =
    document.querySelector("#bookingError");

  if (!box) {
    alert(message);
    return;
  }

  box.textContent = message;
  box.style.display = "block";

  box.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


function clearError() {

  const box =
    document.querySelector("#bookingError");

  if (box) {
    box.textContent = "";
    box.style.display = "none";
  }

}


/* =========================================================
   MOBILE MENU
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const menuButton =
      document.querySelector(".mobile-menu");

    const mobileNav =
      document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {

      menuButton.addEventListener(
        "click",
        function () {

          mobileNav.classList.toggle("open");

          const isOpen =
            mobileNav.classList.contains("open");

          menuButton.textContent =
            isOpen ? "✕" : "☰";

          menuButton.setAttribute(
            "aria-label",
            isOpen
              ? "Close menu"
              : "Open menu"
          );

        }
      );


      mobileNav
        .querySelectorAll("a")
        .forEach(function (link) {

          link.addEventListener(
            "click",
            function () {

              mobileNav.classList.remove("open");

              menuButton.textContent = "☰";

            }
          );

        });

    }

  }
);


/* =========================================================
   WHATSAPP DATA ATTRIBUTES
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    document
      .querySelectorAll("[data-whatsapp]")
      .forEach(function (element) {

        const message =
          element.getAttribute(
            "data-whatsapp"
          );

        const url =
          "https://wa.me/" +
          VSH_CONFIG.whatsapp +
          "?text=" +
          encodeURIComponent(message);

        element.setAttribute(
          "href",
          url
        );

        element.setAttribute(
          "target",
          "_blank"
        );

      });

  }
);


/* =========================================================
   PRICING PAGE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const pricingCard =
      document.querySelector(".pricing-card");

    if (!pricingCard) {
      return;
    }


    let tankType = "overhead";
    let capacity = 500;
    let quantity = 1;
    let paymentMethod = "online";


    const tankTypeButtons =
      document.querySelectorAll(
        ".tank-type"
      );


    const capacityButtons =
      document.querySelectorAll(
        ".capacity-card"
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


    function updatePricing() {

      const result =
        calculateTotal(
          tankType,
          capacity,
          quantity,
          paymentMethod
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


      setText(
        "[data-price-subtotal]",
        money(result.subtotal)
      );


      setText(
        "[data-discount-amount]",
        result.quantityDiscount > 0
          ? "-" + money(result.quantityDiscount)
          : money(0)
      );


      setText(
        "[data-online-discount]",
        result.onlineDiscount > 0
          ? "-" + money(result.onlineDiscount)
          : money(0)
      );


      setText(
        "[data-price-total]",
        money(result.total)
      );


      setText(
        "[data-discount-text]",
        quantity === 1
          ? "1 tank • No discount"
          : quantity +
            " tanks • " +
            result.quantityDiscountPercent +
            "% quantity discount"
      );


      const addMore =
        document.querySelector(
          "[data-add-more]"
        );

      if (addMore) {

        if (quantity < 5) {

          const nextQty =
            quantity + 1;

          const nextDiscount =
            getDiscount(nextQty);

          addMore.textContent =
            "Add " +
            (nextQty - quantity) +
            " more tank to unlock " +
            nextDiscount +
            "% discount.";

        } else {

          addMore.textContent =
            "Maximum quantity discount unlocked.";

        }

      }


      updateBookingSummary(
        result
      );

    }


    function updateBookingSummary(result) {

      setText(
        "[data-booking-subtotal]",
        money(result.subtotal)
      );

      setText(
        "[data-booking-quantity-discount]",
        result.quantityDiscount > 0
          ? "-" + money(result.quantityDiscount)
          : money(0)
      );

      setText(
        "[data-booking-online-discount]",
        result.onlineDiscount > 0
          ? "-" + money(result.onlineDiscount)
          : money(0)
      );

      setText(
        "[data-booking-total]",
        money(result.total)
      );

    }


    tankTypeButtons.forEach(
      function (button) {

        button.addEventListener(
          "click",
          function () {

            tankTypeButtons.forEach(
              function (item) {
                item.classList.remove(
                  "active"
                );
              }
            );

            button.classList.add(
              "active"
            );

            tankType =
              button.dataset.tankType;

            const available =
              PRICES[tankType];

            if (
              !available[capacity]
            ) {

              const firstCapacity =
                Object.keys(
                  available
                )[0];

              capacity =
                Number(firstCapacity);

              capacityButtons.forEach(
                function (item) {

                  item.classList.remove(
                    "active"
                  );

                  if (
                    Number(
                      item.dataset.capacity
                    ) === capacity
                  ) {

                    item.classList.add(
                      "active"
                    );

                  }

                }
              );

            }

            updatePricing();

          }
        );

      }
    );


    capacityButtons.forEach(
      function (button) {

        button.addEventListener(
          "click",
          function () {

            const selected =
              Number(
                button.dataset.capacity
              );

            if (
              !PRICES[tankType]?.[selected]
            ) {

              return;

            }

            capacity =
              selected;

            capacityButtons.forEach(
              function (item) {

                item.classList.remove(
                  "active"
                );

              }
            );

            button.classList.add(
              "active"
            );

            updatePricing();

          }
        );

      }
    );


    if (quantityMinus) {

      quantityMinus.addEventListener(
        "click",
        function () {

          if (quantity > 1) {

            quantity--;

            updatePricing();

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

            updatePricing();

          }

        }
      );

    }


    document
      .querySelectorAll(
        'input[name="paymentMethod"]'
      )
      .forEach(
        function (radio) {

          radio.addEventListener(
            "change",
            function () {

              paymentMethod =
                radio.value;

              document
                .querySelectorAll(
                  ".payment-option"
                )
                .forEach(
                  function (option) {

                    option.classList.remove(
                      "active"
                    );

                  }
                );

              const parent =
                radio.closest(
                  ".payment-option"
                );

              if (parent) {
                parent.classList.add(
                  "active"
                );
              }

              const submit =
                document.querySelector(
                  "#bookingSubmit"
                );

              const note =
                document.querySelector(
                  "#paymentNote"
                );

              if (submit) {

                submit.textContent =
                  paymentMethod === "online"
                    ? "Pay & Book Now →"
                    : "Book Now — Pay After Service →";

              }

              if (note) {

                note.textContent =
                  paymentMethod === "online"
                    ? "🔒 Secure payment powered by Razorpay"
                    : "✓ No online payment required";

              }

              updatePricing();

            }
          );

        }
      );


    const urlParams =
      new URLSearchParams(
        window.location.search
      );

    const requestedType =
      urlParams.get("type");

    if (
      requestedType === "overhead" ||
      requestedType === "underground"
    ) {

      tankType =
        requestedType;

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


    updatePricing();

  }
);


/* =========================================================
   PIN CHECK
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const pinInput =
      document.querySelector(
        "#areaPin"
      );

    const checkButton =
      document.querySelector(
        "#checkPin"
      );

    const result =
      document.querySelector(
        "#pinResult"
      );

    if (
      !pinInput ||
      !checkButton ||
      !result
    ) {
      return;
    }


    checkButton.addEventListener(
      "click",
      function () {

        const pin =
          pinInput.value.trim();


        result.className =
          "pin-result";


        if (
          !/^\d{6}$/.test(pin)
        ) {

          result.classList.add(
            "error"
          );

          result.textContent =
            "Please enter a valid 6-digit PIN code.";

          return;

        }


        if (
          /^110\d{3}$/.test(pin)
        ) {

          result.classList.add(
            "success"
          );

          result.textContent =
            "✓ Good news! This Delhi PIN code is currently within our online booking area.";

        } else {

          result.classList.add(
            "error"
          );

          result.textContent =
            "Online booking is currently available for Delhi PIN codes beginning with 110.";

        }

      }
    );

  }
);


/* =========================================================
   BOOKING FORM
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const form =
      document.querySelector(
        "#bookingForm"
      );

    if (!form) {
      return;
    }


    function getFormData() {

      const formData =
        new FormData(form);

      return {
        name:
          String(
            formData.get("name") ||
            ""
          ).trim(),

        phone:
          String(
            formData.get("phone") ||
            ""
          ).trim(),

        email:
          String(
            formData.get("email") ||
            ""
          ).trim(),

        pincode:
          String(
            formData.get("pincode") ||
            ""
          ).trim(),

        address:
          String(
            formData.get("address") ||
            ""
          ).trim(),

        date:
          String(
            formData.get("date") ||
            ""
          ).trim(),

        time:
          String(
            formData.get("time") ||
            ""
          ).trim(),

        tankType:
          String(
            formData.get("tankType") ||
            "overhead"
          ),

        capacity:
          Number(
            formData.get("capacity") ||
            500
          ),

        quantity:
          Number(
            formData.get("quantity") ||
            1
          ),

        paymentMethod:
          String(
            formData.get("paymentMethod") ||
            "online"
          )

      };

    }


    form.addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();

        clearError();


        const submitButton =
          document.querySelector(
            "#bookingSubmit"
          );


        const data =
          getFormData();


        if (
          !data.name ||
          !data.phone ||
          !data.email ||
          !data.pincode ||
          !data.address ||
          !data.date ||
          !data.time
        ) {

          showError(
            "Please fill in all required fields."
          );

          return;

        }


        if (
          !/^\d{10}$/.test(
            data.phone
          )
        ) {

          showError(
            "Please enter a valid 10-digit mobile number."
          );

          return;

        }


        if (
          !/^\d{6}$/.test(
            data.pincode
          )
        ) {

          showError(
            "Please enter a valid 6-digit PIN code."
          );

          return;

        }


        if (
          !/^110\d{3}$/.test(
            data.pincode
          )
        ) {

          showError(
            "Online booking is currently available for Delhi PIN codes beginning with 110."
          );

          return;

        }


        const calculation =
          calculateTotal(
            data.tankType,
            data.capacity,
            data.quantity,
            data.paymentMethod
          );


        if (!calculation.unitPrice) {

          showError(
            "The selected tank size is not available. Please select another size."
          );

          return;

        }


        const originalButtonText =
          submitButton
            ? submitButton.textContent
            : "";


        if (submitButton) {

          submitButton.disabled =
            true;

          submitButton.textContent =
            "Processing...";

        }


        try {

          const response =
            await fetch(
              VSH_CONFIG.createOrderEndpoint,
              {
                method:"POST",

                headers:{
                  "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({

                  ...data,

                  amount:
                    calculation.total,

                  subtotal:
                    calculation.subtotal,

                  quantityDiscount:
                    calculation.quantityDiscount,

                  quantityDiscountPercent:
                    calculation.quantityDiscountPercent,

                  onlineDiscount:
                    calculation.onlineDiscount,

                  total:
                    calculation.total

                })

              }
            );


          const result =
            await response.json();


          if (!response.ok) {

            throw new Error(
              result.message ||
              result.error ||
              "Unable to create booking."
            );

          }


          /* =================================================
             PAY AFTER SERVICE
          ================================================= */

          if (
            data.paymentMethod ===
            "after_service"
          ) {

            showBookingSuccess(
              result.booking ||
              result
            );

            return;

          }


          /* =================================================
             ONLINE PAYMENT
          ================================================= */

          if (
            !result.order
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
              "Razorpay could not be loaded. Please try again."
            );

          }


          const razorpayOptions = {

            key:
              result.keyId ||
              result.key ||
              "",

            amount:
              result.order.amount,

            currency:
              result.order.currency ||
              "INR",

            name:
              "VSH Tank Cleaning",

            description:
              "Water Tank Cleaning Booking",

            order_id:
              result.order.id,

            prefill:{

              name:
                data.name,

              email:
                data.email,

              contact:
                data.phone

            },

            notes:{

              pincode:
                data.pincode,

              address:
                data.address,

              tankType:
                data.tankType,

              capacity:
                data.capacity,

              quantity:
                data.quantity

            },


            handler:
              async function (
                paymentResponse
              ) {

                try {

                  const verifyResponse =
                    await fetch(
                      VSH_CONFIG.verifyPaymentEndpoint,
                      {
                        method:"POST",

                        headers:{
                          "Content-Type":
                            "application/json"
                        },

                        body:
                          JSON.stringify({

                            ...paymentResponse,

                            booking:
                              data,

                            calculation:
                              calculation

                          })

                      }
                    );


                  const verifyResult =
                    await verifyResponse.json();


                  if (
                    !verifyResponse.ok
                  ) {

                    throw new Error(
                      verifyResult.message ||
                      verifyResult.error ||
                      "Payment verification failed."
                    );

                  }


                  showBookingSuccess(
                    verifyResult.booking ||
                    verifyResult
                  );

                } catch (
                  verificationError
                ) {

                  showError(
                    verificationError.message ||
                    "Payment was received but verification failed. Please contact VSH."
                  );

                }

              },


            modal:{

              ondismiss:
                function () {

                  if (
                    submitButton
                  ) {

                    submitButton.disabled =
                      false;

                    submitButton.textContent =
                      originalButtonText;

                  }

                }

            }

          };


          const razorpay =
            new Razorpay(
              razorpayOptions
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


              if (
                submitButton
              ) {

                submitButton.disabled =
                  false;

                submitButton.textContent =
                  originalButtonText;

              }

            }
          );


          razorpay.open();


        } catch (
          error
        ) {

          showError(
            error.message ||
            "Something went wrong. Please try again."
          );


          if (
            submitButton
          ) {

            submitButton.disabled =
              false;

            submitButton.textContent =
              originalButtonText;

          }

        }

      }
    );


    function showBookingSuccess(
      booking
    ) {

      const successBox =
        document.querySelector(
          "#bookingSuccess"
        );

      if (!successBox) {
        return;
      }


      form.style.display =
        "none";


      const bookingId =
        booking?.bookingId ||
        booking?.id ||
        booking?.reference ||
        "";


      const paymentMethod =
        booking?.paymentMethod ||
        "";


      let message = `
        <strong>✓ Booking confirmed!</strong><br><br>
        Thank you for choosing VSH Tank Cleaning.
      `;


      if (bookingId) {

        message += `
          <br>
          <strong>Booking ID:</strong>
          ${escapeHtml(
            String(
              bookingId
            )
          )}
        `;

      }


      if (
        paymentMethod ===
        "after_service"
      ) {

        message += `
          <br><br>
          <strong>Payment:</strong>
          Pay after service.
        `;

      } else {

        message += `
          <br><br>
          <strong>Payment:</strong>
          Online payment received.
        `;

      }


      message += `
        <br><br>
        Our team will contact you regarding your selected service slot.
      `;


      successBox.innerHTML =
        message;


      successBox.style.display =
        "block";


      successBox.scrollIntoView({
        behavior:"smooth",
        block:"center"
      });

    }

  }
);


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(
  value
) {

  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}


/* =========================================================
   SET MINIMUM BOOKING DATE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const dateInput =
      document.querySelector(
        'input[name="date"]'
      );

    if (!dateInput) {
      return;
    }


    const now =
      new Date();


    const year =
      now.getFullYear();


    const month =
      String(
        now.getMonth() + 1
      ).padStart(
        2,
        "0"
      );


    const day =
      String(
        now.getDate()
      ).padStart(
        2,
        "0"
      );


    dateInput.min =
      `${year}-${month}-${day}`;

  }
);


/* =========================================================
   SMOOTH INTERNAL LINKS
========================================================= */

document.addEventListener(
  "click",
  function (event) {

    const link =
      event.target.closest(
        'a[href^="#"]'
      );

    if (!link) {
      return;
    }


    const targetId =
      link.getAttribute(
        "href"
      );


    if (
      !targetId ||
      targetId === "#"
    ) {
      return;
    }


    const target =
      document.querySelector(
        targetId
      );


    if (!target) {
      return;
    }


    event.preventDefault();


    target.scrollIntoView({
      behavior:"smooth",
      block:"start"
    });

  }
);
