import { MuscleTracker } from '@/components/features';

export function MusclePage() {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl text-primary mb-2">Muscle Preservation</h1>
        <p className="text-text-muted">Track nutrition and exercise to preserve muscle mass</p>
      </div>
      <MuscleTracker />
    </div>
  );
}
