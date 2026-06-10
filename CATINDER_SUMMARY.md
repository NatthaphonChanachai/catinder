# 🐾 Catinder — สรุปสิ่งที่ทำไปแล้วและฟีเจอร์ทั้งหมด

> โปรเจกต์นี้เป็น Landing Page สำหรับวิชา **ENT531 - Startup Incubation** และ **BUS531 - eCommerce and Online Business Management**  
> ทีม: **Suchanayasinee Trisuk** (CEO & CTO) · **Tanasorn Thongkaew** (COO)

---

## สิ่งที่ทำไปแล้วทั้งหมด (Changelog)

### รอบแรก — สร้างเว็บหลัก
- สร้างโปรเจกต์ด้วย **Vite + React 19 + Tailwind CSS v4**
- ติดตั้ง library หลัก: `framer-motion`, `canvas-confetti`, `lucide-react`
- สร้าง 9 section ครบ: Navbar, Hero, SwipeDemo, HowItWorks, Features, BreedSpotlight, SocialProof, Waitlist, Footer
- ออกแบบ color palette หลัก: สีส้ม `#F97316` บน background ขาว/ครีม

### รอบสอง — เพิ่ม Firebase Auth + i18n + Quiz
- ใส่รูปแมวจริงจากไฟล์ `img` ที่ให้มา (7 สายพันธุ์)
- สร้างระบบ Sign In / Sign Up ด้วย **Firebase Authentication** (Google + Email/Password)
- สร้าง Onboarding Quiz 4 ขั้นตอน ที่เด้งขึ้นหลัง login ครั้งแรก
- เพิ่มระบบ **สลับภาษาไทย/อังกฤษ** พร้อม translation ครบทุก section
- เพิ่ม Auth Gate บน SwipeDemo (ต้อง login ก่อนถึงจะกด Like/Pass ได้)

### รอบสาม — ปรับ UI + รูปภาพ
- เปลี่ยน font จาก Plus Jakarta Sans → **Space Grotesk** (ดูทันสมัย เหมาะกับ startup brand)
- ย้ายรูปแมวไปที่ `public/img/` เพื่อให้ Vite serve ได้โดยตรง
- ปรับ **ปุ่มเปลี่ยนภาษา** เป็น `[TH | EN]` pill toggle สีส้มแสดงภาษาที่ active
- เปลี่ยน emoji ทั้งหมดเป็น **lucide-react icons** ที่ดูสวยงามกว่า
- แก้สายพันธุ์ Leo จาก British Shorthair → **Persian Long Hair** ให้ตรงกับรูป
- เปิดใช้งาน Firebase จริงด้วย config จาก project `catinder-d4c54`

### รอบสี่ — ปรับ Content ตาม Pitch Deck
- อัปเดต Tagline หลักให้ตรง pitch: **"No More Random Breeding – Just Verified Love."**
- อัปเดต Hero เน้น: แมวพันธุ์แท้, เจ้าของฟาร์มแมว, นักเพาะพันธุ์มืออาชีพ
- อัปเดต Features 4 ข้อให้ตรง pitch deck: Systems Credibility, Pedigree Matching Engine, Traceability, Specialized Service
- อัปเดต HowItWorks ให้สื่อถึง Pedigree Profile → Matching Engine → Pedigree Service
- อัปเดต **Stats** ให้ตรงตัวเลขใน pitch: **฿40B+** (Thai Pet Market), **45%** (Growth), **98%** (Satisfaction)
- อัปเดต Breed Spotlight subtitle: เริ่มที่ Bangkok กับ Scottish Fold & British Shorthair
- เพิ่มชื่อ **Founder Team** ที่ Footer
- อัปเดต Copyright เป็น **© 2026 Catinder · ENT531 & BUS531**

---

## ลูกเล่นทั้งหมดในเว็บ

### Navbar — แถบเมนูด้านบน
- **Sticky + blur effect**: เมื่อ scroll ลงมา navbar จะกลายเป็น frosted glass (backdrop blur)
- **ปุ่มเปลี่ยนภาษา TH/EN**: pill toggle สีส้ม = ภาษาที่ active อยู่
- **Smooth scroll**: กดลิงก์ menu จะ scroll ไปยัง section นั้นอย่างนุ่มนวล
- **Mobile hamburger menu**: บนมือถือจะมีปุ่ม ☰ ที่กดแล้ว dropdown menu ออกมา
- **User avatar dropdown**: หลัง login จะเห็นรูปโปรไฟล์ + ชื่อ กดแล้วมีเมนู Sign Out

### Hero — หน้าแรก
- **Floating cat cards**: รูปแมว 3 ใบลอยขึ้นลงอัตโนมัติ (float animation แต่ละใบ delay ต่างกัน)
- **Paw pattern background**: ลาย🐾 โปร่งแสงเป็น background texture
- **Gradient glow blobs**: วงกลมเรืองแสงสีส้มอยู่มุมขวาบนและซ้ายล่าง
- **Fade-up animation**: ทุก element เข้ามาแบบ fade + slide up ทีละชิ้น
- **Scroll indicator**: ลูกศรชี้ลงที่กระพริบ bounce ที่ด้านล่าง

### SwipeDemo — จับคู่แมว
- **Drag to swipe**: ลากการ์ดซ้าย/ขวาด้วยนิ้วหรือเมาส์ได้จริง
- **Arrow key support**: กด ← → บน keyboard เพื่อ pass/like
- **Like / Pass buttons**: ปุ่มด้านล่างการ์ดกด hover จะมี scale + float up
- **Card stack effect**: แมว 3 ใบซ้อนกัน ใบหลังจะเล็กกว่าและเยื้องลงนิดหน่อย
- **LIKE / NOPE stamp**: เมื่อลาก จะมีตัวอักษร LIKE (ส้ม) หรือ NOPE (แดง) โผล่บนการ์ด
- **Confetti animation**: เมื่อ swipe right จะยิง confetti สีส้มทั่วหน้าจอ
- **Toast notification**: แจ้งเตือน "จับคู่สำเร็จ!" หรือ "ข้ามแล้ว" ด้านบน
- **Auth Gate overlay**: ถ้ายังไม่ login กดแล้วจะมี overlay เบลอขึ้นมาพร้อมปุ่ม Sign In
- **All seen state**: เมื่อดูครบทุกใบ จะมีหน้า empty state พร้อมปุ่ม Start Over

### HowItWorks — วิธีใช้งาน
- **Animated step cards**: แต่ละ card slide up เข้ามาเมื่อ scroll ถึง
- **Orange arrow connectors**: ลูกศรกลมสีส้มระหว่าง step (scale animation เมื่อ scroll ถึง)
- **Hover lift effect**: hover บน card จะยกขึ้น + shadow เข้ม

### Features — ฟีเจอร์หลัก
- **Grid layout**: 4 card เรียงกัน responsive
- **Hover card effect**: card ยกขึ้น + border สีส้ม + shadow เมื่อ hover
- **Lucide icons**: Shield, FlaskConical, ClipboardList, Users แทน emoji

### BreedSpotlight — สายพันธุ์
- **Horizontal scroll**: card เรียงแนวนอน scroll ได้ ซ่อน scrollbar
- **Hover zoom image**: รูปแมวใน card จะ zoom เล็กน้อยเมื่อ hover
- **Card lift + orange border**: card ยกขึ้นและ border กลายเป็นสีส้มเมื่อ hover
- รูปภาพ **local จริง** จาก `public/img/`: British Shorthair, Scottish Fold, Persian, Maine Coon, Ragdoll, Siamese

### SocialProof — ตัวเลขและรีวิว
- **Animated counters**: ตัวเลข ฿40B+, 45%, 98% จะ count ขึ้นเมื่อ scroll ถึง section
- **Intersection Observer**: ตัวเลข animate ครั้งเดียวเมื่อมองเห็น
- **Review cards**: 3 review card พร้อมดาว 5 ดาว, รูปโปรไฟล์, ชื่อ, สายพันธุ์

### Waitlist — จองสิทธิ์
- **Email validation**: กรอก email ผิด format จะขึ้น error ทันที
- **Success state**: หลัง submit จะมี checkmark animation + ข้อความยืนยัน
- **Gradient background**: ไล่สีส้ม-เหลืองทั้ง section
- **Decorative blobs**: วงกลมโปร่งแสงตกแต่ง

### Auth Modal — เข้าสู่ระบบ
- **Backdrop blur**: พื้นหลัง blur + dim เมื่อ modal เปิด
- **Google Sign In**: กดปุ่มเดียว popup Google account
- **Email/Password**: form Sign In และ Sign Up สลับกันได้
- **Spring animation**: modal เด้งเข้ามาแบบ spring physics
- **Error messages**: แสดง error แยกแบบ wrong-password vs general error
- **Firebase real**: เชื่อมต่อ Firebase project `catinder-d4c54` จริง

### Onboarding Quiz — แบบสอบถาม
- **Auto-triggers after login**: เด้งขึ้นอัตโนมัติหลัง login ครั้งแรก (ครั้งเดียว)
- **4 ขั้นตอน**: บทบาท → สายพันธุ์ → เมือง → เป้าหมาย
- **บทบาท 4 ตัวเลือก**: เจ้าของฟาร์มแมว / นักเพาะพันธุ์มืออาชีพ / ผู้เพาะพันธุ์งานอดิเรก / **เจ้าของแมวทั่วไป**
- **เป้าหมาย 4 ตัวเลือก**: คู่ผสมพันธุ์ / ลูกแมว Pedigree / ทั้งสองอย่าง / **แค่ดูแมวน่ารัก**
- **Progress bar**: แถบความคืบหน้าที่ animate ไปเรื่อยๆ พร้อม % บอก
- **Slide transition**: หน้าเคลื่อนที่ซ้าย/ขวาเมื่อกด Next/Back
- **Firestore save**: บันทึก `quizDone`, `quizAnswers`, `quizCompletedAt` ลง Firestore — ไม่เด้งซ้ำแม้เปลี่ยนอุปกรณ์
- **LocalStorage fallback**: ใช้ localStorage เป็น backup กรณี Firestore ใช้ไม่ได้
- **Skip option**: ข้ามได้ บันทึก `quizSkipped: true` ลง Firestore

### Health Passport — เอกสาร tab
- **อัปโหลดเอกสาร**: ใบ Pedigree, สมุดวัคซีน, ใบรับรองสุขภาพ, ผลตรวจสัตวแพทย์, อื่นๆ
- **Firebase Storage**: ไฟล์เก็บที่ `cat-documents/{catId}/` พร้อม progress bar ขณะอัปโหลด
- **Firestore**: collection `catDocuments` เก็บ `{catId, catName, ownerUid, type, url, status, reviewNote}`
- **Status badges**: รอตรวจสอบ (เหลือง) / ยืนยันแล้ว (เขียว) / ไม่ผ่าน (แดง + เหตุผล)
- **Badge header**: แสดง "X ยืนยัน" บน cat header เมื่อมีเอกสารผ่านการตรวจแล้ว

### Support Chat (`/support`)
- **ทุก user**: เปิด chat กับทีมงาน Catinder ได้ผ่านปุ่ม "ติดต่อทีมงาน" ใน navbar dropdown
- **Firestore**: `supportChats/{userId}` + subcollection `messages`
- **Quick-reply**: 3 ตัวเลือกข้อความด่วนสำหรับ user ใหม่ที่ยังไม่มีข้อความ
- **Admin**: เห็น support chat ทุกคนใน AdminPage → tab "Support", ตอบกลับได้เลย

### AdminPage — tabs เพิ่มเติม
- **Tab "เอกสาร"**: แสดงเอกสารทั้งหมด, badge แดงจำนวน pending, ปุ่มยืนยัน/ไม่ผ่าน + modal ใส่เหตุผล
- **Tab "Support"**: 2-panel layout — รายชื่อ chat ซ้าย, chat window ขวา, ตอบกลับได้ inline

### Language (ภาษา)
- **สลับ TH/EN ได้ทุกส่วน**: ทุก text บนเว็บสลับภาษาพร้อมกันทันที
- **Persist ใน localStorage**: เลือกภาษาแล้วปิดเปิดใหม่ยังจำ
- **ครอบคลุมทุก section**: Navbar, Hero, SwipeDemo, HowItWorks, Features, BreedSpotlight, SocialProof, Waitlist, Footer, Auth Modal, Quiz

---

## Tech Stack

| เทคโนโลยี | การใช้งาน |
|---|---|
| Vite 8 + React 19 | Core framework |
| Tailwind CSS v4 | Utility CSS (no config file) |
| Framer Motion | Animation ทุกชนิด |
| Canvas Confetti | Confetti เมื่อ swipe right |
| Lucide React | Icons ทุกตัว |
| Firebase Auth v12 | Google + Email login |
| Space Grotesk | Font หลัก (Google Fonts) |

---

## โครงสร้างไฟล์สำคัญ

```
src/
├── App.jsx                    # Root component
├── firebase.js                # Firebase config (real credentials)
├── data/cats.js               # ข้อมูลแมว + local image paths
├── contexts/
│   ├── AuthContext.jsx        # Auth state + Firebase functions
│   └── LanguageContext.jsx    # i18n state + t() function
├── i18n/
│   ├── en.js                  # English translations
│   └── th.js                  # Thai translations
├── components/
│   ├── Navbar.jsx             # Fixed header + auth + lang toggle
│   ├── Hero.jsx               # Hero section
│   ├── SwipeDemo.jsx          # Card swipe interaction
│   ├── HowItWorks.jsx         # 3-step process
│   ├── Features.jsx           # 4 feature cards
│   ├── BreedSpotlight.jsx     # Horizontal breed scroll
│   ├── SocialProof.jsx        # Stats + testimonials
│   ├── Waitlist.jsx           # Email signup form
│   ├── Footer.jsx             # Footer + team credits
│   ├── AuthModal.jsx          # Sign in/up modal
│   └── OnboardingQuiz.jsx     # Post-login quiz
└── img/                       # ต้นฉบับรูปแมว (source)

public/
└── img/                       # รูปแมวที่ serve บนเว็บ
    ├── Scottish-fold-mochi.png
    ├── Persian-Long-Hair-Leo.png
    ├── Persian_dollface_Luna.png
    ├── Maine-Coon.png
    ├── Ragdoll.png
    ├── Siamese_Cat.png
    └── British-Shorthair.png
```

---

## วิธีรันเว็บ

```bash
npm run dev      # รัน dev server ที่ localhost:5173
npm run build    # build สำหรับ production
npm run preview  # preview production build
```

## ก่อนเทส Firebase ต้องทำ (ครั้งเดียว)
1. ไป [console.firebase.google.com](https://console.firebase.google.com) → Project `catinder-d4c54`
2. Authentication → Sign-in method → เปิด **Google** และ **Email/Password**
3. ตรวจว่า `localhost` อยู่ใน Authorized domains

---

---

## Changelog ล่าสุด

### รอบล่าสุด — Pet Document Verification + Support Chat
- **Health Passport tab "เอกสาร"**: อัปโหลดใบ Pedigree / สมุดวัคซีน / ใบรับรองสุขภาพ ไปยัง Firebase Storage
- สถานะเอกสาร: รอตรวจสอบ / ยืนยันแล้ว / ไม่ผ่าน (พร้อมเหตุผลจาก admin)
- แมวที่มีเอกสารยืนยันแล้วแสดง badge "X ยืนยัน" บน Health Passport header
- **Support Chat** ที่ `/support` — แชทกับทีมงาน Catinder, มี quick-reply suggestions
- **AppNavbar dropdown**: เพิ่มปุ่ม "ติดต่อทีมงาน" นำทางไปหน้า Support Chat
- **AdminPage tab "เอกสาร"**: คิวตรวจสอบเอกสาร, badge แดงแสดงจำนวนรอตรวจ, กดยืนยัน/ไม่ผ่าน + ระบุเหตุผล
- **AdminPage tab "Support"**: เห็น support chat ทุกคน, ตอบกลับได้เลยใน panel เดียว

### Health Passport Freemium
- **Free tier จำกัด 10 บันทึกต่อแมว** — progress bar แสดงการใช้งาน, ปุ่มเพิ่มล็อคเมื่อเต็ม
- **Export PDF ล็อคสำหรับ Free** — เห็นปุ่มแต่กดไม่ได้, trigger upgrade modal
- **Upgrade Modal** แสดง perks ครบ + ราคา ฿299/เดือน
- **Banner เตือน** เมื่อถึง limit พร้อมปุ่ม "ดู Premium"
- Premium user (`isPremium: true` ใน Firestore) ข้ามข้อจำกัดทั้งหมด

### Fix 404, Quiz Firestore, Regular Cat Owner options
- สร้าง **`vercel.json`**: rewrite ทุก route → `index.html` แก้ปัญหา 404 เมื่อเปิด URL ตรง เช่น `/dashboard`
- **Quiz บันทึกลง Firestore** แทน localStorage อย่างเดียว: `quizDone`, `quizAnswers`, `quizCompletedAt`
- เพิ่มตัวเลือก **"เจ้าของแมวทั่วไป"** และ **"แค่ดูแมวน่ารัก"** ในแบบสอบถาม

---

*สร้างโดย Suchanayasinee Trisuk & Tanasorn Thongkaew — ENT531 & BUS531, 2026*
