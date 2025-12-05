import { MedicationLevels } from '@/components/features';

export function LevelsPage() {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl text-primary mb-2">Medication Levels</h1>
        <p className="text-text-muted">Visualize your medication concentration over time</p>
      </div>
      <MedicationLevels />
    </div>
  );
}
