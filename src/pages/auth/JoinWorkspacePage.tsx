import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Clock3, Link2, Ticket } from 'lucide-react'

import { AuthCard } from '@/components/auth/AuthCard'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { AuthInput } from '@/components/auth/AuthInput'
import { Divider } from '@/components/auth/Divider'
import { FormAlert } from '@/components/auth/FormAlert'
import { LoadingButton } from '@/components/auth/LoadingButton'
import { StatusIcon } from '@/components/auth/StatusIcon'
import { cn } from '@/lib/utils'

type JoinMethod = 'code' | 'url' | 'request'
type JoinState = 'idle' | 'pending' | 'invalid' | 'expired' | 'joined'

export function JoinWorkspacePage() {
  const [method, setMethod] = useState<JoinMethod>('code')
  const [code, setCode] = useState('')
  const [workspaceUrl, setWorkspaceUrl] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [state, setState] = useState<JoinState>('idle')

  function resolveOutcome(value: string): JoinState {
    const normalized = value.trim().toLowerCase()
    if (normalized.includes('expired')) return 'expired'
    if (normalized.includes('invalid') || normalized.includes('missing')) return 'invalid'
    if (method === 'request' || normalized.includes('pending')) return 'pending'
    return 'joined'
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)

    const value = method === 'code' ? code : method === 'url' ? workspaceUrl : message
    if (!value.trim()) {
      setFormError(
        method === 'request'
          ? 'Tell the workspace why you need access.'
          : 'Enter an invitation code or workspace URL to continue.',
      )
      return
    }

    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      setState(resolveOutcome(value))
    }, 900)
  }

  if (state !== 'idle') {
    const copy = {
      pending: {
        tone: 'warning' as const,
        title: 'Request sent',
        description: 'Your access request is pending approval from a workspace admin.',
      },
      invalid: {
        tone: 'error' as const,
        title: 'Invitation not found',
        description: 'This invitation code or workspace URL is invalid. Double-check and try again.',
      },
      expired: {
        tone: 'error' as const,
        title: 'Invitation expired',
        description: 'This invitation is no longer valid. Ask the workspace admin for a new invite.',
      },
      joined: {
        tone: 'success' as const,
        title: 'Workspace joined',
        description: 'You now have access. Continue to open the workspace.',
      },
    }[state]

    return (
      <AuthCard>
        <AuthHeader eyebrow="Join workspace" title={copy.title} description={copy.description} />
        <StatusIcon tone={copy.tone}>
          <Clock3 className="h-6 w-6" />
        </StatusIcon>
        {state === 'joined' ? (
          <LoadingButton type="button">Open workspace</LoadingButton>
        ) : (
          <LoadingButton type="button" variant="outline" onClick={() => setState('idle')}>
            Try another method
          </LoadingButton>
        )}
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <AuthHeader
        eyebrow="Join workspace"
        title="Find your team"
        description="Join with an invitation code, workspace URL, or request access."
      />

      <div className="mb-6 grid grid-cols-3 gap-2">
        {(
          [
            { id: 'code', label: 'Code', icon: Ticket },
            { id: 'url', label: 'URL', icon: Link2 },
            { id: 'request', label: 'Request', icon: Clock3 },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setMethod(item.id)
              setFormError(null)
            }}
            className={cn(
              'inline-flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-[12.5px] font-medium transition-colors',
              method === item.id
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border text-muted-foreground hover:bg-muted/50',
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <FormAlert variant="error">{formError}</FormAlert>

        <div className="space-y-5">
          {method === 'code' ? (
            <AuthInput
              label="Invitation code"
              name="code"
              placeholder="ACME-7F2K"
              icon={<Ticket className="h-[15px] w-[15px]" />}
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          ) : null}

          {method === 'url' ? (
            <AuthInput
              label="Workspace URL"
              name="workspaceUrl"
              placeholder="https://app.base.com/w/acme"
              icon={<Link2 className="h-[15px] w-[15px]" />}
              value={workspaceUrl}
              onChange={(event) => setWorkspaceUrl(event.target.value)}
            />
          ) : null}

          {method === 'request' ? (
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-foreground/90" htmlFor="message">
                Why do you need access?
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="I'm joining the design team and need editor access."
                className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-[14.5px] text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
              />
            </div>
          ) : null}

          <LoadingButton
            type="submit"
            loading={loading}
            loadingText={method === 'request' ? 'Sending request' : 'Joining'}
          >
            {method === 'request' ? 'Request access' : 'Join workspace'}
          </LoadingButton>
        </div>
      </form>

      <Divider label="or" />

      <p className="text-center text-[13.5px] text-muted-foreground">
        Have an email invite?{' '}
        <Link to="/accept-invitation" className="font-medium text-primary hover:underline">
          Open invitation
        </Link>
      </p>
    </AuthCard>
  )
}
