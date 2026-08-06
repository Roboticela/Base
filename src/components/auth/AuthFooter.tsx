import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AuthFooter({
  prompt,
  linkLabel,
  href,
}: {
  prompt: ReactNode
  linkLabel: string
  href: string
}) {
  return (
    <p className="mt-8 text-center text-[14px] text-muted-foreground">
      {prompt}{' '}
      <Link
        to={href}
        className="font-medium text-primary underline-offset-4 transition-opacity hover:underline hover:opacity-80 focus-visible:outline-none focus-visible:underline"
      >
        {linkLabel}
      </Link>
    </p>
  )
}
