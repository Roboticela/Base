import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'

import { AuthCard } from '@/components/auth/AuthCard'
import { AuthFooter } from '@/components/auth/AuthFooter'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { AuthInput } from '@/components/auth/AuthInput'
import { Divider } from '@/components/auth/Divider'
import { FormAlert } from '@/components/auth/FormAlert'
import { LoadingButton } from '@/components/auth/LoadingButton'
import { OAuthButton } from '@/components/auth/OAuthButton'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { PasswordStrength } from '@/components/auth/PasswordStrength'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { getPasswordStrength } from '@/lib/password-strength'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [newsletter, setNewsletter] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const strength = getPasswordStrength(password)

  const errors = {
    firstName: touched.firstName && !firstName ? 'First name is required' : undefined,
    lastName: touched.lastName && !lastName ? 'Last name is required' : undefined,
    email:
      touched.email && !email
        ? 'Email is required'
        : touched.email && !isValidEmail(email)
          ? 'Enter a valid email address'
          : undefined,
    password:
      touched.password && strength.score < 4
        ? 'Password does not meet all requirements'
        : undefined,
    confirmPassword:
      touched.confirmPassword && confirmPassword !== password
        ? 'Passwords do not match'
        : undefined,
    acceptTerms:
      touched.acceptTerms && !acceptTerms ? 'You must accept the terms to continue' : undefined,
  }

  function markTouched(field: string) {
    setTouched((current) => ({ ...current, [field]: true }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
      acceptTerms: true,
    })
    setFormError(null)

    if (
      !firstName ||
      !lastName ||
      !isValidEmail(email) ||
      strength.score < 4 ||
      confirmPassword !== password ||
      !acceptTerms
    ) {
      setFormError('Please complete all required fields before continuing.')
      return
    }

    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      setSuccess(true)
    }, 1200)
  }

  if (success) {
    return (
      <AuthCard>
        <AuthHeader
          eyebrow="Almost there"
          title="Account created"
          description="Next you'll verify your email, then continue into onboarding."
        />
        <FormAlert variant="success">
          Welcome, {firstName}. We sent a verification link to {email}.
        </FormAlert>
        <LoadingButton type="button" onClick={() => navigate('/email-verification')}>
          Continue to email verification
        </LoadingButton>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <AuthHeader
        eyebrow="Get started"
        title="Create account"
        description="Set up your profile and join your workspace in a few steps."
      />

      <form onSubmit={handleSubmit} noValidate>
        <FormAlert variant="error">{formError}</FormAlert>

        <div className="space-y-3">
          <OAuthButton label="Sign up with Google" />
          <OAuthButton provider="github" label="Sign up with GitHub" />
        </div>

        <Divider label="or register with email" />

        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <AuthInput
              label="First name"
              name="firstName"
              autoComplete="given-name"
              placeholder="Jordan"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              onBlur={() => markTouched('firstName')}
              error={errors.firstName}
            />
            <AuthInput
              label="Last name"
              name="lastName"
              autoComplete="family-name"
              placeholder="Avery"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              onBlur={() => markTouched('lastName')}
              error={errors.lastName}
            />
          </div>

          <AuthInput
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            icon={<Mail className="h-[15px] w-[15px]" />}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => markTouched('email')}
            error={errors.email}
          />

          <div>
            <PasswordInput
              label="Password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={() => markTouched('password')}
              error={errors.password}
            />
            <PasswordStrength password={password} />
          </div>

          <PasswordInput
            label="Confirm password"
            name="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            onBlur={() => markTouched('confirmPassword')}
            error={errors.confirmPassword}
          />

          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onChange={(event) => {
                  setAcceptTerms(event.target.checked)
                  markTouched('acceptTerms')
                }}
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="cursor-pointer text-[13.5px] leading-relaxed text-muted-foreground">
                I agree to the{' '}
                <a
                  href="https://roboticela.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary underline underline-offset-2 hover:opacity-80"
                  onClick={(event) => event.stopPropagation()}
                >
                  Terms & Conditions
                </a>{' '}
                and{' '}
                <a
                  href="https://roboticela.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary underline underline-offset-2 hover:opacity-80"
                  onClick={(event) => event.stopPropagation()}
                >
                  Privacy Policy
                </a>
              </Label>
            </div>
            {errors.acceptTerms ? (
              <p className="text-[12.5px] font-medium text-red-500">{errors.acceptTerms}</p>
            ) : null}

            <div className="flex items-start gap-2.5">
              <Checkbox
                id="newsletter"
                checked={newsletter}
                onChange={(event) => setNewsletter(event.target.checked)}
                className="mt-0.5"
              />
              <Label htmlFor="newsletter" className="cursor-pointer text-[13.5px] leading-relaxed text-muted-foreground">
                Send me product updates and tips (optional)
              </Label>
            </div>
          </div>

          <LoadingButton type="submit" loading={loading} loadingText="Creating account">
            Create account
          </LoadingButton>
        </div>
      </form>

      <AuthFooter prompt="Already have an account?" linkLabel="Sign in" href="/login" />
    </AuthCard>
  )
}
