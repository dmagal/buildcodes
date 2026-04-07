// Pure slug helpers — no Node.js APIs, safe to import from client or server code.

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')  // strip special chars (commas, &, (), /, etc.)
    .replace(/\s+/g, '-')           // spaces → hyphens
    .replace(/-+/g, '-')            // collapse runs of hyphens
    .replace(/^-|-$/g, '');         // trim leading/trailing hyphens
}

// "9.8" + "Stairs, Ramps, Handrails and Guards" → "9-8-stairs-ramps-handrails-and-guards"
// Truncates at 80 characters, trimming any trailing hyphen.
export function sectionSlug(sectionId: string, title: string): string {
  const idPart = sectionId.replace(/\./g, '-');
  const titlePart = slugify(title);
  const full = `${idPart}-${titlePart}`;
  return full.length > 80 ? full.slice(0, 80).replace(/-+$/, '') : full;
}

// "9-8-stairs-ramps-handrails-and-guards" → "9.8"
// Extracts the leading numeric prefix (stops at the first hyphen-letter transition).
// Also handles legacy format "section-9-8" as a fallback.
export function slugToSectionId(slug: string | undefined): string {
  if (!slug) return '';
  const match = slug.match(/^(\d+(?:-\d+)*)(?=-[a-zA-Z]|$)/);
  if (match) return match[1].replace(/-/g, '.');
  // Legacy format: "section-9-8"
  return slug.replace(/^section-/, '').replace(/-/g, '.');
}

// Derive part number from a section slug — works for both old and new formats.
// "9-8-stairs-ramps..." → "9"   |   "section-9-8" → "9"
export function partNumFromSectionSlug(slug: string): string {
  return slug.replace(/^section-/, '').split('-')[0];
}
