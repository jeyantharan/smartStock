import { removeAuthCookie } from "@/lib/auth";
import { jsonSuccess } from "@/lib/api-response";

export async function POST() {
  await removeAuthCookie();
  return jsonSuccess({ message: "Logged out successfully" });
}
