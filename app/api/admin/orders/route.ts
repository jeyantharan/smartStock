import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/admin-auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";

function serializeShippingAddress(addr: {
  title: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}) {
  return {
    title: addr.title,
    fullName: addr.fullName,
    addressLine1: addr.addressLine1,
    addressLine2: addr.addressLine2 ?? "",
    city: addr.city,
    state: addr.state,
    zipCode: addr.zipCode,
    country: addr.country,
    phone: addr.phone,
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    await connectDB();

    const users = await User.find({ "orders.0": { $exists: true } })
      .select("name email orders")
      .lean();

    const orders = users
      .flatMap((user) =>
        (user.orders ?? []).map((order) => ({
          id: order.id,
          date: order.date,
          total: order.total,
          status: order.status,
          paymentMethod: order.paymentMethod,
          items: order.items ?? [],
          shippingAddress: serializeShippingAddress(order.shippingAddress),
          customerName: user.name,
          customerEmail: user.email,
        }))
      )
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

    const pendingCount = orders.filter((o) => o.status === "Processing").length;

    return jsonSuccess({ orders, pendingCount });
  } catch (error) {
    console.error("Admin orders error:", error);
    return jsonError("Failed to fetch orders.", 500);
  }
}
