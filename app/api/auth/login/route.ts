import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User, { serializeUser } from "@/models/User";
import { signToken, attachAuthCookie } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email?.trim() || !password) {
      return jsonError("Email and password are required.", 400);
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return jsonError("Invalid email or password.", 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return jsonError("Invalid email or password.", 401);
    }

    if (user.emailVerified === false) {
      return jsonError(
        "Please verify your email before logging in. Check your inbox for the verification link.",
        403
      );
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role === "admin" ? "admin" : "user",
    });

    await attachAuthCookie(token);

    return jsonSuccess({ user: serializeUser(user) });
  } catch (error) {
    console.error("Login error:", error);
    return jsonError("Login failed. Please try again.", 500);
  }
}
