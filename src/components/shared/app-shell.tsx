"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import { Gift } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AppSidebar, CatAvatar } from "@/components/shared/app-sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? "คุณตะนาสรน์";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#FFF5F8" }}>
      <AppSidebar />

      <div className="flex flex-1 min-w-0 flex-col overflow-y-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center gap-4 px-5"
          style={{ background: "rgba(255,248,250,0.94)", borderBottom: "1px solid rgba(212,160,175,0.20)", backdropFilter: "blur(16px)" }}>
          <Link href="/" className="relative h-9 w-28 flex-shrink-0 xl:hidden">
            <Image src="/img/logo_and_icon.png" alt="Catinder" fill className="object-contain object-left" />
          </Link>
          <div className="hidden flex-1 max-w-sm items-center gap-2.5 rounded-2xl px-4 py-2 sm:flex"
            style={{ background: "rgba(180,80,110,0.05)", border: "1px solid rgba(212,160,175,0.22)" }}>
            <Search className="size-4 flex-shrink-0 text-[#D4AF37]" />
            <input type="text" placeholder="ค้นหาแมว ผู้เพาะพันธุ์ ..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#6B5232]/40" />
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <CatAvatar size={10} />
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-[#0B1D3A]">{displayName}</p>
              <div className="flex items-center gap-1">
                <Gift className="size-2.5 text-[#6B5232]" />
                <span className="text-[9px] font-semibold text-[#6B5232]">สมาชิกทั่วไป</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 pb-24 sm:p-5 lg:p-6 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
