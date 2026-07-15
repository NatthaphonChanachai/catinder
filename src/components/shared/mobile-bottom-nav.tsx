"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import {
  Home,
  HeartHandshake,
  PawPrint,
  MessageCircle,
  User,
  BookOpen,
  Users2,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const t = useTranslations("bottomNav");
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // pathname is e.g. "/th", "/th/discover", "/en/chat"
  const localePrefix = pathname.startsWith("/en") ? "/en" : "/th";

  function isActive(href: string): boolean {
    if (href === "/") return pathname === localePrefix;
    return pathname.startsWith(localePrefix + href);
  }

  const loggedInItems = [
    { href: "/dashboard",  icon: Home,          label: t("dashboard") },
    { href: "/discover",   icon: HeartHandshake, label: t("discover")  },
    { href: "/cats",       icon: PawPrint,       label: t("myCats")    },
    { href: "/chat",       icon: MessageCircle,  label: t("chat")      },
    { href: "/settings",   icon: User,           label: t("me")        },
  ] as const;

  const loggedOutItems = [
    { href: "/",          icon: Home,        label: t("home")      },
    { href: "/articles",  icon: BookOpen,    label: t("articles")  },
    { href: "/community", icon: Users2,      label: t("community") },
    { href: "/events",    icon: CalendarDays, label: t("events")   },
    { href: "/login",     icon: User,        label: t("login")     },
  ] as const;

  const items = !loading && user ? loggedInItems : loggedOutItems;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[60] lg:hidden"
      style={{
        background: "rgba(255,254,245,0.94)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(212,175,55,0.22)",
        boxShadow: "0 -4px 24px rgba(11,29,58,0.07)",
      }}
    >
      <div
        className="flex items-stretch justify-around px-1 pt-2"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {items.map(({ href, icon: Icon, label }, idx) => {
          const active = isActive(href);
          return (
            <Link key={idx} href={href}>
              <motion.div
                whileTap={{ scale: 0.82 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 px-2 min-w-[56px] pt-1",
                  active ? "text-[#C4A020]" : "text-[#8A7060]/70",
                )}
              >
                {/* Active indicator bar */}
                {active && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute -top-2 h-[3px] w-5 rounded-full bg-[#D4AF37]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Icon pill */}
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-xl transition-all duration-200",
                    active && "bg-[#D4AF37]/12",
                  )}
                >
                  <Icon className={cn("size-[20px]", active ? "text-[#C4A020]" : "text-[#8A7060]/65")} />
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-[9.5px] font-semibold leading-none",
                    active ? "text-[#C4A020]" : "text-[#8A7060]/60",
                  )}
                >
                  {label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
