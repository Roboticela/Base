import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, CheckCircle2, XCircle } from 'lucide-react'

import { AuthCard } from '@/components/auth/AuthCard'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { LoadingButton } from '@/components/auth/LoadingButton'
import { StatusIcon } from '@/components/auth/StatusIcon'
import { LogoMark } from '@/components/shared/Logo'

export function AcceptInvitationPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null)
  const [result, setResult] = useState<'accepted' | 'declined' | null>(null)
  const [needsAccount] = useState(false)

  const invitation = {
    workspaceName: 'Acme Studio',
    invitedBy: 'Alex Rivera',
    role: 'Editor',
  }

  function handleAccept() {
    setLoading('accept')
    window.setTimeout(() => {
      setLoading(null)
      if (needsAccount) {
        navigate('/register')
        return
      }
      setResult('accepted')
    }, 900)
  }

  function handleDecline() {
    setLoading('decline')
    window.setTimeout(() => {
      setLoading(null)
      setResult('declined')
    }, 700)
  }

  if (result === 'accepted') {
    return (
      <AuthCard>
        <AuthHeader
          eyebrow="Invitation"
          title="You're in"
          description={`Welcome to ${invitation.workspaceName}.`}
        />
        <div className="text-center">
          <StatusIcon tone="success">
            <CheckCircle2 className="h-6 w-6" />
          </StatusIcon>
          <p className="mb-6 text-[14.5px] leading-relaxed text-muted-foreground">
            Invitation accepted. Your role is{' '}
            <span className="font-medium text-foreground">{invitation.role}</span>.
          </p>
          <LoadingButton type="button" onClick={() => navigate('/')}>
            Continue to workspace
          </LoadingButton>
        </div>
      </AuthCard>
    )
  }

  if (result === 'declined') {
    return (
      <AuthCard>
        <AuthHeader
          eyebrow="Invitation"
          title="Invitation declined"
          description="You declined the invite to join this workspace."
        />
        <div className="text-center">
          <StatusIcon tone="error">
            <XCircle className="h-6 w-6" />
          </StatusIcon>
          <p className="mb-6 text-[14.5px] leading-relaxed text-muted-foreground">
            No changes were made to{' '}
            <span className="font-medium text-foreground">{invitation.workspaceName}</span>. You can
            sign in to your own workspaces or close this page.
          </p>
          <div className="space-y-3">
            <LoadingButton type="button" onClick={() => navigate('/login')}>
              Go to login
            </LoadingButton>
            <LoadingButton type="button" variant="outline" onClick={() => setResult(null)}>
              Review invitation again
            </LoadingButton>
          </div>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <AuthHeader
        eyebrow="Invitation"
        title="Join a workspace"
        description="Review the invitation details, then accept or decline."
      />

      <div className="mb-6 rounded-xl border border-border bg-background p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card">
            <LogoMark className="h-8 w-8" />
          </span>
          <div>
            <p className="text-[16px] font-semibold text-foreground">{invitation.workspaceName}</p>
            <p className="text-[13px] text-muted-foreground">Workspace invitation</p>
          </div>
        </div>

        <dl className="mt-5 space-y-3 text-[14px]">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Invited by</dt>
            <dd className="font-medium text-foreground">{invitation.invitedBy}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Assigned role</dt>
            <dd className="font-medium text-foreground">{invitation.role}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Organization</dt>
            <dd className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              Acme Inc.
            </dd>
          </div>
        </dl>
      </div>

      <div className="space-y-3">
        <LoadingButton
          type="button"
          loading={loading === 'accept'}
          loadingText="Accepting"
          onClick={handleAccept}
        >
          Accept invitation
        </LoadingButton>
        <LoadingButton
          type="button"
          variant="outline"
          loading={loading === 'decline'}
          loadingText="Declining"
          onClick={handleDecline}
        >
          Decline invitation
        </LoadingButton>
      </div>

      <p className="mt-6 text-center text-[13px] leading-relaxed text-muted-foreground">
        Don&apos;t have an account yet? Accepting will take you to registration before joining.
      </p>

      <p className="mt-4 text-center text-[13.5px] text-muted-foreground">
        <Link to="/join-workspace" className="font-medium text-primary hover:underline">
          Join with a code instead
        </Link>
      </p>
    </AuthCard>
  )
}
