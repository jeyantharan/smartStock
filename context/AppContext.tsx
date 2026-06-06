"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { authService } from "@/services/authService";

// Types
export interface ProductVariantOption {
  name: string;
  values: string[];
  displayOrder: number;
  valueImages?: Record<string, string>;
  valuePrices?: Record<string, number>;
}

export interface ProductVariant {
  id?: string;
  sku: string;
  options: Record<string, string>;
  price: number;
  originalPrice?: number;
  stock: number;
  image?: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  ratingCount: number;
  image: string;
  images: string[];
  category: string;
  description: string;
  inStock: boolean;
  stockCount: number;
  specifications: Record<string, string>;
  variantOptions?: ProductVariantOption[];
  variants?: ProductVariant[];
  colors?: string[];
  sizes?: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isLatest?: boolean;
  shippingCharge?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions?: Record<string, string>;
  variantId?: string;
  selectedColor?: string;
  selectedSize?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "danger";
}

export interface UserAddress {
  id: string;
  title: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  shippingAddress: UserAddress;
  paymentMethod: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  phone: string;
  avatar?: string;
  emailVerified?: boolean;
  addresses: UserAddress[];
  orders: Order[];
}

interface AppContextType {
  cart: CartItem[];
  wishlist: string[];
  user: UserProfile | null;
  authLoading: boolean;
  toasts: ToastMessage[];
  addToCart: (product: Product, quantity?: number, color?: string, size?: string, selectedOptions?: Record<string, string>, variantId?: string) => void;
  removeFromCart: (productId: string, color?: string, size?: string, selectedOptions?: Record<string, string>) => void;
  updateCartQuantity: (productId: string, quantity: number, color?: string, size?: string, selectedOptions?: Record<string, string>) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{
    success: boolean;
    error?: string;
    verificationRequired?: boolean;
    email?: string;
  }>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (name: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  uploadAvatar: (file: File) => Promise<{ success: boolean; error?: string }>;
  addToast: (message: string, type: ToastMessage["type"]) => void;
  removeToast: (id: string) => void;
  addAddress: (address: Omit<UserAddress, "id">) => Promise<{ success: boolean; error?: string }>;
  removeAddress: (id: string) => Promise<{ success: boolean; error?: string }>;
  placeOrder: (
    addressId: string,
    paymentMethod: string
  ) => Promise<{ success: boolean; orderId?: string; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const addToast = useCallback((message: string, type: ToastMessage["type"]) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const refreshUser = useCallback(async () => {
    const { data, error } = await authService.getMe();
    if (data?.user) {
      setUser(data.user);
    } else if (error) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("cart");
      const storedWishlist = localStorage.getItem("wishlist");

      if (storedCart) setCart(JSON.parse(storedCart));
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const initAuth = async () => {
      setAuthLoading(true);
      await refreshUser();
      setAuthLoading(false);
    };

    initAuth();
  }, [isLoaded, refreshUser]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, isLoaded]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const optionsMatch = (
    item: CartItem,
    options?: Record<string, string>,
    color?: string,
    size?: string
  ) => {
    if (options && Object.keys(options).length > 0) {
      const itemOpts = item.selectedOptions ?? {};
      return (
        Object.keys(options).length === Object.keys(itemOpts).length &&
        Object.entries(options).every(([k, v]) => itemOpts[k] === v)
      );
    }
    return item.selectedColor === color && item.selectedSize === size;
  };

  const addToCart = (
    product: Product,
    quantity = 1,
    color?: string,
    size?: string,
    selectedOptions?: Record<string, string>,
    variantId?: string
  ) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.product.id === product.id &&
          optionsMatch(item, selectedOptions, color, size)
      );

      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += quantity;
        addToast(`Updated quantity of ${product.name} in cart.`, "success");
        return newCart;
      } else {
        addToast(`Added ${product.name} to cart.`, "success");
        return [
          ...prevCart,
          {
            product,
            quantity,
            selectedColor: color,
            selectedSize: size,
            selectedOptions,
            variantId,
          },
        ];
      }
    });
  };

  const removeFromCart = (
    productId: string,
    color?: string,
    size?: string,
    selectedOptions?: Record<string, string>
  ) => {
    setCart((prevCart) => {
      const item = prevCart.find(
        (i) =>
          i.product.id === productId &&
          optionsMatch(i, selectedOptions, color, size)
      );
      if (item) {
        addToast(`Removed ${item.product.name} from cart.`, "info");
      }
      return prevCart.filter(
        (i) =>
          !(i.product.id === productId && optionsMatch(i, selectedOptions, color, size))
      );
    });
  };

  const updateCartQuantity = (
    productId: string,
    quantity: number,
    color?: string,
    size?: string,
    selectedOptions?: Record<string, string>
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, color, size, selectedOptions);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId && optionsMatch(item, selectedOptions, color, size)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prevWishlist) => {
      if (prevWishlist.includes(productId)) {
        addToast("Removed item from wishlist.", "info");
        return prevWishlist.filter((id) => id !== productId);
      } else {
        addToast("Added item to wishlist.", "success");
        return [...prevWishlist, productId];
      }
    });
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await authService.login(email, password);
    if (data?.user) {
      setUser(data.user);
      addToast("Successfully logged in!", "success");
      return { success: true };
    }
    addToast(error ?? "Login failed.", "danger");
    return { success: false, error };
  };

  const register = async (name: string, email: string, password: string) => {
    const { data, error } = await authService.register(name, email, password);
    if (data?.verificationRequired) {
      addToast("Check your email to verify your account.", "success");
      return {
        success: true,
        verificationRequired: true,
        email: data.email,
      };
    }
    if (data?.user) {
      setUser(data.user);
      addToast("Account created successfully!", "success");
      return { success: true };
    }
    addToast(error ?? "Registration failed.", "danger");
    return { success: false, error };
  };

  const resendVerification = async (email: string) => {
    const { data, error } = await authService.resendVerification(email);
    if (data) {
      addToast(data.message, "success");
      return { success: true };
    }
    addToast(error ?? "Failed to resend verification email.", "danger");
    return { success: false, error };
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    clearCart();
    setWishlist([]);
    addToast("Successfully logged out.", "info");
  };

  const updateProfile = async (name: string, phone: string) => {
    const { data, error } = await authService.updateProfile(name, phone);
    if (data?.user) {
      setUser(data.user);
      addToast("Profile updated successfully!", "success");
      return { success: true };
    }
    addToast(error ?? "Failed to update profile.", "danger");
    return { success: false, error };
  };

  const uploadAvatar = async (file: File) => {
    const { data, error } = await authService.uploadAvatar(file);
    if (data?.user) {
      setUser(data.user);
      addToast("Profile photo updated!", "success");
      return { success: true };
    }
    addToast(error ?? "Failed to upload photo.", "danger");
    return { success: false, error };
  };

  const addAddress = async (address: Omit<UserAddress, "id">) => {
    const { data, error } = await authService.addAddress(address);
    if (data?.user) {
      setUser(data.user);
      addToast("Address added successfully.", "success");
      return { success: true };
    }
    addToast(error ?? "Failed to add address.", "danger");
    return { success: false, error };
  };

  const removeAddress = async (id: string) => {
    const { data, error } = await authService.removeAddress(id);
    if (data?.user) {
      setUser(data.user);
      addToast("Address removed.", "info");
      return { success: true };
    }
    addToast(error ?? "Failed to remove address.", "danger");
    return { success: false, error };
  };

  const placeOrder = async (addressId: string, paymentMethod: string) => {
    if (!user || cart.length === 0) {
      addToast("Your cart is empty or you are not logged in.", "warning");
      return { success: false, error: "Cart is empty or not logged in." };
    }

    const items = cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      variantId: item.variantId,
      selectedOptions: item.selectedOptions,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
    }));

    const { data, error } = await authService.createOrder({
      addressId,
      paymentMethod,
      items,
    });

    if (data?.user && data.order) {
      setUser(data.user);
      clearCart();
      addToast("Order placed successfully!", "success");
      return { success: true, orderId: data.order.id };
    }

    addToast(error ?? "Failed to place order.", "danger");
    return { success: false, error };
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        wishlist,
        user,
        authLoading,
        toasts,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        login,
        register,
        resendVerification,
        logout,
        refreshUser,
        updateProfile,
        uploadAvatar,
        addToast,
        removeToast,
        addAddress,
        removeAddress,
        placeOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
