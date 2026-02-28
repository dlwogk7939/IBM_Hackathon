import { Inter, JetBrains_Mono } from 'next/font/google';
import { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MaintAIn \u2014 AI-Powered Study Intelligence',
  description:
    'You\u2019re studying. But are you studying the right things? MaintAIn tracks time, focus, and deadline pressure \u2014 then tells you what\u2019s putting your grades at risk.',
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} ${jetbrains.variable} font-sans`}>
      {children}
    </div>
  );
}
