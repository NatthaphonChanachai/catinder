import { ALL_ARTICLES } from "@/constants/sample-content";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { BackToTop } from "@/components/shared/back-to-top";
import { ArticleReader } from "@/components/features/articles/article-reader";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return ALL_ARTICLES.map((a) => ({ slug: a.slug }));
}

export default async function ArticleSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = ALL_ARTICLES.find((a) => a.slug === slug);
  if (!article) notFound();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ArticleReader slug={slug} />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
