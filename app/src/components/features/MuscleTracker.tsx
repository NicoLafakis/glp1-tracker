import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
import { useStore, selectSortedMuscleEntries } from '@/store';
import {
  getCurrentDate,
  formatDate,
  calculateMuscleHealthScore,
  getScoreColor,
  getScoreBgColor,
  cn,
} from '@/lib/utils';
import {
  Dumbbell,
  Droplets,
  Beef,
  Wheat,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { format, parseISO } from 'date-fns';

const EXERCISE_OPTIONS = [
  'Squats',
  'Deadlifts',
  'Bench Press',
  'Rows',
  'Shoulder Press',
  'Lunges',
  'Planks',
  'Resistance Bands',
  'Walking',
  'Other',
];

export function MuscleTracker() {
  const { addMuscleEntry, deleteMuscleEntry } = useStore();
  const muscleEntries = useStore(selectSortedMuscleEntries);

  const [date, setDate] = useState(getCurrentDate());
  const [proteinGrams, setProteinGrams] = useState('');
  const [waterOz, setWaterOz] = useState('');
  const [fiberGrams, setFiberGrams] = useState('');
  const [strengthTraining, setStrengthTraining] = useState(false);
  const [strengthMinutes, setStrengthMinutes] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addMuscleEntry({
      date,
      proteinGrams: parseFloat(proteinGrams) || 0,
      waterOz: parseFloat(waterOz) || 0,
      fiberGrams: parseFloat(fiberGrams) || 0,
      strengthTraining,
      strengthMinutes: strengthTraining ? parseFloat(strengthMinutes) || 0 : undefined,
      exercises: strengthTraining ? selectedExercises : undefined,
    });

    // Reset form
    setDate(getCurrentDate());
    setProteinGrams('');
    setWaterOz('');
    setFiberGrams('');
    setStrengthTraining(false);
    setStrengthMinutes('');
    setSelectedExercises([]);
  };

  const toggleExercise = (exercise: string) => {
    setSelectedExercises((prev) =>
      prev.includes(exercise)
        ? prev.filter((e) => e !== exercise)
        : [...prev, exercise]
    );
  };

  // Calculate latest score
  const latestEntry = muscleEntries[0];
  const latestScore = latestEntry
    ? calculateMuscleHealthScore(latestEntry)
    : null;

  // Prepare radar chart data
  const radarData = latestScore
    ? [
        { subject: 'Protein', value: latestScore.proteinScore, fullMark: 25 },
        { subject: 'Hydration', value: latestScore.hydrationScore, fullMark: 25 },
        { subject: 'Fiber', value: latestScore.fiberScore, fullMark: 25 },
        { subject: 'Exercise', value: latestScore.exerciseScore, fullMark: 25 },
      ]
    : [];

  // Prepare trend chart data
  const trendData = muscleEntries
    .slice(0, 14)
    .reverse()
    .map((entry) => {
      const score = calculateMuscleHealthScore(entry);
      return {
        date: format(parseISO(entry.date), 'MMM d'),
        score: score.score,
      };
    });

  // Calculate averages
  const avgScore =
    muscleEntries.length > 0
      ? Math.round(
          muscleEntries
            .slice(0, 7)
            .reduce(
              (sum, entry) => sum + calculateMuscleHealthScore(entry).score,
              0
            ) / Math.min(muscleEntries.length, 7)
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Muscle Health Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Muscle Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            {latestScore ? (
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#E8EBE9"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={
                        latestScore.score >= 80
                          ? '#52B788'
                          : latestScore.score >= 60
                          ? '#2D5F5D'
                          : latestScore.score >= 40
                          ? '#F77F00'
                          : '#D62828'
                      }
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${latestScore.score * 3.52} 352`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className={cn(
                        'text-3xl font-bold font-serif',
                        getScoreColor(latestScore.score)
                      )}
                    >
                      {latestScore.score}
                    </span>
                    <span className="text-xs text-text-muted">/ 100</span>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Beef className="w-4 h-4 text-error" />
                      <span className="text-sm">Protein</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(latestScore.proteinScore / 25) * 100}
                        className="w-24 h-2"
                        indicatorClassName="bg-error"
                      />
                      <span className="text-sm font-mono w-8">
                        {latestScore.proteinScore}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-primary" />
                      <span className="text-sm">Hydration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(latestScore.hydrationScore / 25) * 100}
                        className="w-24 h-2"
                      />
                      <span className="text-sm font-mono w-8">
                        {latestScore.hydrationScore}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wheat className="w-4 h-4 text-warning" />
                      <span className="text-sm">Fiber</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(latestScore.fiberScore / 25) * 100}
                        className="w-24 h-2"
                        indicatorClassName="bg-warning"
                      />
                      <span className="text-sm font-mono w-8">
                        {latestScore.fiberScore}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-success" />
                      <span className="text-sm">Exercise</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(latestScore.exerciseScore / 25) * 100}
                        className="w-24 h-2"
                        indicatorClassName="bg-success"
                      />
                      <span className="text-sm font-mono w-8">
                        {latestScore.exerciseScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Dumbbell className="w-12 h-12 mx-auto mb-4 text-text-muted opacity-50" />
                <p className="text-text-muted">
                  Log your first entry to see your Muscle Health Score
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {radarData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#E8EBE9" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#7A8C89', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 25]} tick={{ fill: '#7A8C89', fontSize: 10 }} />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#2D5F5D"
                      fill="#2D5F5D"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Trend Chart */}
      {trendData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Score Trend</span>
              <Badge variant="default" className="font-mono">
                7-day avg: {avgScore}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EBE9" />
                  <XAxis dataKey="date" stroke="#7A8C89" fontSize={12} tickLine={false} />
                  <YAxis stroke="#7A8C89" fontSize={12} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E8EBE9',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#2D5F5D"
                    strokeWidth={2}
                    dot={{ fill: '#2D5F5D' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Log Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle>Log Daily Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="date"
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                type="number"
                label="Protein (grams)"
                placeholder="e.g., 100"
                value={proteinGrams}
                onChange={(e) => setProteinGrams(e.target.value)}
                min="0"
              />
              <Input
                type="number"
                label="Water (oz)"
                placeholder="e.g., 64"
                value={waterOz}
                onChange={(e) => setWaterOz(e.target.value)}
                min="0"
              />
              <Input
                type="number"
                label="Fiber (grams)"
                placeholder="e.g., 30"
                value={fiberGrams}
                onChange={(e) => setFiberGrams(e.target.value)}
                min="0"
              />
            </div>

            <div className="space-y-4">
              <Checkbox
                checked={strengthTraining}
                onCheckedChange={(checked) => setStrengthTraining(checked === true)}
                label="Did strength training today"
              />

              {strengthTraining && (
                <div className="pl-6 space-y-4 animate-fade-in">
                  <Input
                    type="number"
                    label="Duration (minutes)"
                    placeholder="e.g., 30"
                    value={strengthMinutes}
                    onChange={(e) => setStrengthMinutes(e.target.value)}
                    min="0"
                  />

                  <div className="space-y-2">
                    <label className="block font-semibold text-sm text-text">
                      Exercises Performed
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {EXERCISE_OPTIONS.map((exercise) => (
                        <button
                          key={exercise}
                          type="button"
                          onClick={() => toggleExercise(exercise)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                            selectedExercises.includes(exercise)
                              ? 'bg-primary text-white'
                              : 'bg-bg border border-border text-text-muted hover:border-primary'
                          )}
                        >
                          {exercise}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button type="submit">Save Entry</Button>
          </form>
        </CardContent>
      </Card>

      {/* Entry History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {muscleEntries.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-text-muted opacity-50" />
              <p className="text-text-muted">
                No entries yet. Start tracking to see your progress!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {muscleEntries.slice(0, 7).map((entry) => {
                const score = calculateMuscleHealthScore(entry);
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 bg-bg rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center font-bold text-white',
                          getScoreBgColor(score.score)
                        )}
                      >
                        {score.score}
                      </div>
                      <div>
                        <div className="font-mono text-sm text-primary">
                          {formatDate(entry.date)}
                        </div>
                        <div className="flex gap-2 text-xs text-text-muted mt-1">
                          <span>{entry.proteinGrams}g protein</span>
                          <span>&bull;</span>
                          <span>{entry.waterOz}oz water</span>
                          {entry.strengthTraining && (
                            <>
                              <span>&bull;</span>
                              <span>{entry.strengthMinutes}min exercise</span>
                            </>
                          )}
                        </div>
                      </div>
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
                          <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this entry?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMuscleEntry(entry.id)}
                            className="bg-error hover:bg-error/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
