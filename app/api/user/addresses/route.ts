import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User, { serializeUser } from "@/models/User";
import { getAuthPayload } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return jsonError("Not authenticated.", 401);
    }

    const body = await request.json();
    const { title, fullName, addressLine1, addressLine2, city, state, zipCode, country, phone } =
      body;

    if (!title || !fullName || !addressLine1 || !city || !state || !zipCode || !phone) {
      return jsonError("Please fill in all required address fields.", 400);
    }

    await connectDB();
    const user = await User.findById(payload.userId);
    if (!user) {
      return jsonError("User not found.", 404);
    }

    user.addresses.push({
      title,
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country: country || "United States",
      phone,
    });

    await user.save();
    return jsonSuccess({ user: serializeUser(user) }, 201);
  } catch (error) {
    console.error("Add address error:", error);
    return jsonError("Failed to add address.", 500);
  }
}
