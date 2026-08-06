import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: {
  icon?: ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center px-4 py-10 text-center', className)}>
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground">
          {icon}
        </div>
      ) : null}
      <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      {actionLabel && onAction ? (
        <Button type="button" variant="accent" size="sm" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
