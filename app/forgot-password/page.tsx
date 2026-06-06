"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import Logo from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { toastSuccess, toastWarning } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toastWarning("Please fill in your email address.");
      return;
    }
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      toastSuccess(`Password reset instructions dispatched to ${email}`);
    }, 1200);
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-h-screen bg-light py-5 px-3"
      style={{
        backgroundImage: "radial-gradient(circle at 50% 50%, rgba(13, 110, 253, 0.03) 0%, transparent 50%)",
      }}
    >
      <div className="card border-0 shadow-lg p-4 p-sm-5 rounded-4 w-100 bg-white" style={{ maxWidth: "480px" }}>
        {/* Brand/Logo */}
        <div className="text-center mb-4">
          <div className="d-flex justify-content-center mb-3">
            <Logo size="md" href="/" showName />
          </div>
          <h4 className="fw-bold text-dark mb-1">Reset Password</h4>
          <p className="text-muted" style={{ fontSize: "0.85rem" }}>
            Enter your email to receive recovery instructions.
          </p>
        </div>

        {isSent ? (
          /* Success Alert Box */
          <div className="text-center">
            <div className="alert alert-success border-0 p-3 mb-4 rounded-3 text-start" style={{ fontSize: "0.85rem" }}>
              <i className="bi bi-envelope-check-fill me-2 fs-5"></i>
              Check your inbox! We have dispatched instructions to **{email}**. Please follow the secure link in the email to define a new password.
            </div>
            <button
              onClick={() => {
                setIsSent(false);
                setEmail("");
              }}
              className="btn btn-outline-primary rounded-pill px-4 py-2.5 w-100 fw-semibold"
            >
              Request Another Link
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
                Account Email Address *
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-100 py-3 rounded-pill fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Processing Request...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        )}

        {/* Footer actions */}
        <div className="text-center mt-4 pt-3 border-top border-light">
          <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
            Remembered details?{" "}
            <Link href="/login" className="text-primary fw-bold">
              Log In
            </Link>
          </p>
        </div>
      </div>
      <style jsx>{`
        .min-h-screen {
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
}
