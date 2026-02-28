export const COLORS = {
  electric: '#306CB5',
  ember: '#F59E0B',
  success: '#10B981',
  danger: '#F43F5E',
  glass: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.10)',
  glassHover: 'rgba(255,255,255,0.12)',
} as const;

export const RISK_CONFIG = {
  low: { color: COLORS.success, label: 'Low' },
  medium: { color: COLORS.ember, label: 'Medium' },
  high: { color: COLORS.danger, label: 'High' },
} as const;

export const INTENSITY_CLASSES = [
  'bg-slate-800',
  'bg-emerald-900/60',
  'bg-emerald-700/60',
  'bg-emerald-500/60',
  'bg-emerald-400/80',
] as const;

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const HOUR_LABELS = ['6a', '8a', '10a', '12p', '2p', '4p', '6p', '8p', '10p', '12a'] as const;
