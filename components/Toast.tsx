"use client";

import React, { useEffect } from "react";
import { useToast } from "@/hooks/useToast";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="position-fixed bottom-0 end-0 p-3"
      style={{ zIndex: 9999, maxWidth: "350px" }}
    >
      <div className="d-flex flex-column gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </div>
  );
}

function ToastItem({
  toast,
  onClose,
}: {
  toast: { id: string; message: string; type: "success" | "info" | "warning" | "danger" };
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // auto-close after 4 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return "bi-check-circle-fill text-success";
      case "info":
        return "bi-info-circle-fill text-info";
      case "warning":
        return "bi-exclamation-triangle-fill text-warning";
      case "danger":
        return "bi-exclamation-octagon-fill text-danger";
      default:
        return "bi-bell-fill";
    }
  };

  return (
    <div
      className={`toast show border-0 shadow-lg bg-white`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{ borderRadius: "10px" }}
    >
      <div className="d-flex p-3 align-items-center">
        <i className={`bi ${getIcon()} fs-5 me-3`}></i>
        <div className="toast-body p-0 me-auto text-dark fw-medium" style={{ fontSize: "0.9rem" }}>
          {toast.message}
        </div>
        <button
          type="button"
          className="btn-close ms-2"
          onClick={onClose}
          aria-label="Close"
        ></button>
      </div>
    </div>
  );
}
