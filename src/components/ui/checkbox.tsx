import * as React from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, id, checked, onChange, disabled, ...props }, ref) => {
    return (
      <label
        className={cn(
          'relative inline-flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <input
          ref={ref}
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <span
          className={cn(
            'flex h-[18px] w-[18px] items-center justify-center rounded-md border border-border bg-background transition-all duration-150',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-foreground/20 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
            'peer-checked:border-foreground peer-checked:bg-foreground',
          )}
        >
          <Check
            className={cn(
              'h-3 w-3 text-background opacity-0 transition-opacity',
              checked && 'opacity-100',
            )}
            strokeWidth={3}
          />
        </span>
      </label>
    )
  },
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
