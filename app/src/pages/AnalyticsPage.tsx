import { AnalyticsDashboard } from '@/components/features';

export function AnalyticsPage() {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl text-primary mb-2">Analytics Dashboard</h1>
        <p className="text-text-muted">Comprehensive insights into your progress</p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
