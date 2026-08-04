import { redirect } from "@/i18n/navigation";

// "คลังความรู้" merged into "บทความ" (/articles) — one content hub instead of two.
// Kept as a redirect so old links still work.
export default async function KnowledgePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/articles", locale });
}
