import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://buildcodes.ca'),
  title: {
    default: 'BuildCodes.ca — Ontario Building Code 2024',
    template: '%s — BuildCodes.ca',
  },
  description:
    'A fast, searchable, plain-English guide to the 2024 Ontario Building Code. Find any requirement by section number, topic, or keyword.',
  openGraph: {
    siteName: 'BuildCodes.ca',
    url: 'https://buildcodes.ca',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {/* ── Header ── */}
        <header className="bg-[#1a3a5c] text-white shadow-md">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors">
              <span className="text-xl font-bold tracking-tight">BuildCodes.ca</span>
              <span className="hidden sm:inline text-blue-200 text-sm font-normal">
                Ontario Building Code 2024
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-blue-100 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/search" className="text-blue-100 hover:text-white transition-colors">
                Search
              </Link>
            </nav>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1">
          {children}
        </main>

        {/* ── Footer ── */}
        <footer className="bg-slate-800 text-slate-400 text-sm mt-12">
          <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between gap-2">
            <p>
              Ontario Building Code 2024 — effective January 1, 2025
            </p>
            <div className="text-right">
              <p className="text-slate-500">
                Plain English explanations for reference only. Always verify with your local building department.
              </p>
              <p className="text-slate-600 mt-1">
                © King&apos;s Printer for Ontario, 2024. Reproduced for reference purposes.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
