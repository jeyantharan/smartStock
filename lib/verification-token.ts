import crypto from "crypto";

const TOKEN_BYTES = 32;
const EXPIRY_HOURS = 24;

export function generateVerificationToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

export function getVerificationExpiry(): Date {
  return new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000);
}
