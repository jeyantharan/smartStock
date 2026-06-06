import { useApp } from "@/context/AppContext";

export function useToast() {
  const { toasts, addToast, removeToast } = useApp();

  return {
    toasts,
    toastSuccess: (message: string) => addToast(message, "success"),
    toastInfo: (message: string) => addToast(message, "info"),
    toastWarning: (message: string) => addToast(message, "warning"),
    toastDanger: (message: string) => addToast(message, "danger"),
    removeToast
  };
}
