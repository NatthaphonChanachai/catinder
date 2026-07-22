import Image from "next/image";
import { Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";

const EXPLORE = [
  { href: "/about",     label: "เกี่ยวกับเรา" },
  { href: "/knowledge", label: "คลังความรู้" },
  { href: "/articles",  label: "บทความ" },
  { href: "/events",    label: "กิจกรรม" },
];
const COMMUNITY = [
  { href: "/community", label: "ชุมชน" },
  { href: "/faq",       label: "คำถามที่พบบ่อย" },
  { href: "/contact",   label: "ติดต่อเรา" },
];
const ACCOUNT = [
  { href: "/login",    label: "เข้าสู่ระบบ" },
  { href: "/register", label: "สมัครสมาชิก" },
];

export function Footer() {
  return (
    <footer
      style={{
        background: "linear-gradient(170deg, #0B1D3A 0%, #091428 60%, #060E1E 100%)",
        borderTop: "1px solid rgba(212,175,55,0.20)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-8">
        {/* Top row */}
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="inline-block">
              <div className="relative h-14 w-48">
                <Image
                  src="/img/logo_and_icon.png"
                  alt="Catinder"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p
              className="mt-5 text-sm leading-relaxed"
              style={{ color: "rgba(247,215,171,0.60)" }}
            >
              แพลตฟอร์มจับคู่แมวที่ปลอดภัยและเชื่อถือได้ <br />
              ช่วยให้คุณพ่อคุณแม่แมวสร้างรุ่นต่อรุ่นที่แข็งแรงและมีความสุข
            </p>

            {/* Social icons placeholder */}
            <div className="mt-6 flex items-center gap-3">
              {["f", "ig", "tw", "yt"].map((s) => (
                <div
                  key={s}
                  className="flex size-9 items-center justify-center rounded-full text-xs font-bold transition-colors hover:opacity-80"
                  style={{
                    background: "rgba(212,175,55,0.14)",
                    border: "1px solid rgba(212,175,55,0.28)",
                    color: "#D4AF37",
                  }}
                >
                  {s === "f" ? "f" : s === "ig" ? "ig" : s === "tw" ? "x" : "▶"}
                </div>
              ))}
            </div>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="flex flex-col gap-3">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "#D4AF37" }}
              >
                สำรวจ
              </span>
              {EXPLORE.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm transition-colors hover:text-[#D4AF37]"
                  style={{ color: "rgba(247,215,171,0.60)" }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "#D4AF37" }}
              >
                ชุมชน
              </span>
              {COMMUNITY.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm transition-colors hover:text-[#D4AF37]"
                  style={{ color: "rgba(247,215,171,0.60)" }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "#D4AF37" }}
              >
                บัญชี
              </span>
              {ACCOUNT.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm transition-colors hover:text-[#D4AF37]"
                  style={{ color: "rgba(247,215,171,0.60)" }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Gold divider */}
        <div
          className="my-10 h-px w-full"
          style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.35), transparent)" }}
        />

        {/* Legal links */}
        <div className="mb-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:justify-start">
          {[
            { href: "/terms", label: "ข้อกำหนดการใช้บริการ" },
            { href: "/privacy", label: "นโยบายความเป็นส่วนตัว" },
            { href: "/refund", label: "การชำระเงินและคืนเงิน" },
            { href: "/pricing", label: "แผนราคา" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-[#D4AF37]"
              style={{ color: "rgba(247,215,171,0.55)" }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex flex-col items-center justify-between gap-4 text-xs sm:flex-row" style={{ color: "rgba(247,215,171,0.40)" }}>
          <p>© {new Date().getFullYear()} Catinder. สงวนลิขสิทธิ์ทุกประการ</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="size-3 fill-[#F9C5D1] text-[#F9C5D1]" /> for cat parents
          </p>
        </div>
      </div>
    </footer>
  );
}
