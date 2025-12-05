import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-text-muted font-mono">
          GLP-1 Shot Tracker &bull; Personal Health Management
        </div>
      </footer>
    </div>
  );
}
