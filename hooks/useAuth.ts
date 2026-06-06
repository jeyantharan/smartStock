import { useApp } from "@/context/AppContext";

export function useAuth() {
  const {
    user,
    authLoading,
    login,
    register,
    resendVerification,
    logout,
    refreshUser,
    updateProfile,
    uploadAvatar,
    addAddress,
    removeAddress,
    placeOrder,
  } = useApp();

  return {
    user,
    authLoading,
    isAuthenticated: !!user,
    login,
    register,
    resendVerification,
    logout,
    refreshUser,
    updateProfile,
    uploadAvatar,
    addAddress,
    removeAddress,
    placeOrder,
  };
}
