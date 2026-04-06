import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPart, getSectionsList, getAllSectionSlugs, SectionSummary } from '@/lib/data';

interface Props {
  params: { partSlug: string };
}

// Generate one path per part, e.g. { partSlug: "part-9" }
export async function generateStaticParams() {
  const seen = new Set<string>();
  const params: { partSlug: string }[] = [];
  for (const { partNum } of getAllSectionSlugs()) {
    const slug = `part-${partNum}`;
    if (!seen.has(slug)) {
      seen.add(slug);
      params.push({ partSlug: slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const partNum = params.partSlug.replace(/^part-/, '');
  const part = getPart(partNum);
  if (!part) return {};
  return {
    title: `Part ${part.part} — ${part.partTitle}`,
    description: `Browse all sections in Part ${part.part} of the 2024 Ontario Building Code: ${part.partTitle}.`,
  };
}

const PART_DESCRIPTIONS: Record<string, string> = {
  '1':  'Definitions, compliance requirements, and the list of documents referenced throughout the code.',
  '2':  'The underlying objectives the building code is designed to achieve.',
  '3':  'Functional statements describing what each part of a building must do.',
  '4':  'Structural design requirements including loads, foundations, and engineering.',
  '5':  'Requirements for environmental separation: walls, roofs, windows, and moisture control.',
  '6':  'Heating, ventilation, and air-conditioning (HVAC) system requirements.',
  '7':  'Plumbing fixtures, piping, drainage, and water supply requirements.',
  '8':  'On-site sewage systems (septic tanks, leaching beds, holding tanks).',
  '9':  'The most-used part of the code. Covers houses, semi-detached homes, duplexes, triplexes, small apartments, and cottages — anything up to 3 storeys and 600 m² per floor.',
  '10': 'Requirements that apply when a building changes its major occupancy classification.',
  '11': 'Requirements for renovations, alterations, and additions to existing buildings.',
  '12': 'Energy efficiency, water conservation, and environmental requirements.',
};

export default function PartPage({ params }: Props) {
  const partNum = params.partSlug?.replace(/^part-/, '');
  const part = getPart(partNum);
  if (!part) notFound();

  const sections = getSectionsList(partNum);
  const totalArticles = sections.reduce((sum: number, s: SectionSummary) => sum + s.articleCount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="text-sm text-slate-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>›</span>
        <span className="text-slate-800">Part {part.part}</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-sm font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
            Part {part.part}
          </span>
          <span className="text-sm text-slate-400">
            {totalArticles.toLocaleString()} articles · {sections.length} sections
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">{part.partTitle}</h1>
        {PART_DESCRIPTIONS[part.part] && (
          <p className="text-slate-600 leading-relaxed max-w-2xl">
            {PART_DESCRIPTIONS[part.part]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        {sections.map((sec: SectionSummary) => (
          <Link
            key={sec.id}
            href={`/part-${part.part}/${sec.slug}`}
            className="section-card group flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <span className="font-mono text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded flex-shrink-0 w-16 text-center">
                {sec.id}
              </span>
              <div className="min-w-0">
                <h2 className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors leading-snug truncate">
                  {sec.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {sec.articleCount} article{sec.articleCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-400 flex-shrink-0 transition-colors"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
