"use client";

import React, { useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { adminNavItems } from "@/components/admin/adminNav";

function getPageTitle(pathname: string): string {
  const match = adminNavItems.find((item) =>
    item.href === "/admin/dashboard" ? pathname === item.href : pathname.startsWith(item.href)
  );
  return match?.label ?? "Admin Dashboard";
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, authLoading, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  if (authLoading) {
    return (
      <div className="admin-standalone min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="text-muted mb-0">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="admin-standalone min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 w-100" style={{ maxWidth: "480px" }}>
          <div className="text-center mb-4">
            <div
              className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{ width: "56px", height: "56px" }}
            >
              <i className="bi bi-shield-x fs-4"></i>
            </div>
            <h4 className="fw-bold">Access Denied</h4>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              You do not have permission to access the admin panel.
            </p>
          </div>
          <Link href="/" className="btn btn-primary w-100 rounded-pill fw-semibold">
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-standalone min-vh-100 bg-light d-flex">
      {sidebarOpen && (
        <div
          className="admin-overlay d-lg-none"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <AdminSidebar
        userName={user.name}
        userEmail={user.email}
        mobileOpen={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />

      <div className="admin-main flex-grow-1 d-flex flex-column min-vh-100 min-w-0">
        <AdminTopBar
          title={getPageTitle(pathname)}
          onMenuToggle={() => setSidebarOpen((open) => !open)}
          onLogout={handleLogout}
        />
        <main className="admin-content p-3 p-lg-4 flex-grow-1">{children}</main>
      </div>

      <style jsx global>{`
        .admin-standalone {
          font-family: var(--body-font, system-ui, sans-serif);
        }
        .admin-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 1035;
        }
        @media (max-width: 991.98px) {
          .admin-sidebar.show {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </div>
  );
}
