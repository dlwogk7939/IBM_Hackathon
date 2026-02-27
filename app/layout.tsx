import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'CampusFlow',
  description: 'Local-first university planning demo'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
              <Link href="/" className="text-xl font-bold text-brand-700">
                CampusFlow
              </Link>
              <nav className="flex items-center gap-2 text-sm">
                <Link
                  href="/student"
                  className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
                >
                  Student Portal
                </Link>
                <Link
                  href="/admin"
                  className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-brand-50 hover:text-brand-700"
                >
                  Admin Dashboard
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-7xl px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
