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

export function getDiscount(quantity) {
  const qty = Number(quantity);

  if (qty >= 5) {
    return 15;
  }

  return QUANTITY_DISCOUNTS[qty] || 0;
}

export function getPrice(tankType, capacity) {
  return Number(PRICES[tankType]?.[capacity] || 0);
}

export function calculateTotal(tankType, capacity, quantity) {
  const unitPrice = getPrice(tankType, capacity);
  const qty = Number(quantity);

  const subtotal = unitPrice * qty;
  const discountPercent = getDiscount(qty);
  const discount = Math.round(
    subtotal * discountPercent / 100
  );

  return {
    unitPrice,
    quantity: qty,
    subtotal,
    discountPercent,
    discount,
    total: subtotal - discount
  };
}
