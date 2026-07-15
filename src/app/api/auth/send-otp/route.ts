import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const SECRET = process.env.OTP_SECRET ?? "catinder-otp-dev-secret";
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function generateCode(): string {
  return String(crypto.randomInt(100000, 999999));
}

function signToken(email: string, code: string, expiresAt: number): string {
  const payload = `${email}:${code}:${expiresAt}`;
  const hmac = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(`${hmac}:${expiresAt}`).toString("base64url");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email: string = body?.email ?? "";

  if (!email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const code = generateCode();
  const expiresAt = Date.now() + OTP_TTL_MS;
  const token = signToken(email, code, expiresAt);

  const safeEmail = email.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";

  if (apiKey && !apiKey.startsWith("re_REPLACE")) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: `Catinder <${from}>`,
        to: email,
        subject: `${code} — รหัส OTP ของคุณจาก Catinder`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#FFFAFC;">
            <div style="text-align:center;margin-bottom:28px;">
              <p style="margin:0;font-size:22px;font-weight:900;color:#0B1D3A;">🐾 Catinder</p>
            </div>
            <h2 style="color:#0B1D3A;margin:0 0 8px;font-size:20px;">รหัสยืนยันของคุณ</h2>
            <p style="color:#6B5232;margin:0 0 24px;font-size:14px;line-height:1.6;">
              ใช้รหัสนี้เพื่อยืนยันอีเมล <strong>${safeEmail}</strong> บน Catinder<br/>
              รหัสหมดอายุใน <strong>10 นาที</strong>
            </p>
            <div style="background:linear-gradient(135deg,#EDD060,#D4AF37);border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
              <span style="font-size:44px;font-weight:900;color:#0B1D3A;letter-spacing:10px;display:block;">${code}</span>
            </div>
            <p style="color:#B0A090;font-size:12px;margin:0;">
              หากคุณไม่ได้ขอรหัสนี้ กรุณาเพิกเฉยต่ออีเมลนี้
            </p>
          </div>
        `,
      });
    } catch (err) {
      console.error("[send-otp] Resend error:", err);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
  } else {
    // Dev mode — log code to console so developer can test without email setup
    console.log(`\n📧 [DEV] OTP for ${email}: ${code}  (expires in 10 min)\n`);
  }

  return NextResponse.json({ token });
}
