import { useState } from 'react'
import {
  Cable,
  Check,
  KeyRound,
  Link2,
  Unplug,
  Webhook,
} from 'lucide-react'

import { EmptyState } from '@/components/app/EmptyState'
import { PageHeader } from '@/components/app/PageHeader'
import { SectionCard } from '@/components/app/SectionCard'
import { SegmentedTabs } from '@/components/app/SegmentedTabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type IntegrationId =
  | 'google'
  | 'microsoft'
  | 'slack'
  | 'discord'
  | 'stripe'
  | 'smtp'
  | 'github'
  | 'zapier'
  | 'make'
  | 'n8n'
  | 'openai'
  | 'anthropic'
  | 'webhooks'
  | 'apikeys'

type Filter = 'all' | 'connected' | 'available'

const INTEGRATIONS: {
  id: IntegrationId
  name: string
  description: string
  category: string
}[] = [
  { id: 'google', name: 'Google', description: 'Drive, Sheets, and Calendar sync', category: 'Productivity' },
  { id: 'microsoft', name: 'Microsoft', description: 'Outlook, Teams, and OneDrive', category: 'Productivity' },
  { id: 'slack', name: 'Slack', description: 'Channel alerts and slash commands', category: 'Chat' },
  { id: 'discord', name: 'Discord', description: 'Server notifications and bots', category: 'Chat' },
  { id: 'stripe', name: 'Stripe', description: 'Payments and subscription events', category: 'Payments' },
  { id: 'smtp', name: 'SMTP', description: 'Custom outbound email delivery', category: 'Email' },
  { id: 'github', name: 'GitHub', description: 'Repos, issues, and deploy hooks', category: 'Dev' },
  { id: 'zapier', name: 'Zapier', description: 'No-code automation connectors', category: 'Automation' },
  { id: 'make', name: 'Make', description: 'Scenario-based workflow sync', category: 'Automation' },
  { id: 'n8n', name: 'n8n', description: 'Self-hosted workflow engine', category: 'Automation' },
  { id: 'openai', name: 'OpenAI', description: 'Bring your own OpenAI API key', category: 'AI' },
  { id: 'anthropic', name: 'Anthropic', description: 'Claude models via API key', category: 'AI' },
  { id: 'webhooks', name: 'Webhooks', description: 'Outbound event delivery endpoints', category: 'Dev' },
  { id: 'apikeys', name: 'API Keys', description: 'Workspace keys for the Base API', category: 'Dev' },
]

export function IntegrationsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [connected, setConnected] = useState<Record<string, boolean>>({
    google: true,
    slack: true,
    github: true,
    openai: false,
    stripe: false,
  })
  const [selected, setSelected] = useState<IntegrationId | null>(null)
  const [apiKeyPreview, setApiKeyPreview] = useState('sk_live_••••••••••••9f2a')

  function toggle(id: string) {
    setConnected((current) => ({ ...current, [id]: !current[id] }))
  }

  const list = INTEGRATIONS.filter((item) => {
    const isOn = Boolean(connected[item.id])
    if (filter === 'connected') return isOn
    if (filter === 'available') return !isOn
    return true
  })

  const detail = INTEGRATIONS.find((i) => i.id === selected)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Integrations"
        title="Connect your stack"
        description="Link productivity, chat, payments, AI, and automation tools to this workspace."
        actions={
          <Button type="button" variant="outline" size="sm">
            <Cable className="h-3.5 w-3.5" />
            Request integration
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedTabs
          value={filter}
          onChange={setFilter}
          tabs={[
            { id: 'all', label: 'All' },
            { id: 'connected', label: 'Connected' },
            { id: 'available', label: 'Available' },
          ]}
        />
        <p className="text-[13px] text-muted-foreground">
          {Object.values(connected).filter(Boolean).length} connected
        </p>
      </div>

      {list.length === 0 ? (
        <SectionCard>
          <EmptyState
            title="Nothing here"
            description="Try another filter or connect a new integration."
            actionLabel="Show all"
            onAction={() => setFilter('all')}
          />
        </SectionCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((item) => {
            const isOn = Boolean(connected[item.id])
            return (
              <div
                key={item.id}
                className={cn(
                  'flex flex-col rounded-2xl border bg-card p-5',
                  isOn ? 'border-primary/40' : 'border-border',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-semibold text-foreground">{item.name}</p>
                    <p className="mt-1 text-[12.5px] text-muted-foreground">{item.category}</p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[11px] font-medium',
                      isOn
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
                        : 'border-border text-muted-foreground',
                    )}
                  >
                    {isOn ? 'Connected' : 'Available'}
                  </span>
                </div>
                <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={isOn ? 'outline' : 'accent'}
                    onClick={() => toggle(item.id)}
                  >
                    {isOn ? (
                      <>
                        <Unplug className="h-3.5 w-3.5" />
                        Disconnect
                      </>
                    ) : (
                      <>
                        <Link2 className="h-3.5 w-3.5" />
                        Connect
                      </>
                    )}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setSelected(item.id)}>
                    Configure
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {detail ? (
        <SectionCard
          title={`${detail.name} settings`}
          description={detail.description}
          actions={
            <Button type="button" size="sm" variant="ghost" onClick={() => setSelected(null)}>
              Close
            </Button>
          }
        >
          {detail.id === 'smtp' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">Host</Label>
                <Input id="smtp-host" defaultValue="smtp.mailgun.org" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">Port</Label>
                <Input id="smtp-port" defaultValue="587" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="smtp-user">Username</Label>
                <Input id="smtp-user" defaultValue="postmaster@acme.co" />
              </div>
            </div>
          ) : null}

          {detail.id === 'openai' || detail.id === 'anthropic' || detail.id === 'apikeys' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="int-key">API key</Label>
                <Input
                  id="int-key"
                  value={apiKeyPreview}
                  onChange={(e) => setApiKeyPreview(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <KeyRound className="h-4 w-4" />
                Keys are encrypted at rest and never shown in full after save.
              </div>
            </div>
          ) : null}

          {detail.id === 'webhooks' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hook-url">Endpoint URL</Label>
                <Input id="hook-url" placeholder="https://example.com/hooks/base" />
              </div>
              <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <Webhook className="h-4 w-4" />
                Events: record.created, form.submitted, member.invited
              </div>
            </div>
          ) : null}

          {!['smtp', 'openai', 'anthropic', 'apikeys', 'webhooks'].includes(detail.id) ? (
            <div className="rounded-xl border border-border bg-background px-4 py-3 text-[13.5px] text-muted-foreground">
              OAuth scopes and sync options will appear here once connected.
              {connected[detail.id] ? (
                <span className="mt-2 flex items-center gap-1.5 text-emerald-600">
                  <Check className="h-3.5 w-3.5" />
                  Account linked
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4">
            <Button type="button" variant="accent" size="sm">
              Save configuration
            </Button>
          </div>
        </SectionCard>
      ) : null}
    </div>
  )
}
