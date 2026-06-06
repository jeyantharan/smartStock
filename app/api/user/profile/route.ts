import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User, { serializeUser } from "@/models/User";
import { getAuthPayload } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return jsonError("Not authenticated.", 401);
    }

    await connectDB();
    const user = await User.findById(payload.userId);
    if (!user) {
      return jsonError("User not found.", 404);
    }

    return jsonSuccess({ user: serializeUser(user) });
  } catch (error) {
    console.error("Profile GET error:", error);
    return jsonError("Failed to fetch profile.", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return jsonError("Not authenticated.", 401);
    }

    const body = await request.json();
    const { name, phone } = body;

    if (!name?.trim()) {
      return jsonError("Name is required.", 400);
    }

    await connectDB();
    const user = await User.findById(payload.userId);
    if (!user) {
      return jsonError("User not found.", 404);
    }

    user.name = name.trim();
    user.phone = phone?.trim() ?? "";
    await user.save();

    return jsonSuccess({ user: serializeUser(user) });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return jsonError("Failed to update profile.", 500);
  }
}
