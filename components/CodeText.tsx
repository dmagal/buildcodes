import Link from 'next/link';
import { resolveRef } from '@/lib/data';

// Server component: renders code text with cross-references hyperlinked.
// Matches "Article 9.14.4.1.", "Subsection 9.14.3.", "Section 9.18.",
// "Table 9.10.3.1.-A", "Part 9" — including lists ("Articles 9.8.4.1. and
// 9.8.4.2."). "Sentence (3)" and "Clause (2)(a)" point within the same
// article, so they stay plain text. References that don't resolve to a real
// page in the dataset are left unlinked.

// keyword + first number + any ", and/or/to"-joined continuation numbers
const REF_BLOCK =
  /\b(Articles?|Subsections?|Sections?|Tables?|Parts?)(\s+)(\d[\d.]*(?:\.?-[A-Z]\d*)?\.?(?:(?:,\s*(?:and\s+|or\s+)?|\s+(?:and|or|to)\s+)\d[\d.]*(?:\.?-[A-Z]\d*)?\.?)*)/g;

// individual number token within a matched block
const NUM_TOKEN = /\d[\d.]*(?:\.?-[A-Z]\d*)?\.?/g;

function linkNumbers(numbers: string, kind: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  NUM_TOKEN.lastIndex = 0;
  while ((m = NUM_TOKEN.exec(numbers)) !== null) {
    if (m.index > last) out.push(numbers.slice(last, m.index));
    const token = m[0];
    const target = resolveRef(token, kind === 'table' ? 'table' : undefined);
    if (target) {
      out.push(
        <Link
          key={`${keyPrefix}-${m.index}`}
          href={target.url}
          title={target.title}
          className="text-blue-700 hover:text-blue-900 hover:underline"
        >
          {token}
        </Link>
      );
    } else {
      out.push(token);
    }
    last = m.index + token.length;
  }
  if (last < numbers.length) out.push(numbers.slice(last));
  return out;
}

export default function CodeText({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  REF_BLOCK.lastIndex = 0;
  while ((m = REF_BLOCK.exec(text)) !== null) {
    const [, keyword, space, numbers] = m;
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(keyword, space);
    const kind = keyword.toLowerCase().startsWith('table') ? 'table' : 'other';
    out.push(...linkNumbers(numbers, kind, `ref-${m.index}`));
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
