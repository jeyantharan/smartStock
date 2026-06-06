import { calculateCartShipping } from "@/lib/shipping";

export const TAX_RATE = 0.08;

export function calculateCartTotals(
  cart: { product: { id: string; price: number; shippingCharge?: number }; quantity: number }[]
) {
  const cartSubtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  const shippingCost = calculateCartShipping(cart);
  const cartTax = cartSubtotal * TAX_RATE;
  const cartTotal = cartSubtotal + cartTax + shippingCost;

  return { cartSubtotal, shippingCost, cartTax, cartTotal };
}
