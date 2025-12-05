import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  useStore,
  selectSortedInjections,
  selectSortedWeights,
  selectSortedMuscleEntries,
} from '@/store';
import {
  formatDate,
  calculateMuscleHealthScore,
  getCurrentMedicationLevel,
} from '@/lib/utils';
import {
  FileText,
  Download,
  Calendar,
  Syringe,
  Scale,
  Activity,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format, parseISO, subDays, isWithinInterval } from 'date-fns';
import type { Symptom } from '@/types';

export function DoctorReport() {
  const injections = useStore(selectSortedInjections);
  const weights = useStore(selectSortedWeights);
  const muscleEntries = useStore(selectSortedMuscleEntries);
  const medicationSettings = useStore((state) => state.medicationSettings);
  const weightUnit = useStore((state) => state.weightUnit);

  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 30), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [generating, setGenerating] = useState(false);

  // Filter data by date range
  const filteredData = useMemo(() => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    const filterByRange = <T extends { date: string }>(items: T[]) =>
      items.filter((item) =>
        isWithinInterval(parseISO(item.date), { start, end })
      );

    const rangeInjections = filterByRange(injections);
    const rangeWeights = filterByRange(weights);
    const rangeMuscle = filterByRange(muscleEntries);

    // Calculate symptom frequency
    const symptomCounts: Record<string, number> = {};
    rangeInjections.forEach((i) => {
      i.symptoms.forEach((s) => {
        if (s !== 'None') {
          symptomCounts[s] = (symptomCounts[s] || 0) + 1;
        }
      });
    });

    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name as Symptom);

    // Weight change
    let weightChange = 0;
    let startWeight = 0;
    let endWeight = 0;
    if (rangeWeights.length >= 2) {
      const sorted = [...rangeWeights].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      startWeight = sorted[0].weight;
      endWeight = sorted[sorted.length - 1].weight;
      weightChange = endWeight - startWeight;
    }

    // Average muscle score
    const avgMuscleScore =
      rangeMuscle.length > 0
        ? Math.round(
            rangeMuscle.reduce(
              (sum, entry) => sum + calculateMuscleHealthScore(entry).score,
              0
            ) / rangeMuscle.length
          )
        : null;

    return {
      injections: rangeInjections,
      weights: rangeWeights,
      muscleEntries: rangeMuscle,
      symptomCounts,
      topSymptoms,
      weightChange,
      startWeight,
      endWeight,
      avgMuscleScore,
    };
  }, [injections, weights, muscleEntries, startDate, endDate]);

  const generatePDF = async () => {
    setGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      // Helper functions
      const addText = (text: string, x: number, yPos: number, options?: { fontSize?: number; fontStyle?: string; color?: number[] }) => {
        if (options?.fontSize) doc.setFontSize(options.fontSize);
        if (options?.fontStyle) doc.setFont('helvetica', options.fontStyle);
        if (options?.color) doc.setTextColor(...options.color as [number, number, number]);
        else doc.setTextColor(44, 62, 59);
        doc.text(text, x, yPos);
        return yPos;
      };

      const addLine = (yPos: number) => {
        doc.setDrawColor(232, 235, 233);
        doc.line(20, yPos, pageWidth - 20, yPos);
        return yPos + 5;
      };

      // Header
      addText('GLP-1 Treatment Progress Report', 20, y, { fontSize: 20, fontStyle: 'bold', color: [45, 95, 93] });
      y += 10;
      addText(`Report Period: ${formatDate(startDate)} - ${formatDate(endDate)}`, 20, y, { fontSize: 10, color: [122, 140, 137] });
      y += 5;
      addText(`Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, 20, y, { fontSize: 10, color: [122, 140, 137] });
      y += 10;
      y = addLine(y);

      // Summary Section
      y += 5;
      addText('Summary', 20, y, { fontSize: 14, fontStyle: 'bold', color: [45, 95, 93] });
      y += 10;

      // Stats grid
      const stats = [
        { label: 'Total Injections', value: filteredData.injections.length.toString() },
        { label: 'Weight Change', value: `${filteredData.weightChange > 0 ? '+' : ''}${filteredData.weightChange.toFixed(1)} ${weightUnit}` },
        { label: 'Current Med Level', value: `${Math.round(getCurrentMedicationLevel(injections, medicationSettings))}%` },
        { label: 'Avg Muscle Score', value: filteredData.avgMuscleScore?.toString() || 'N/A' },
      ];

      stats.forEach((stat, i) => {
        const x = 20 + (i % 2) * 85;
        const statY = y + Math.floor(i / 2) * 15;
        addText(stat.label + ':', x, statY, { fontSize: 10, color: [122, 140, 137] });
        addText(stat.value, x, statY + 5, { fontSize: 12, fontStyle: 'bold' });
      });
      y += 35;

      // Medication Info
      y = addLine(y);
      y += 5;
      addText('Medication Information', 20, y, { fontSize: 14, fontStyle: 'bold', color: [45, 95, 93] });
      y += 10;
      addText(`Type: ${medicationSettings.medicationType}`, 20, y, { fontSize: 10 });
      y += 5;
      addText(`Current Dose: ${medicationSettings.currentDose} ${medicationSettings.doseUnit}`, 20, y, { fontSize: 10 });
      y += 10;

      // Weight Progress
      if (filteredData.weights.length > 0) {
        y = addLine(y);
        y += 5;
        addText('Weight Progress', 20, y, { fontSize: 14, fontStyle: 'bold', color: [45, 95, 93] });
        y += 10;

        if (filteredData.startWeight && filteredData.endWeight) {
          addText(`Starting Weight: ${filteredData.startWeight} ${weightUnit}`, 20, y, { fontSize: 10 });
          y += 5;
          addText(`Current Weight: ${filteredData.endWeight} ${weightUnit}`, 20, y, { fontSize: 10 });
          y += 5;
          const percentChange = ((filteredData.weightChange / filteredData.startWeight) * 100).toFixed(1);
          addText(`Change: ${filteredData.weightChange > 0 ? '+' : ''}${filteredData.weightChange.toFixed(1)} ${weightUnit} (${percentChange}%)`, 20, y, { fontSize: 10 });
          y += 10;
        }
      }

      // Injection History
      y = addLine(y);
      y += 5;
      addText('Injection History', 20, y, { fontSize: 14, fontStyle: 'bold', color: [45, 95, 93] });
      y += 10;

      if (filteredData.injections.length === 0) {
        addText('No injections recorded in this period.', 20, y, { fontSize: 10, color: [122, 140, 137] });
        y += 10;
      } else {
        // Table header
        doc.setFillColor(248, 249, 250);
        doc.rect(20, y - 3, pageWidth - 40, 8, 'F');
        addText('Date', 22, y + 2, { fontSize: 9, fontStyle: 'bold' });
        addText('Site', 60, y + 2, { fontSize: 9, fontStyle: 'bold' });
        addText('Symptoms', 110, y + 2, { fontSize: 9, fontStyle: 'bold' });
        y += 10;

        filteredData.injections.slice(0, 15).forEach((injection) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          addText(format(parseISO(injection.date), 'MMM d, yyyy'), 22, y, { fontSize: 9 });
          addText(injection.site, 60, y, { fontSize: 9 });
          const symptoms = injection.symptoms.length > 0 ? injection.symptoms.join(', ') : 'None';
          addText(symptoms.substring(0, 40), 110, y, { fontSize: 9 });
          y += 6;
        });

        if (filteredData.injections.length > 15) {
          y += 2;
          addText(`... and ${filteredData.injections.length - 15} more entries`, 20, y, { fontSize: 9, color: [122, 140, 137] });
        }
        y += 10;
      }

      // Symptom Analysis
      if (Object.keys(filteredData.symptomCounts).length > 0) {
        if (y > 240) {
          doc.addPage();
          y = 20;
        }
        y = addLine(y);
        y += 5;
        addText('Symptom Analysis', 20, y, { fontSize: 14, fontStyle: 'bold', color: [45, 95, 93] });
        y += 10;

        Object.entries(filteredData.symptomCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .forEach(([symptom, count]) => {
            addText(`${symptom}: ${count} occurrence${count > 1 ? 's' : ''}`, 20, y, { fontSize: 10 });
            y += 5;
          });
        y += 5;
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(122, 140, 137);
      doc.text(
        'This report was generated from the GLP-1 Shot Tracker app. Please consult with your healthcare provider for medical advice.',
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );

      // Save
      doc.save(`GLP1-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Doctor Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-text-muted">
              Generate a comprehensive PDF report to share with your healthcare provider.
              The report includes injection history, weight progress, symptom analysis, and more.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <Button onClick={generatePDF} disabled={generating} className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              {generating ? 'Generating...' : 'Download PDF Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-bg rounded-xl p-6 border border-border space-y-6">
            {/* Header */}
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-serif text-primary font-bold">
                GLP-1 Treatment Progress Report
              </h2>
              <p className="text-sm text-text-muted mt-1">
                {formatDate(startDate)} - {formatDate(endDate)}
              </p>
            </div>

            {/* Summary Stats */}
            <div>
              <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-bg-card p-3 rounded-lg border border-border">
                  <Syringe className="w-4 h-4 text-primary mb-1" />
                  <p className="text-xs text-text-muted">Injections</p>
                  <p className="font-bold text-primary">
                    {filteredData.injections.length}
                  </p>
                </div>
                <div className="bg-bg-card p-3 rounded-lg border border-border">
                  <Scale className="w-4 h-4 text-primary mb-1" />
                  <p className="text-xs text-text-muted">Weight Change</p>
                  <p className="font-bold text-primary">
                    {filteredData.weightChange > 0 ? '+' : ''}
                    {filteredData.weightChange.toFixed(1)} {weightUnit}
                  </p>
                </div>
                <div className="bg-bg-card p-3 rounded-lg border border-border">
                  <Activity className="w-4 h-4 text-primary mb-1" />
                  <p className="text-xs text-text-muted">Med Level</p>
                  <p className="font-bold text-primary">
                    {Math.round(getCurrentMedicationLevel(injections, medicationSettings))}%
                  </p>
                </div>
                <div className="bg-bg-card p-3 rounded-lg border border-border">
                  <CheckCircle className="w-4 h-4 text-primary mb-1" />
                  <p className="text-xs text-text-muted">Muscle Score</p>
                  <p className="font-bold text-primary">
                    {filteredData.avgMuscleScore || '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Medication Info */}
            <div>
              <h3 className="font-semibold text-primary mb-3">Medication</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="site">{medicationSettings.medicationType}</Badge>
                <Badge variant="default">
                  {medicationSettings.currentDose} {medicationSettings.doseUnit}
                </Badge>
              </div>
            </div>

            {/* Recent Injections */}
            <div>
              <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Recent Injections
              </h3>
              {filteredData.injections.length === 0 ? (
                <p className="text-text-muted text-sm">No injections in selected period</p>
              ) : (
                <div className="space-y-2">
                  {filteredData.injections.slice(0, 5).map((injection) => (
                    <div
                      key={injection.id}
                      className="flex items-center justify-between p-2 bg-bg-card rounded border border-border"
                    >
                      <span className="font-mono text-sm">
                        {formatDate(injection.date)}
                      </span>
                      <Badge variant="site" className="text-xs">
                        {injection.site}
                      </Badge>
                    </div>
                  ))}
                  {filteredData.injections.length > 5 && (
                    <p className="text-xs text-text-muted text-center">
                      + {filteredData.injections.length - 5} more in full report
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Top Symptoms */}
            {filteredData.topSymptoms.length > 0 && (
              <div>
                <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Most Reported Symptoms
                </h3>
                <div className="flex flex-wrap gap-2">
                  {filteredData.topSymptoms.map((symptom) => (
                    <Badge key={symptom} variant="symptom">
                      {symptom} ({filteredData.symptomCounts[symptom]}x)
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
