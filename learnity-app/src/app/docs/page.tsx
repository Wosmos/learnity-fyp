import Link from "next/link";
import { PublicLayout } from "@/components/layout/AppLayout";
import { getDocsByCategory } from "@/lib/docs";
import { Book, FileText, Folder, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Comprehensive documentation for the Learnity platform, including guides, API references, and implementation details.",
};

export default function DocsIndexPage() {
  const docsByCategory = getDocsByCategory();
  const categories = Object.keys(docsByCategory).sort();

  // Count total docs
  const totalDocs = Object.values(docsByCategory).reduce(
    (acc, docs) => acc + docs.length,
    0
  );

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-6">
                <Book className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-600">
                  Documentation Hub
                </span>
              </div>

              <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">
                Learnity{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Documentation
                </span>
              </h1>

              <p className="text-xl text-slate-600 mb-8">
                Comprehensive guides, implementation details, and technical
                documentation for the Learnity platform.
              </p>

              <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{totalDocs} Documents</span>
                </div>
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  <span>{categories.length} Categories</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Grid */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto">
            {categories.map((category) => (
              <div key={category} className="mb-16">
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full" />
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {category}
                  </h2>
                  <span className="text-sm font-semibold text-slate-400 ml-2">
                    ({docsByCategory[category].length})
                  </span>
                </div>

                {/* Documentation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {docsByCategory[category].map((doc) => (
                    <Link
                      key={doc.slug}
                      href={`/docs/${doc.slug}`}
                      className="group"
                    >
                      <div className="h-full bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                        {/* Icon */}
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {doc.metadata.title}
                        </h3>

                        {/* Description */}
                        {doc.metadata.description && (
                          <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                            {doc.metadata.description}
                          </p>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Read More
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

// Enable static generation
export const dynamic = "force-static";