import type { ReactNode } from 'react'

export function AuthHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description?: ReactNode
}) {
  return (
    <div className="mb-8 text-center">
      {eyebrow ? (
        <p className="mb-3 text-[12.5px] font-semibold uppercase tracking-[0.12em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-balance text-[28px] font-semibold leading-[1.12] tracking-tight text-foreground sm:text-[34px]">
        {title}
      </h1>
      {description ? (
        <p className="mx-auto mt-3 max-w-sm text-balance text-[15px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  )
}
