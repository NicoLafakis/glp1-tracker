import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useStore, selectSortedWeights, selectLatestWeight } from '@/store';
import { getCurrentDate, formatDate, calculateWeightTrend, cn } from '@/lib/utils';
import { Scale, TrendingDown, TrendingUp, Minus, Trash2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';

export function WeightTracker() {
  const { addWeight, deleteWeight, weightUnit, setWeightUnit } = useStore();
  const weights = useStore(selectSortedWeights);
  const latestWeight = useStore(selectLatestWeight);
  const [date, setDate] = useState(getCurrentDate());
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) return;

    addWeight({
      date,
      weight: weightValue,
      unit: weightUnit,
      notes: notes.trim() || undefined,
    });

    setDate(getCurrentDate());
    setWeight('');
    setNotes('');
  };

  const trend = calculateWeightTrend(
    weights.map((w) => ({ date: w.date, weight: w.weight })),
    30
  );

  const chartData = [...weights]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30)
    .map((w) => ({
      date: format(parseISO(w.date), 'MMM d'),
      weight: w.weight,
      fullDate: w.date,
    }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 mb-0">
          <div className="text-sm text-text-muted mb-1">Current Weight</div>
          <div className="text-2xl font-bold text-primary font-serif">
            {latestWeight ? `${latestWeight.weight} ${latestWeight.unit}` : '—'}
          </div>
        </Card>
        <Card className="p-4 mb-0">
          <div className="text-sm text-text-muted mb-1">30-Day Change</div>
          <div
            className={cn(
              'text-2xl font-bold font-serif flex items-center gap-2',
              trend?.trend === 'down'
                ? 'text-success'
                : trend?.trend === 'up'
                ? 'text-warning'
                : 'text-text-muted'
            )}
          >
            {trend ? (
              <>
                {trend.trend === 'down' && <TrendingDown className="w-5 h-5" />}
                {trend.trend === 'up' && <TrendingUp className="w-5 h-5" />}
                {trend.trend === 'stable' && <Minus className="w-5 h-5" />}
                {trend.change > 0 ? '+' : ''}
                {trend.change.toFixed(1)} {weightUnit}
              </>
            ) : (
              '—'
            )}
          </div>
        </Card>
        <Card className="p-4 mb-0">
          <div className="text-sm text-text-muted mb-1">Total Entries</div>
          <div className="text-2xl font-bold text-primary font-serif">
            {weights.length}
          </div>
        </Card>
      </div>

      {/* Weight Chart */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Weight Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
                    dot={{ fill: '#2D5F5D', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#F4A261' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Log Weight Form */}
      <Card>
        <CardHeader>
          <CardTitle>Log Weight</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                type="date"
                label="Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <Input
                type="number"
                label="Weight"
                placeholder="Enter weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                step="0.1"
                min="0"
                required
              />
              <div className="space-y-2">
                <label className="block font-semibold text-sm text-text">
                  Unit
                </label>
                <Select
                  value={weightUnit}
                  onValueChange={(v) => setWeightUnit(v as 'lbs' | 'kg')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Input
              type="text"
              label="Notes (optional)"
              placeholder="Any notes about this weigh-in..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button type="submit">Save Weight</Button>
          </form>
        </CardContent>
      </Card>

      {/* Weight History */}
      <Card>
        <CardHeader>
          <CardTitle>Weight History</CardTitle>
        </CardHeader>
        <CardContent>
          {weights.length === 0 ? (
            <div className="text-center py-12">
              <Scale className="w-12 h-12 mx-auto mb-4 text-text-muted opacity-50" />
              <p className="text-text-muted">
                No weight entries yet. Log your first weigh-in above!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {weights.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-bg rounded-lg border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="font-mono text-sm text-text-muted">
                      {formatDate(entry.date)}
                    </div>
                    <Badge variant="site">
                      {entry.weight} {entry.unit}
                    </Badge>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-error hover:bg-error hover:text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Weight Entry</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this weight entry?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteWeight(entry.id)}
                          className="bg-error hover:bg-error/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
              {weights.length > 10 && (
                <p className="text-center text-sm text-text-muted pt-2">
                  Showing last 10 of {weights.length} entries
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
