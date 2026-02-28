'use client';

import { useDashboard, type Role } from '../../_lib/context';
import { cn } from '../../_lib/utils';

const roles: { value: Role; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'educator', label: 'Educator' },
];

export function Navbar() {
  const { role, setRole } = useDashboard();
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0F1219]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <span className="text-lg font-bold tracking-tight text-white">
          maint<span className="text-[#306CB5]">AI</span>n
        </span>
        <div className="flex gap-1 rounded-lg bg-white/5 p-1">
          {roles.map((r) => (
            <button
              key={r.value}
              onClick={() => setRole(r.value)}
              className={cn(
                'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                role === r.value
                  ? 'bg-[#306CB5] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
