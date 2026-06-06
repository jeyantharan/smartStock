import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User, { serializeUser } from "@/models/User";
import { getAuthPayload } from "@/lib/auth";
import { uploadAvatar, deleteAvatar } from "@/lib/cloudinary";
import { jsonError, jsonSuccess } from "@/lib/api-response";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return jsonError("Not authenticated.", 401);
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return jsonError("No image file provided.", 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return jsonError("Only JPEG, PNG, WebP, and GIF images are allowed.", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonError("Image must be smaller than 5MB.", 400);
    }

    await connectDB();
    const user = await User.findById(payload.userId);
    if (!user) {
      return jsonError("User not found.", 404);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (user.avatarPublicId) {
      await deleteAvatar(user.avatarPublicId).catch(() => {});
    }

    const { url, publicId } = await uploadAvatar(buffer, payload.userId);

    user.avatar = url;
    user.avatarPublicId = publicId;
    await user.save();

    return jsonSuccess({ user: serializeUser(user) });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return jsonError("Failed to upload avatar.", 500);
  }
}
