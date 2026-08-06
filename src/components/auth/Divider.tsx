export function Divider({ label = 'or continue with email' }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-3" role="separator">
      <span className="h-px flex-1 bg-border" />
      <span className="shrink-0 text-[11.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}
