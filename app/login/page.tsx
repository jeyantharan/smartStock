"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/Logo";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const verified = searchParams.get("verified");
  const { login, resendVerification } = useAuth();

  const isUnverifiedError = error.toLowerCase().includes("verify your email");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      // Full page navigation ensures the auth cookie is sent to middleware
      window.location.href = redirect;
      return;
    } else {
      setError(result.error ?? "Invalid email or password.");
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Enter your email address to resend the verification link.");
      return;
    }
    setIsResending(true);
    await resendVerification(email);
    setIsResending(false);
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-h-screen bg-light py-5 px-3"
      style={{
        backgroundImage: "radial-gradient(circle at 10% 20%, rgba(13, 110, 253, 0.05) 0%, transparent 40%)",
      }}
    >
      <div className="card border-0 shadow-lg p-4 p-sm-5 rounded-4 w-100 bg-white" style={{ maxWidth: "480px" }}>
        <div className="text-center mb-4">
          <div className="d-flex justify-content-center mb-3">
            <Logo size="md" href="/" showName />
          </div>
          <h4 className="fw-bold text-dark mb-1">Welcome Back</h4>
          <p className="text-muted" style={{ fontSize: "0.85rem" }}>
            Login to your account to manage orders and track shipments.
          </p>
        </div>

        {verified === "1" && (
          <div className="alert alert-success py-2 px-3 mb-3" style={{ fontSize: "0.85rem" }}>
            Email verified successfully. You can now log in.
          </div>
        )}

        {error && (
          <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: "0.85rem" }}>
            {error}
            {isUnverifiedError && (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="btn btn-link p-0 ms-1 align-baseline fw-semibold text-danger"
                style={{ fontSize: "0.85rem" }}
              >
                {isResending ? "Sending..." : "Resend verification email"}
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
              Email Address *
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

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label text-muted fw-semibold mb-0" style={{ fontSize: "0.75rem" }}>
                Password *
              </label>
              <Link href="/forgot-password" className="text-primary fw-medium" style={{ fontSize: "0.75rem" }}>
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top border-light">
          <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
            Don&apos;t have an account?{" "}
            <Link href={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-primary fw-bold">
              Sign Up Free
            </Link>
          </p>
        </div>
      </div>
      <style jsx>{`.min-h-screen { min-height: 100vh; }`}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-vh-100 d-flex align-items-center justify-content-center"><div className="spinner-border text-primary" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
