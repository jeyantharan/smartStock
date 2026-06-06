"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/Logo";

function RegisterForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const { register, resendVerification } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError("Please agree to the Terms of Service.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    const result = await register(name, email, password);
    setIsSubmitting(false);

    if (result.success && result.verificationRequired) {
      setRegisteredEmail(result.email ?? email);
    } else if (!result.success) {
      setError(result.error ?? "Registration failed.");
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) return;
    setIsResending(true);
    await resendVerification(registeredEmail);
    setIsResending(false);
  };

  if (registeredEmail) {
    return (
      <div
        className="d-flex align-items-center justify-content-center min-h-screen bg-light py-5 px-3"
        style={{
          backgroundImage: "radial-gradient(circle at 90% 10%, rgba(13, 110, 253, 0.05) 0%, transparent 40%)",
        }}
      >
        <div className="card border-0 shadow-lg p-4 p-sm-5 rounded-4 w-100 bg-white text-center" style={{ maxWidth: "480px" }}>
          <div
            className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
            style={{ width: "72px", height: "72px" }}
          >
            <i className="bi bi-envelope-check-fill fs-1"></i>
          </div>
          <h4 className="fw-bold text-dark mb-2">Check Your Email</h4>
          <p className="text-muted mb-1" style={{ fontSize: "0.9rem" }}>
            We sent a verification link to
          </p>
          <p className="fw-semibold text-primary mb-3">{registeredEmail}</p>
          <p className="text-muted mb-4" style={{ fontSize: "0.85rem" }}>
            Click the link in the email to verify your account. The link expires in 24 hours.
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold mb-3"
          >
            {isResending ? "Sending..." : "Resend Verification Email"}
          </button>
          <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
            Already verified?{" "}
            <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-primary fw-bold">
              Log In
            </Link>
          </p>
        </div>
        <style jsx>{`.min-h-screen { min-height: 100vh; }`}</style>
      </div>
    );
  }

  return (
    <div
      className="d-flex align-items-center justify-content-center min-h-screen bg-light py-5 px-3"
      style={{
        backgroundImage: "radial-gradient(circle at 90% 10%, rgba(13, 110, 253, 0.05) 0%, transparent 40%)",
      }}
    >
      <div className="card border-0 shadow-lg p-4 p-sm-5 rounded-4 w-100 bg-white" style={{ maxWidth: "480px" }}>
        <div className="text-center mb-4">
          <div className="d-flex justify-content-center mb-3">
            <Logo size="md" href="/" showName />
          </div>
          <h4 className="fw-bold text-dark mb-1">Create Account</h4>
          <p className="text-muted" style={{ fontSize: "0.85rem" }}>
            Join thousands of shoppers and access exclusive member deals.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
              Full Name *
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Jane Doe"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
            <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
              Password *
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="At least 8 characters"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-check mb-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
            />
            <label className="form-check-label text-secondary" htmlFor="agreeTerms" style={{ fontSize: "0.8rem" }}>
              I agree to the <a href="#" className="text-primary fw-medium">Terms of Service</a> &amp; <a href="#" className="text-primary fw-medium">Privacy Policy</a>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-100 py-3 rounded-pill fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Creating Profile...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top border-light">
          <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
            Already have an account?{" "}
            <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-primary fw-bold">
              Log In
            </Link>
          </p>
        </div>
      </div>
      <style jsx>{`.min-h-screen { min-height: 100vh; }`}</style>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-vh-100 d-flex align-items-center justify-content-center"><div className="spinner-border text-primary" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
