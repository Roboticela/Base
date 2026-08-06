import * as React from 'react'
import { AlertCircle, Eye, EyeOff, Lock } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
  hint?: React.ReactNode
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false)
    const inputId = id ?? props.name
    const errorId = `${inputId}-error`

    return (
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor={inputId}>{label}</Label>
          {hint}
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground">
            <Lock className="h-[15px] w-[15px]" />
          </span>
          <Input
            ref={ref}
            id={inputId}
            type={visible ? 'text' : 'password'}
            invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            autoComplete={props.autoComplete ?? 'current-password'}
            className={cn('pl-10 pr-11', className)}
            {...props}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
          >
            {visible ? (
              <EyeOff className="h-[17px] w-[17px]" />
            ) : (
              <Eye className="h-[17px] w-[17px]" />
            )}
          </button>
        </div>
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="flex items-center gap-1.5 text-[12.5px] font-medium text-red-500"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)
PasswordInput.displayName = 'PasswordInput'
