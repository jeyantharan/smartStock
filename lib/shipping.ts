/** Default shipping when product has no shippingCharge set (LKR) */
export const DEFAULT_SHIPPING_CHARGE_LKR = 300;

export function getProductShippingCharge(shippingCharge?: number | null): number {
  if (shippingCharge != null && shippingCharge >= 0) {
    return shippingCharge;
  }
  return DEFAULT_SHIPPING_CHARGE_LKR;
}

/** Sum shipping once per unique product in the cart */
export function calculateCartShipping(
  cart: { product: { id: string; shippingCharge?: number } }[]
): number {
  if (cart.length === 0) return 0;

  const seen = new Set<string>();
  let total = 0;

  for (const item of cart) {
    if (seen.has(item.product.id)) continue;
    seen.add(item.product.id);
    total += getProductShippingCharge(item.product.shippingCharge);
  }

  return total;
}
