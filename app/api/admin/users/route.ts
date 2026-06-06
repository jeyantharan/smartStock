import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getAuthPayload } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return jsonError("Not authenticated.", 401);
    }

    if (payload.role !== "admin") {
      return jsonError("Admin access required.", 403);
    }

    await connectDB();

    const users = await User.find()
      .select("name email role emailVerified createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return jsonSuccess({
      users: users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role ?? "user",
        emailVerified: u.emailVerified === true,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return jsonError("Failed to fetch users.", 500);
  }
}
