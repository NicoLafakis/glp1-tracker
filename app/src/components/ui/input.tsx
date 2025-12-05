import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-semibold text-sm text-text"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 border-2 border-border rounded-lg font-sans text-base text-text bg-bg transition-all duration-200',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10',
            'placeholder:text-text-muted',
            error && 'border-error focus:border-error focus:ring-error/10',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
