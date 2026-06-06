import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken, getVerificationExpiry } from "@/lib/verification-token";
import { jsonError, jsonSuccess } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name?.trim() || !email?.trim() || !password) {
      return jsonError("Name, email, and password are required.", 400);
    }

    if (password.length < 8) {
      return jsonError("Password must be at least 8 characters.", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return jsonError("Please enter a valid email address.", 400);
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      if (!existingUser.emailVerified) {
        return jsonError(
          "An account with this email exists but is not verified. Please check your inbox or request a new verification email.",
          409
        );
      }
      return jsonError("An account with this email already exists.", 409);
    }

    const verificationToken = generateVerificationToken();
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
      emailVerified: false,
      verificationToken,
      verificationTokenExpiry: getVerificationExpiry(),
    });

    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (mailError) {
      await User.findByIdAndDelete(user._id);
      console.error("Verification email error:", mailError);
      return jsonError(
        "Account could not be created because the verification email failed to send. Please check SMTP settings.",
        500
      );
    }

    return jsonSuccess(
      {
        message: "Registration successful. Please check your email to verify your account.",
        email: user.email,
        verificationRequired: true,
      },
      201
    );
  } catch (error) {
    console.error("Register error:", error);
    return jsonError("Registration failed. Please try again.", 500);
  }
}
