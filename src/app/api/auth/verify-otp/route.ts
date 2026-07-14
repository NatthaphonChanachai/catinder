import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const SECRET = process.env.OTP_SECRET ?? "catinder-otp-dev-secret";

function verifyToken(email: string, code: string, token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const lastColon = decoded.lastIndexOf(":");
    const hmac = decoded.slice(0, lastColon);
    const expiresAt = Number(decoded.slice(lastColon + 1));

    if (Date.now() > expiresAt) return false;

    const payload = `${email}:${code}:${expiresAt}`;
    const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");

    if (hmac.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(hmac, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, code, token } = body ?? {};

  if (!email || !code || !token) {
    return NextResponse.json({ valid: false, error: "Missing fields" }, { status: 400 });
  }

  const valid = verifyToken(String(email), String(code), String(token));
  return NextResponse.json({ valid });
}
