document.addEventListener("DOMContentLoaded", function () {

  console.log("VSH Tank Cleaning booking system loaded.");



  // ==================================================
  // PRICES
  // ==================================================

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



  // ==================================================
  // QUANTITY DISCOUNTS
  // ==================================================

  const DISCOUNTS = {

    1: 0,

    2: 10,

    3: 12,

    4: 14,

    5: 15

  };



  // ==================================================
  // HELPER FUNCTIONS
  // ==================================================

  function money(value) {

    return (
      "₹" +
      Number(value).toLocaleString("en-IN")
    );

  }



  function getDiscount(quantity) {

    quantity = Number(quantity);

    if (quantity >= 5) {

      return 15;

    }

    return DISCOUNTS[quantity] || 0;

  }



  function calculateTotal(
    tankType,
    capacity,
    quantity
  ) {

    const unitPrice =
      Number(
        PRICES[tankType]?.[capacity] || 0
      );

    const qty =
      Number(quantity);

    const subtotal =
      unitPrice * qty;

    const discountPercent =
      getDiscount(qty);

    const discount =
      Math.round(
        subtotal *
        discountPercent /
        100
      );

    const total =
      subtotal - discount;

    return {

      unitPrice,
      quantity: qty,
      subtotal,
      discountPercent,
      discount,
      total

    };

  }



  // ==================================================
  // BOOKING FORM
  // ==================================================

  const form =
    document.getElementById(
      "bookingForm"
    );



  if (!form) {

    console.log(
      "Booking form not found."
    );

    return;

  }



  // ==================================================
  // BOOKING TOTAL
  // ==================================================

  const tankType =
    document.getElementById(
      "tankType"
    );



  const capacity =
    document.getElementById(
      "capacity"
    );



  const quantity =
    document.getElementById(
      "quantity"
    );



  const bookingAmount =
    document.getElementById(
      "bookingAmount"
    );



  function updateBookingAmount() {

    if (
      !tankType ||
      !capacity ||
      !quantity ||
      !bookingAmount
    ) {

      return;

    }



    const result =
      calculateTotal(
        tankType.value,
        capacity.value,
        quantity.value
      );



    bookingAmount.textContent =
      money(result.total);

  }



  if (tankType) {

    tankType.addEventListener(
      "change",
      updateBookingAmount
    );

  }



  if (capacity) {

    capacity.addEventListener(
      "change",
      updateBookingAmount
    );

  }



  if (quantity) {

    quantity.addEventListener(
      "input",
      updateBookingAmount
    );

  }



  updateBookingAmount();



  // ==================================================
  // FORM SUBMISSION
  // ==================================================

  form.addEventListener(
    "submit",
    async function (event) {

      // THIS PREVENTS THE PAGE REFRESH
      event.preventDefault();
      event.stopPropagation();

      console.log(
        "VSH booking form submitted."
      );



      const payButton =
        document.getElementById(
          "payButton"
        );



      const successBox =
        document.getElementById(
          "success"
        );



      const errorBox =
        document.getElementById(
          "bookingError"
        );



      // Hide previous messages

      if (successBox) {

        successBox.style.display =
          "none";

      }



      if (errorBox) {

        errorBox.style.display =
          "none";

      }



      // Disable button

      if (payButton) {

        payButton.disabled =
          true;

        payButton.textContent =
          "Creating secure payment...";

      }



      try {

        // ============================================
        // GET FORM DATA
        // ============================================

        const formData =
          new FormData(form);



        const bookingData = {

          name:
            String(
              formData.get("name") || ""
            ).trim(),

          phone:
            String(
              formData.get("phone") || ""
            ).trim(),

          email:
            String(
              formData.get("email") || ""
            ).trim(),

          address:
            String(
              formData.get("address") || ""
            ).trim(),

          pincode:
            String(
              formData.get("pincode") || ""
            ).trim(),

          tankType:
            String(
              formData.get("tankType") || ""
            ),

          capacity:
            String(
              formData.get("capacity") || ""
            ),

          quantity:
            Number(
              formData.get("quantity") || 1
            ),

          date:
            String(
              formData.get("date") || ""
            ),

          time:
            String(
              formData.get("time") || ""
            )

        };



        // ============================================
        // BASIC VALIDATION
        // ============================================

        if (
          !bookingData.name ||
          !bookingData.phone ||
          !bookingData.email ||
          !bookingData.address ||
          !bookingData.tankType ||
          !bookingData.capacity ||
          !bookingData.date ||
          !bookingData.time
        ) {

          throw new Error(
            "Please fill in all booking details."
          );

        }



        if (
          !Number.isInteger(
            bookingData.quantity
          ) ||
          bookingData.quantity < 1 ||
          bookingData.quantity > 20
        ) {

          throw new Error(
            "Quantity must be between 1 and 20."
          );

        }



        // ============================================
        // CREATE RAZORPAY ORDER
        // ============================================

        console.log(
          "Creating Razorpay order..."
        );



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
                  bookingData
                )

            }
          );



        // Read as TEXT first.
        // This prevents JSON parsing errors
        // from hiding the actual server response.

        const responseText =
          await response.text();



        console.log(
          "Create-order response:",
          responseText
        );



        let order;



        try {

          order =
            JSON.parse(
              responseText
            );

        } catch (jsonError) {

          throw new Error(
            "The booking server returned an invalid response. Please check the Vercel API deployment."
          );

        }



        if (
          !response.ok ||
          !order.success
        ) {

          throw new Error(
            order.message ||
            "Unable to create Razorpay order."
          );

        }



        console.log(
          "Razorpay order created:",
          order
        );



        // ============================================
        // CHECK RAZORPAY
        // ============================================

        if (
          typeof window.Razorpay ===
          "undefined"
        ) {

          throw new Error(
            "Razorpay checkout has not loaded. Please refresh and try again."
          );

        }



        // ============================================
        // OPEN RAZORPAY
        // ============================================

        const options = {

          key:
            order.keyId,

          amount:
            order.amount,

          currency:
            order.currency ||
            "INR",

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

            color:
              "#0877f9"

          },



          handler:
            async function (
              paymentResponse
            ) {

              try {

                console.log(
                  "Razorpay payment successful:",
                  paymentResponse
                );



                if (payButton) {

                  payButton.textContent =
                    "Verifying payment...";

                }



                // ==================================
                // VERIFY PAYMENT
                // ==================================

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
                        JSON.stringify(
                          paymentResponse
                        )

                    }
                  );



                const verifyText =
                  await verifyResponse.text();



                console.log(
                  "Verification response:",
                  verifyText
                );



                let verification;



                try {

                  verification =
                    JSON.parse(
                      verifyText
                    );

                } catch (error) {

                  throw new Error(
                    "Payment verification returned an invalid server response."
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



                // ==================================
                // SUCCESS
                // ==================================

                if (successBox) {

                  successBox.style.display =
                    "block";

                  successBox.innerHTML = `
                    <strong>
                      Booking confirmed!
                    </strong>
                    <br>
                    Your payment was successful.
                    <br>
                    Booking ID:
                    <strong>
                      ${
                        verification.bookingId ||
                        order.bookingId
                      }
                    </strong>
                  `;

                }



                form.reset();

                updateBookingAmount();



                if (payButton) {

                  payButton.disabled =
                    false;

                  payButton.textContent =
                    "Pay & Book Cleaning";

                }

              } catch (error) {

                console.error(
                  "Payment verification error:",
                  error
                );



                if (errorBox) {

                  errorBox.style.display =
                    "block";

                  errorBox.textContent =
                    error.message;

                }



                if (payButton) {

                  payButton.disabled =
                    false;

                  payButton.textContent =
                    "Pay & Book Cleaning";

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
          function (paymentError) {

            console.error(
              "Razorpay payment failed:",
              paymentError
            );



            if (errorBox) {

              errorBox.style.display =
                "block";

              errorBox.textContent =
                "Payment failed. Please try again.";

            }



            if (payButton) {

              payButton.disabled =
                false;

              payButton.textContent =
                "Pay & Book Cleaning";

            }

          }
        );



        razorpay.open();



      } catch (error) {

        console.error(
          "VSH booking error:",
          error
        );



        if (errorBox) {

          errorBox.style.display =
            "block";

          errorBox.textContent =
            error.message;

        }



        if (payButton) {

          payButton.disabled =
            false;

          payButton.textContent =
            "Pay & Book Cleaning";

        }

      }

    }

  );

});
