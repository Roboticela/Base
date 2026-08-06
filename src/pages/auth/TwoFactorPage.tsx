import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound, ShieldCheck } from 'lucide-react'

import { AuthCard } from '@/components/auth/AuthCard'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { AuthInput } from '@/components/auth/AuthInput'
import { FormAlert } from '@/components/auth/FormAlert'
import { LoadingButton } from '@/components/auth/LoadingButton'
import { useCountdown } from '@/hooks/use-countdown'
import { cn } from '@/lib/utils'

const CODE_LENGTH = 6
const RESEND_SECONDS = 30

export function TwoFactorPage() {
  const navigate = useNavigate()
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [mode, setMode] = useState<'code' | 'recovery'>('code')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const { secondsLeft, start, isActive } = useCountdown(RESEND_SECONDS)
  const code = digits.join('')

  useEffect(() => {
    start(RESEND_SECONDS)
    inputsRef.current[0]?.focus()
  }, [start])

  useEffect(() => {
    if (mode === 'code' && code.length === CODE_LENGTH && !loading && !success) {
      submitCode(code)
    }
  }, [code, mode, loading, success])

  function submitCode(value: string) {
    setFormError(null)
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      if (value === '123456') {
        setSuccess(true)
      } else {
        setFormError('Incorrect verification code. Try again or use a recovery code.')
        setDigits(Array(CODE_LENGTH).fill(''))
        inputsRef.current[0]?.focus()
      }
    }, 900)
  }

  function handleChange(index: number, value: string) {
    const cleaned = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = cleaned
    setDigits(next)
    if (cleaned && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (!pasted) return
    const next = Array(CODE_LENGTH)
      .fill('')
      .map((_, index) => pasted[index] ?? '')
    setDigits(next)
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1)
    inputsRef.current[focusIndex]?.focus()
  }

  function handleRecoverySubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    if (!recoveryCode.trim()) {
      setFormError('Enter a recovery code to continue.')
      return
    }
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      setSuccess(true)
    }, 900)
  }

  if (success) {
    return (
      <AuthCard>
        <AuthHeader
          eyebrow="Verified"
          title="You're in"
          description="Two-factor authentication succeeded. Continuing to your workspace."
        />
        <FormAlert variant="success">Authentication complete.</FormAlert>
        <LoadingButton type="button" onClick={() => navigate('/')}>
          Continue
        </LoadingButton>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <AuthHeader
        eyebrow="Security check"
        title="Two-factor authentication"
        description={
          mode === 'code'
            ? 'Enter the 6-digit code from your authenticator app or email.'
            : 'Enter one of your single-use recovery codes.'
        }
      />

      <FormAlert variant="error">{formError}</FormAlert>

      {mode === 'code' ? (
        <div className="space-y-5">
          <div className="flex justify-center gap-2 sm:gap-2.5">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputsRef.current[index] = element
                }}
                inputMode="numeric"
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                maxLength={1}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                aria-label={`Digit ${index + 1}`}
                className={cn(
                  'h-12 w-10 rounded-xl border border-border bg-background text-center text-[18px] font-semibold text-foreground outline-none transition-all sm:h-14 sm:w-12 sm:text-[20px]',
                  'focus:border-primary/40 focus:ring-2 focus:ring-primary/15',
                )}
              />
            ))}
          </div>

          <LoadingButton type="button" loading={loading} loadingText="Verifying" onClick={() => submitCode(code)}>
            Verify code
          </LoadingButton>

          <div className="flex flex-col items-center gap-2 text-[13.5px]">
            <button
              type="button"
              disabled={isActive || loading}
              onClick={() => start(RESEND_SECONDS)}
              className="font-medium text-foreground underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isActive ? `Resend code in ${secondsLeft}s` : 'Resend code'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('recovery')
                setFormError(null)
              }}
              className="inline-flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Use a recovery code
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleRecoverySubmit} className="space-y-5" noValidate>
          <AuthInput
            label="Recovery code"
            name="recoveryCode"
            placeholder="XXXX-XXXX-XXXX"
            icon={<ShieldCheck className="h-[15px] w-[15px]" />}
            value={recoveryCode}
            onChange={(event) => setRecoveryCode(event.target.value)}
          />
          <LoadingButton type="submit" loading={loading} loadingText="Verifying">
            Verify recovery code
          </LoadingButton>
          <button
            type="button"
            onClick={() => {
              setMode('code')
              setFormError(null)
            }}
            className="w-full text-center text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Switch to authenticator code
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-[13.5px] text-muted-foreground">
        <Link to="/login" className="font-medium text-primary hover:underline">
          ← Back to login
        </Link>
      </p>
    </AuthCard>
  )
}
