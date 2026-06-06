import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User, { serializeUser } from "@/models/User";
import { getAuthPayload, signToken, attachAuthCookie } from "@/lib/auth";
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

    const dbRole = user.role === "admin" ? "admin" : "user";

    // Keep JWT in sync with database (e.g. after role is changed to admin)
    if (payload.role !== dbRole || payload.email !== user.email) {
      const token = signToken({
        userId: user._id.toString(),
        email: user.email,
        role: dbRole,
      });
      await attachAuthCookie(token);
    }

    return jsonSuccess({ user: serializeUser(user) });
  } catch (error) {
    console.error("Auth me error:", error);
    return jsonError("Failed to fetch user.", 500);
  }
}
