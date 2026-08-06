import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const emailError =
    touched.email && !email
      ? 'Email is required'
      : touched.email && !isValidEmail(email)
        ? 'Enter a valid email address'
        : undefined
  const passwordError =
    touched.password && !password
      ? 'Password is required'
      : touched.password && password.length < 8
        ? 'Password must be at least 8 characters'
        : undefined

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setTouched({ email: true, password: true })
    setFormError(null)

    if (!email || !isValidEmail(email) || !password || password.length < 8) {
      setFormError('Please fix the highlighted fields and try again.')
      return
    }

    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      setFormError('Invalid email or password. Check your credentials and try again.')
    }, 1200)
  }

  return (
    <AuthCard>
      <AuthHeader
        eyebrow="Welcome back"
        title="Sign in"
        description="Continue to your last workspace and pick up where you left off."
      />

      <form onSubmit={handleSubmit} noValidate>
        <FormAlert variant="error">{formError}</FormAlert>

        <div className="space-y-3">
          <OAuthButton label="Continue with Google" />
          <OAuthButton provider="github" label="Continue with GitHub" />
        </div>

        <Divider />

        <div className="space-y-5">
          <AuthInput
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setTouched((current) => ({ ...current, email: true }))}
            icon={<Mail className="h-[15px] w-[15px]" />}
            error={emailError}
          />

          <PasswordInput
            label="Password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={() => setTouched((current) => ({ ...current, password: true }))}
            error={passwordError}
            hint={
              <Link
                to="/forgot-password"
                className="text-[12.5px] font-medium text-primary transition-opacity hover:opacity-80"
              >
                Forgot password?
              </Link>
            }
          />

          <div className="flex items-center gap-2.5">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <Label htmlFor="remember-me" className="cursor-pointer text-[13.5px] text-muted-foreground">
              Remember me on this device
            </Label>
          </div>

          <LoadingButton type="submit" loading={loading} loadingText="Signing in">
            Sign in
          </LoadingButton>
        </div>
      </form>

      <AuthFooter prompt="Don't have an account?" linkLabel="Create one" href="/register" />
    </AuthCard>
  )
}
