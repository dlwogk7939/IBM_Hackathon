import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} ${jetbrains.variable} font-sans fixed inset-0 z-50 overflow-y-auto bg-[#0F1219] sl-scrollbar`}>
      {children}
    </div>
  );
}
