import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { toEmail, toName, matchedCatName, myName } = body as {
    toEmail?: string;
    toName?: string;
    matchedCatName?: string;
    myName?: string;
  };

  if (!toEmail?.includes("@") || !matchedCatName || !myName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";

  if (!apiKey || apiKey.startsWith("re_REPLACE")) {
    console.log(`\n🐾 [DEV] Match notification → ${toEmail}: ${myName} matched with ${matchedCatName}\n`);
    return NextResponse.json({ ok: true, dev: true });
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const safeToName = (toName ?? "คุณ").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeMyName = myName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeCatName = matchedCatName.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    await resend.emails.send({
      from: `Catinder 🐾 <${from}>`,
      to: toEmail,
      subject: `🐾 ${safeCatName} แมตช์ใหม่บน Catinder!`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#FFFAFC;">
          <div style="text-align:center;margin-bottom:28px;">
            <p style="margin:0;font-size:22px;font-weight:900;color:#0B1D3A;">🐾 Catinder</p>
          </div>
          <h2 style="color:#0B1D3A;margin:0 0 8px;font-size:22px;">ยินดีด้วย! มีแมตช์ใหม่!</h2>
          <p style="color:#6B5232;margin:0 0 24px;font-size:15px;line-height:1.6;">
            สวัสดีคุณ <strong>${safeToName}</strong> 👋<br/>
            <strong>${safeCatName}</strong> ของคุณ ได้รับ Like จาก <strong>${safeMyName}</strong> และเกิดแมตช์แล้ว! 🎉
          </p>
          <div style="background:linear-gradient(135deg,#EDD060,#D4AF37);border-radius:16px;padding:24px;text-align:center;margin-bottom:28px;">
            <p style="font-size:36px;margin:0;">🐱💛🐱</p>
            <p style="font-weight:700;color:#0B1D3A;font-size:16px;margin:12px 0 0;">${safeCatName} &amp; ${safeMyName}</p>
          </div>
          <div style="text-align:center;margin-bottom:24px;">
            <a href="https://catinder.app/chat" style="display:inline-block;background:#0B1D3A;color:#EDD060;padding:14px 32px;border-radius:100px;font-weight:700;text-decoration:none;font-size:14px;">
              เริ่มแชทเลย →
            </a>
          </div>
          <p style="color:#B0A090;font-size:12px;text-align:center;">Catinder — Where Happy Cats Begin Their Forever Story</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[match-notification] Resend error:", err);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
