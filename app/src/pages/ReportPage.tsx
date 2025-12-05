import { DoctorReport } from '@/components/features';

export function ReportPage() {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl text-primary mb-2">Doctor Report</h1>
        <p className="text-text-muted">Generate a PDF report to share with your healthcare provider</p>
      </div>
      <DoctorReport />
    </div>
  );
}
