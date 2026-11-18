// ======================================================
// VSH TANK CLEANING — CENTRAL PRICING CONFIG
// ======================================================

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


// ======================================================
// QUANTITY DISCOUNTS
// ======================================================

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


// ======================================================
// TRANSPORTATION
// Charged ONCE per booking, NOT per tank
// ======================================================

export const TRANSPORT_RULES = {
  freeDistanceKm: 5,

  tiers: [
    {
      maxDistance: 5,
      charge: 0
    },
    {
      maxDistance: 10,
      charge: 50
    },
    {
      maxDistance: 15,
      charge: 75
    },
    {
      maxDistance: Infinity,
      charge: 100
    }
  ]
};


export function getTransportCharge(distanceKm) {
  const distance = Number(distanceKm);

  if (!Number.isFinite(distance) || distance < 0) {
    return 0;
  }

  const tier = TRANSPORT_RULES.tiers.find(
    item => distance <= item.maxDistance
  );

  return tier ? tier.charge : 100;
}


// ======================================================
// PRICE HELPERS
// ======================================================

export function getPrice(tankType, capacity) {
  return Number(
    PRICES[tankType]?.[capacity] || 0
  );
}


export function calculateTotal(
  tankType,
  capacity,
  quantity,
  transportCharge = 0
) {
  const unitPrice = getPrice(tankType, capacity);
  const qty = Number(quantity);

  const subtotal = unitPrice * qty;

  const discountPercent = getDiscount(qty);

  const discount = Math.round(
    subtotal * discountPercent / 100
  );

  const serviceTotal = subtotal - discount;

  const transport = Number(transportCharge) || 0;

  const total = serviceTotal + transport;

  return {
    unitPrice,
    quantity: qty,
    subtotal,
    discountPercent,
    discount,
    serviceTotal,
    transport,
    total
  };
}
