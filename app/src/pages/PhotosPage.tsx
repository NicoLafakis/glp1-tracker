import { PhotoGallery } from '@/components/features';

export function PhotosPage() {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl text-primary mb-2">Progress Photos</h1>
        <p className="text-text-muted">Document your visual transformation</p>
      </div>
      <PhotoGallery />
    </div>
  );
}
