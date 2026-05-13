export type SportType =
  | 'bike'
  | 'virtual_bike'
  | 'run'
  | 'gym'
  | 'hyrox'
  | 'swim'
  | 'other'
  | 'hiit'

export const SPORT_COLORS: Record<string, string> = {
  bike: '#3B82F6',
  virtual_bike: '#60A5FA',
  run: '#F97316',
  gym: '#8B5CF6',
  hyrox: '#EF4444',
  swim: '#06B6D4',
  other: '#6B7280',
  hiit: '#EC4899',
}

export const SPORT_BG: Record<string, string> = {
  bike: 'bg-blue-500',
  virtual_bike: 'bg-blue-400',
  run: 'bg-orange-500',
  gym: 'bg-violet-500',
  hyrox: 'bg-red-500',
  swim: 'bg-cyan-500',
  other: 'bg-gray-500',
  hiit: 'bg-pink-500',
}

export const SPORT_BG_LIGHT: Record<string, string> = {
  bike: 'bg-blue-50',
  virtual_bike: 'bg-blue-50',
  run: 'bg-orange-50',
  gym: 'bg-violet-50',
  hyrox: 'bg-red-50',
  swim: 'bg-cyan-50',
  other: 'bg-gray-50',
  hiit: 'bg-pink-50',
}

export const SPORT_TEXT: Record<string, string> = {
  bike: 'text-blue-600',
  virtual_bike: 'text-blue-500',
  run: 'text-orange-600',
  gym: 'text-violet-600',
  hyrox: 'text-red-600',
  swim: 'text-cyan-600',
  other: 'text-gray-600',
  hiit: 'text-pink-600',
}

export const SPORT_LABELS: Record<string, string> = {
  bike: 'Cyclisme',
  virtual_bike: 'Home Trainer',
  run: 'Running',
  gym: 'Musculation',
  hyrox: 'Hyrox',
  swim: 'Natation',
  other: 'Autre',
  hiit: 'HIIT',
}

export const SPORT_ICONS: Record<string, string> = {
  bike: '🚴',
  virtual_bike: '🏠',
  run: '🏃',
  gym: '🏋️',
  hyrox: '🔴',
  swim: '🏊',
  other: '⚡',
  hiit: '💥',
}

export const SPORT_ORDER = ['bike', 'virtual_bike', 'run', 'gym', 'swim', 'hyrox', 'other', 'hiit']

export function getSportColor(sport: string): string {
  return SPORT_COLORS[sport] ?? SPORT_COLORS.other
}
