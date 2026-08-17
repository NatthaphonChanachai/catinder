"use client";

import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  User, Bell, Shield, LogOut, Crown, Check, Loader2, X, AlertTriangle, Mail, Pencil,
} from "lucide-react";
import {
  updateProfile, sendPasswordResetEmail, deleteUser,
} from "firebase/auth";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/services/firebase";
import { AppShell } from "@/components/shared/app-shell";
import { useAuth } from "@/contexts/auth-context";
import { Link, useRouter } from "@/i18n/navigation";
import { fadeUp, staggerContainer } from "@/lib/motion";

type NotifKey = "matches" | "messages" | "events" | "tips";

export function SettingsContent() {
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.displayName ?? userProfile?.displayName ?? "");
  const [notifs, setNotifs] = useState<Record<NotifKey, boolean>>({ matches: true, messages: true, events: false, tips: true });
  const [toast, setToast] = useState<string | null>(null);

  const [editName, setEditName] = useState(false);
  const [nameDraft, setNameDraft] = useState(name);
  const [savingName, setSavingName] = useState(false);

  const [pwSending, setPwSending] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);
  const [savingNotifs, setSavingNotifs] = useState(false);

  const isGoogle = user?.providerData?.some((p) => p.providerId === "google.com");

  // hydrate from profile
  useEffect(() => {
    if (userProfile?.displayName) setName(userProfile.displayName);
    const prefs = (userProfile as { notifPrefs?: Record<NotifKey, boolean> } | null)?.notifPrefs;
    if (prefs) setNotifs((cur) => ({ ...cur, ...prefs }));
  }, [userProfile]);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function saveName() {
    if (!nameDraft.trim() || !user) return;
    setSavingName(true);
    try {
      await updateProfile(user, { displayName: nameDraft.trim() });
      await updateDoc(doc(db, "users", user.uid), { displayName: nameDraft.trim() });
      setName(nameDraft.trim());
      setEditName(false);
      flash("บันทึกชื่อแล้ว");
    } catch {
      flash("บันทึกไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setSavingName(false);
    }
  }

  async function changePassword() {
    if (!user?.email) return;
    setPwSending(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      flash("ส่งลิงก์เปลี่ยนรหัสไปที่อีเมลแล้ว");
    } catch {
      flash("ส่งอีเมลไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setPwSending(false);
    }
  }

  async function saveNotifs() {
    if (!user) return;
    setSavingNotifs(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { notifPrefs: notifs });
      flash("บันทึกการแจ้งเตือนแล้ว");
    } catch {
      flash("บันทึกไม่สำเร็จ");
    } finally {
      setSavingNotifs(false);
    }
  }

  async function confirmDelete() {
    if (!user) return;
    setDeleting(true);
    setDeleteErr(null);
    try {
      await deleteDoc(doc(db, "users", user.uid)).catch(() => {});
      await deleteUser(user);
      router.push("/");
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code === "auth/requires-recent-login") {
        setDeleteErr("เพื่อความปลอดภัย กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่ ก่อนลบบัญชี");
      } else {
        setDeleteErr("ลบบัญชีไม่สำเร็จ กรุณาลองอีกครั้ง");
      }
      setDeleting(false);
    }
  }

  const notifLabels: Record<NotifKey, string> = {
    matches: "มี Match ใหม่", messages: "ข้อความใหม่", events: "กิจกรรมใหม่", tips: "เคล็ดลับรายวัน",
  };

  return (
    <AppShell>
      <m.div initial="hidden" animate="visible" variants={staggerContainer} className="mx-auto max-w-xl space-y-5">

        <m.div variants={fadeUp}>
          <h1 className="text-xl font-extrabold text-[#0B1D3A]">ตั้งค่า</h1>
          <p className="text-xs text-[#6B5232]/60">จัดการบัญชีและการตั้งค่าแอป</p>
        </m.div>

        {/* Plan banner */}
        <m.div variants={fadeUp} className="flex items-center gap-4 rounded-2xl p-4"
          style={{ background: "linear-gradient(135deg,rgba(249,197,209,0.30),rgba(237,208,96,0.15))", border: "1px solid rgba(212,140,165,0.30)" }}>
          <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(212,175,55,0.15)" }}>
            <Crown className="size-5 text-[#D4AF37]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-[#4A1030]">แผนฟรี</p>
            <p className="text-xs text-[#6B5232]/60">อัปเกรดเพื่อปลดล็อกฟีเจอร์ทั้งหมด</p>
          </div>
          <Link href="/pricing" className="rounded-full px-3 py-1.5 text-xs font-bold hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>Premium</Link>
        </m.div>

        {/* Account */}
        <Section icon={User} title="บัญชีของฉัน">
          <Row label="ชื่อที่แสดง" value={name || "—"} onClick={() => { setNameDraft(name); setEditName(true); }} actionIcon={Pencil} />
          <Row label="อีเมล" value={user?.email ?? "—"} />
          {!isGoogle && (
            <button onClick={changePassword} disabled={pwSending} className="flex w-full items-center justify-between px-5 py-3.5 hover:bg-[#FFF5F8] disabled:opacity-60">
              <span className="text-sm text-[#0B1D3A]">เปลี่ยนรหัสผ่าน</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#C4A020]">
                {pwSending ? <Loader2 className="size-3.5 animate-spin" /> : <Mail className="size-3.5" />} ส่งลิงก์ทางอีเมล
              </span>
            </button>
          )}
          {isGoogle && <Row label="เข้าสู่ระบบด้วย" value="Google" />}
        </Section>

        {/* Notifications */}
        <Section icon={Bell} title="การแจ้งเตือน">
          {(Object.keys(notifs) as NotifKey[]).map((key) => (
            <div key={key} className="flex items-center justify-between px-5 py-3.5">
              <p className="text-sm text-[#0B1D3A]">{notifLabels[key]}</p>
              <button onClick={() => setNotifs((p) => ({ ...p, [key]: !p[key] }))}
                className="relative h-6 w-11 rounded-full transition-colors"
                style={{ background: notifs[key] ? "linear-gradient(135deg,#EDD060,#D4AF37)" : "rgba(212,160,175,0.30)" }}>
                <span className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all" style={{ left: notifs[key] ? "calc(100% - 20px)" : "4px" }} />
              </button>
            </div>
          ))}
          <div className="px-5 py-3">
            <button onClick={saveNotifs} disabled={savingNotifs}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
              {savingNotifs ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} บันทึกการแจ้งเตือน
            </button>
          </div>
        </Section>

        {/* Danger zone */}
        <Section icon={Shield} title="ความเป็นส่วนตัว">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div>
              <p className="text-sm font-semibold text-[#B03030]">ลบบัญชี</p>
              <p className="text-[11px] text-[#6B5232]/50">ลบบัญชีและข้อมูลทั้งหมดถาวร</p>
            </div>
            <button onClick={() => { setShowDelete(true); setDeleteErr(null); }}
              className="rounded-full px-3.5 py-1.5 text-xs font-bold text-white" style={{ background: "#B04060" }}>ลบบัญชี</button>
          </div>
        </Section>

        {/* Logout */}
        <m.div variants={fadeUp}>
          <button onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold hover:opacity-80"
            style={{ background: "rgba(220,80,80,0.08)", border: "1px solid rgba(220,80,80,0.18)", color: "#B03030" }}>
            <LogOut className="size-4" /> ออกจากระบบ
          </button>
        </m.div>
      </m.div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg lg:bottom-6"
            style={{ background: "#0B1D3A" }}>
            {toast}
          </m.div>
        )}
      </AnimatePresence>

      {/* Edit name modal */}
      <AnimatePresence>
        {editName && (
          <Modal onClose={() => setEditName(false)} title="แก้ไขชื่อที่แสดง">
            <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} autoFocus placeholder="ชื่อของคุณ"
              className="w-full rounded-xl px-3.5 py-2.5 text-sm text-[#0B1D3A] outline-none" style={{ background: "#FFF5F8", border: "1px solid rgba(212,160,175,0.35)" }} />
            <button onClick={saveName} disabled={savingName || !nameDraft.trim()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#EDD060,#D4AF37)", color: "#0B1D3A" }}>
              {savingName ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} บันทึก
            </button>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete account modal */}
      <AnimatePresence>
        {showDelete && (
          <Modal onClose={() => !deleting && setShowDelete(false)} title="ลบบัญชีถาวร?">
            <div className="flex items-start gap-2 rounded-xl p-3 text-xs text-[#B04060]" style={{ background: "rgba(176,64,96,0.08)" }}>
              <AlertTriangle className="size-4 shrink-0" />
              การลบบัญชีจะลบโปรไฟล์ แมว การจับคู่ และข้อมูลทั้งหมดอย่างถาวร ไม่สามารถกู้คืนได้
            </div>
            {deleteErr && <p className="mt-3 text-xs font-semibold text-[#B04060]">{deleteErr}</p>}
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowDelete(false)} disabled={deleting}
                className="flex-1 rounded-full py-2.5 text-sm font-semibold" style={{ border: "1px solid rgba(212,160,175,0.35)", color: "#6B5232" }}>ยกเลิก</button>
              <button onClick={confirmDelete} disabled={deleting}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-bold text-white disabled:opacity-60" style={{ background: "#B04060" }}>
                {deleting ? <Loader2 className="size-4 animate-spin" /> : null} ลบถาวร
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) {
  return (
    <m.div variants={fadeUp} className="overflow-hidden rounded-2xl"
      style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)", boxShadow: "0 2px 12px rgba(160,60,90,0.06)" }}>
      <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: "1px solid rgba(212,160,175,0.15)" }}>
        <Icon className="size-4 text-[#D4AF37]" />
        <h2 className="text-sm font-bold text-[#0B1D3A]">{title}</h2>
      </div>
      <div className="divide-y divide-[#F5E0E6]">{children}</div>
    </m.div>
  );
}

function Row({ label, value, onClick, actionIcon: ActionIcon }: { label: string; value: string; onClick?: () => void; actionIcon?: typeof Pencil }) {
  const content = (
    <>
      <p className="text-sm text-[#0B1D3A]">{label}</p>
      <div className="flex items-center gap-2">
        <span className="max-w-[55vw] truncate text-xs text-[#6B5232]/60 sm:max-w-none">{value}</span>
        {ActionIcon && <ActionIcon className="size-3.5 text-[#6B5232]/40" />}
      </div>
    </>
  );
  if (onClick) return <button onClick={onClick} className="flex w-full items-center justify-between px-5 py-3.5 hover:bg-[#FFF5F8]">{content}</button>;
  return <div className="flex items-center justify-between px-5 py-3.5">{content}</div>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <m.div initial={{ y: "100%" }} animate={{ y: 0, transition: { type: "spring", damping: 26, stiffness: 280 } }} exit={{ y: "100%" }}
        className="relative w-full rounded-t-3xl p-5 pb-8 sm:max-w-sm sm:rounded-3xl" style={{ background: "#FFFAFC", border: "1px solid rgba(212,160,175,0.22)" }} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-[#0B1D3A]">{title}</h3>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded-full hover:bg-[#F9C5D1]/30"><X className="size-4 text-[#6B5232]" /></button>
        </div>
        {children}
      </m.div>
    </m.div>
  );
}
