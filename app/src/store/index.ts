import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Injection,
  WeightEntry,
  MuscleEntry,
  ProgressPhoto,
  DailyCheckIn,
  MedicationSettings,
  InjectionSite,
  Symptom,
} from '@/types';
import { generateId } from '@/lib/utils';

interface AppState {
  // Injection data
  injections: Injection[];
  addInjection: (injection: Omit<Injection, 'id' | 'timestamp'>) => void;
  deleteInjection: (id: string) => void;
  updateInjection: (id: string, updates: Partial<Injection>) => void;

  // Weight data
  weights: WeightEntry[];
  addWeight: (weight: Omit<WeightEntry, 'id' | 'timestamp'>) => void;
  deleteWeight: (id: string) => void;
  updateWeight: (id: string, updates: Partial<WeightEntry>) => void;

  // Muscle tracking data
  muscleEntries: MuscleEntry[];
  addMuscleEntry: (entry: Omit<MuscleEntry, 'id' | 'timestamp'>) => void;
  deleteMuscleEntry: (id: string) => void;
  updateMuscleEntry: (id: string, updates: Partial<MuscleEntry>) => void;

  // Progress photos
  photos: ProgressPhoto[];
  addPhoto: (photo: Omit<ProgressPhoto, 'id' | 'timestamp'>) => void;
  deletePhoto: (id: string) => void;

  // Daily check-ins
  checkIns: DailyCheckIn[];
  addCheckIn: (checkIn: Omit<DailyCheckIn, 'id' | 'timestamp'>) => void;
  deleteCheckIn: (id: string) => void;

  // Medication settings
  medicationSettings: MedicationSettings;
  updateMedicationSettings: (settings: Partial<MedicationSettings>) => void;

  // UI preferences
  weightUnit: 'lbs' | 'kg';
  setWeightUnit: (unit: 'lbs' | 'kg') => void;

  // Last used values for smart defaults
  lastInjectionSite: InjectionSite | null;
  lastSymptoms: Symptom[];
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Injections
      injections: [],
      addInjection: (injection) =>
        set((state) => ({
          injections: [
            {
              ...injection,
              id: generateId(),
              timestamp: new Date(`${injection.date}T${injection.time}`).getTime(),
            },
            ...state.injections,
          ],
          lastInjectionSite: injection.site,
          lastSymptoms: injection.symptoms,
        })),
      deleteInjection: (id) =>
        set((state) => ({
          injections: state.injections.filter((i) => i.id !== id),
        })),
      updateInjection: (id, updates) =>
        set((state) => ({
          injections: state.injections.map((i) =>
            i.id === id
              ? {
                  ...i,
                  ...updates,
                  timestamp: updates.date || updates.time
                    ? new Date(
                        `${updates.date || i.date}T${updates.time || i.time}`
                      ).getTime()
                    : i.timestamp,
                }
              : i
          ),
        })),

      // Weights
      weights: [],
      addWeight: (weight) =>
        set((state) => ({
          weights: [
            {
              ...weight,
              id: generateId(),
              timestamp: new Date(weight.date).getTime(),
            },
            ...state.weights,
          ],
        })),
      deleteWeight: (id) =>
        set((state) => ({
          weights: state.weights.filter((w) => w.id !== id),
        })),
      updateWeight: (id, updates) =>
        set((state) => ({
          weights: state.weights.map((w) =>
            w.id === id
              ? {
                  ...w,
                  ...updates,
                  timestamp: updates.date
                    ? new Date(updates.date).getTime()
                    : w.timestamp,
                }
              : w
          ),
        })),

      // Muscle entries
      muscleEntries: [],
      addMuscleEntry: (entry) =>
        set((state) => ({
          muscleEntries: [
            {
              ...entry,
              id: generateId(),
              timestamp: new Date(entry.date).getTime(),
            },
            ...state.muscleEntries,
          ],
        })),
      deleteMuscleEntry: (id) =>
        set((state) => ({
          muscleEntries: state.muscleEntries.filter((m) => m.id !== id),
        })),
      updateMuscleEntry: (id, updates) =>
        set((state) => ({
          muscleEntries: state.muscleEntries.map((m) =>
            m.id === id
              ? {
                  ...m,
                  ...updates,
                  timestamp: updates.date
                    ? new Date(updates.date).getTime()
                    : m.timestamp,
                }
              : m
          ),
        })),

      // Photos
      photos: [],
      addPhoto: (photo) =>
        set((state) => ({
          photos: [
            {
              ...photo,
              id: generateId(),
              timestamp: new Date(photo.date).getTime(),
            },
            ...state.photos,
          ],
        })),
      deletePhoto: (id) =>
        set((state) => ({
          photos: state.photos.filter((p) => p.id !== id),
        })),

      // Check-ins
      checkIns: [],
      addCheckIn: (checkIn) =>
        set((state) => ({
          checkIns: [
            {
              ...checkIn,
              id: generateId(),
              timestamp: new Date(checkIn.date).getTime(),
            },
            ...state.checkIns,
          ],
        })),
      deleteCheckIn: (id) =>
        set((state) => ({
          checkIns: state.checkIns.filter((c) => c.id !== id),
        })),

      // Medication settings
      medicationSettings: {
        medicationType: 'semaglutide',
        halfLifeDays: 7,
        currentDose: 0.5,
        doseUnit: 'mg',
      },
      updateMedicationSettings: (settings) =>
        set((state) => ({
          medicationSettings: { ...state.medicationSettings, ...settings },
        })),

      // UI preferences
      weightUnit: 'lbs',
      setWeightUnit: (unit) => set({ weightUnit: unit }),

      // Smart defaults
      lastInjectionSite: null,
      lastSymptoms: [],
    }),
    {
      name: 'glp1-tracker-storage',
      partialize: (state) => ({
        injections: state.injections,
        weights: state.weights,
        muscleEntries: state.muscleEntries,
        photos: state.photos,
        checkIns: state.checkIns,
        medicationSettings: state.medicationSettings,
        weightUnit: state.weightUnit,
        lastInjectionSite: state.lastInjectionSite,
        lastSymptoms: state.lastSymptoms,
      }),
    }
  )
);

// Selectors for common queries
export const selectSortedInjections = (state: AppState) =>
  [...state.injections].sort((a, b) => b.timestamp - a.timestamp);

export const selectSortedWeights = (state: AppState) =>
  [...state.weights].sort((a, b) => b.timestamp - a.timestamp);

export const selectSortedMuscleEntries = (state: AppState) =>
  [...state.muscleEntries].sort((a, b) => b.timestamp - a.timestamp);

export const selectRecentCheckIn = (state: AppState) => {
  const sorted = [...state.checkIns].sort((a, b) => b.timestamp - a.timestamp);
  return sorted[0] || null;
};

export const selectLatestWeight = (state: AppState) => {
  const sorted = [...state.weights].sort((a, b) => b.timestamp - a.timestamp);
  return sorted[0] || null;
};

export const selectLastInjection = (state: AppState) => {
  const sorted = [...state.injections].sort((a, b) => b.timestamp - a.timestamp);
  return sorted[0] || null;
};
