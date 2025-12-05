import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useStore,
  selectSortedInjections,
  selectSortedWeights,
  selectSortedMuscleEntries,
} from '@/store';
import {
  calculateMuscleHealthScore,
  getCurrentMedicationLevel,
  daysSinceLastInjection,
  cn,
} from '@/lib/utils';
import {
  Syringe,
  Scale,
  Dumbbell,
  Activity,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, parseISO, subDays, eachWeekOfInterval } from 'date-fns';
import type { Symptom } from '@/types';

const COLORS = ['#2D5F5D', '#F4A261', '#52B788', '#F77F00', '#D62828', '#3D7F7D', '#F7C59F', '#7A8C89'];

export function AnalyticsDashboard() {
  const injections = useStore(selectSortedInjections);
  const weights = useStore(selectSortedWeights);
  const muscleEntries = useStore(selectSortedMuscleEntries);
  const medicationSettings = useStore((state) => state.medicationSettings);

  // Calculate statistics
  const stats = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentInjections = injections.filter(
      (i) => new Date(i.date) >= thirtyDaysAgo
    );
    const recentWeights = weights.filter(
      (w) => new Date(w.date) >= thirtyDaysAgo
    );

    // Weight change
    let weightChange = 0;
    let weightPercentChange = 0;
    if (recentWeights.length >= 2) {
      const sortedWeights = [...recentWeights].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const firstWeight = sortedWeights[0].weight;
      const lastWeight = sortedWeights[sortedWeights.length - 1].weight;
      weightChange = lastWeight - firstWeight;
      weightPercentChange = (weightChange / firstWeight) * 100;
    }

    // Symptom frequency
    const symptomCounts: Record<string, number> = {};
    recentInjections.forEach((injection) => {
      injection.symptoms.forEach((symptom) => {
        if (symptom !== 'None') {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        }
      });
    });

    // Average muscle score
    const recentMuscle = muscleEntries.slice(0, 7);
    const avgMuscleScore =
      recentMuscle.length > 0
        ? Math.round(
            recentMuscle.reduce(
              (sum, entry) => sum + calculateMuscleHealthScore(entry).score,
              0
            ) / recentMuscle.length
          )
        : 0;

    // Injection site distribution
    const siteCounts: Record<string, number> = {};
    injections.forEach((injection) => {
      siteCounts[injection.site] = (siteCounts[injection.site] || 0) + 1;
    });

    return {
      totalInjections: injections.length,
      recentInjections: recentInjections.length,
      weightChange,
      weightPercentChange,
      symptomCounts,
      avgMuscleScore,
      siteCounts,
      currentLevel: getCurrentMedicationLevel(injections, medicationSettings),
      daysSinceLast: daysSinceLastInjection(injections),
    };
  }, [injections, weights, muscleEntries, medicationSettings]);

  // Prepare chart data
  const weightChartData = useMemo(() => {
    return [...weights]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30)
      .map((w) => ({
        date: format(parseISO(w.date), 'MMM d'),
        weight: w.weight,
      }));
  }, [weights]);

  const symptomChartData = useMemo(() => {
    return Object.entries(stats.symptomCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [stats.symptomCounts]);

  const siteChartData = useMemo(() => {
    return Object.entries(stats.siteCounts).map(([name, value]) => ({
      name: name.replace('(', '\n('),
      value,
    }));
  }, [stats.siteCounts]);

  // Weekly injection frequency
  const weeklyInjectionData = useMemo(() => {
    if (injections.length === 0) return [];

    const sortedInjections = [...injections].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstDate = parseISO(sortedInjections[0].date);
    const lastDate = new Date();

    const weeks = eachWeekOfInterval({ start: firstDate, end: lastDate });
    const weeklyData = weeks.slice(-12).map((weekStart) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const count = injections.filter((i) => {
        const date = parseISO(i.date);
        return date >= weekStart && date < weekEnd;
      }).length;

      return {
        week: format(weekStart, 'MMM d'),
        injections: count,
      };
    });

    return weeklyData;
  }, [injections]);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 mb-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Syringe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Total Injections</p>
              <p className="text-2xl font-bold font-serif text-primary">
                {stats.totalInjections}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 mb-0">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'p-2 rounded-lg',
                stats.weightChange < 0 ? 'bg-success/10' : 'bg-warning/10'
              )}
            >
              {stats.weightChange < 0 ? (
                <TrendingDown className="w-5 h-5 text-success" />
              ) : (
                <TrendingUp className="w-5 h-5 text-warning" />
              )}
            </div>
            <div>
              <p className="text-sm text-text-muted">30-Day Weight</p>
              <p
                className={cn(
                  'text-2xl font-bold font-serif',
                  stats.weightChange < 0 ? 'text-success' : 'text-warning'
                )}
              >
                {stats.weightChange > 0 ? '+' : ''}
                {stats.weightChange.toFixed(1)} lbs
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 mb-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Activity className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Med Level</p>
              <p className="text-2xl font-bold font-serif text-primary">
                {Math.round(stats.currentLevel)}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 mb-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Dumbbell className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Muscle Score</p>
              <p className="text-2xl font-bold font-serif text-primary">
                {stats.avgMuscleScore || '—'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Weight Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {weightChartData.length > 1 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8EBE9" />
                    <XAxis dataKey="date" stroke="#7A8C89" fontSize={12} />
                    <YAxis
                      stroke="#7A8C89"
                      fontSize={12}
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E8EBE9',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#2D5F5D"
                      strokeWidth={2}
                      dot={{ fill: '#2D5F5D' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-text-muted">
                <Scale className="w-8 h-8 mr-2 opacity-50" />
                Not enough data to display trend
              </div>
            )}
          </CardContent>
        </Card>

        {/* Symptom Frequency */}
        <Card>
          <CardHeader>
            <CardTitle>Symptom Frequency (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {symptomChartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={symptomChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8EBE9" />
                    <XAxis type="number" stroke="#7A8C89" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#7A8C89"
                      fontSize={11}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E8EBE9',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" fill="#F4A261" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-text-muted">
                <AlertCircle className="w-8 h-8 mr-2 opacity-50" />
                No symptoms recorded in the last 30 days
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Injection Site Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Injection Site Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {siteChartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={siteChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${(name as string)?.split('\n')[0] || ''} ${((percent as number) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {siteChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E8EBE9',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-text-muted">
                <Syringe className="w-8 h-8 mr-2 opacity-50" />
                No injection data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Injection Frequency */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Injection Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyInjectionData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyInjectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8EBE9" />
                    <XAxis dataKey="week" stroke="#7A8C89" fontSize={11} />
                    <YAxis stroke="#7A8C89" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E8EBE9',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="injections" fill="#2D5F5D" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-text-muted">
                <Calendar className="w-8 h-8 mr-2 opacity-50" />
                No injection data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Symptom Correlation Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Symptom-Medication Correlation</CardTitle>
        </CardHeader>
        <CardContent>
          {injections.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-text-muted">
                Analysis of when symptoms typically occur relative to injections
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.symptomCounts)
                  .slice(0, 6)
                  .map(([symptom, count]) => {
                    // Calculate average days since injection when symptom occurs
                    const symptomsWithTiming = injections
                      .filter((i) => i.symptoms.includes(symptom as Symptom))
                      .map((i) => {
                        const daysSince = daysSinceLastInjection(
                          injections.filter((inj) => inj.timestamp < i.timestamp)
                        );
                        return daysSince || 0;
                      });

                    const avgDays =
                      symptomsWithTiming.length > 0
                        ? (
                            symptomsWithTiming.reduce((a, b) => a + b, 0) /
                            symptomsWithTiming.length
                          ).toFixed(1)
                        : '—';

                    return (
                      <div
                        key={symptom}
                        className="p-4 bg-bg rounded-lg border border-border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="symptom">{symptom}</Badge>
                          <span className="text-sm font-mono text-text-muted">
                            {count}x
                          </span>
                        </div>
                        <p className="text-xs text-text-muted">
                          Avg. {avgDays} days post-injection
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-text-muted">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Log some injections with symptoms to see correlation analysis
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
