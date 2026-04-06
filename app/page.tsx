import Link from 'next/link';
import { getPartsList, PartSummary } from '@/lib/data';
import SearchBar from '@/components/SearchBar';

const PART_DESCRIPTIONS: Record<string, string> = {
  '1':  'General compliance, definitions, and referenced documents',
  '2':  'Objectives of the building code',
  '3':  'Functional statements for all building types',
  '4':  'Structural loads, foundations, and engineering requirements',
  '5':  'Walls, roofs, and moisture management',
  '6':  'Heating, ventilation, and air conditioning (HVAC)',
  '7':  'Plumbing systems, fixtures, and drainage',
  '8':  'Sewage systems and septic design',
  '9':  'Houses, additions, cottages, and small buildings',
  '10': 'Change of use and occupancy requirements',
  '11': 'Renovation and heritage building requirements',
  '12': 'Energy efficiency and resource conservation',
};

const SUGGESTIONS = [
  'deck railing height',
  'basement ceiling height',
  'egress window',
  'fire separation',
  'stair rise and run',
  'smoke alarm',
  'secondary suite',
  'minimum ceiling height',
  'fire alarm requirements',
];

export default function HomePage() {
  const parts = getPartsList();
  const totalArticles = parts.reduce((sum: number, p: PartSummary) => sum + p.articleCount, 0);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-[#1a3a5c] text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-blue-500/20 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
            Updated to 2024 Code · Effective Jan 1, 2025
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Ontario Building Code 2024
          </h1>
          <p className="text-blue-200 text-lg mb-8">
            {totalArticles.toLocaleString()} articles. Free, searchable, mobile-friendly.
          </p>

          <SearchBar />

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <Link
                key={s}
                href={`/search?q=${encodeURIComponent(s)}`}
                className="text-xs bg-white/10 hover:bg-white/20 text-blue-100 px-3 py-1.5 rounded-full transition-colors"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Parts grid ── */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-semibold text-slate-700 mb-6">Browse by Part</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {parts.map((p: PartSummary) => {
            const isPart9 = p.part === '9';
            return (
              <Link
                key={p.part}
                href={`/part-${p.part}`}
                className={`part-card group relative ${
                  isPart9
                    ? 'border-blue-400 ring-1 ring-blue-300 bg-blue-50/50'
                    : ''
                }`}
              >
                {isPart9 && (
                  <span className="absolute top-3 right-3 text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                    isPart9 ? 'text-blue-700 bg-blue-100' : 'text-blue-600 bg-blue-50'
                  }`}>
                    Part {p.part}
                  </span>
                  <span className="text-xs text-slate-400 mr-16">
                    {p.articleCount.toLocaleString()} articles
                  </span>
                </div>
                <h3 className={`font-semibold leading-snug transition-colors ${
                  isPart9
                    ? 'text-blue-900 group-hover:text-blue-700'
                    : 'text-slate-800 group-hover:text-blue-700'
                }`}>
                  {p.partTitle}
                </h3>
                <p className="text-sm text-slate-500 mt-1 leading-snug">
                  {PART_DESCRIPTIONS[p.part] ?? ''}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
