import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/admin-auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";

function todayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    await connectDB();

    const today = todayDateString();

    const [productCount, publishedProductCount, userCount, usersWithOrders] =
      await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ isPublished: true }),
        User.countDocuments(),
        User.find({ "orders.0": { $exists: true } })
          .select("name email orders")
          .lean(),
      ]);

    const allOrders = usersWithOrders.flatMap((user) =>
      (user.orders ?? []).map((order) => ({
        id: order.id,
        date: order.date,
        total: order.total,
        status: order.status,
        paymentMethod: order.paymentMethod,
        itemCount: order.items?.length ?? 0,
        customerName: user.name,
        customerEmail: user.email,
      }))
    );

    const activeOrders = allOrders.filter((o) => o.status !== "Cancelled");
    const pendingOrders = allOrders.filter((o) => o.status === "Processing").length;
    const totalOrders = allOrders.length;

    const revenueToday = activeOrders
      .filter((o) => o.date === today)
      .reduce((sum, o) => sum + o.total, 0);

    const revenueAllTime = activeOrders.reduce((sum, o) => sum + o.total, 0);

    const recentOrders = [...allOrders]
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
      .slice(0, 5);

    return jsonSuccess({
      productCount,
      publishedProductCount,
      pendingOrders,
      totalOrders,
      userCount,
      revenueToday,
      revenueAllTime,
      recentOrders,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return jsonError("Failed to load dashboard stats.", 500);
  }
}
