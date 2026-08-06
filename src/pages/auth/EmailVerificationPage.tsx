import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, RefreshCw } from 'lucide-react'

import { AuthCard } from '@/components/auth/AuthCard'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { FormAlert } from '@/components/auth/FormAlert'
import { LoadingButton } from '@/components/auth/LoadingButton'
import { StatusIcon } from '@/components/auth/StatusIcon'
import { useCountdown } from '@/hooks/use-countdown'

const RESEND_SECONDS = 60

export function EmailVerificationPage() {
  const navigate = useNavigate()
  const [email] = useState('you@company.com')
  const [status, setStatus] = useState<'pending' | 'checking' | 'verified'>('pending')
  const [loading, setLoading] = useState(false)
  const { secondsLeft, start, isActive } = useCountdown(RESEND_SECONDS)

  useEffect(() => {
    start(RESEND_SECONDS)
  }, [start])

  useEffect(() => {
    if (status !== 'pending') return
    const id = window.setTimeout(() => {
      setStatus('checking')
      window.setTimeout(() => {
        setStatus('verified')
        navigate('/email-verified')
      }, 1200)
    }, 8000)
    return () => window.clearTimeout(id)
  }, [status, navigate])

  function handleResend() {
    if (isActive || loading) return
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      start(RESEND_SECONDS)
    }, 800)
  }

  return (
    <AuthCard>
      <AuthHeader
        eyebrow="Verify email"
        title="Confirm your email"
        description="We sent a verification link to your inbox. Open it to continue."
      />

      <StatusIcon tone={status === 'checking' ? 'info' : 'warning'}>
        {status === 'checking' ? (
          <RefreshCw className="h-6 w-6 animate-spin" />
        ) : (
          <Mail className="h-6 w-6" />
        )}
      </StatusIcon>

      <div className="space-y-4 text-[14.5px] leading-relaxed text-muted-foreground">
        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <p className="text-[12.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Status
          </p>
          <p className="mt-1 font-medium text-foreground">
            {status === 'checking' ? 'Verification detected — continuing…' : 'Waiting for verification'}
          </p>
        </div>

        <p>
          Registered email:{' '}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <FormAlert variant="success">
        {status === 'checking'
          ? 'Email verified. Taking you to the next step…'
          : null}
      </FormAlert>

      <div className="mt-6 space-y-3">
        <LoadingButton
          type="button"
          loading={loading}
          loadingText="Sending"
          disabled={isActive}
          onClick={handleResend}
        >
          {isActive ? `Resend in ${secondsLeft}s` : 'Resend verification email'}
        </LoadingButton>

        <button
          type="button"
          className="w-full text-center text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Change email
        </button>
      </div>

      <p className="mt-8 text-center text-[13.5px] text-muted-foreground">
        Already verified?{' '}
        <Link to="/email-verified" className="font-medium text-primary hover:underline">
          Continue
        </Link>
      </p>
    </AuthCard>
  )
}
