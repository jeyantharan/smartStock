import { useApp } from "@/context/AppContext";
import { calculateCartTotals } from "@/lib/cart-utils";

export function useCart() {
  const { cart, addToCart, removeFromCart, updateCartQuantity, clearCart } = useApp();

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const { cartSubtotal, cartTax, shippingCost, cartTotal } = calculateCartTotals(cart);

  return {
    cart,
    cartCount,
    cartSubtotal,
    cartTax,
    shippingCost,
    cartTotal,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
  };
}
