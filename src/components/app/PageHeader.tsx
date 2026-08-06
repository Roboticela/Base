import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div>
        {eyebrow ? (
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.1em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1.5 text-[26px] font-semibold tracking-tight text-foreground sm:text-[30px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-xl text-[14.5px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div> : null}
    </div>
  )
}
