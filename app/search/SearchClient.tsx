'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { searchArticles } from '@/lib/search';
import { ArticleSearchResult } from '@/lib/types';
import SearchBar from '@/components/SearchBar';

export default function SearchClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const [results, setResults] = useState<ArticleSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!initialQuery.trim()) return;
    setLoading(true);
    setSearched(false);
    searchArticles(initialQuery).then((hits: ArticleSearchResult[]) => {
      setResults(hits);
      setLoading(false);
      setSearched(true);
    });
  }, [initialQuery]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Search the Building Code</h1>

      <SearchBar initialQuery={initialQuery} autoFocus />

      <div className="mt-8">
        {loading && (
          <p className="text-slate-500 text-sm">Searching…</p>
        )}

        {searched && !loading && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg mb-2">No results for &ldquo;{initialQuery}&rdquo;</p>
            <p className="text-slate-400 text-sm">Try different keywords or browse by part below.</p>
            <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
              ← Browse all parts
            </Link>
          </div>
        )}

        {results.length > 0 && (
          <>
            <p className="text-sm text-slate-500 mb-4">
              {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{initialQuery}&rdquo;
            </p>
            <div className="space-y-3">
              {results.map((r) => (
                <Link
                  key={r.articleId}
                  href={r.url}
                  className="block bg-white rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {r.articleId}
                    </span>
                    <span className="font-semibold text-slate-800">{r.title}</span>
                  </div>
                  {r.textSnippet && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-2">{r.textSnippet}</p>
                  )}
                  <p className="text-xs text-slate-400">
                    Part {r.partNum}: {r.partTitle} › {r.sectionTitle}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}

        {!initialQuery && !loading && (
          <p className="text-slate-500 text-sm mt-4">
            Enter a keyword, topic, or article number above to search all{' '}
            <Link href="/" className="text-blue-600 hover:underline">2,500+ articles</Link>.
          </p>
        )}
      </div>
    </div>
  );
}
