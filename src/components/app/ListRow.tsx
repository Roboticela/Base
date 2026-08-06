import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function ListRow({
  title,
  meta,
  trailing,
  onClick,
  className,
}: {
  title: ReactNode
  meta?: ReactNode
  trailing?: ReactNode
  onClick?: () => void
  className?: string
}) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors',
        onClick && 'hover:bg-muted/40',
        className,
      )}
    >
      <div className="min-w-0">
        <div className="truncate text-[13.5px] font-medium text-foreground">{title}</div>
        {meta ? <div className="mt-0.5 text-[12px] text-muted-foreground">{meta}</div> : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </Comp>
  )
}
