import * as React from 'react'

import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, invalid, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'flex h-11 w-full rounded-xl border border-border bg-background px-3.5 text-[14.5px] text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/70',
          'focus:border-primary/40 focus:ring-2 focus:ring-primary/15',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'aria-[invalid=true]:border-red-500/60 aria-[invalid=true]:focus:ring-red-500/15',
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
