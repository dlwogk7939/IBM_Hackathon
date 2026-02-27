export function parseISODate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00Z`);
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDaysUTC(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function addDaysToISO(dateStr: string, days: number): string {
  return toISODate(addDaysUTC(parseISODate(dateStr), days));
}

export function isDateInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

export function getWeekRange(termStart: string, week: number): {
  start: string;
  end: string;
} {
  const start = addDaysToISO(termStart, (week - 1) * 7);
  const end = addDaysToISO(start, 6);
  return { start, end };
}

export function getWeekDates(start: string): string[] {
  return Array.from({ length: 7 }, (_, idx) => addDaysToISO(start, idx));
}
