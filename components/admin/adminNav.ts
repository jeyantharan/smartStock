export const adminNavItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: "bi-speedometer2",
    description: "Overview and store statistics",
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: "bi-box-seam",
    description: "Manage catalog, pricing, and inventory",
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: "bi-diagram-3",
    description: "Multi-level product categories for the store sidebar",
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: "bi-receipt",
    description: "Review and update order status",
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: "bi-people",
    description: "View registered customers and roles",
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: "bi-gear",
    description: "Configure store and platform settings",
  },
] as const;
