import { notFound } from "next/navigation";
import Link from "next/link";
import { PublicLayout } from "@/components/layout/AppLayout";
import { getDocBySlug, getAllDocSlugs } from "@/lib/docs";
import { ArrowLeft, Calendar, Tag, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import "@/styles/markdown.css";
import "prismjs/themes/prism-tomorrow.css";

interface DocPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all docs
export async function generateStaticParams() {
  const slugs = getAllDocSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

// Generate metadata for each doc
export async function generateMetadata({
  params,
}: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);

  if (!doc) {
    return {
      title: "Documentation Not Found",
    };
  }

  return {
    title: doc.metadata.title,
    description: doc.metadata.description,
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              {/* Back Button */}
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors mb-6 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Documentation
              </Link>

              {/* Category Badge */}
              {doc.metadata.category && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full mb-4">
                  <BookOpen className="w-3 h-3 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-600">
                    {doc.metadata.category}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                {doc.metadata.title}
              </h1>

              {/* Description */}
              {doc.metadata.description && (
                <p className="text-lg text-slate-600 mb-6">
                  {doc.metadata.description}
                </p>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                {doc.metadata.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(doc.metadata.date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {doc.metadata.tags && doc.metadata.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <div className="flex gap-2">
                      {doc.metadata.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <article className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
              <div
                className="markdown-content prose prose-slate max-w-none
                  prose-headings:font-black prose-headings:tracking-tight
                  prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8
                  prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-200
                  prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-6
                  prose-h4:text-xl prose-h4:mb-2 prose-h4:mt-4
                  prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
                  prose-a:text-blue-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-slate-900 prose-strong:font-bold
                  prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:before:content-[''] prose-code:after:content-['']
                  prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:p-6 prose-pre:overflow-x-auto
                  prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                  prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
                  prose-li:text-slate-700 prose-li:my-2
                  prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600
                  prose-img:rounded-xl prose-img:shadow-lg
                  prose-table:w-full prose-table:border-collapse
                  prose-th:bg-slate-100 prose-th:p-3 prose-th:text-left prose-th:font-bold prose-th:border prose-th:border-slate-300
                  prose-td:p-3 prose-td:border prose-td:border-slate-300
                  prose-hr:border-slate-200 prose-hr:my-8"
                dangerouslySetInnerHTML={{ __html: doc.htmlContent }}
              />
            </article>

            {/* Navigation */}
            <div className="mt-8 flex justify-center">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                View All Documentation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

// Enable static generation
export const dynamic = "force-static";
