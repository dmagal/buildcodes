'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchArticles } from '@/lib/search';
import { ArticleSearchResult } from '@/lib/types';

interface SearchBarProps {
  initialQuery?: string;   // Pre-fill on the /search page
  autoFocus?: boolean;
}

export default function SearchBar({ initialQuery = '', autoFocus = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ArticleSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Run search as the user types
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      const hits = await searchArticles(query);
      setResults(hits.slice(0, 8)); // Show up to 8 in dropdown
      setOpen(hits.length > 0);
      setLoading(false);
    }, 200); // 200ms debounce
    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function handleSelect(result: ArticleSearchResult) {
    setOpen(false);
    router.push(result.url);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Search the building code…"
            autoFocus={autoFocus}
            className="w-full px-5 py-3.5 pr-14 rounded-xl text-slate-800 bg-white shadow-lg text-base
                       border-2 border-transparent focus:border-blue-400 focus:outline-none
                       placeholder:text-slate-400 transition-colors"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700
                       text-white p-2 rounded-lg transition-colors"
            aria-label="Search"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Dropdown results */}
      {open && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          {results.map((r) => (
            <button
              key={r.articleId}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-0"
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                  {r.articleId}
                </span>
                <span className="text-sm font-semibold text-slate-800 truncate">{r.title}</span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                Part {r.partNum} · {r.sectionTitle}
              </p>
            </button>
          ))}
          <button
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            className="w-full text-center px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 font-medium transition-colors"
          >
            See all results for &ldquo;{query}&rdquo; →
          </button>
        </div>
      )}
    </div>
  );
}
