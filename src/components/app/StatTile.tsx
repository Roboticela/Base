import { cn } from '@/lib/utils'

export function StatTile({
  label,
  value,
  meta,
  className,
}: {
  label: string
  value: string
  meta?: string
  className?: string
}) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
      <p className="text-[12.5px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-[22px] font-semibold tracking-tight text-foreground">{value}</p>
      {meta ? <p className="mt-1 text-[12px] text-muted-foreground">{meta}</p> : null}
    </div>
  )
}
