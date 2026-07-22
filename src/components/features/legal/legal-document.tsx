import { Link } from "@/i18n/navigation";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

interface LegalDocumentProps {
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
}

export function LegalDocument({ title, updatedAt, intro, sections }: LegalDocumentProps) {
  return (
    <div className="min-h-screen" style={{ background: "#FFF5F8" }}>
      <div className="mx-auto max-w-3xl px-5 py-14 md:py-20">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: "#B04060" }}
        >
          <span>←</span>
          <span>กลับหน้าแรก</span>
        </Link>

        <h1
          className="font-heading text-3xl font-bold md:text-4xl"
          style={{ color: "#0B1D3A" }}
        >
          {title}
        </h1>
        <p className="mt-2 text-xs" style={{ color: "#6B5232" }}>
          ปรับปรุงล่าสุด: {updatedAt}
        </p>

        <p
          className="mt-6 text-sm leading-relaxed md:text-base"
          style={{ color: "#4A3820" }}
        >
          {intro}
        </p>

        <div className="mt-10 space-y-8">
          {sections.map((s, i) => (
            <section key={i}>
              <h2
                className="font-heading text-lg font-bold md:text-xl"
                style={{ color: "#0B1D3A" }}
              >
                {i + 1}. {s.heading}
              </h2>
              {s.paragraphs.map((p, j) => (
                <p
                  key={j}
                  className="mt-3 text-sm leading-relaxed"
                  style={{ color: "#4A3820" }}
                >
                  {p}
                </p>
              ))}
              {s.bullets && (
                <ul className="mt-3 space-y-2 pl-1">
                  {s.bullets.map((b, k) => (
                    <li
                      key={k}
                      className="flex gap-2 text-sm leading-relaxed"
                      style={{ color: "#4A3820" }}
                    >
                      <span style={{ color: "#D4AF37" }}>•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div
          className="mt-14 rounded-2xl p-5 text-sm"
          style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)", color: "#6B5232" }}
        >
          มีคำถามเกี่ยวกับนโยบายนี้? ติดต่อเราได้ที่{" "}
          <Link href="/contact" className="font-semibold underline" style={{ color: "#B04060" }}>
            หน้าติดต่อเรา
          </Link>{" "}
          หรืออีเมล support@catinder.app
        </div>
      </div>
    </div>
  );
}
