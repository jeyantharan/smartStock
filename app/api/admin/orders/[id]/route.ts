import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/admin-auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";

const ORDER_STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { id: orderId } = await params;
    const body = await request.json();
    const { status } = body as { status?: string };

    if (!status || !ORDER_STATUSES.includes(status as OrderStatus)) {
      return jsonError("Invalid order status.", 400);
    }

    await connectDB();

    const user = await User.findOne({ "orders.id": orderId });
    if (!user) {
      return jsonError("Order not found.", 404);
    }

    const order = user.orders.find((o) => o.id === orderId);
    if (!order) {
      return jsonError("Order not found.", 404);
    }

    order.status = status as OrderStatus;
    await user.save();

    return jsonSuccess({
      order: {
        id: order.id,
        date: order.date,
        total: order.total,
        status: order.status,
        paymentMethod: order.paymentMethod,
        items: order.items,
        shippingAddress: serializeShippingAddress(order.shippingAddress),
        customerName: user.name,
        customerEmail: user.email,
      },
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return jsonError("Failed to update order status.", 500);
  }
}
