import Link from 'next/link';
import { resolveRef } from '@/lib/data';

// Server component: renders an article's parsed relatedArticles ids as links.
// Ids may point at articles, subsections, or sections; ~7% reference content
// that isn't in the dataset and are silently skipped.
export default function RelatedArticles({ ids }: { ids: string[] }) {
  const related = ids
    .map((id) => ({ id, target: resolveRef(id) }))
    .filter((r): r is { id: string; target: NonNullable<ReturnType<typeof resolveRef>> } => !!r.target);

  if (related.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-slate-100">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide mr-2">
        Related
      </span>
      <span className="inline-flex flex-wrap gap-x-3 gap-y-1">
        {related.map(({ id, target }) => (
          <Link
            key={id}
            href={target.url}
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            {id} {target.title}
          </Link>
        ))}
      </span>
    </div>
  );
}
