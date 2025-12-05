import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { useStore, selectSortedInjections } from '@/store';
import { formatDate, formatTime } from '@/lib/utils';
import { Syringe, Trash2 } from 'lucide-react';

export function InjectionHistory() {
  const injections = useStore(selectSortedInjections);
  const deleteInjection = useStore((state) => state.deleteInjection);

  if (injections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Injection History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Syringe className="w-12 h-12 mx-auto mb-4 text-text-muted opacity-50" />
            <p className="text-text-muted">
              No injections logged yet. Add your first one above!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Injection History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {injections.map((entry) => (
          <div
            key={entry.id}
            className="bg-bg border border-border border-l-4 border-l-accent rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:translate-x-1 animate-slide-in"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-mono font-medium text-primary">
                  {formatDate(entry.date)}
                </div>
                <div className="font-mono text-sm text-text-muted">
                  {formatTime(entry.time)}
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error hover:bg-error hover:text-white -mr-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Injection Entry</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this injection entry from{' '}
                      {formatDate(entry.date)}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteInjection(entry.id)}
                      className="bg-error hover:bg-error/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="site">{entry.site}</Badge>
              {entry.symptoms.length > 0 ? (
                entry.symptoms.map((symptom) => (
                  <Badge key={symptom} variant="symptom">
                    {symptom}
                  </Badge>
                ))
              ) : (
                <Badge variant="default">No symptoms reported</Badge>
              )}
            </div>
            {entry.notes && (
              <p className="mt-3 text-sm text-text-muted italic">
                {entry.notes}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
