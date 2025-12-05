import { Link, useLocation } from 'react-router-dom';
import {
  Syringe,
  Scale,
  Activity,
  Camera,
  BarChart3,
  FileText,
  Dumbbell,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Injections', icon: Syringe },
  { path: '/weight', label: 'Weight', icon: Scale },
  { path: '/muscle', label: 'Muscle', icon: Dumbbell },
  { path: '/levels', label: 'Med Levels', icon: Activity },
  { path: '/photos', label: 'Photos', icon: Camera },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/report', label: 'Report', icon: FileText },
];

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-bg-card border-b-2 border-primary sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <h1 className="font-serif text-2xl text-primary">GLP-1 Tracker</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-text-muted hover:bg-primary/10 hover:text-primary'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-primary" />
            ) : (
              <Menu className="w-6 h-6 text-primary" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border animate-fade-in">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary text-white'
                        : 'bg-bg text-text-muted hover:bg-primary/10 hover:text-primary'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>

      {/* Accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent" />
    </header>
  );
}
