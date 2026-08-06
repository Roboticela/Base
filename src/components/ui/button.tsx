import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:pointer-events-none [&_svg]:shrink-0 select-none',
  {
    variants: {
      variant: {
        default:
          'bg-foreground text-background hover:opacity-90 focus-visible:ring-foreground/40 active:scale-[0.98]',
        accent:
          'bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-primary/40 active:scale-[0.98]',
        outline:
          'border border-border bg-transparent text-foreground hover:bg-muted/60 focus-visible:ring-foreground/20 active:scale-[0.98]',
        ghost:
          'bg-transparent text-foreground hover:bg-muted/60 focus-visible:ring-foreground/20 active:scale-[0.98]',
        link: 'text-foreground underline-offset-4 hover:underline',
        destructive:
          'bg-destructive text-destructive-foreground hover:opacity-90 focus-visible:ring-destructive/40 active:scale-[0.98]',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 px-4 text-[13px]',
        lg: 'h-12 px-7 text-[15px]',
        xl: 'h-14 px-8 text-[15.5px]',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
