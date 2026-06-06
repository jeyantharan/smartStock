"use client";

export default function AdminSettingsPage() {
  return (
    <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white h-100">
      <h4 className="fw-bold mb-2">Settings</h4>
      <p className="text-muted mb-4 pb-2 border-bottom" style={{ fontSize: "0.85rem" }}>
        Configure store details and platform preferences.
      </p>

      <form>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
              Store Name
            </label>
            <input type="text" className="form-control" defaultValue="Smart Stock" disabled />
          </div>
          <div className="col-md-6">
            <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
              Support Email
            </label>
            <input type="email" className="form-control" placeholder="support@smartstock.com" disabled />
          </div>
          <div className="col-12">
            <label className="form-label text-muted fw-semibold" style={{ fontSize: "0.75rem" }}>
              Store Description
            </label>
            <textarea
              className="form-control"
              rows={3}
              defaultValue="Premium online marketplace for electronics, fashion, and more."
              disabled
            />
          </div>
        </div>
        <p className="text-muted mt-4 mb-0" style={{ fontSize: "0.8rem" }}>
          Store settings management coming soon.
        </p>
      </form>
    </div>
  );
}
