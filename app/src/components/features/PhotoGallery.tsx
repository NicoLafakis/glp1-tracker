import { useState, useRef } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useStore } from '@/store';
import { getCurrentDate, formatDate, cn } from '@/lib/utils';
import {
  Camera,
  Upload,
  Trash2,
  ZoomIn,
  Grid,
  LayoutList,
} from 'lucide-react';
import type { ProgressPhoto } from '@/types';

type ViewMode = 'grid' | 'list';
type AngleFilter = 'all' | 'front' | 'side' | 'back';

export function PhotoGallery() {
  const { photos, addPhoto, deletePhoto } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [date, setDate] = useState(getCurrentDate());
  const [angle, setAngle] = useState<'front' | 'side' | 'back'>('front');
  const [notes, setNotes] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [angleFilter, setAngleFilter] = useState<AngleFilter>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [comparePhotos, setComparePhotos] = useState<ProgressPhoto[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = () => {
    if (!previewImage) return;

    addPhoto({
      date,
      imageData: previewImage,
      angle,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setDate(getCurrentDate());
    setAngle('front');
    setNotes('');
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleComparePhoto = (photo: ProgressPhoto) => {
    if (comparePhotos.find((p) => p.id === photo.id)) {
      setComparePhotos(comparePhotos.filter((p) => p.id !== photo.id));
    } else if (comparePhotos.length < 2) {
      setComparePhotos([...comparePhotos, photo]);
    }
  };

  const sortedPhotos = [...photos].sort((a, b) => b.timestamp - a.timestamp);
  const filteredPhotos =
    angleFilter === 'all'
      ? sortedPhotos
      : sortedPhotos.filter((p) => p.angle === angleFilter);

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Add Progress Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                type="date"
                label="Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <div className="space-y-2">
                <label className="block font-semibold text-sm text-text">
                  Angle
                </label>
                <Select value={angle} onValueChange={(v) => setAngle(v as 'front' | 'side' | 'back')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="front">Front</SelectItem>
                    <SelectItem value="side">Side</SelectItem>
                    <SelectItem value="back">Back</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="text"
                label="Notes (optional)"
                placeholder="Any notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all',
                    previewImage
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary hover:bg-primary/5'
                  )}
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="h-full object-contain rounded-lg"
                    />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-text-muted" />
                      <span className="text-sm text-text-muted">
                        Click to upload or drag and drop
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSavePhoto} disabled={!previewImage}>
                <Camera className="w-4 h-4 mr-2" />
                Save Photo
              </Button>
              {previewImage && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setPreviewImage(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Photo Gallery</CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={angleFilter}
                onValueChange={(v) => setAngleFilter(v as AngleFilter)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Angles</SelectItem>
                  <SelectItem value="front">Front</SelectItem>
                  <SelectItem value="side">Side</SelectItem>
                  <SelectItem value="back">Back</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'grid'
                      ? 'bg-primary text-white'
                      : 'hover:bg-primary/10'
                  )}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'list'
                      ? 'bg-primary text-white'
                      : 'hover:bg-primary/10'
                  )}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
              <Button
                variant={compareMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setCompareMode(!compareMode);
                  setComparePhotos([]);
                }}
              >
                Compare
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-12 h-12 mx-auto mb-4 text-text-muted opacity-50" />
              <p className="text-text-muted">
                No photos yet. Add your first progress photo above!
              </p>
            </div>
          ) : (
            <>
              {compareMode && (
                <div className="mb-4 p-4 bg-accent-light/20 rounded-lg">
                  <p className="text-sm text-text-muted mb-2">
                    Select 2 photos to compare ({comparePhotos.length}/2 selected)
                  </p>
                  {comparePhotos.length === 2 && (
                    <Button
                      size="sm"
                      onClick={() => setSelectedPhoto(comparePhotos[0])}
                    >
                      View Comparison
                    </Button>
                  )}
                </div>
              )}

              <div
                className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'
                    : 'space-y-4'
                )}
              >
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className={cn(
                      'relative group rounded-xl overflow-hidden border transition-all',
                      compareMode && comparePhotos.find((p) => p.id === photo.id)
                        ? 'border-2 border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary'
                    )}
                    onClick={() => {
                      if (compareMode) {
                        toggleComparePhoto(photo);
                      } else {
                        setSelectedPhoto(photo);
                      }
                    }}
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <div className="aspect-square">
                          <img
                            src={photo.imageData}
                            alt={`Progress photo from ${formatDate(photo.date)}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-white text-sm font-mono">
                              {formatDate(photo.date)}
                            </p>
                            <Badge variant="site" className="mt-1 text-xs">
                              {photo.angle}
                            </Badge>
                          </div>
                          <div className="absolute top-2 right-2 flex gap-1">
                            <button className="p-1.5 bg-white/20 rounded-full hover:bg-white/40 transition-colors">
                              <ZoomIn className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-4 p-4">
                        <img
                          src={photo.imageData}
                          alt={`Progress photo from ${formatDate(photo.date)}`}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-mono text-primary">
                            {formatDate(photo.date)}
                          </p>
                          <Badge variant="site" className="mt-1">
                            {photo.angle}
                          </Badge>
                          {photo.notes && (
                            <p className="text-sm text-text-muted mt-2">
                              {photo.notes}
                            </p>
                          )}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-error hover:bg-error hover:text-white"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Photo</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this photo?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deletePhoto(photo.id)}
                                className="bg-error hover:bg-error/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Photo Viewer Dialog */}
      <Dialog
        open={!!selectedPhoto}
        onOpenChange={() => {
          setSelectedPhoto(null);
          if (comparePhotos.length === 2) {
            setComparePhotos([]);
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {comparePhotos.length === 2 ? 'Photo Comparison' : 'Photo Details'}
            </DialogTitle>
          </DialogHeader>
          {comparePhotos.length === 2 ? (
            <div className="grid grid-cols-2 gap-4">
              {comparePhotos.map((photo) => (
                <div key={photo.id} className="space-y-2">
                  <img
                    src={photo.imageData}
                    alt={`Progress photo from ${formatDate(photo.date)}`}
                    className="w-full rounded-lg"
                  />
                  <div className="text-center">
                    <p className="font-mono text-primary">{formatDate(photo.date)}</p>
                    <Badge variant="site">{photo.angle}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : selectedPhoto ? (
            <div className="space-y-4">
              <img
                src={selectedPhoto.imageData}
                alt={`Progress photo from ${formatDate(selectedPhoto.date)}`}
                className="w-full max-h-[60vh] object-contain rounded-lg"
              />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-primary">
                    {formatDate(selectedPhoto.date)}
                  </p>
                  <Badge variant="site">{selectedPhoto.angle}</Badge>
                  {selectedPhoto.notes && (
                    <p className="text-sm text-text-muted mt-2">
                      {selectedPhoto.notes}
                    </p>
                  )}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Photo</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this photo?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          deletePhoto(selectedPhoto.id);
                          setSelectedPhoto(null);
                        }}
                        className="bg-error hover:bg-error/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
