"use client";

import Image from "next/image";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
          width={140}
          height={140}
          className="mx-auto drop-shadow-lg opacity-90"
          priority
        />
      </div>

      {/* Heading */}
      <h1
        className="font-heading text-2xl font-bold mb-2"
        style={{ color: "#0B1D3A" }}
      >
        เกิดข้อผิดพลาด
      </h1>

      {/* Subtitle */}
      <p className="text-base mb-8 max-w-xs leading-relaxed" style={{ color: "#6B5232" }}>
        บางอย่างไม่ถูกต้อง กรุณาลองอีกครั้ง
      </p>

      {/* Error digest (dev only) */}
      {error.digest && (
        <p className="text-xs mb-6 font-mono opacity-50" style={{ color: "#6B5232" }}>
          {error.digest}
        </p>
      )}

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={reset}
          className="flex-1 rounded-xl py-3 px-5 text-sm font-semibold text-center transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(135deg,#EDD060,#D4AF37)",
            color: "#0B1D3A",
          }}
        >
          ลองอีกครั้ง
        </button>

        <Link
          href="/"
          className="flex-1 rounded-xl py-3 px-5 text-sm font-semibold text-center border transition-colors hover:bg-rose-50"
          style={{
            borderColor: "rgba(212,160,175,0.22)",
            color: "#B04060",
          }}
        >
          กลับหน้าแรก
        </Link>
      </div>
    </div>
  );
}
