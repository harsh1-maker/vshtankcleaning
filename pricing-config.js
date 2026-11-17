// ============================================================
// VSH TANK CLEANING — PRICING
// CHANGE YOUR PRICES HERE
// ============================================================
// Capacity is in litres.
// Example: change 499 to 549 and redeploy on Vercel.
//
// The website and Razorpay order API both use this file.
// ============================================================

export const PRICES = {
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

export const QUANTITY_DISCOUNTS = {
  1: 0,
  2: 10,
  3: 12,
  4: 14,
  5: 15
};

export function getQuantityDiscount(quantity) {
  const q = Number(quantity);
  if (q >= 5) return QUANTITY_DISCOUNTS[5];
  return QUANTITY_DISCOUNTS[q] ?? 0;
}

export function getUnitPrice(tankType, capacity) {
  return Number(PRICES[String(tankType).toLowerCase()]?.[String(capacity)]) || 0;
}

export function calculateTotal(tanks) {
  const subtotal = tanks.reduce(
    (sum, tank) => sum + getUnitPrice(tank.tankType, tank.capacity),
    0
  );

  const discountPercent = getQuantityDiscount(tanks.length);
  const discount = Math.round(subtotal * discountPercent / 100);

  return {
    subtotal,
    discountPercent,
    discount,
    total: subtotal - discount
  };
}
