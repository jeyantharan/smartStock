"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authService } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    const verify = async () => {
      const { data, error } = await authService.verifyEmail(token);
      if (data?.verified) {
        setStatus("success");
        setMessage(data.message);
        await refreshUser();
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        setStatus("error");
        setMessage(error ?? "Verification failed.");
      }
    };

    verify();
  }, [token, refreshUser]);

  return (
    <div
      className="d-flex align-items-center justify-content-center min-h-screen bg-light py-5 px-3"
      style={{
        backgroundImage: "radial-gradient(circle at 50% 20%, rgba(13, 110, 253, 0.05) 0%, transparent 40%)",
      }}
    >
      <div className="card border-0 shadow-lg p-4 p-sm-5 rounded-4 w-100 bg-white text-center" style={{ maxWidth: "480px" }}>
        {status === "loading" && (
          <>
            <div className="spinner-border text-primary mx-auto mb-4" role="status" />
            <h4 className="fw-bold text-dark mb-2">Verifying Email...</h4>
            <p className="text-muted mb-0">Please wait while we confirm your account.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div
              className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
              style={{ width: "72px", height: "72px" }}
            >
              <i className="bi bi-check-circle-fill fs-1"></i>
            </div>
            <h4 className="fw-bold text-dark mb-2">Email Verified!</h4>
            <p className="text-muted mb-4">{message}</p>
            <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
              Redirecting to home...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div
              className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
              style={{ width: "72px", height: "72px" }}
            >
              <i className="bi bi-x-circle-fill fs-1"></i>
            </div>
            <h4 className="fw-bold text-dark mb-2">Verification Failed</h4>
            <p className="text-muted mb-4">{message}</p>
            <Link href="/login" className="btn btn-primary rounded-pill px-4 py-2 fw-semibold">
              Go to Login
            </Link>
          </>
        )}
      </div>
      <style jsx>{`.min-h-screen { min-height: 100vh; }`}</style>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-vh-100 d-flex align-items-center justify-content-center"><div className="spinner-border text-primary" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
