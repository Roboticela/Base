import * as React from 'react'
import { AlertCircle } from 'lucide-react'

import { Input, type InputProps } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface AuthInputProps extends InputProps {
  label: string
  error?: string
  icon?: React.ReactNode
  hint?: React.ReactNode
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, icon, hint, id, className, ...props }, ref) => {
    const inputId = id ?? props.name
    const errorId = `${inputId}-error`

    return (
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor={inputId}>{label}</Label>
          {hint}
        </div>
        <div className="relative">
          {icon ? (
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground">
              {icon}
            </span>
          ) : null}
          <Input
            ref={ref}
            id={inputId}
            invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={cn(icon ? 'pl-10' : undefined, className)}
            {...props}
          />
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
AuthInput.displayName = 'AuthInput'
