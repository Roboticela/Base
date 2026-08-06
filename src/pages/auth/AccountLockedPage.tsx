import { Link, useNavigate } from 'react-router-dom'
import { LifeBuoy, LockKeyhole } from 'lucide-react'

import { AuthCard } from '@/components/auth/AuthCard'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { LoadingButton } from '@/components/auth/LoadingButton'
import { StatusIcon } from '@/components/auth/StatusIcon'

export function AccountLockedPage() {
  const navigate = useNavigate()

  return (
    <AuthCard>
      <AuthHeader
        eyebrow="Security"
        title="Account locked"
        description="Too many unsuccessful sign-in attempts triggered a temporary lock."
      />

      <StatusIcon tone="error">
        <LockKeyhole className="h-6 w-6" />
      </StatusIcon>

      <div className="mb-6 space-y-4 text-[14.5px] leading-relaxed text-muted-foreground">
        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <p className="font-medium text-foreground">Lock reason</p>
          <p className="mt-1">
            Multiple failed password attempts were detected from this device in a short window.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <p className="font-medium text-foreground">Recovery instructions</p>
          <ol className="mt-2 list-decimal space-y-1.5 pl-4">
            <li>Wait 30 minutes for the automatic unlock, or</li>
            <li>Reset your password using a verified email, or</li>
            <li>Contact support if you believe this was a mistake.</li>
          </ol>
        </div>
      </div>

      <div className="space-y-3">
        <LoadingButton type="button" onClick={() => navigate('/forgot-password')}>
          Reset password
        </LoadingButton>
        <a
          href="mailto:support@base.roboticela.com"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-transparent text-[15px] font-medium text-foreground transition-all hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
        >
          <LifeBuoy className="h-4 w-4" />
          Contact support
        </a>
      </div>

      <p className="mt-8 text-center text-[13.5px] text-muted-foreground">
        <Link to="/login" className="font-medium text-primary hover:underline">
          ← Back to login
        </Link>
      </p>
    </AuthCard>
  )
}
