import type { Metadata } from 'next';
import { Suspense } from 'react';
import SearchClient from './SearchClient';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search the 2024 Ontario Building Code by topic, section number, or keyword.',
};

// Static export requires this page to be a static shell.
// The query param is read client-side in SearchClient via useSearchParams.
export default function SearchPage() {
  return (
    <Suspense>
      <SearchClient />
    </Suspense>
  );
}
