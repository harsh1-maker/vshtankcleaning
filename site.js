/* =====================================================
   VSH TANK CLEANING
   SITE JS
===================================================== */


/* =====================================================
   SETTINGS
===================================================== */

const WHATSAPP_NUMBER = "919599057079";

const API_CREATE_ORDER = "/api/create-order.js";
const API_VERIFY_PAYMENT = "/api/verify-payment.js";

const SERVICE_PIN_PREFIXES = [
  "110",
  "121",
  "122",
  "201"
];


/* =====================================================
   PRICES
===================================================== */

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


/* =====================================================
   HELPERS
===================================================== */

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

  const unitPrice =
    getPrice(tankType, capacity);

  const qty =
    Number(quantity);

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


function isServiceablePin(pin) {

  const value =
    String(pin || "")
      .replace(/\D/g, "");

  if (value.length !== 6) {
    return false;
  }

  return SERVICE_PIN_PREFIXES.some(
    prefix =>
      value.startsWith(prefix)
  );

}


/* =====================================================
   MOBILE MENU
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const menuButton =
      document.querySelector(".menu-toggle");

    const mobileNav =
      document.querySelector(".mobile-nav");


    if (
      menuButton &&
      mobileNav
    ) {

      menuButton.addEventListener(
        "click",
        function () {

          const isOpen =
            mobileNav.classList.toggle("open");

          menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
          );

          menuButton.textContent =
            isOpen ? "✕" : "☰";

        }
      );


      mobileNav
        .querySelectorAll("a")
        .forEach(function (link) {

          link.addEventListener(
            "click",
            function () {

              mobileNav.classList.remove(
                "open"
              );

              menuButton.setAttribute(
                "aria-expanded",
                "false"
              );

              menuButton.textContent =
                "☰";

            }
          );

        });

    }


    initHomePinChecker();

    initPricing();

    initBooking();

    initDateMinimum();

  }
);


/* =====================================================
   HOME PIN CHECKER
===================================================== */

function initHomePinChecker() {

  const input =
    document.getElementById("homePin");

  const button =
    document.getElementById("homePinCheck");

  const result =
    document.getElementById("homePinResult");


  if (
    !input ||
    !button ||
    !result
  ) {
    return;
  }


  button.addEventListener(
    "click",
    function () {

      const pin =
        input.value
          .replace(/\D/g, "");


      if (pin.length !== 6) {

        result.textContent =
          "Please enter a valid 6-digit PIN code.";

        result.style.color =
          "#b42318";

        return;

      }


      if (
        isServiceablePin(pin)
      ) {

        result.textContent =
          "✓ Good news — VSH currently serves this PIN code.";

        result.style.color =
          "#15803d";

      } else {

        result.textContent =
          "This PIN is currently outside our online service area.";

        result.style.color =
          "#b42318";

      }

    }
  );

}


/* =====================================================
   PRICING PAGE
===================================================== */

function initPricing() {

  const tankButtons =
    document.querySelectorAll(
      "[data-tank-type]"
    );

  const capacityButtons =
    document.querySelectorAll(
      "[data-capacity]"
    );


  if (
    !tankButtons.length &&
    !capacityButtons.length
  ) {
    return;
  }


  let tankType =
    document.getElementById(
      "selectedTankType"
    )?.value ||
    "overhead";


  let capacity =
    Number(
      document.getElementById(
        "selectedCapacity"
      )?.value ||
      500
    );


  let quantity = 1;


  const selectedTankInput =
    document.getElementById(
      "selectedTankType"
    );

  const selectedCapacityInput =
    document.getElementById(
      "selectedCapacity"
    );

  const selectedQuantityInput =
    document.getElementById(
      "selectedQuantity"
    );


  const quantityDisplay =
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


  const discountText =
    document.querySelector(
      "[data-discount-text]"
    );


  const addMore =
    document.querySelector(
      "[data-add-more]"
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


  function updatePricing() {

    if (
      selectedTankInput
    ) {
      selectedTankInput.value =
        tankType;
    }


    if (
      selectedCapacityInput
    ) {
      selectedCapacityInput.value =
        capacity;
    }


    if (
      selectedQuantityInput
    ) {
      selectedQuantityInput.value =
        quantity;
    }


    if (
      quantityDisplay
    ) {
      quantityDisplay.textContent =
        quantity;
    }


    const paymentMethod =
      document.querySelector(
        'input[name="paymentMethod"]:checked'
      )?.value ||
      "online";


    const pricing =
      calculateTotal(
        tankType,
        capacity,
        quantity,
        paymentMethod
      );


    if (
      subtotalElement
    ) {

      subtotalElement.textContent =
        money(
          pricing.subtotal
        );

    }


    if (
      discountElement
    ) {

      let discountTotal =
        pricing.quantityDiscount +
        pricing.onlineDiscount;

      discountElement.textContent =
        discountTotal > 0
          ? "-" + money(discountTotal)
          : money(0);

    }


    if (
      totalElement
    ) {

      totalElement.textContent =
        money(pricing.total);

    }


    if (
      discountText
    ) {

      if (
        pricing.quantityDiscountPercent > 0
      ) {

        discountText.innerHTML =
          `<strong>
            ${quantity} tank${quantity > 1 ? "s" : ""}
            • ${pricing.quantityDiscountPercent}% quantity discount
          </strong>`;

      } else {

        discountText.innerHTML =
          `<strong>
            ${quantity} tank
            • No quantity discount
          </strong>`;

      }

    }


    if (
      addMore
    ) {

      if (
        quantity < 5
      ) {

        const next =
          quantity + 1;

        const nextDiscount =
          getDiscount(next);

        addMore.textContent =
          nextDiscount > 0
            ? `Add ${next - quantity} more tank${next - quantity > 1 ? "s" : ""} to unlock ${nextDiscount}% quantity savings.`
            : "Add more tanks to unlock quantity savings.";

      } else {

        addMore.textContent =
          "Maximum quantity discount unlocked: 15%.";

      }

    }

  }


  tankButtons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          tankButtons.forEach(
            b =>
              b.classList.remove(
                "active"
              )
          );

          button.classList.add(
            "active"
          );

          tankType =
            button.dataset.tankType;


          const available =
            Object.keys(
              PRICES[tankType] || {}
            )
            .map(Number);


          if (
            !available.includes(
              capacity
            )
          ) {

            capacity =
              available[0] ||
              500;

          }


          updateCapacityPrices();

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

          capacity =
            Number(
              button.dataset.capacity
            );


          capacityButtons.forEach(
            b =>
              b.classList.remove(
                "active"
              )
          );


          button.classList.add(
            "active"
          );


          updatePricing();

        }
      );

    }
  );


  if (
    quantityMinus
  ) {

    quantityMinus.addEventListener(
      "click",
      function () {

        quantity =
          Math.max(
            1,
            quantity - 1
          );

        updatePricing();

      }
    );

  }


  if (
    quantityPlus
  ) {

    quantityPlus.addEventListener(
      "click",
      function () {

        quantity =
          Math.min(
            10,
            quantity + 1
          );

        updatePricing();

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

            updatePaymentUI();

            updatePricing();

          }
        );

      }
    );


  function updatePaymentUI() {

    const method =
      document.querySelector(
        'input[name="paymentMethod"]:checked'
      )?.value;


    const note =
      document.querySelector(
        "[data-payment-note]"
      );


    const submit =
      document.getElementById(
        "bookingSubmit"
      );


    if (
      note
    ) {

      if (
        method === "online"
      ) {

        note.textContent =
          "Online payment includes a 5% discount.";

      } else {

        note.textContent =
          "Pay after service selected — the 5% online discount does not apply.";

      }

    }


    if (
      submit
    ) {

      submit.textContent =
        method === "online"
          ? "Pay & Book Now →"
          : "Confirm Booking →";

    }

  }


  function updateCapacityPrices() {

    capacityButtons.forEach(
      function (button) {

        const value =
          Number(
            button.dataset.capacity
          );


        const price =
          getPrice(
            tankType,
            value
          );


        const strong =
          button.querySelector(
            "strong"
          );


        if (
          strong
        ) {

          strong.textContent =
            money(price);

        }

      }
    );

  }


  updateCapacityPrices();

  updatePaymentUI();

  updatePricing();

}


/* =====================================================
   BOOKING
===================================================== */

function initBooking() {

  const form =
    document.getElementById(
      "bookingForm"
    );


  if (!form) {
    return;
  }


  const errorBox =
    document.getElementById(
      "bookingError"
    );


  const successBox =
    document.getElementById(
      "bookingSuccess"
    );


  const submitButton =
    document.getElementById(
      "bookingSubmit"
    );


  function showError(message) {

    if (!errorBox) {
      alert(message);
      return;
    }


    errorBox.textContent =
      message;

    errorBox.style.display =
      "block";

  }


  function clearError() {

    if (
      errorBox
    ) {

      errorBox.textContent =
        "";

      errorBox.style.display =
        "none";

    }

  }


  function showSuccess(html) {

    if (
      form
    ) {

      form.style.display =
        "none";

    }


    if (
      successBox
    ) {

      successBox.innerHTML =
        html;

      successBox.style.display =
        "block";

    }

  }


  form.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      clearError();


      const formData =
        new FormData(form);


      const name =
        String(
          formData.get("name") ||
          ""
        ).trim();


      const phone =
        String(
          formData.get("phone") ||
          ""
        ).replace(
          /\D/g,
          ""
        );


      const email =
        String(
          formData.get("email") ||
          ""
        ).trim();


      const pincode =
        String(
          formData.get("pincode") ||
          ""
        ).replace(
          /\D/g,
          ""
        );


      const address =
        String(
          formData.get("address") ||
          ""
        ).trim();


      const date =
        String(
          formData.get("date") ||
          ""
        );


      const time =
        String(
          formData.get("time") ||
          ""
        );


      const tankType =
        String(
          formData.get("tankType") ||
          "overhead"
        );


      const capacity =
        Number(
          formData.get("capacity") ||
          500
        );


      const quantity =
        Number(
          formData.get("quantity") ||
          1
        );


      const paymentMethod =
        String(
          formData.get("paymentMethod") ||
          "online"
        );


      if (
        !name ||
        !phone ||
        !email ||
        !pincode ||
        !address ||
        !date ||
        !time
      ) {

        showError(
          "Please fill all required booking details."
        );

        return;

      }


      if (
        phone.length !== 10
      ) {

        showError(
          "Please enter a valid 10-digit mobile number."
        );

        return;

      }


      if (
        !isServiceablePin(
          pincode
        )
      ) {

        showError(
          "Online booking is currently available only for supported Delhi NCR PIN codes beginning with 110, 121, 122 or 201."
        );

        return;

      }


      if (
        !["online","after_service"]
          .includes(
            paymentMethod
          )
      ) {

        showError(
          "Please select a valid payment method."
        );

        return;

      }


      const pricing =
        calculateTotal(
          tankType,
          capacity,
          quantity,
          paymentMethod
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

        paymentMethod,

        pricing

      };


      const originalText =
        submitButton
          ? submitButton.textContent
          : "";


      try {

        if (
          submitButton
        ) {

          submitButton.disabled =
            true;

          submitButton.textContent =
            paymentMethod === "online"
              ? "Creating secure payment…"
              : "Confirming booking…";

        }


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
                JSON.stringify(
                  payload
                )
            }
          );


        let data =
          null;


        try {

          data =
            await response.json();

        } catch (_) {

          data =
            null;

        }


        if (
          !response.ok
        ) {

          throw new Error(
            data?.error ||
            data?.message ||
            "Booking could not be created."
          );

        }


        /* ==================================
           PAY AFTER SERVICE
        ================================== */

        if (
          paymentMethod ===
          "after_service"
        ) {

          if (
            data?.bookingConfirmed !== true
          ) {

            throw new Error(
              data?.error ||
              "Pay-after-service booking is currently unavailable."
            );

          }


          showSuccess(`

            <div style="
              width:58px;
              height:58px;
              margin:0 auto 15px;
              display:grid;
              place-items:center;
              border-radius:50%;
              background:#dcfce7;
              color:#15803d;
              font-size:25px;
              font-weight:900;
            ">
              ✓
            </div>

            <h3>
              Booking confirmed!
            </h3>

            <p>
              Thank you,
              ${escapeHtml(name)}.
              Your tank cleaning booking has been received.
            </p>

            <p>
              <strong>
                Booking details
              </strong><br>

              ${escapeHtml(tankType)}
              tank ·
              ${capacity.toLocaleString("en-IN")}
              L ·
              ${quantity}
              tank${quantity > 1 ? "s" : ""}

              <br>

              ${escapeHtml(date)}
              ·
              ${escapeHtml(time)}
            </p>

            <p>
              Payment:
              <strong>
                Pay after service
              </strong>
            </p>

            <a
              href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                `Hi VSH Tank Cleaning, my booking is confirmed. Name: ${name}, Date: ${date}, Time: ${time}`
              )}"
              target="_blank"
              class="btn btn-whatsapp"
            >
              WhatsApp VSH
            </a>

          `);


          return;

        }


        /* ==================================
           ONLINE PAYMENT
        ================================== */

        if (
          !window.Razorpay
        ) {

          throw new Error(
            "Razorpay could not be loaded. Please refresh and try again."
          );

        }


        if (
          !data?.orderId ||
          !data?.keyId
        ) {

          throw new Error(
            "Payment order could not be created."
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

            contact:
              phone

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
              String(
                capacity
              ),

            quantity:
              String(
                quantity
              )

          },


          theme: {

            color:
              "#0878f9"

          },


          handler:
            async function (
              paymentResponse
            ) {

              try {

                if (
                  submitButton
                ) {

                  submitButton.disabled =
                    true;

                  submitButton.textContent =
                    "Confirming payment…";

                }


                const verifyResponse =
                  await fetch(
                    API_VERIFY_PAYMENT,
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


                if (
                  !verifyResponse.ok
                ) {

                  throw new Error(
                    verifyData?.error ||
                    verifyData?.message ||
                    "Payment verification failed."
                  );

                }


                showSuccess(`

                  <div style="
                    width:58px;
                    height:58px;
                    margin:0 auto 15px;
                    display:grid;
                    place-items:center;
                    border-radius:50%;
                    background:#dcfce7;
                    color:#15803d;
                    font-size:25px;
                    font-weight:900;
                  ">
                    ✓
                  </div>

                  <h3>
                    Booking confirmed!
                  </h3>

                  <p>
                    Thank you,
                    ${escapeHtml(name)}.
                    Your tank cleaning booking has been received.
                  </p>

                  <p>
                    <strong>
                      Booking details
                    </strong><br>

                    ${escapeHtml(tankType)}
                    tank ·
                    ${capacity.toLocaleString("en-IN")}
                    L ·
                    ${quantity}
                    tank${quantity > 1 ? "s" : ""}

                    <br>

                    ${escapeHtml(date)}
                    ·
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


              } catch (
                error
              ) {

                showError(
                  error.message ||
                  "Payment was received, but booking confirmation failed. Please contact VSH with your payment ID."
                );

              } finally {

                if (
                  submitButton
                ) {

                  submitButton.disabled =
                    false;

                  submitButton.textContent =
                    originalText;

                }

              }

            },


          modal: {

            ondismiss:
              function () {

                if (
                  submitButton
                ) {

                  submitButton.disabled =
                    false;

                  submitButton.textContent =
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

            showError(
              response?.error?.description ||
              "Payment failed. Please try again."
            );


            if (
              submitButton
            ) {

              submitButton.disabled =
                false;

              submitButton.textContent =
                originalText;

            }

          }
        );


        razorpay.open();


      } catch (
        error
      ) {

        showError(
          error.message ||
          "Something went wrong while creating your booking."
        );


        if (
          submitButton
        ) {

          submitButton.disabled =
            false;

          submitButton.textContent =
            originalText;

        }

      }

    }
  );

}


/* =====================================================
   DATE MINIMUM
===================================================== */

function initDateMinimum() {

  const dateInput =
    document.querySelector(
      'input[name="date"]'
    );


  if (!dateInput) {
    return;
  }


  const today =
    new Date();


  const yyyy =
    today.getFullYear();


  const mm =
    String(
      today.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const dd =
    String(
      today.getDate()
    ).padStart(
      2,
      "0"
    );


  dateInput.min =
    `${yyyy}-${mm}-${dd}`;

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}
