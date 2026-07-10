"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Send, PawPrint } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { addXP } from "@/lib/xp";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  name: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  comments: number;
}

const SEED_POSTS: Post[] = [
  {
    id: "seed-1",
    name: "Nattaya S.",
    avatar: "🌸",
    text: "น้องมิโมะของฉันเพิ่งอายุครบ 1 ขวบ! ขอบคุณ Catinder ที่ช่วยให้รู้เรื่องโภชนาการดีขึ้นมากเลยค่ะ 🎂",
    time: "2 ชั่วโมงที่แล้ว",
    likes: 47,
    comments: 12,
  },
  {
    id: "seed-2",
    name: "Wit P.",
    avatar: "🐾",
    text: "เพิ่งพาน้องสกอตติชโฟลด์ไปฉีดวัคซีนตามที่บทความแนะนำ คุณหมอบอกสุขภาพดีมากครับ ขอบคุณ Catinder!",
    time: "5 ชั่วโมงที่แล้ว",
    likes: 32,
    comments: 8,
  },
  {
    id: "seed-3",
    name: "Pim T.",
    avatar: "✨",
    text: "ทดลองเล่นเกม Cat Compatibility แล้วได้ 94% กับน้องเมนคูนของเพื่อน 😂 แนะนำให้ทุกคนลองเล่นเลย!",
    time: "เมื่อวาน",
    likes: 89,
    comments: 23,
  },
  {
    id: "seed-4",
    name: "Suda C.",
    avatar: "🌙",
    text: "ถามหน่อยนะคะ แมวเปอร์เซียกินอาหารยี่ห้อไหนดีคะ? น้องหน้าพาวขี้เลือกมากเลย 🙈",
    time: "เมื่อวาน",
    likes: 21,
    comments: 34,
  },
  {
    id: "seed-5",
    name: "Krit A.",
    avatar: "🏆",
    text: "รวม Level Tiger แล้ว! สะสม XP จากการอ่านบทความทุกวัน ขอบคุณ Catinder ที่ทำให้ทุกวันสนุก 🐯",
    time: "2 วันที่แล้ว",
    likes: 156,
    comments: 41,
  },
];

const AVATARS = ["🐱", "🌸", "🐾", "✨", "🌙", "🏆", "🎀", "🐯", "🦁", "⭐"];

export function DiscussionBoard() {
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("catinder.discussion");
      const storedLikes = localStorage.getItem("catinder.discussionLikes");
      if (stored) setUserPosts(JSON.parse(stored) as Post[]);
      if (storedLikes) setLikedIds(new Set(JSON.parse(storedLikes) as string[]));
    } catch {}
    setMounted(true);
  }, []);

  const allPosts = [...userPosts, ...SEED_POSTS];

  function toggleLike(id: string) {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        addXP(3, "กด Like");
      }
      try { localStorage.setItem("catinder.discussionLikes", JSON.stringify([...next])); } catch {}
      return next;
    });
  }

  function submitPost(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setPosting(true);

    const newPost: Post = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)]!,
      text: text.trim(),
      time: "เมื่อกี้",
      likes: 0,
      comments: 0,
    };

    setTimeout(() => {
      setUserPosts((prev) => {
        const updated = [newPost, ...prev];
        try { localStorage.setItem("catinder.discussion", JSON.stringify(updated)); } catch {}
        return updated;
      });
      setName("");
      setText("");
      setPosting(false);
      addXP(20, "โพสต์ในชุมชน");
    }, 500);
  }

  if (!mounted) return null;

  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-6"
        >
          <h2 className="text-2xl font-extrabold">💬 พูดคุยชุมชน</h2>
          <p className="mt-1 text-sm text-muted-foreground">แชร์ประสบการณ์กับเพื่อนๆ คนรักแมว</p>
        </motion.div>

        {/* Post form */}
        <motion.form
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          onSubmit={submitPost}
          className="mb-6 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border/60"
        >
          <div className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--rose-blush)]/40">
              <PawPrint className="size-4 text-foreground/60" />
            </div>
            <div className="flex-1 space-y-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อของคุณ"
                maxLength={30}
                className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="แชร์เรื่องของน้องแมวคุณ... 🐱"
                maxLength={280}
                rows={2}
                className="w-full resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--soft-gold)]"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{text.length}/280</span>
                <button
                  type="submit"
                  disabled={!name.trim() || !text.trim() || posting}
                  className="flex items-center gap-1.5 rounded-full bg-[var(--soft-gold)] px-4 py-2 text-xs font-bold transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  <Send className="size-3.5" />
                  {posting ? "กำลังโพสต์..." : "โพสต์ (+20 XP)"}
                </button>
              </div>
            </div>
          </div>
        </motion.form>

        {/* Feed */}
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {allPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.25) }}
                className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border/60"
              >
                <div className="flex gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--rose-blush)]/40 text-lg">
                    {post.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold">{post.name}</span>
                      <span className="text-xs text-muted-foreground">{post.time}</span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed">{post.text}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={cn(
                          "flex items-center gap-1.5 text-xs font-semibold transition-colors",
                          likedIds.has(post.id)
                            ? "text-[var(--petal-pink)]"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Heart
                          className={cn("size-4 transition-all", likedIds.has(post.id) && "fill-[var(--petal-pink)] scale-110")}
                        />
                        {post.likes + (likedIds.has(post.id) ? 1 : 0)}
                      </button>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MessageCircle className="size-4" /> {post.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
