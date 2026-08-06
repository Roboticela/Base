import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BadgeCheck } from 'lucide-react'

import { AuthCard } from '@/components/auth/AuthCard'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { LoadingButton } from '@/components/auth/LoadingButton'
import { StatusIcon } from '@/components/auth/StatusIcon'
import { useCountdown } from '@/hooks/use-countdown'

const REDIRECT_SECONDS = 5

export function EmailVerifiedPage() {
  const navigate = useNavigate()
  const { secondsLeft, start } = useCountdown(REDIRECT_SECONDS)

  useEffect(() => {
    start(REDIRECT_SECONDS)
  }, [start])

  useEffect(() => {
    if (secondsLeft === 0) {
      navigate('/')
    }
  }, [secondsLeft, navigate])

  return (
    <AuthCard>
      <AuthHeader
        eyebrow="All set"
        title="Email verified"
        description="Your account is confirmed. You can continue into the application."
      />

      <StatusIcon tone="success">
        <BadgeCheck className="h-6 w-6" />
      </StatusIcon>

      <p className="mb-6 text-[14.5px] leading-relaxed text-muted-foreground">
        Redirecting automatically in {secondsLeft}s…
      </p>

      <LoadingButton type="button" onClick={() => navigate('/')}>
        Continue to application
      </LoadingButton>

      <p className="mt-6 text-center text-[13.5px] text-muted-foreground">
        Prefer to sign in again?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Go to login
        </Link>
      </p>
    </AuthCard>
  )
}
