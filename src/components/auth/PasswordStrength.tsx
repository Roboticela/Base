import { Check, X } from 'lucide-react'

import { getPasswordStrength } from '@/lib/password-strength'
import { cn } from '@/lib/utils'

const BAR_COLORS = [
  'bg-border',
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-emerald-500',
]

export function PasswordStrength({ password }: { password: string }) {
  const { score, label, requirements } = getPasswordStrength(password)
  const filledBars = password.length === 0 ? 0 : Math.max(score, 1)

  return (
    <div className="space-y-3 pt-1">
      <div className="space-y-1.5">
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full w-full origin-left transition-transform duration-300 ease-out',
                  BAR_COLORS[filledBars] ?? BAR_COLORS[0],
                  index < filledBars ? 'scale-x-100' : 'scale-x-0',
                )}
              />
            </div>
          ))}
        </div>
        {password.length > 0 ? (
          <p className="text-[12.5px] font-medium text-muted-foreground">
            Password strength: <span className="text-foreground">{label}</span>
          </p>
        ) : null}
      </div>

      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {requirements.map((requirement) => (
          <li
            key={requirement.id}
            className={cn(
              'flex items-center gap-1.5 text-[12.5px] transition-colors duration-200',
              requirement.met ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            <span
              className={cn(
                'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-200',
                requirement.met
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-border text-transparent',
              )}
            >
              {requirement.met ? (
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              ) : (
                <X className="h-2.5 w-2.5" strokeWidth={3} />
              )}
            </span>
            {requirement.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
