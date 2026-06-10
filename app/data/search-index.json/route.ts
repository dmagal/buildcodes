import { getSearchList } from '@/lib/data';

// Emitted as a static file (out/data/search-index.json) at build time.
// This is the slim client-side search index — the full parsed code
// (data/volume1-parsed.json) never leaves the build machine.
export const dynamic = 'force-static';

export async function GET() {
  return Response.json(getSearchList());
}
