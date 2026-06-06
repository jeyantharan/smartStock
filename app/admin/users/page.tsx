"use client";

import { useEffect, useState } from "react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch("/api/admin/users", { credentials: "include" });
      const result = await response.json();
      if (result.success) {
        setUsers(result.data.users);
      } else {
        setError(result.message ?? "Failed to load users.");
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  return (
    <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white h-100">
      <h4 className="fw-bold mb-2">Users</h4>
      <p className="text-muted mb-4 pb-2 border-bottom" style={{ fontSize: "0.85rem" }}>
        View all registered customers and their account roles.
      </p>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-2 px-3" style={{ fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr style={{ fontSize: "0.8rem" }}>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="fw-semibold" style={{ fontSize: "0.875rem" }}>
                    {u.name}
                  </td>
                  <td className="text-muted" style={{ fontSize: "0.85rem" }}>
                    {u.email}
                  </td>
                  <td>
                    <span className={`badge ${u.role === "admin" ? "bg-primary" : "bg-secondary"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.emailVerified ? "bg-success" : "bg-warning text-dark"}`}>
                      {u.emailVerified ? "Yes" : "Pending"}
                    </span>
                  </td>
                  <td className="text-muted" style={{ fontSize: "0.85rem" }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
