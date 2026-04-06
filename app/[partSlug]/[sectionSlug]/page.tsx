import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPart, getSection, getAllSectionSlugs, slugToSectionId, partNumFromSectionSlug, articleAnchor } from '@/lib/data';
import { Subsection, Article, Sentence, CodeTable as CodeTableType } from '@/lib/types';
import CodeTable from '@/components/CodeTable';

interface Props {
  params: { partSlug: string; sectionSlug: string };
}

export async function generateStaticParams() {
  return getAllSectionSlugs().map(({ partNum, sectionSlug }) => ({
    partSlug: `part-${partNum}`,
    sectionSlug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Derive partNum from sectionSlug in case partSlug param is missing (Next.js static export bug)
  const partNum = params.partSlug?.replace(/^part-/, '') || partNumFromSectionSlug(params.sectionSlug);
  const sectionId = slugToSectionId(params.sectionSlug);
  const section = getSection(partNum, sectionId);
  if (!section) return {};
  return {
    title: `Section ${section.id} — ${section.title}`,
    description: `Ontario Building Code 2024, Section ${section.id}: ${section.title}. Full official text.`,
  };
}

export default function SectionPage({ params }: Props) {
  // Derive partNum from sectionSlug as fallback — Next.js static export doesn't always pass parent params
  const partNum = params.partSlug?.replace(/^part-/, '') || partNumFromSectionSlug(params.sectionSlug);
  const sectionId = slugToSectionId(params.sectionSlug);
  const part = getPart(partNum);
  const section = getSection(partNum, sectionId);
  if (!part || !section) notFound();

  const articleCount = section.subsections.reduce(
    (sum: number, sub: Subsection) => sum + (sub.articles?.length ?? 0), 0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-slate-500 mb-6 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>›</span>
        <Link href={`/part-${part.part}`} className="hover:text-blue-600">
          Part {part.part}: {part.partTitle}
        </Link>
        <span>›</span>
        <span className="text-slate-800">{section.id}</span>
      </nav>

      <div className="flex gap-8 items-start">
        <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-6 self-start">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">In this section</p>
          <nav className="space-y-1">
            {section.subsections.map((sub: Subsection) => (
              <a key={sub.id} href={`#sub-${sub.id.replace(/\./g, '-')}`}
                 className="flex items-start gap-2 text-sm text-slate-500 hover:text-blue-600 py-1 transition-colors leading-snug">
                <span className="font-mono text-xs text-slate-400 flex-shrink-0 mt-0.5">{sub.id}</span>
                <span>{sub.title}</span>
              </a>
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                {section.id}
              </span>
              <span className="text-sm text-slate-400">
                {articleCount} articles · {section.subsections.length} subsections
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{section.title}</h1>
          </div>

          <div className="space-y-10">
            {section.subsections.map((sub: Subsection) => (
              <div key={sub.id} id={`sub-${sub.id.replace(/\./g, '-')}`} className="scroll-mt-4">
                <div className="flex items-baseline gap-3 mb-4 pb-2 border-b-2 border-slate-200">
                  <span className="font-mono text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded flex-shrink-0">
                    {sub.id}
                  </span>
                  <h2 className="text-lg font-semibold text-slate-800">{sub.title}</h2>
                </div>

                <div className="space-y-4">
                  {(sub.articles ?? []).map((article: Article) => (
                    <div key={article.id} id={articleAnchor(article.id)}
                         className="scroll-mt-4 bg-white rounded-lg border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3">
                          <span className="article-id flex-shrink-0">{article.id}</span>
                          <h3 className="font-semibold text-slate-800 leading-snug">{article.title}</h3>
                        </div>
                        <a href={`#${articleAnchor(article.id)}`}
                           className="text-slate-300 hover:text-blue-400 flex-shrink-0 mt-0.5 transition-colors"
                           title={`Link to ${article.id}`} aria-label={`Link to article ${article.id}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                          </svg>
                        </a>
                      </div>

                      {article.sentences && article.sentences.length > 0 && (
                        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                          {article.sentences.map((sentence: Sentence) => (
                            <div key={sentence.number}>
                              <p>
                                <span className="font-semibold text-slate-400 mr-1.5 select-none">({sentence.number})</span>
                                {sentence.text}
                              </p>
                              {sentence.clauses && sentence.clauses.length > 0 && (
                                <ul className="mt-1.5 space-y-1 ml-6">
                                  {sentence.clauses.map((clause: string, ci: number) => (
                                    <li key={ci} className="text-slate-700">{clause}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {article.tables && article.tables.length > 0 && (
                        <div className="mt-4 space-y-4">
                          {article.tables.map((table: CodeTableType) => (
                            <CodeTable key={table.id} table={table} />
                          ))}
                        </div>
                      )}

                      {article.tags && article.tags.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                          {article.tags.map((tag: string) => (
                            <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}
                                  className="text-xs text-slate-500 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 px-2 py-0.5 rounded-full transition-colors">
                              {tag}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
