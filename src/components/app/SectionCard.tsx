import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  padded = true,
}: {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card', className)}>
      {title || actions ? (
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-[15px] font-semibold tracking-tight text-foreground">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className={padded ? 'p-5 sm:p-6' : undefined}>{children}</div>
    </div>
  )
}
