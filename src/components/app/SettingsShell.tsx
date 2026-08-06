import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function SettingsNav({
  items,
  value,
  onChange,
}: {
  items: { id: string; label: string }[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={cn(
            'shrink-0 rounded-xl px-3 py-2 text-left text-[13px] font-medium transition-colors',
            value === item.id
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          )}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}

export function SettingsShell({
  nav,
  children,
}: {
  nav: ReactNode
  children: ReactNode
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">{nav}</aside>
      <div className="min-w-0 space-y-6">{children}</div>
    </div>
  )
}
