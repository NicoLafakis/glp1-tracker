import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, differenceInDays, subDays } from 'date-fns';
import type { Injection, MedicationLevel, MedicationSettings, MuscleEntry, MuscleHealthScore } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEE, MMM d, yyyy');
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function getCurrentDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getCurrentTime(): string {
  return format(new Date(), 'HH:mm');
}

// Pharmacokinetic calculation for GLP-1 medications
// Uses exponential decay model based on half-life
export function calculateMedicationLevels(
  injections: Injection[],
  settings: MedicationSettings,
  daysToCalculate: number = 30
): MedicationLevel[] {
  const levels: MedicationLevel[] = [];
  const now = Date.now();
  const halfLifeMs = settings.halfLifeDays * 24 * 60 * 60 * 1000;
  const decayConstant = Math.log(2) / halfLifeMs;

  // Calculate levels for each hour over the specified days
  const hoursToCalculate = daysToCalculate * 24;
  const hourMs = 60 * 60 * 1000;

  for (let i = hoursToCalculate; i >= 0; i--) {
    const timestamp = now - (i * hourMs);
    let totalLevel = 0;

    // Sum contributions from all injections
    for (const injection of injections) {
      const injectionTime = injection.timestamp;
      if (injectionTime <= timestamp) {
        const timeSinceInjection = timestamp - injectionTime;
        // Exponential decay: level = 100 * e^(-λt)
        const contribution = 100 * Math.exp(-decayConstant * timeSinceInjection);
        totalLevel += contribution;
      }
    }

    // Cap at 100% (in case of overlapping doses)
    levels.push({
      timestamp,
      level: Math.min(totalLevel, 100)
    });
  }

  return levels;
}

// Get current medication level
export function getCurrentMedicationLevel(
  injections: Injection[],
  settings: MedicationSettings
): number {
  const levels = calculateMedicationLevels(injections, settings, 1);
  return levels.length > 0 ? levels[levels.length - 1].level : 0;
}

// Calculate Muscle Health Score (0-100)
export function calculateMuscleHealthScore(entry: MuscleEntry): MuscleHealthScore {
  // Target values based on common recommendations for GLP-1 users
  const proteinTarget = 100; // grams per day (1g per lb of goal weight typical)
  const waterTarget = 64; // oz per day
  const fiberTarget = 30; // grams per day
  const exerciseTarget = 30; // minutes of strength training

  // Calculate individual scores (0-25 each, total 100)
  const proteinScore = Math.min((entry.proteinGrams / proteinTarget) * 25, 25);
  const hydrationScore = Math.min((entry.waterOz / waterTarget) * 25, 25);
  const fiberScore = Math.min((entry.fiberGrams / fiberTarget) * 25, 25);

  let exerciseScore = 0;
  if (entry.strengthTraining && entry.strengthMinutes) {
    exerciseScore = Math.min((entry.strengthMinutes / exerciseTarget) * 25, 25);
  }

  const totalScore = proteinScore + hydrationScore + fiberScore + exerciseScore;

  return {
    date: entry.date,
    score: Math.round(totalScore),
    proteinScore: Math.round(proteinScore),
    hydrationScore: Math.round(hydrationScore),
    fiberScore: Math.round(fiberScore),
    exerciseScore: Math.round(exerciseScore)
  };
}

// Get score color based on value
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-primary';
  if (score >= 40) return 'text-warning';
  return 'text-error';
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-success';
  if (score >= 60) return 'bg-primary';
  if (score >= 40) return 'bg-warning';
  return 'bg-error';
}

// Storage helpers
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// Calculate days since last injection
export function daysSinceLastInjection(injections: Injection[]): number | null {
  if (injections.length === 0) return null;

  const sorted = [...injections].sort((a, b) => b.timestamp - a.timestamp);
  const lastInjection = sorted[0];
  const lastDate = parseISO(lastInjection.date);

  return differenceInDays(new Date(), lastDate);
}

// Get suggested next injection date (typically 7 days for weekly medications)
export function getNextInjectionDate(injections: Injection[], intervalDays: number = 7): Date | null {
  if (injections.length === 0) return null;

  const sorted = [...injections].sort((a, b) => b.timestamp - a.timestamp);
  const lastInjection = sorted[0];
  const lastDate = parseISO(lastInjection.date);

  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + intervalDays);

  return nextDate;
}

// Convert weight between units
export function convertWeight(value: number, from: 'lbs' | 'kg', to: 'lbs' | 'kg'): number {
  if (from === to) return value;
  if (from === 'lbs' && to === 'kg') return value * 0.453592;
  return value * 2.20462;
}

// Calculate weight statistics
export function calculateWeightTrend(
  weights: { date: string; weight: number }[],
  days: number = 30
): { change: number; percentChange: number; trend: 'up' | 'down' | 'stable' } | null {
  if (weights.length < 2) return null;

  const sorted = [...weights].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const cutoffDate = subDays(new Date(), days);
  const recent = sorted.filter(w => new Date(w.date) >= cutoffDate);

  if (recent.length < 2) return null;

  const first = recent[0].weight;
  const last = recent[recent.length - 1].weight;
  const change = last - first;
  const percentChange = (change / first) * 100;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (Math.abs(percentChange) > 0.5) {
    trend = change > 0 ? 'up' : 'down';
  }

  return { change, percentChange, trend };
}
