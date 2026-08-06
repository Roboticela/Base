import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MailCheck } from 'lucide-react'

import { AuthCard } from '@/components/auth/AuthCard'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { AuthInput } from '@/components/auth/AuthInput'
import { FormAlert } from '@/components/auth/FormAlert'
import { LoadingButton } from '@/components/auth/LoadingButton'
import { StatusIcon } from '@/components/auth/StatusIcon'
import { useCountdown } from '@/hooks/use-countdown'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const RESEND_SECONDS = 45

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const { secondsLeft, start, isActive } = useCountdown(0)

  const emailError =
    touched && !email
      ? 'Email is required'
      : touched && !isValidEmail(email)
        ? 'Enter a valid email address'
        : undefined

  function submit(targetEmail: string) {
    setFormError(null)
    if (!isValidEmail(targetEmail)) {
      setTouched(true)
      setFormError('Enter a valid email address to continue.')
      return
    }

    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      setSentTo(targetEmail)
      start(RESEND_SECONDS)
    }, 900)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setTouched(true)
    submit(email)
  }

  if (sentTo) {
    return (
      <AuthCard>
        <AuthHeader
          eyebrow="Reset password"
          title="Check your inbox"
          description="We sent a secure link to reset your password."
        />
        <StatusIcon tone="success">
          <MailCheck className="h-6 w-6" />
        </StatusIcon>
        <p className="text-[14.5px] leading-relaxed text-muted-foreground">
          A reset link was sent to <span className="font-medium text-foreground">{sentTo}</span>.
          It expires in 15 minutes.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <LoadingButton
            type="button"
            loading={loading}
            loadingText="Sending"
            disabled={isActive}
            onClick={() => submit(sentTo)}
          >
            {isActive ? `Resend email in ${secondsLeft}s` : 'Resend email'}
          </LoadingButton>
          <button
            type="button"
            onClick={() => {
              setSentTo(null)
              setEmail('')
              setTouched(false)
            }}
            className="text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Change email
          </button>
        </div>

        <Link
          to="/login"
          className="mt-8 inline-block text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to login
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <AuthHeader
        eyebrow="Reset password"
        title="Forgot password?"
        description="Enter your email and we'll send a link to reset your password."
      />

      <form onSubmit={handleSubmit} noValidate>
        <FormAlert variant="error">{formError}</FormAlert>

        <div className="space-y-5">
          <AuthInput
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            icon={<Mail className="h-[15px] w-[15px]" />}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setTouched(true)}
            error={emailError}
          />

          <LoadingButton type="submit" loading={loading} loadingText="Sending link">
            Send reset link
          </LoadingButton>

          <Link
            to="/login"
            className="block text-center text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to login
          </Link>
        </div>
      </form>
    </AuthCard>
  )
}
