import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "#FFF5F8" }}
    >
      {/* Mascot */}
      <div className="mb-6">
        <Image
          src="/img/mascot.png"
          alt="Nori the cat mascot"
          width={160}
          height={160}
          className="mx-auto drop-shadow-lg"
          priority
        />
      </div>

      {/* 404 number */}
      <p
        className="text-[80px] font-black leading-none tracking-tight mb-2"
        style={{
          background: "linear-gradient(135deg,#EDD060,#D4AF37)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        404
      </p>

      {/* Heading */}
      <h1
        className="font-heading text-2xl font-bold mb-3"
        style={{ color: "#0B1D3A" }}
      >
        หน้าที่คุณหาไม่พบ
      </h1>

      {/* Subtitle */}
      <p className="text-base mb-8 max-w-xs leading-relaxed" style={{ color: "#6B5232" }}>
        ลองกลับไปหน้าแรก หรือหาคู่แมวน้องของคุณ
      </p>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link
          href="/"
          className="flex-1 rounded-xl py-3 px-5 text-sm font-semibold text-center transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(135deg,#EDD060,#D4AF37)",
            color: "#0B1D3A",
          }}
        >
          กลับหน้าแรก
        </Link>

        <Link
          href="/discover"
          className="flex-1 rounded-xl py-3 px-5 text-sm font-semibold text-center border transition-colors hover:bg-rose-50"
          style={{
            borderColor: "rgba(212,160,175,0.22)",
            color: "#B04060",
          }}
        >
          จับคู่แมว
        </Link>
      </div>
    </div>
  );
}
