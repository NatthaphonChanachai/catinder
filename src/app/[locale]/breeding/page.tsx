import { redirect } from "@/i18n/navigation";

// Breeding merged into "คู่ของฉัน" (/matches). Keep this route as a redirect so
// old links/bookmarks still work.
export default async function BreedingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/matches", locale });
}
