import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function AuthCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative w-full rounded-[22px] border border-border bg-card p-8 sm:p-10',
        className,
      )}
    >
      {children}
    </div>
  )
}
