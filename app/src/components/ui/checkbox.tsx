import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    label?: string;
  }
>(({ className, label, ...props }, ref) => {
  const id = React.useId();

  if (label) {
    return (
      <div className="flex items-center gap-3">
        <CheckboxPrimitive.Root
          ref={ref}
          id={id}
          className={cn(
            'peer h-5 w-5 shrink-0 rounded border-2 border-border bg-bg transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'data-[state=checked]:bg-accent data-[state=checked]:border-accent',
            className
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator
            className={cn('flex items-center justify-center text-white')}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        <label
          htmlFor={id}
          className="text-sm font-medium text-text cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
        >
          {label}
        </label>
      </div>
    );
  }

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        'peer h-5 w-5 shrink-0 rounded border-2 border-border bg-bg transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-accent data-[state=checked]:border-accent',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn('flex items-center justify-center text-white')}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
