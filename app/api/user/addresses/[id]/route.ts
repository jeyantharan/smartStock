import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User, { serializeUser } from "@/models/User";
import { getAuthPayload } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return jsonError("Not authenticated.", 401);
    }

    const { id } = await params;
    if (!id) {
      return jsonError("Address ID is required.", 400);
    }

    await connectDB();
    const user = await User.findById(payload.userId);
    if (!user) {
      return jsonError("User not found.", 404);
    }

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id?.toString() === id
    );

    if (addressIndex === -1) {
      return jsonError("Address not found.", 404);
    }

    user.addresses.splice(addressIndex, 1);
    await user.save();

    return jsonSuccess({ user: serializeUser(user) });
  } catch (error) {
    console.error("Delete address error:", error);
    return jsonError("Failed to delete address.", 500);
  }
}
