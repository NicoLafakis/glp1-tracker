import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useStore, selectSortedInjections, selectLastInjection } from '@/store';
import {
  calculateMedicationLevels,
  getCurrentMedicationLevel,
  daysSinceLastInjection,
  getNextInjectionDate,
  formatDate,
} from '@/lib/utils';
import { Activity, Calendar, Clock, AlertCircle } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';

export function MedicationLevels() {
  const injections = useStore(selectSortedInjections);
  const lastInjection = useStore(selectLastInjection);
  const { medicationSettings, updateMedicationSettings } = useStore();

  const currentLevel = getCurrentMedicationLevel(injections, medicationSettings);
  const daysSinceLast = daysSinceLastInjection(injections);
  const nextInjectionDate = getNextInjectionDate(injections, 7);

  const levels = calculateMedicationLevels(injections, medicationSettings, 21);
  const chartData = levels
    .filter((_, i) => i % 4 === 0) // Sample every 4 hours for smoother chart
    .map((l) => ({
      timestamp: l.timestamp,
      date: format(l.timestamp, 'MMM d'),
      time: format(l.timestamp, 'HH:mm'),
      level: Math.round(l.level * 10) / 10,
    }));

  const getLevelStatus = (level: number) => {
    if (level >= 70) return { label: 'Optimal', color: 'success' };
    if (level >= 40) return { label: 'Moderate', color: 'warning' };
    return { label: 'Low', color: 'error' };
  };

  const status = getLevelStatus(currentLevel);

  return (
    <div className="space-y-6">
      {/* Current Level Card */}
      <Card>
        <CardHeader>
          <CardTitle>Current Medication Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#E8EBE9"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={
                    status.color === 'success'
                      ? '#52B788'
                      : status.color === 'warning'
                      ? '#F77F00'
                      : '#D62828'
                  }
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${currentLevel * 4.4} 440`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-serif text-primary">
                  {Math.round(currentLevel)}%
                </span>
                <Badge
                  variant={
                    status.color === 'success'
                      ? 'success'
                      : status.color === 'warning'
                      ? 'warning'
                      : 'error'
                  }
                >
                  {status.label}
                </Badge>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-text-muted" />
                <div>
                  <div className="text-sm text-text-muted">Days Since Last Injection</div>
                  <div className="font-semibold text-primary">
                    {daysSinceLast !== null ? `${daysSinceLast} day${daysSinceLast !== 1 ? 's' : ''}` : 'No injections logged'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-text-muted" />
                <div>
                  <div className="text-sm text-text-muted">Next Injection Due</div>
                  <div className="font-semibold text-primary">
                    {nextInjectionDate ? formatDate(nextInjectionDate) : 'Log an injection to see'}
                  </div>
                </div>
              </div>

              {lastInjection && (
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-text-muted" />
                  <div>
                    <div className="text-sm text-text-muted">Last Injection Site</div>
                    <div className="font-semibold text-primary">{lastInjection.site}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level History Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Medication Level Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="levelGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D5F5D" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2D5F5D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EBE9" />
                  <XAxis
                    dataKey="date"
                    stroke="#7A8C89"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#7A8C89"
                    fontSize={12}
                    tickLine={false}
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-bg-card border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-mono text-sm text-text-muted">
                              {data.date} at {data.time}
                            </p>
                            <p className="font-semibold text-primary">
                              Level: {data.level}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={70}
                    stroke="#52B788"
                    strokeDasharray="5 5"
                    label={{ value: 'Optimal', fill: '#52B788', fontSize: 12 }}
                  />
                  <ReferenceLine
                    y={40}
                    stroke="#F77F00"
                    strokeDasharray="5 5"
                    label={{ value: 'Moderate', fill: '#F77F00', fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="level"
                    stroke="#2D5F5D"
                    strokeWidth={2}
                    fill="url(#levelGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-text-muted">
              <AlertCircle className="w-4 h-4" />
              <span>
                Based on {medicationSettings.medicationType} pharmacokinetics with a{' '}
                {medicationSettings.halfLifeDays}-day half-life
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medication Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Medication Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block font-semibold text-sm text-text">
                Medication Type
              </label>
              <Select
                value={medicationSettings.medicationType}
                onValueChange={(v) =>
                  updateMedicationSettings({
                    medicationType: v as 'semaglutide' | 'tirzepatide' | 'other',
                    halfLifeDays: v === 'semaglutide' ? 7 : v === 'tirzepatide' ? 5 : 7,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semaglutide">
                    Semaglutide (Ozempic, Wegovy)
                  </SelectItem>
                  <SelectItem value="tirzepatide">
                    Tirzepatide (Mounjaro, Zepbound)
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input
              type="number"
              label="Current Dose"
              value={medicationSettings.currentDose}
              onChange={(e) =>
                updateMedicationSettings({ currentDose: parseFloat(e.target.value) || 0 })
              }
              step="0.25"
              min="0"
            />

            <div className="space-y-2">
              <label className="block font-semibold text-sm text-text">
                Dose Unit
              </label>
              <Select
                value={medicationSettings.doseUnit}
                onValueChange={(v) =>
                  updateMedicationSettings({ doseUnit: v as 'mg' | 'mcg' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mg">Milligrams (mg)</SelectItem>
                  <SelectItem value="mcg">Micrograms (mcg)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input
              type="number"
              label="Half-Life (days)"
              value={medicationSettings.halfLifeDays}
              onChange={(e) =>
                updateMedicationSettings({
                  halfLifeDays: parseFloat(e.target.value) || 7,
                })
              }
              step="0.5"
              min="1"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
