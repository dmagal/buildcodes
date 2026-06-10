// Data loading and query helpers for the Ontario Building Code
// This file runs at build time (server-side) — never in the browser.

import fs from 'fs';
import path from 'path';
import { Part, Section, Article, ArticleSearchResult } from './types';
import { sectionSlug } from './slugs';
export { sectionSlug, slugToSectionId, partNumFromSectionSlug } from './slugs';

// ── Load raw data ─────────────────────────────────────────────────────────────

function loadParts(): Part[] {
  const filePath = path.join(process.cwd(), 'data/volume1-parsed.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);
  return data.parts as Part[];
}

// Cached at module level — loaded once per build/server start
let _parts: Part[] | null = null;
function getParts(): Part[] {
  if (!_parts) _parts = loadParts();
  return _parts;
}

// ── Part helpers ──────────────────────────────────────────────────────────────

export interface PartSummary {
  part: string;
  partTitle: string;
  slug: string;
  sectionCount: number;
  articleCount: number;
}

export function getPartsList(): PartSummary[] {
  return getParts().map((p) => ({
    part: p.part,
    partTitle: p.partTitle,
    slug: `part-${p.part}`,
    sectionCount: p.sections.length,
    articleCount: p.sections.reduce(
      (acc, sec) =>
        acc + sec.subsections.reduce((a, sub) => a + (sub.articles?.length ?? 0), 0),
      0
    ),
  }));
}

export function getPart(partNum: string | undefined): Part | undefined {
  if (!partNum) return undefined;
  // Accept either "9" or "part-9" — Next.js App Router passes the full URL segment
  const id = partNum.replace(/^part-/, '');
  return getParts().find((p) => p.part === id);
}

// ── Section helpers ───────────────────────────────────────────────────────────

export interface SectionSummary {
  id: string;
  title: string;
  slug: string;
  articleCount: number;
  subsectionCount: number;
}

export function getSectionsList(partNum: string): SectionSummary[] {
  const part = getPart(partNum);
  if (!part) return [];
  return part.sections.map((sec) => ({
    id: sec.id,
    title: sec.title,
    slug: sectionSlug(sec.id, sec.title),
    articleCount: sec.subsections.reduce((a, sub) => a + (sub.articles?.length ?? 0), 0),
    subsectionCount: sec.subsections.length,
  }));
}

export function getSection(partNum: string, sectionId: string): Section | undefined {
  const part = getPart(partNum);
  return part?.sections.find((s) => s.id === sectionId);
}

// ── Article helpers ───────────────────────────────────────────────────────────

export function getArticle(articleId: string): Article | undefined {
  for (const part of getParts()) {
    for (const sec of part.sections) {
      for (const sub of sec.subsections) {
        const found = sub.articles.find((a) => a.id === articleId);
        if (found) return found;
      }
    }
  }
}

// ── Slug helpers ──────────────────────────────────────────────────────────────
// sectionSlug, slugToSectionId, partNumFromSectionSlug are re-exported from ./slugs

// "9.8.8.1" → "9-8-8-1"  (used as HTML anchor IDs)
export function articleAnchor(articleId: string): string {
  return articleId.replace(/\./g, '-');
}


// ── Flat article list for search ──────────────────────────────────────────────

let _searchList: ArticleSearchResult[] | null = null;

export function getSearchList(): ArticleSearchResult[] {
  if (_searchList) return _searchList;

  const results: ArticleSearchResult[] = [];
  for (const part of getParts()) {
    for (const sec of part.sections) {
      for (const sub of sec.subsections) {
        for (const article of (sub.articles ?? [])) {
          const firstSentence = article.sentences?.[0]?.text ?? '';
          results.push({
            articleId: article.id,
            title: article.title,
            partNum: part.part,
            partTitle: part.partTitle,
            sectionId: sec.id,
            sectionTitle: sec.title,
            subsectionId: sub.id,
            subsectionTitle: sub.title,
            tags: article.tags ?? [],
            textSnippet: firstSentence.slice(0, 200),
            url: `/part-${part.part}/${sectionSlug(sec.id, sec.title)}#${articleAnchor(article.id)}`,
          });
        }
      }
    }
  }

  _searchList = results;
  return results;
}

// ── Cross-reference resolution ────────────────────────────────────────────────
// Maps every part/section/subsection/article/table id to its page URL so that
// in-text references ("conforms to Article 9.14.4.1.") can be hyperlinked.
// Keys are bare ids ("9", "9.14", "9.14.3", "9.14.3.1") — segment count makes
// them collision-free. Tables share digits with their parent article, so they
// get a "table:" prefix and link to the containing article's anchor.

export interface RefTarget {
  url: string;
  title: string;
}

let _refMap: Map<string, RefTarget> | null = null;

function getRefMap(): Map<string, RefTarget> {
  if (_refMap) return _refMap;

  const map = new Map<string, RefTarget>();
  for (const part of getParts()) {
    map.set(part.part, { url: `/part-${part.part}/`, title: part.partTitle });
    for (const sec of part.sections) {
      const base = `/part-${part.part}/${sectionSlug(sec.id, sec.title)}/`;
      map.set(sec.id, { url: base, title: sec.title });
      for (const sub of sec.subsections) {
        map.set(sub.id, {
          url: `${base}#sub-${sub.id.replace(/\./g, '-')}`,
          title: sub.title,
        });
        for (const article of sub.articles ?? []) {
          const articleUrl = `${base}#${articleAnchor(article.id)}`;
          map.set(article.id, { url: articleUrl, title: article.title });
          for (const table of article.tables ?? []) {
            const tableId = (table.id ?? '').replace(/^Table\s+/i, '').replace(/\.$/, '');
            if (tableId) {
              map.set(`table:${tableId}`, { url: articleUrl, title: table.title || article.title });
            }
          }
        }
      }
    }
  }

  _refMap = map;
  return map;
}

// Resolve a reference id from code text to its URL, or undefined if the
// target doesn't exist in the dataset (never emit broken links).
// "9.14.3." → subsection · "Table 9.10.3.1.-A" → pass kind 'table'.
export function resolveRef(id: string, kind?: 'table'): RefTarget | undefined {
  const map = getRefMap();
  const clean = id.replace(/\.$/, '');
  if (kind === 'table') {
    return (
      map.get(`table:${clean}`) ??
      // "9.10.3.1.-A" → containing article "9.10.3.1"
      map.get(`table:${clean.replace(/\.?-[A-Z]\d*$/, '')}`) ??
      map.get(clean.replace(/\.?-[A-Z]\d*$/, ''))
    );
  }
  return map.get(clean);
}

// ── Static path generation (used by Next.js dynamic routes) ──────────────────

export function getAllPartSlugs(): string[] {
  return getParts().map((p) => p.part);
}

export function getAllSectionSlugs(): { partNum: string; sectionSlug: string }[] {
  const result: { partNum: string; sectionSlug: string }[] = [];
  for (const part of getParts()) {
    for (const sec of part.sections) {
      result.push({ partNum: part.part, sectionSlug: sectionSlug(sec.id, sec.title) });
    }
  }
  return result;
}
