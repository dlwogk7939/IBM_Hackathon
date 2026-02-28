'use client';

import { cn } from '../../_lib/utils';

type Variant = 'watsonx' | 'granite' | 'maintain';

const styles: Record<Variant, string> = {
  watsonx: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  granite: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  maintain: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const labels: Record<Variant, string> = {
  watsonx: 'IBM watsonx',
  granite: 'Granite',
  maintain: 'maintAIn',
};

export function AIBadge({ variant = 'watsonx' }: { variant?: Variant }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium', styles[variant])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[variant]}
    </span>
  );
}
