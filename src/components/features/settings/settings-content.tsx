"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Bell, Shield, Globe, LogOut, Crown, ChevronRight, Check } from "lucide-react";
import { AppShell } from "@/components/shared/app-shell";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@/i18n/navigation";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function SettingsContent() {
  const { user, logout } = useAuth();
  const [notifs, setNotifs] = useState({ matches: true, messages: true, events: false, tips: true });
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const sections = [
    {
      title: "บัญชีของฉัน",
      icon: User,
      items: [
        { label: "ชื่อที่แสดง",    value: user?.displayName ?? "—",              action: "edit" },
        { label: "อีเมล",           value: user?.email ?? "—",                    action: "view" },
        { label: "เปลี่ยนรหัสผ่าน", value: "••••••••",                          action: "edit" },
      ],
    },
    {
      title: "ความเป็นส่วนตัว",
      icon: Shield,
      items: [
        { label: "แสดงโปรไฟล์",    value: "สาธารณะ",  action: "edit" },
        { label: "แสดงสถานที่",     value: "จังหวัด",  action: "edit" },
        { label: "ลบบัญชี",         value: "",         action: "danger" },
      ],
    },
    {
      title: "ภาษา",
      icon: Globe,
      items: [
        { label: "ภาษาของแอป",     value: "ภาษาไทย",  action: "edit" },
      ],
    },
  ];

  return (
    <AppShell>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="mx-auto max-w-xl space-y-5">

        {/* Header */}
        <motion.div variants={fadeUp}>
          <h1 className="text-xl font-extrabold text-[#0B1D3A]">ตั้งค่า</h1>
          <p className="text-xs text-[#6B5232]/60">จัดการบัญชีและการตั้งค่าแอป</p>
        </motion.div>

        {/* Plan banner */}
        <motion.div variants={fadeUp} className="flex items-center gap-4 rounded-2xl p-4"
          style={{ background: "linear-gradient(135deg,rgba(249,197,209,0.30),rgba(237,208,96,0.15))", border: "1px solid rgba(212,140,165,0.30)" }}>
          <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full"
            style={{ background: "rgba(212,175,55,0.15)" }}>
            <Crown className="size-5 text-[#D4AF37]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-[#4A1030]">แผนฟรี</p>
            <p className="text-xs text-[#6B5232]/60">อัปเกรดเพื่อปลดล็อกฟีเจอร์ทั้งหมด</p>
          </div>
          <Link href="/pricing" className="rounded-full px-3 py-1.5 text-xs font-bold hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
            Premium
          </Link>
        </motion.div>

        {/* Setting sections */}
        {sections.map(({ title, icon: Icon, items }) => (
          <motion.div key={title} variants={fadeUp} className="overflow-hidden rounded-2xl"
            style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)", boxShadow: "0 2px 12px rgba(160,60,90,0.06)" }}>
            <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: "1px solid rgba(212,160,175,0.15)" }}>
              <Icon className="size-4 text-[#D4AF37]" />
              <h2 className="text-sm font-bold text-[#0B1D3A]">{title}</h2>
            </div>
            <div className="divide-y divide-[#F5E0E6]">
              {items.map((item) => (
                <div key={item.label} className="flex items-center justify-between px-5 py-3.5">
                  <p className="text-sm text-[#0B1D3A]">{item.label}</p>
                  <div className="flex items-center gap-2">
                    {item.value && (
                      <span className="text-xs text-[#6B5232]/60"
                        style={{ color: item.action === "danger" ? "#dc2626" : undefined }}>
                        {item.value}
                      </span>
                    )}
                    {item.action === "edit" && <ChevronRight className="size-4 text-[#6B5232]/30" />}
                    {item.action === "danger" && (
                      <span className="cursor-pointer text-xs font-semibold text-red-500 hover:underline">ลบ</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Notifications */}
        <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl"
          style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)", boxShadow: "0 2px 12px rgba(160,60,90,0.06)" }}>
          <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: "1px solid rgba(212,160,175,0.15)" }}>
            <Bell className="size-4 text-[#D4AF37]" />
            <h2 className="text-sm font-bold text-[#0B1D3A]">การแจ้งเตือน</h2>
          </div>
          <div className="divide-y divide-[#F5E0E6]">
            {(Object.entries(notifs) as [keyof typeof notifs, boolean][]).map(([key, val]) => {
              const labels: Record<keyof typeof notifs, string> = {
                matches: "มี Match ใหม่", messages: "ข้อความใหม่", events: "กิจกรรมใหม่", tips: "เคล็ดลับรายวัน",
              };
              return (
                <div key={key} className="flex items-center justify-between px-5 py-3.5">
                  <p className="text-sm text-[#0B1D3A]">{labels[key]}</p>
                  <button
                    onClick={() => setNotifs((p) => ({ ...p, [key]: !p[key] }))}
                    className="relative h-6 w-11 rounded-full transition-colors"
                    style={{ background: val ? "linear-gradient(135deg,#EDD060,#D4AF37)" : "rgba(212,160,175,0.30)" }}>
                    <span className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all"
                      style={{ left: val ? "calc(100% - 20px)" : "4px" }} />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-3">
            <button onClick={save}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
              {saved ? <><Check className="size-4" /> บันทึกแล้ว</> : "บันทึกการตั้งค่า"}
            </button>
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div variants={fadeUp}>
          <button onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ background: "rgba(220,80,80,0.08)", border: "1px solid rgba(220,80,80,0.18)", color: "#B03030" }}>
            <LogOut className="size-4" /> ออกจากระบบ
          </button>
        </motion.div>

      </motion.div>
    </AppShell>
  );
}
