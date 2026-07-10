"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { LinkButton } from "@/components/shared/link-button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { XPBadge } from "@/components/shared/xp-badge";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const { user, loading, logout } = useAuth();

  const navLinks = [
    { href: "/about",     label: t("about") },
    { href: "/knowledge", label: t("knowledge") },
    { href: "/articles",  label: t("articles") },
    { href: "/events",    label: t("events") },
    { href: "/community", label: t("community") },
    { href: "/faq",       label: t("faq") },
    { href: "/contact",   label: t("contact") },
  ];

  const initial = user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U";
  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? "ผู้ใช้";

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl"
      style={{
        background: "rgba(255,254,245,0.88)",
        borderBottom: "1px solid rgba(212,175,55,0.20)",
        boxShadow: "0 2px 24px rgba(11,29,58,0.06)",
      }}
    >
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-6 sm:h-[76px] lg:h-20">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <div className="relative h-14 w-44 sm:h-16 sm:w-52 lg:h-[64px] lg:w-56">
            <Image
              src="/img/logo_and_icon.png"
              alt="Catinder"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 lg:flex xl:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-sm font-medium transition-colors hover:text-[#D4AF37]"
              style={{ color: "rgba(11,29,58,0.70)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />

          {!loading && user ? (
            /* Logged-in state */
            <>
              <LinkButton
                href="/dashboard"
                className="h-9 rounded-full px-5 text-sm font-semibold"
                style={{
                  background: "linear-gradient(135deg, #E8C84A 0%, #D4AF37 100%)",
                  color: "#0B1D3A",
                  boxShadow: "0 3px 16px rgba(212,175,55,0.40)",
                } as React.CSSProperties}
              >
                <LayoutDashboard className="mr-1.5 size-4" />
                แดชบอร์ด
              </LinkButton>
              <button
                onClick={logout}
                title="ออกจากระบบ"
                className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-[#D4AF37]/10"
                style={{ border: "1px solid rgba(212,175,55,0.25)" }}
              >
                <LogOut className="size-3.5 text-[#6B5232]" />
              </button>
            </>
          ) : (
            /* Logged-out state */
            <>
              <XPBadge />
              <LinkButton
                href="/login"
                variant="ghost"
                className="h-9 rounded-full px-5 text-sm font-semibold"
                style={{ color: "#0B1D3A" }}
              >
                {t("login")}
              </LinkButton>
              <LinkButton
                href="/register"
                className="h-9 rounded-full px-6 text-sm font-bold"
                style={{
                  background: "linear-gradient(135deg, #E8C84A 0%, #D4AF37 100%)",
                  color: "#0B1D3A",
                  boxShadow: "0 3px 16px rgba(212,175,55,0.45)",
                } as React.CSSProperties}
              >
                {t("join")}
              </LinkButton>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          aria-label={tc("toggleMenu")}
          className={cn(
            "flex size-10 items-center justify-center rounded-full transition-colors lg:hidden",
            "hover:bg-[#D4AF37]/10",
          )}
          onClick={() => setOpen((v) => !v)}
        >
          {open
            ? <X className="size-5 text-[#0B1D3A]" />
            : <Menu className="size-5 text-[#0B1D3A]" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden border-t lg:hidden"
            style={{ borderColor: "rgba(212,175,55,0.20)", background: "rgba(255,254,245,0.97)" }}
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[#D4AF37]/10"
                  style={{ color: "rgba(11,29,58,0.80)" }}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex items-center gap-3 px-3">
                <LanguageSwitcher />
              </div>
              <div className="mt-2 flex gap-3 px-3">
                {!loading && user ? (
                  <>
                    <LinkButton href="/dashboard" className="flex-1 rounded-full font-bold"
                      style={{ background: "linear-gradient(135deg, #E8C84A 0%, #D4AF37 100%)", color: "#0B1D3A" } as React.CSSProperties}>
                      แดชบอร์ด
                    </LinkButton>
                    <button onClick={logout}
                      className="flex-1 rounded-full border border-border py-2 text-sm font-semibold text-[#6B5232]">
                      ออกจากระบบ
                    </button>
                  </>
                ) : (
                  <>
                    <LinkButton href="/login" variant="outline" className="flex-1 rounded-full">
                      {t("login")}
                    </LinkButton>
                    <LinkButton
                      href="/register"
                      className="flex-1 rounded-full font-bold"
                      style={{
                        background: "linear-gradient(135deg, #E8C84A 0%, #D4AF37 100%)",
                        color: "#0B1D3A",
                      } as React.CSSProperties}
                    >
                      {t("join")}
                    </LinkButton>
                  </>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
