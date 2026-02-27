import Link from 'next/link';

type PortalChoiceCardProps = {
  href: string;
  title: string;
  description: string;
  cta: string;
};

export function PortalChoiceCard({ href, title, description, cta }: PortalChoiceCardProps) {
  return (
    <div className="card flex h-full flex-col justify-between">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </div>
      <Link
        href={href}
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
      >
        {cta}
      </Link>
    </div>
  );
}
