import { jwtVerify } from "jose";
import type { UserRole } from "@/models/User";

export const TOKEN_COOKIE = "smartstock_token";

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export async function verifyAuthToken(token: string): Promise<JwtPayload | null> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;

    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

    if (typeof payload.userId !== "string" || typeof payload.email !== "string") {
      return null;
    }

    const role = payload.role === "admin" ? "admin" : "user";

    return {
      userId: payload.userId,
      email: payload.email,
      role,
    };
  } catch {
    return null;
  }
}
