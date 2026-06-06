import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken, attachAuthCookie } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return jsonError("Verification token is missing.", 400);
    }

    await connectDB();

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return jsonError("Invalid or expired verification link.", 400);
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    const jwtToken = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role === "admin" ? "admin" : "user",
    });

    await attachAuthCookie(jwtToken);

    return jsonSuccess({
      message: "Email verified successfully. You are now logged in.",
      verified: true,
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return jsonError("Email verification failed. Please try again.", 500);
  }
}
