import { StudyPlanEntry } from '@/lib/types';

type WeeklyCalendarProps = {
  weekDates: string[];
  entries: StudyPlanEntry[];
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function dayNumber(date: string): string {
  return date.slice(8, 10);
}

export function WeeklyCalendar({ weekDates, entries }: WeeklyCalendarProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
      {weekDates.map((date, idx) => {
        const dayEntries = entries.filter((entry) => entry.date === date);

        return (
          <div key={date} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {DAY_LABELS[idx]}
              </span>
              <span className="text-xs text-slate-500">{dayNumber(date)}</span>
            </div>
            <div className="space-y-2">
              {dayEntries.length === 0 ? (
                <p className="text-xs text-slate-400">No study blocks</p>
              ) : (
                dayEntries.map((entry, entryIdx) => (
                  <div
                    key={`${entry.date}-${entry.start}-${entryIdx}`}
                    className="rounded-md border border-brand-100 bg-brand-50 px-2 py-1"
                  >
                    <p className="text-xs font-medium text-brand-700">{entry.start}</p>
                    <p className="text-xs text-slate-700">{entry.label}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
