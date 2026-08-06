import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'

import { AuthCard } from '@/components/auth/AuthCard'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { FormAlert } from '@/components/auth/FormAlert'
import { LoadingButton } from '@/components/auth/LoadingButton'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { PasswordStrength } from '@/components/auth/PasswordStrength'
import { StatusIcon } from '@/components/auth/StatusIcon'
import { useCountdown } from '@/hooks/use-countdown'
import { getPasswordStrength } from '@/lib/password-strength'

const REDIRECT_SECONDS = 4

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [touched, setTouched] = useState({ password: false, confirmPassword: false })
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [succeeded, setSucceeded] = useState(false)
  const { secondsLeft, start } = useCountdown(0)

  const strength = getPasswordStrength(password)
  const passwordError =
    touched.password && strength.score < 4
      ? 'Password does not meet all requirements'
      : undefined
  const confirmError =
    touched.confirmPassword && confirmPassword !== password
      ? 'Passwords do not match'
      : undefined

  useEffect(() => {
    if (succeeded) start(REDIRECT_SECONDS)
  }, [succeeded, start])

  useEffect(() => {
    if (succeeded && secondsLeft === 0) {
      navigate('/login')
    }
  }, [succeeded, secondsLeft, navigate])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setTouched({ password: true, confirmPassword: true })
    setFormError(null)

    if (strength.score < 4 || confirmPassword !== password) {
      setFormError('Please choose a stronger password and confirm it matches.')
      return
    }

    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      setSucceeded(true)
    }, 1000)
  }

  if (succeeded) {
    return (
      <AuthCard>
        <AuthHeader
          eyebrow="Password reset"
          title="Password updated"
          description="Your new password is ready. You'll be redirected to sign in."
        />
        <StatusIcon tone="success">
          <CheckCircle2 className="h-6 w-6" />
        </StatusIcon>
        <p className="text-[14.5px] leading-relaxed text-muted-foreground">
          Redirecting to login in {secondsLeft}s…
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block text-[13.5px] font-medium text-foreground underline-offset-4 hover:underline"
        >
          Go to login now
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <AuthHeader
        eyebrow="Password reset"
        title="Set a new password"
        description="Choose a strong password you haven't used before."
      />

      <form onSubmit={handleSubmit} noValidate>
        <FormAlert variant="error">{formError}</FormAlert>

        <div className="space-y-5">
          <div>
            <PasswordInput
              label="New password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, password: true }))}
              error={passwordError}
            />
            <PasswordStrength password={password} />
          </div>

          <PasswordInput
            label="Confirm password"
            name="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
            error={confirmError}
          />

          <LoadingButton type="submit" loading={loading} loadingText="Updating password">
            Update password
          </LoadingButton>
        </div>
      </form>
    </AuthCard>
  )
}
