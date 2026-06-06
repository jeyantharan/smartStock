"use client";

interface AdminTopBarProps {
  title?: string;
  onMenuToggle: () => void;
  onLogout: () => void;
}

export default function AdminTopBar({ title = "Admin Dashboard", onMenuToggle, onLogout }: AdminTopBarProps) {
  return (
    <header className="admin-topbar bg-white border-bottom px-3 px-lg-4 py-3 d-flex align-items-center justify-content-between sticky-top">
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className="btn btn-light d-lg-none p-2 rounded-3 border"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <i className="bi bi-list fs-5"></i>
        </button>
        <h1 className="h5 fw-bold mb-0 text-dark">{title}</h1>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold d-flex align-items-center gap-2"
      >
        <i className="bi bi-box-arrow-right"></i>
        <span className="d-none d-sm-inline">Logout</span>
      </button>
      <style jsx>{`
        .admin-topbar {
          top: 0;
          z-index: 1030;
        }
      `}</style>
    </header>
  );
}
