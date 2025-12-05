// Core data types for GLP-1 Tracker

export interface Injection {
  id: string;
  date: string;
  time: string;
  site: InjectionSite;
  dosage: number; // in mg, default 0.25
  symptoms: Symptom[];
  notes?: string;
  timestamp: number;
}

export type InjectionSite =
  | 'Upper Abdomen (Left)'
  | 'Upper Abdomen (Right)'
  | 'Lower Abdomen (Left)'
  | 'Lower Abdomen (Right)'
  | 'Thigh (Left)'
  | 'Thigh (Right)'
  | 'Upper Arm (Left)'
  | 'Upper Arm (Right)';

export type Symptom =
  | 'Decreased Appetite'
  | 'Nausea'
  | 'Headache'
  | 'Fatigue'
  | 'Dizziness'
  | 'Indigestion'
  | 'Hair Loss'
  | 'Constipation'
  | 'Diarrhea'
  | 'Vomiting'
  | 'Heartburn'
  | 'None';

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  unit: 'lbs' | 'kg';
  notes?: string;
  timestamp: number;
}

export interface MuscleEntry {
  id: string;
  date: string;
  proteinGrams: number;
  waterOz: number;
  fiberGrams: number;
  strengthTraining: boolean;
  strengthMinutes?: number;
  exercises?: string[];
  timestamp: number;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  imageData: string; // base64 encoded
  angle: 'front' | 'side' | 'back';
  notes?: string;
  timestamp: number;
}

export interface DailyCheckIn {
  id: string;
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  appetiteLevel: 1 | 2 | 3 | 4 | 5;
  symptoms: Symptom[];
  notes?: string;
  timestamp: number;
}

// Medication level calculation types
export interface MedicationLevel {
  timestamp: number;
  level: number; // 0-100 percentage
}

export interface MedicationSettings {
  medicationType: 'semaglutide' | 'tirzepatide' | 'other';
  halfLifeDays: number;
  currentDose: number;
  doseUnit: 'mg' | 'mcg';
}

// Muscle Health Score calculation
export interface MuscleHealthScore {
  date: string;
  score: number; // 0-100
  proteinScore: number;
  hydrationScore: number;
  fiberScore: number;
  exerciseScore: number;
}

// Analytics types
export interface WeightTrend {
  startWeight: number;
  currentWeight: number;
  totalLoss: number;
  percentLoss: number;
  weeklyAverage: number;
}

export interface SymptomCorrelation {
  symptom: Symptom;
  medicationLevelAvg: number;
  frequency: number;
  daysSinceInjectionAvg: number;
}

// PDF Report types
export interface DoctorReport {
  generatedAt: string;
  dateRange: {
    start: string;
    end: string;
  };
  summary: {
    totalInjections: number;
    weightChange: number;
    avgMuscleScore: number;
    mostCommonSymptoms: Symptom[];
  };
  injections: Injection[];
  weightHistory: WeightEntry[];
  muscleScores: MuscleHealthScore[];
}
