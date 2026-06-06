import { useApp } from "@/context/AppContext";

export function useWishlist() {
  const { wishlist, toggleWishlist } = useApp();

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  return {
    wishlist,
    toggleWishlist,
    isWishlisted
  };
}
