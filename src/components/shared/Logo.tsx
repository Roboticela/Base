import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      className={cn('h-full w-full', className)}
      aria-hidden="true"
    >
      <rect x="48" y="48" width="416" height="416" rx="120" fill="#6366f1" />
      <path
        fill="#FFFFFF"
        d="M256 122C340 122 392 182 392 256C392 338 334 392 256 392C176 392 120 336 120 256C120 176 178 122 256 122Z"
      />
      <path fill="#4338CA" d="M225 195 322 256 225 317Z" />
      <path
        fill="#FFFFFF"
        d="M350 150 360 178 388 188 360 198 350 226 340 198 312 188 340 178Z"
      />
      <path
        fill="#FFFFFF"
        opacity=".9"
        d="M146 322 152 338 168 344 152 350 146 366 140 350 124 344 140 338Z"
      />
    </svg>
  )
}

export function Logo({
  className,
  markClassName,
  wordmarkClassName,
  showWordmark = true,
}: {
  className?: string
  markClassName?: string
  wordmarkClassName?: string
  showWordmark?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className={cn('relative h-7 w-7 shrink-0', markClassName)}>
        <LogoMark />
      </span>
      {showWordmark ? (
        <span
          className={cn(
            'text-[16.5px] font-semibold tracking-tight text-foreground',
            wordmarkClassName,
          )}
        >
          B<span className="text-primary">ase</span>
        </span>
      ) : null}
    </span>
  )
}
