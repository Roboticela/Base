import { useNavigate } from 'react-router-dom'
import { TimerOff } from 'lucide-react'

import { AuthCard } from '@/components/auth/AuthCard'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { LoadingButton } from '@/components/auth/LoadingButton'
import { StatusIcon } from '@/components/auth/StatusIcon'

export function SessionExpiredPage() {
  const navigate = useNavigate()

  return (
    <AuthCard>
      <AuthHeader
        eyebrow="Session"
        title="Session expired"
        description="For your security, you were signed out after a period of inactivity."
      />

      <StatusIcon tone="warning">
        <TimerOff className="h-6 w-6" />
      </StatusIcon>

      <div className="mb-6 rounded-xl border border-border bg-background px-4 py-3 text-[14px] leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground">Reason</p>
        <p className="mt-1">
          Your authentication token expired. Unsaved draft changes were preserved locally when
          possible.
        </p>
      </div>

      <LoadingButton type="button" onClick={() => navigate('/login')}>
        Login again
      </LoadingButton>

      <p className="mt-6 text-center text-[13.5px] text-muted-foreground">
        After signing in, we&apos;ll return you to your previous page.
      </p>
    </AuthCard>
  )
}
