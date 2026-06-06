"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminNavItems } from "@/components/admin/adminNav";
import { formatCurrency } from "@/utils/format";

interface DashboardStats {
  productCount: number;
  publishedProductCount: number;
  pendingOrders: number;
  totalOrders: number;
  userCount: number;
  revenueToday: number;
  revenueAllTime: number;
  recentOrders: {
    id: string;
    date: string;
    total: number;
    status: string;
    customerName: string;
  }[];
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "Processing":
      return "bg-warning-subtle text-warning-emphasis";
    case "Shipped":
      return "bg-info-subtle text-info-emphasis";
    case "Delivered":
      return "bg-success-subtle text-success-emphasis";
    case "Cancelled":
      return "bg-danger-subtle text-danger-emphasis";
    default:
      return "bg-secondary-subtle text-secondary";
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/dashboard", { credentials: "include" });
        const result = await response.json();
        if (!response.ok || !result.success) {
          setError(result.message ?? "Failed to load dashboard.");
          return;
        }
        setStats(result.data);
      } catch {
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = stats
    ? [
        {
          label: "Total Products",
          value: stats.productCount,
          sub: `${stats.publishedProductCount} published`,
          icon: "bi-box-seam",
          color: "primary",
        },
        {
          label: "Pending Orders",
          value: stats.pendingOrders,
          sub: `${stats.totalOrders} total orders`,
          icon: "bi-receipt",
          color: "warning",
        },
        {
          label: "Registered Users",
          value: stats.userCount,
          sub: "All accounts",
          icon: "bi-people",
          color: "success",
        },
        {
          label: "Revenue (Today)",
          value: formatCurrency(stats.revenueToday),
          sub: `${formatCurrency(stats.revenueAllTime)} all time`,
          icon: "bi-currency-dollar",
          color: "info",
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="card border-0 shadow-sm p-5 rounded-4 bg-white text-center">
        <div className="spinner-border text-primary" />
        <p className="text-muted small mt-3 mb-0">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="card border-0 shadow-sm p-5 rounded-4 bg-white">
        <p className="text-danger mb-0">{error || "Failed to load dashboard."}</p>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white h-100">
      <h4 className="fw-bold mb-2">Dashboard Overview</h4>
      <p className="text-muted mb-4 pb-2 border-bottom" style={{ fontSize: "0.85rem" }}>
        Live store metrics from your database.
      </p>

      <div className="row g-3 mb-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="col-sm-6 col-xl-3">
            <div className="card border rounded-4 p-3 h-100">
              <div className="d-flex align-items-center gap-3">
                <div
                  className={`bg-${stat.color} bg-opacity-10 text-${stat.color} rounded-3 d-flex align-items-center justify-content-center`}
                  style={{ width: "44px", height: "44px", minWidth: "44px" }}
                >
                  <i className={`bi ${stat.icon} fs-5`}></i>
                </div>
                <div>
                  <p className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                    {stat.label}
                  </p>
                  <h5 className="fw-bold mb-0">{stat.value}</h5>
                  <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                    {stat.sub}
                  </small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats.recentOrders.length > 0 && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Recent Orders</h5>
            <Link href="/admin/orders" className="btn btn-sm btn-outline-primary rounded-pill px-3">
              View All
            </Link>
          </div>
          <div className="table-responsive mb-4">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr style={{ fontSize: "0.8rem" }}>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} style={{ fontSize: "0.85rem" }}>
                    <td className="fw-semibold">{order.id}</td>
                    <td>{order.customerName}</td>
                    <td>{order.date}</td>
                    <td className="fw-semibold">{formatCurrency(order.total)}</td>
                    <td>
                      <span className={`badge ${statusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h5 className="fw-bold mb-3">Quick Access</h5>
      <div className="row g-3">
        {adminNavItems
          .filter((item) => item.href !== "/admin/dashboard")
          .map((item) => (
            <div key={item.href} className="col-md-6">
              <Link
                href={item.href}
                className="card border rounded-4 p-3 h-100 text-decoration-none text-dark hover-shadow transition-base d-block"
              >
                <div className="d-flex align-items-start gap-3">
                  <div
                    className="bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center"
                    style={{ width: "40px", height: "40px", minWidth: "40px" }}
                  >
                    <i className={`bi ${item.icon}`}></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">{item.label}</h6>
                    <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
}
