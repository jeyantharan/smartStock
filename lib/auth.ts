import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const TOKEN_COOKIE = "smartstock_token";
export const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface JwtPayload {
  userId: string;
  email: string;
  role: "user" | "admin";
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return secret;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: TOKEN_MAX_AGE });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as Partial<JwtPayload>;
    if (!payload.userId || !payload.email) return null;
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role === "admin" ? "admin" : "user",
    };
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(TOKEN_COOKIE)?.value ?? null;
}

export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE)?.value ?? null;
}

export async function attachAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
}

export async function getAuthPayload(
  request?: NextRequest
): Promise<JwtPayload | null> {
  const token = request
    ? getTokenFromRequest(request)
    : await getTokenFromCookies();

  if (!token) return null;
  return verifyToken(token);
}
