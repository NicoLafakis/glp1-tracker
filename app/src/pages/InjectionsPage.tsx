import { InjectionForm, InjectionHistory } from '@/components/features';

export function InjectionsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl text-primary mb-2">Injection Tracker</h1>
        <p className="text-text-muted">Log and track your GLP-1 injections</p>
      </div>
      <InjectionForm />
      <InjectionHistory />
    </div>
  );
}
