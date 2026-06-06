import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { uploadProductImage } from "@/lib/cloudinary";
import { jsonError, jsonSuccess } from "@/lib/api-response";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return jsonError("No image file provided.", 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return jsonError("Only JPEG, PNG, WebP, and GIF images are allowed.", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonError("Image must be smaller than 5MB.", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, publicId } = await uploadProductImage(buffer);

    return jsonSuccess({ url, publicId });
  } catch (error) {
    console.error("Product image upload:", error);
    return jsonError("Failed to upload image.", 500);
  }
}
