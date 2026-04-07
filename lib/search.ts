'use client';

import Fuse from 'fuse.js';
import { ArticleSearchResult } from './types';
import { sectionSlug } from './slugs';

let fuse: Fuse<ArticleSearchResult> | null = null;
// loadPromise is set exactly once and resolves when fuse is ready (or failed)
let loadPromise: Promise<void> | null = null;

async function initFuse(): Promise<void> {
  const res = await fetch('/data/volume1-parsed.json');
  if (!res.ok) throw new Error(`Failed to fetch search data: ${res.status}`);
  const data = await res.json();

  const records: ArticleSearchResult[] = [];
  for (const part of data.parts) {
    for (const sec of part.sections ?? []) {
      for (const sub of sec.subsections ?? []) {
        for (const article of sub.articles ?? []) {
          const firstSentence = article.sentences?.[0]?.text ?? '';
          records.push({
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
            url: `/part-${part.part}/${sectionSlug(sec.id, sec.title)}#${article.id.replace(/\./g, '-')}`,
          });
        }
      }
    }
  }

  fuse = new Fuse(records, {
    keys: [
      { name: 'title',       weight: 1.0 },
      { name: 'tags',        weight: 0.8 },
      { name: 'textSnippet', weight: 0.5 },
      { name: 'articleId',   weight: 0.3 },
    ],
    threshold: 0.35,
    includeScore: true,
    minMatchCharLength: 2,
  });
}

export async function searchArticles(query: string): Promise<ArticleSearchResult[]> {
  // Only create the promise once — subsequent calls reuse it
  if (!loadPromise) loadPromise = initFuse().catch((err) => {
    console.error('Search index failed to load:', err);
    loadPromise = null; // Allow retry on next call
  });
  await loadPromise;

  if (!fuse || !query.trim()) return [];
  return fuse.search(query).slice(0, 20).map((r) => r.item);
}
