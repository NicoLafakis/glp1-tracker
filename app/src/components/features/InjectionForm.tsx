import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/store';
import { getCurrentDate, getCurrentTime, cn } from '@/lib/utils';
import type { InjectionSite, Symptom } from '@/types';

const INJECTION_SITES: InjectionSite[] = [
  'Upper Abdomen (Left)',
  'Upper Abdomen (Right)',
  'Lower Abdomen (Left)',
  'Lower Abdomen (Right)',
  'Thigh (Left)',
  'Thigh (Right)',
  'Upper Arm (Left)',
  'Upper Arm (Right)',
];

const SYMPTOMS: Symptom[] = [
  'Decreased Appetite',
  'Nausea',
  'Headache',
  'Fatigue',
  'Dizziness',
  'Indigestion',
  'Hair Loss',
  'Constipation',
  'Diarrhea',
  'Vomiting',
  'Heartburn',
  'None',
];

// Get the next recommended injection site in rotation
function getNextRecommendedSite(lastSite: InjectionSite | null): InjectionSite {
  if (!lastSite) return INJECTION_SITES[0];
  const currentIndex = INJECTION_SITES.indexOf(lastSite);
  if (currentIndex === -1) return INJECTION_SITES[0];
  return INJECTION_SITES[(currentIndex + 1) % INJECTION_SITES.length];
}

export function InjectionForm() {
  const { addInjection, lastInjectionSite, medicationSettings } = useStore();
  const [date, setDate] = useState(getCurrentDate());
  const [time, setTime] = useState(getCurrentTime());
  const [dosage, setDosage] = useState(medicationSettings.currentDose.toString());
  const [selectedSite, setSelectedSite] = useState<InjectionSite | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Smart site rotation - recommend next site
  const recommendedSite = useMemo(
    () => getNextRecommendedSite(lastInjectionSite),
    [lastInjectionSite]
  );

  const handleSymptomToggle = (symptom: Symptom) => {
    if (symptom === 'None') {
      setSelectedSymptoms(['None']);
    } else {
      setSelectedSymptoms((prev) => {
        const filtered = prev.filter((s) => s !== 'None');
        if (filtered.includes(symptom)) {
          return filtered.filter((s) => s !== symptom);
        }
        return [...filtered, symptom];
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedSite) {
      setError('Please select an injection site');
      return;
    }

    const parsedDosage = parseFloat(dosage);
    if (isNaN(parsedDosage) || parsedDosage <= 0) {
      setError('Please enter a valid dosage');
      return;
    }

    addInjection({
      date,
      time,
      site: selectedSite,
      dosage: parsedDosage,
      symptoms: selectedSymptoms,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setDate(getCurrentDate());
    setTime(getCurrentTime());
    setDosage(medicationSettings.currentDose.toString());
    setSelectedSite(null);
    setSelectedSymptoms([]);
    setNotes('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log New Injection</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              type="date"
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Input
              type="time"
              label="Time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
            <Input
              type="number"
              label="Dosage (mg)"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block font-semibold text-sm text-text">
              Injection Site
              <span className="font-normal text-text-muted ml-2">
                {lastInjectionSite ? (
                  <>
                    (Last: {lastInjectionSite} · <span className="text-primary">Suggested: {recommendedSite}</span>)
                  </>
                ) : (
                  `(Suggested: ${recommendedSite})`
                )}
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {INJECTION_SITES.map((site) => (
                <button
                  key={site}
                  type="button"
                  onClick={() => setSelectedSite(site)}
                  className={cn(
                    'p-3 border-2 rounded-lg text-sm font-medium transition-all duration-200 relative',
                    selectedSite === site
                      ? 'bg-primary border-primary text-white shadow-md'
                      : site === recommendedSite
                      ? 'bg-primary-light/20 border-primary-light text-primary hover:bg-primary-light hover:text-white hover:-translate-y-0.5 hover:shadow-md'
                      : 'bg-bg border-border text-text hover:border-primary-light hover:bg-primary-light hover:text-white hover:-translate-y-0.5 hover:shadow-md'
                  )}
                >
                  {site}
                  {site === recommendedSite && selectedSite !== site && (
                    <span className="absolute -top-2 -right-2 bg-accent text-white text-xs px-1.5 py-0.5 rounded-full">
                      Next
                    </span>
                  )}
                </button>
              ))}
            </div>
            {error && <p className="text-sm text-error mt-2">{error}</p>}
          </div>

          <div className="space-y-2">
            <label className="block font-semibold text-sm text-text">
              Symptoms (select all that apply)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SYMPTOMS.map((symptom) => (
                <label
                  key={symptom}
                  className={cn(
                    'flex items-center gap-2 p-3 border-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200',
                    selectedSymptoms.includes(symptom)
                      ? 'bg-accent-light border-accent text-primary-dark'
                      : 'bg-bg border-border text-text hover:border-accent-light'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedSymptoms.includes(symptom)}
                    onChange={() => handleSymptomToggle(symptom)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                      selectedSymptoms.includes(symptom)
                        ? 'bg-accent border-accent'
                        : 'border-border'
                    )}
                  >
                    {selectedSymptoms.includes(symptom) && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  <span>{symptom}</span>
                </label>
              ))}
            </div>
          </div>

          <Input
            type="text"
            label="Notes (optional)"
            placeholder="Any additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Button type="submit" className="w-full sm:w-auto">
            Save Injection
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
