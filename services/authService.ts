import type { UserProfile } from "@/context/AppContext";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  const result: ApiResponse<T> = await response.json();

  if (!response.ok || !result.success) {
    return { error: result.message ?? "Something went wrong." };
  }

  return { data: result.data };
}

export const authService = {
  async register(name: string, email: string, password: string) {
    return apiFetch<{
      user?: UserProfile;
      message?: string;
      email?: string;
      verificationRequired?: boolean;
    }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  async login(email: string, password: string) {
    return apiFetch<{ user: UserProfile }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async logout() {
    return apiFetch<{ message: string }>("/api/auth/logout", {
      method: "POST",
    });
  },

  async getMe() {
    return apiFetch<{ user: UserProfile }>("/api/auth/me");
  },

  async verifyEmail(token: string) {
    return apiFetch<{ message: string; verified: boolean }>(
      `/api/auth/verify-email?token=${encodeURIComponent(token)}`
    );
  },

  async resendVerification(email: string) {
    return apiFetch<{ message: string }>("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async updateProfile(name: string, phone: string) {
    return apiFetch<{ user: UserProfile }>("/api/user/profile", {
      method: "PUT",
      body: JSON.stringify({ name, phone }),
    });
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiFetch<{ user: UserProfile }>("/api/user/avatar", {
      method: "POST",
      body: formData,
    });
  },

  async addAddress(address: Omit<UserProfile["addresses"][0], "id">) {
    return apiFetch<{ user: UserProfile }>("/api/user/addresses", {
      method: "POST",
      body: JSON.stringify(address),
    });
  },

  async removeAddress(id: string) {
    return apiFetch<{ user: UserProfile }>(`/api/user/addresses/${id}`, {
      method: "DELETE",
    });
  },

  async createOrder(payload: {
    addressId: string;
    paymentMethod: string;
    items: {
      productId: string;
      quantity: number;
      variantId?: string;
      selectedOptions?: Record<string, string>;
      selectedColor?: string;
      selectedSize?: string;
    }[];
  }) {
    return apiFetch<{ user: UserProfile; order: UserProfile["orders"][0] }>(
      "/api/user/orders",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },
};
