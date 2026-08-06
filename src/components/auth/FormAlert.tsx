import { CheckCircle2, TriangleAlert } from 'lucide-react'

import { cn } from '@/lib/utils'

export function FormAlert({
  variant = 'error',
  children,
}: {
  variant?: 'error' | 'success'
  children: React.ReactNode
}) {
  if (!children) return null

  return (
    <div className="mb-5 overflow-hidden">
      <div
        role="alert"
        className={cn(
          'flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13.5px] leading-relaxed',
          variant === 'error'
            ? 'border-red-500/20 bg-red-500/[0.07] text-red-500'
            : 'border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-500',
        )}
      >
        {variant === 'error' ? (
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <span>{children}</span>
      </div>
    </div>
  )
}
