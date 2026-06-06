"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import EmptyState from "@/components/EmptyState";
import { formatCurrency } from "@/utils/format";

const ORDER_STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"] as const;

type SortOption = "newest" | "oldest" | "total-high" | "total-low";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShippingAddress {
  title: string;
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface AdminOrder {
  id: string;
  date: string;
  total: number;
  status: string;
  paymentMethod: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  customerName: string;
  customerEmail: string;
}

const EMPTY_FILTERS = {
  search: "",
  status: "all",
  dateFrom: "",
  dateTo: "",
  paymentMethod: "all",
  sortBy: "newest" as SortOption,
};

function statusBadgeClass(status: string): string {
  switch (status) {
    case "Processing":
      return "bg-warning-subtle text-warning-emphasis border-warning-subtle";
    case "Shipped":
      return "bg-info-subtle text-info-emphasis border-info-subtle";
    case "Delivered":
      return "bg-success-subtle text-success-emphasis border-success-subtle";
    case "Cancelled":
      return "bg-danger-subtle text-danger-emphasis border-danger-subtle";
    default:
      return "bg-secondary-subtle text-secondary border-secondary-subtle";
  }
}

function formatAddress(addr: ShippingAddress): string {
  const lines = [
    addr.addressLine1,
    addr.addressLine2,
    [addr.city, addr.state, addr.zipCode].filter(Boolean).join(", "),
    addr.country,
  ].filter(Boolean);
  return lines.join("\n");
}

function filterAndSortOrders(orders: AdminOrder[], filters: typeof EMPTY_FILTERS): AdminOrder[] {
  const q = filters.search.trim().toLowerCase();

  let result = orders.filter((order) => {
    if (filters.status !== "all" && order.status !== filters.status) return false;
    if (filters.paymentMethod !== "all" && order.paymentMethod !== filters.paymentMethod) {
      return false;
    }
    if (filters.dateFrom && order.date < filters.dateFrom) return false;
    if (filters.dateTo && order.date > filters.dateTo) return false;

    if (q) {
      const haystack = [
        order.id,
        order.customerName,
        order.customerEmail,
        order.paymentMethod,
        order.shippingAddress.fullName,
        order.shippingAddress.phone,
        order.shippingAddress.city,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  result = [...result].sort((a, b) => {
    switch (filters.sortBy) {
      case "oldest":
        return a.date.localeCompare(b.date) || a.id.localeCompare(b.id);
      case "total-high":
        return b.total - a.total || b.date.localeCompare(a.date);
      case "total-low":
        return a.total - b.total || b.date.localeCompare(a.date);
      case "newest":
      default:
        return b.date.localeCompare(a.date) || b.id.localeCompare(a.id);
    }
  });

  return result;
}

function hasActiveFilters(filters: typeof EMPTY_FILTERS): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "" ||
    filters.paymentMethod !== "all" ||
    filters.sortBy !== "newest"
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/orders", { credentials: "include" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.message ?? "Failed to load orders.");
        return;
      }
      setOrders(result.data.orders ?? []);
      setError("");
    } catch {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const paymentMethods = useMemo(() => {
    const methods = new Set(orders.map((o) => o.paymentMethod).filter(Boolean));
    return Array.from(methods).sort();
  }, [orders]);

  const filteredOrders = useMemo(
    () => filterAndSortOrders(orders, filters),
    [orders, filters]
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    for (const status of ORDER_STATUSES) {
      counts[status] = orders.filter((o) => o.status === status).length;
    }
    return counts;
  }, [orders]);

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.message ?? "Failed to update status.");
        return;
      }
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: result.data.order.status } : order
        )
      );
      setError("");
    } catch {
      setError("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleExpanded = (orderId: string) => {
    setExpandedId((prev) => (prev === orderId ? null : orderId));
  };

  const updateFilter = <K extends keyof typeof EMPTY_FILTERS>(
    key: K,
    value: (typeof EMPTY_FILTERS)[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  if (loading) {
    return (
      <div className="card border-0 shadow-sm p-5 rounded-4 bg-white text-center">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (orders.length === 0 && !error) {
    return (
      <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white h-100">
        <h4 className="fw-bold mb-2">Orders</h4>
        <p className="text-muted mb-4 pb-2 border-bottom" style={{ fontSize: "0.85rem" }}>
          Review customer orders and update fulfillment status.
        </p>
        <EmptyState
          title="No Orders Yet"
          description="When customers place orders, they will appear here for you to manage and track."
          icon="bi-receipt"
          actionText="View Store"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white h-100">
      <h4 className="fw-bold mb-2">Orders</h4>
      <p className="text-muted mb-3 pb-2 border-bottom" style={{ fontSize: "0.85rem" }}>
        {filteredOrders.length} of {orders.length} order{orders.length === 1 ? "" : "s"} shown
        {hasActiveFilters(filters) ? " (filtered)" : ""} — expand a row for shipping and items.
      </p>

      {error && (
        <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-light rounded-4 p-3 p-md-4 mb-4 border">
        <div className="row g-3 align-items-end">
          <div className="col-lg-4">
            <label className="form-label text-muted fw-semibold mb-1" style={{ fontSize: "0.75rem" }}>
              Search
            </label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Order ID, customer, email, city..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-lg-2">
            <label className="form-label text-muted fw-semibold mb-1" style={{ fontSize: "0.75rem" }}>
              Status
            </label>
            <select
              className="form-select form-select-sm"
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
            >
              <option value="all">All ({statusCounts.all})</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s} ({statusCounts[s] ?? 0})
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-lg-2">
            <label className="form-label text-muted fw-semibold mb-1" style={{ fontSize: "0.75rem" }}>
              Payment
            </label>
            <select
              className="form-select form-select-sm"
              value={filters.paymentMethod}
              onChange={(e) => updateFilter("paymentMethod", e.target.value)}
            >
              <option value="all">All methods</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-lg-2">
            <label className="form-label text-muted fw-semibold mb-1" style={{ fontSize: "0.75rem" }}>
              Sort by
            </label>
            <select
              className="form-select form-select-sm"
              value={filters.sortBy}
              onChange={(e) => updateFilter("sortBy", e.target.value as SortOption)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="total-high">Highest total</option>
              <option value="total-low">Lowest total</option>
            </select>
          </div>

          <div className="col-6 col-lg-2">
            {hasActiveFilters(filters) && (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm w-100 rounded-pill"
                onClick={clearFilters}
              >
                <i className="bi bi-x-lg me-1"></i> Clear
              </button>
            )}
          </div>

          <div className="col-6 col-md-4 col-lg-3">
            <label className="form-label text-muted fw-semibold mb-1" style={{ fontSize: "0.75rem" }}>
              From date
            </label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={filters.dateFrom}
              onChange={(e) => updateFilter("dateFrom", e.target.value)}
            />
          </div>

          <div className="col-6 col-md-4 col-lg-3">
            <label className="form-label text-muted fw-semibold mb-1" style={{ fontSize: "0.75rem" }}>
              To date
            </label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={filters.dateTo}
              min={filters.dateFrom || undefined}
              onChange={(e) => updateFilter("dateTo", e.target.value)}
            />
          </div>

          <div className="col-12 col-md-4 col-lg-6 d-flex flex-wrap gap-2 align-items-center">
            <span className="text-muted" style={{ fontSize: "0.75rem" }}>
              Quick:
            </span>
            {ORDER_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                className={`btn btn-sm rounded-pill ${
                  filters.status === s ? "btn-primary" : "btn-outline-secondary"
                }`}
                style={{ fontSize: "0.75rem" }}
                onClick={() =>
                  updateFilter("status", filters.status === s ? "all" : s)
                }
              >
                {s} ({statusCounts[s] ?? 0})
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-funnel text-muted d-block mb-3" style={{ fontSize: "2.5rem" }}></i>
          <h5 className="fw-bold mb-2">No Matching Orders</h5>
          <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
            Try changing your search or filter settings.
          </p>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm rounded-pill px-4"
            onClick={clearFilters}
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr style={{ fontSize: "0.8rem" }}>
                <th style={{ width: "36px" }}></th>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const isExpanded = expandedId === order.id;
                const addr = order.shippingAddress;

                return (
                  <Fragment key={order.id}>
                    <tr style={{ fontSize: "0.85rem" }}>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-light border-0 p-1"
                          onClick={() => toggleExpanded(order.id)}
                          aria-expanded={isExpanded}
                          title={isExpanded ? "Hide details" : "Show details"}
                        >
                          <i className={`bi bi-chevron-${isExpanded ? "down" : "right"}`}></i>
                        </button>
                      </td>
                      <td className="fw-semibold">{order.id}</td>
                      <td>
                        <div className="fw-semibold">{order.customerName}</div>
                        <small className="text-muted">{order.customerEmail}</small>
                      </td>
                      <td>{order.date}</td>
                      <td className="fw-semibold">{formatCurrency(order.total)}</td>
                      <td>{order.paymentMethod}</td>
                      <td style={{ minWidth: "160px" }}>
                        <select
                          className={`form-select form-select-sm border ${statusBadgeClass(order.status)}`}
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          style={{ fontSize: "0.8rem", fontWeight: 600 }}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-light">
                        <td colSpan={7} className="p-0 border-0">
                          <div className="p-4 border-top">
                            <div className="row g-4">
                              <div className="col-md-5">
                                <h6 className="fw-bold mb-3">
                                  <i className="bi bi-geo-alt me-2 text-primary"></i>
                                  Shipping Details
                                </h6>
                                <div
                                  className="bg-white rounded-3 p-3 border"
                                  style={{ fontSize: "0.85rem" }}
                                >
                                  <div className="mb-2">
                                    <span className="badge bg-primary-subtle text-primary me-2">
                                      {addr.title}
                                    </span>
                                    <span className="fw-semibold">{addr.fullName}</span>
                                  </div>
                                  <p className="text-muted mb-2" style={{ whiteSpace: "pre-line" }}>
                                    {formatAddress(addr)}
                                  </p>
                                  <div className="d-flex align-items-center gap-2 text-dark">
                                    <i className="bi bi-telephone text-muted"></i>
                                    <span>{addr.phone}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="col-md-7">
                                <h6 className="fw-bold mb-3">
                                  <i className="bi bi-box-seam me-2 text-primary"></i>
                                  Order Items ({order.items.length})
                                </h6>
                                <div className="d-flex flex-column gap-2">
                                  {order.items.map((item) => (
                                    <div
                                      key={`${order.id}-${item.productId}-${item.name}`}
                                      className="d-flex align-items-center gap-3 bg-white rounded-3 p-2 border"
                                    >
                                      <div
                                        className="rounded overflow-hidden bg-light flex-shrink-0"
                                        style={{ width: 48, height: 48 }}
                                      >
                                        {item.image ? (
                                          <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-100 h-100 object-fit-cover"
                                          />
                                        ) : (
                                          <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                                            <i className="bi bi-image"></i>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-grow-1 min-w-0">
                                        <div
                                          className="fw-semibold text-truncate"
                                          style={{ fontSize: "0.85rem" }}
                                        >
                                          {item.name}
                                        </div>
                                        <small className="text-muted">
                                          Qty: {item.quantity} × {formatCurrency(item.price)}
                                        </small>
                                      </div>
                                      <div
                                        className="fw-semibold text-nowrap"
                                        style={{ fontSize: "0.85rem" }}
                                      >
                                        {formatCurrency(item.price * item.quantity)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
