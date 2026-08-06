import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  children: ReactNode
  variant?: 'accent' | 'default' | 'outline' | 'destructive'
}

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  variant = 'accent',
  ...props
}: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(buttonVariants({ variant, size: 'lg' }), 'w-full', className)}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText ?? 'Please wait'}
        </>
      ) : (
        children
      )}
    </button>
  )
}
