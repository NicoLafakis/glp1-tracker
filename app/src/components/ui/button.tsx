import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wide',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-white shadow-md hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0',
        secondary:
          'bg-accent text-primary-dark shadow-md hover:bg-accent-light hover:-translate-y-0.5 hover:shadow-lg',
        outline:
          'border-2 border-border bg-bg hover:border-primary-light hover:bg-primary-light hover:text-white hover:-translate-y-0.5',
        ghost:
          'hover:bg-primary/10 hover:text-primary',
        link:
          'text-primary underline-offset-4 hover:underline',
        destructive:
          'bg-error text-white shadow-md hover:bg-error/90 hover:-translate-y-0.5 hover:shadow-lg',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
