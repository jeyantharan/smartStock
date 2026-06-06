import { NextRequest } from "next/server";
import { getAuthPayload, JwtPayload } from "@/lib/auth";
import { jsonError } from "@/lib/api-response";

export async function requireAdmin(
  request: NextRequest
): Promise<{ payload: JwtPayload } | Response> {
  const payload = await getAuthPayload(request);
  if (!payload) {
    return jsonError("Not authenticated.", 401);
  }
  if (payload.role !== "admin") {
    return jsonError("Admin access required.", 403);
  }
  return { payload };
}
