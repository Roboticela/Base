import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

export function StatusIcon({
  children,
  tone = 'success',
}: {
  children: ReactNode
  tone?: 'success' | 'warning' | 'error' | 'info'
}) {
  return (
    <div
      className={cn(
        'mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl',
        tone === 'success' && 'bg-emerald-500/10 text-emerald-500',
        tone === 'warning' && 'bg-amber-500/10 text-amber-500',
        tone === 'error' && 'bg-red-500/10 text-red-500',
        tone === 'info' && 'bg-blue-500/10 text-blue-500',
      )}
    >
      {children}
    </div>
  )
}

export function BackLink({ to = '/login', label = '← Back to login' }: { to?: string; label?: string }) {
  return (
    <Link
      to={to}
      className="mt-8 inline-block text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      {label}
    </Link>
  )
}
