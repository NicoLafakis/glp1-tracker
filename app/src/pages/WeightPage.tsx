import { WeightTracker } from '@/components/features';

export function WeightPage() {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl text-primary mb-2">Weight Tracker</h1>
        <p className="text-text-muted">Monitor your weight loss journey</p>
      </div>
      <WeightTracker />
    </div>
  );
}
