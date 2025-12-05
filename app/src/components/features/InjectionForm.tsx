import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/store';
import { getCurrentDate, getCurrentTime, cn } from '@/lib/utils';
import type { InjectionSite, Symptom } from '@/types';

const INJECTION_SITES: InjectionSite[] = [
  'Abdomen (Left)',
  'Abdomen (Right)',
  'Thigh (Left)',
  'Thigh (Right)',
  'Upper Arm (Left)',
  'Upper Arm (Right)',
];

const SYMPTOMS: Symptom[] = [
  'Nausea',
  'Constipation',
  'Diarrhea',
  'Fatigue',
  'Headache',
  'Dizziness',
  'Decreased Appetite',
  'Injection Site Reaction',
  'None',
];

export function InjectionForm() {
  const { addInjection, lastInjectionSite } = useStore();
  const [date, setDate] = useState(getCurrentDate());
  const [time, setTime] = useState(getCurrentTime());
  const [selectedSite, setSelectedSite] = useState<InjectionSite | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

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

    addInjection({
      date,
      time,
      site: selectedSite,
      symptoms: selectedSymptoms,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setDate(getCurrentDate());
    setTime(getCurrentTime());
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          <div className="space-y-2">
            <label className="block font-semibold text-sm text-text">
              Injection Site
              {lastInjectionSite && (
                <span className="font-normal text-text-muted ml-2">
                  (Last used: {lastInjectionSite})
                </span>
              )}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {INJECTION_SITES.map((site) => (
                <button
                  key={site}
                  type="button"
                  onClick={() => setSelectedSite(site)}
                  className={cn(
                    'p-3 border-2 rounded-lg text-sm font-medium transition-all duration-200',
                    selectedSite === site
                      ? 'bg-primary border-primary text-white shadow-md'
                      : 'bg-bg border-border text-text hover:border-primary-light hover:bg-primary-light hover:text-white hover:-translate-y-0.5 hover:shadow-md'
                  )}
                >
                  {site}
                </button>
              ))}
            </div>
            {error && <p className="text-sm text-error mt-2">{error}</p>}
          </div>

          <div className="space-y-2">
            <label className="block font-semibold text-sm text-text">
              Symptoms (select all that apply)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
