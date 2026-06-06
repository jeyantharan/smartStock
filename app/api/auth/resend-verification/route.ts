import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken, getVerificationExpiry } from "@/lib/verification-token";
import { jsonError, jsonSuccess } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email?.trim()) {
      return jsonError("Email is required.", 400);
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return jsonSuccess({
        message: "If an unverified account exists for this email, a new verification link has been sent.",
      });
    }

    if (user.emailVerified) {
      return jsonError("This email is already verified. You can log in.", 400);
    }

    const verificationToken = generateVerificationToken();
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = getVerificationExpiry();
    await user.save();

    await sendVerificationEmail(user.email, user.name, verificationToken);

    return jsonSuccess({
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return jsonError("Failed to send verification email. Please try again.", 500);
  }
}
