import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MaintAIn — AI-Powered Study Intelligence',
  description:
    'Study analytics that predict burnout. A Chrome extension that tracks focus, flags late-night spikes, and maps deadline pressure.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
