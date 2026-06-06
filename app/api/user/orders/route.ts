import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User, { serializeUser } from "@/models/User";
import Product from "@/models/Product";
import { getAuthPayload } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import {
  applyStockDeductions,
  calculateOrderTotal,
  generateOrderId,
  OrderItemInput,
  resolveOrderLines,
} from "@/lib/order-utils";

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return jsonError("Not authenticated.", 401);
    }

    const body = await request.json();
    const { addressId, paymentMethod, items } = body as {
      addressId?: string;
      paymentMethod?: string;
      items?: OrderItemInput[];
    };

    if (!addressId || !paymentMethod) {
      return jsonError("Address and payment method are required.", 400);
    }

    if (!Array.isArray(items) || items.length === 0) {
      return jsonError("Your cart is empty.", 400);
    }

    await connectDB();

    const user = await User.findById(payload.userId);
    if (!user) {
      return jsonError("User not found.", 404);
    }

    const address = user.addresses.find((addr) => addr._id?.toString() === addressId);
    if (!address) {
      return jsonError("Please select a valid shipping address.", 400);
    }

    const productIds = [...new Set(items.map((item) => item.productId))];
    const productDocs = await Product.find({
      _id: { $in: productIds },
      isPublished: true,
    });

    const productMap = new Map(productDocs.map((p) => [p._id.toString(), p]));

    const { lines, error: resolveError } = resolveOrderLines(items, productMap);
    if (resolveError || lines.length === 0) {
      return jsonError(resolveError ?? "Could not process cart items.", 400);
    }

    applyStockDeductions(productMap, lines);

    const orderTotal = calculateOrderTotal(lines);
    const orderId = generateOrderId();
    const orderDate = new Date().toISOString().split("T")[0];

    const newOrder = {
      id: orderId,
      date: orderDate,
      items: lines.map(({ productId, name, price, quantity, image }) => ({
        productId,
        name,
        price,
        quantity,
        image,
      })),
      total: orderTotal,
      status: "Processing" as const,
      shippingAddress: {
        title: address.title,
        fullName: address.fullName,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.phone,
      },
      paymentMethod,
    };

    user.orders.unshift(newOrder);
    await user.save();
    await Promise.all([...productMap.values()].map((product) => product.save()));

    const serialized = serializeUser(user);
    const savedOrder = serialized.orders[0];

    return jsonSuccess({ user: serialized, order: savedOrder }, 201);
  } catch (error) {
    console.error("Create order error:", error);
    return jsonError("Failed to place order.", 500);
  }
}
