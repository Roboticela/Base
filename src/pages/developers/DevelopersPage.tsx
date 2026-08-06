import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  BookOpen,
  Code2,
  Copy,
  ExternalLink,
  Gauge,
  KeyRound,
  Plus,
  ScrollText,
  Terminal,
  Webhook,
} from 'lucide-react'

import { EmptyState } from '@/components/app/EmptyState'
import { ListRow } from '@/components/app/ListRow'
import { PageHeader } from '@/components/app/PageHeader'
import { SectionCard } from '@/components/app/SectionCard'
import { SegmentedTabs } from '@/components/app/SegmentedTabs'
import { SettingsNav, SettingsShell } from '@/components/app/SettingsShell'
import { StatTile } from '@/components/app/StatTile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const NAV = [
  { id: 'keys', label: 'API Keys' },
  { id: 'oauth', label: 'OAuth Apps' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'docs', label: 'Documentation' },
  { id: 'sdks', label: 'SDKs' },
  { id: 'logs', label: 'API Logs' },
  { id: 'limits', label: 'Rate Limits' },
  { id: 'playground', label: 'Playground' },
] as const

type SectionId = (typeof NAV)[number]['id']

const KEYS = [
  { id: 'k1', name: 'Production', prefix: 'sk_live_9f2a…', created: 'Jan 12, 2026' },
  { id: 'k2', name: 'Staging', prefix: 'sk_test_44bc…', created: 'Feb 3, 2026' },
]

const OAUTH_APPS = [
  { id: 'o1', name: 'Acme Portal', meta: 'client_id · acme_portal · 2 redirects' },
  { id: 'o2', name: 'Mobile Companion', meta: 'client_id · mobile_v1 · 1 redirect' },
]

const WEBHOOKS = [
  { id: 'w1', name: 'CRM sync', meta: 'https://hooks.acme.co/base · Active' },
  { id: 'w2', name: 'Slack bridge', meta: 'https://hooks.acme.co/slack · Paused' },
]

const LOGS = [
  { id: 'l1', title: 'GET /v1/sheets', meta: '200 · 42ms · sk_live · 2 min ago' },
  { id: 'l2', title: 'POST /v1/records', meta: '201 · 118ms · sk_test · 8 min ago' },
  { id: 'l3', title: 'GET /v1/members', meta: '401 · 9ms · missing key · 15 min ago' },
]

const SDKS = [
  { name: 'JavaScript / TypeScript', meta: '@base/sdk' },
  { name: 'Python', meta: 'base-python' },
  { name: 'Go', meta: 'github.com/base/go-sdk' },
  { name: 'PHP', meta: 'base/php-sdk' },
]

export function DevelopersPage() {
  const { workspaceId = 'ws-acme' } = useParams()
  const [section, setSection] = useState<SectionId>('keys')
  const [logFilter, setLogFilter] = useState<'all' | 'success' | 'error'>('all')
  const [playgroundMethod, setPlaygroundMethod] = useState('GET')
  const [playgroundPath, setPlaygroundPath] = useState('/v1/sheets')
  const [playgroundResult, setPlaygroundResult] = useState<string | null>(null)
  const [keys, setKeys] = useState(KEYS)

  const filteredLogs = LOGS.filter((log) => {
    if (logFilter === 'success') return log.meta.startsWith('2')
    if (logFilter === 'error') return log.meta.startsWith('4') || log.meta.startsWith('5')
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Developers"
        title="Developer platform"
        description="API keys, OAuth apps, webhooks, and tools to build on Base."
        actions={
          <Link
            to={`/w/${workspaceId}/integrations`}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/60"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Integrations
          </Link>
        }
      />

      <SettingsShell
        nav={<SettingsNav items={[...NAV]} value={section} onChange={(id) => setSection(id as SectionId)} />}
      >
        {section === 'keys' ? (
          <SectionCard
            title="API keys"
            description="Authenticate requests to the Base API"
            actions={
              <Button
                type="button"
                size="sm"
                variant="accent"
                onClick={() =>
                  setKeys((c) => [
                    {
                      id: `k${c.length + 1}`,
                      name: `Key ${c.length + 1}`,
                      prefix: 'sk_test_••••…',
                      created: 'Just now',
                    },
                    ...c,
                  ])
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Create key
              </Button>
            }
            padded={false}
          >
            {keys.length === 0 ? (
              <EmptyState
                icon={<KeyRound className="h-5 w-5" />}
                title="No API keys"
                description="Create a key to start calling the Base REST API."
              />
            ) : (
              <div className="divide-y divide-border">
                {keys.map((key) => (
                  <ListRow
                    key={key.id}
                    title={key.name}
                    meta={`${key.prefix} · Created ${key.created}`}
                    trailing={
                      <div className="flex gap-1">
                        <Button type="button" size="sm" variant="ghost">
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setKeys((c) => c.filter((k) => k.id !== key.id))}
                        >
                          Revoke
                        </Button>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </SectionCard>
        ) : null}

        {section === 'oauth' ? (
          <SectionCard
            title="OAuth apps"
            description="Third-party apps that use Base as an identity provider"
            actions={
              <Button type="button" size="sm" variant="outline">
                <Plus className="h-3.5 w-3.5" />
                New app
              </Button>
            }
            padded={false}
          >
            <div className="divide-y divide-border">
              {OAUTH_APPS.map((app) => (
                <ListRow key={app.id} title={app.name} meta={app.meta} />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'webhooks' ? (
          <SectionCard
            title="Webhooks"
            description="Receive signed event payloads"
            actions={
              <Button type="button" size="sm" variant="outline">
                <Webhook className="h-3.5 w-3.5" />
                Add endpoint
              </Button>
            }
            padded={false}
          >
            <div className="divide-y divide-border">
              {WEBHOOKS.map((hook) => (
                <ListRow key={hook.id} title={hook.name} meta={hook.meta} />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'docs' ? (
          <SectionCard
            title="Documentation"
            description="Guides and reference for the Base API"
            actions={<BookOpen className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Authentication',
                'Sheets & records',
                'Forms API',
                'Webhooks',
                'Pagination',
                'Errors & retries',
              ].map((topic) => (
                <button
                  key={topic}
                  type="button"
                  className="rounded-xl border border-border bg-background px-4 py-3 text-left text-[13.5px] font-medium text-foreground transition-colors hover:bg-muted/40"
                >
                  {topic}
                </button>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'sdks' ? (
          <SectionCard title="SDKs" description="Official client libraries" padded={false}>
            <div className="divide-y divide-border">
              {SDKS.map((sdk) => (
                <ListRow
                  key={sdk.name}
                  title={sdk.name}
                  meta={sdk.meta}
                  trailing={<Code2 className="h-4 w-4 text-muted-foreground" />}
                />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'logs' ? (
          <SectionCard
            title="API logs"
            description="Recent request activity"
            actions={
              <SegmentedTabs
                value={logFilter}
                onChange={setLogFilter}
                tabs={[
                  { id: 'all', label: 'All' },
                  { id: 'success', label: '2xx' },
                  { id: 'error', label: 'Errors' },
                ]}
              />
            }
            padded={false}
          >
            {filteredLogs.length === 0 ? (
              <EmptyState
                icon={<ScrollText className="h-5 w-5" />}
                title="No matching logs"
                description="Try another filter to inspect recent API traffic."
              />
            ) : (
              <div className="divide-y divide-border">
                {filteredLogs.map((log) => (
                  <ListRow key={log.id} title={log.title} meta={log.meta} />
                ))}
              </div>
            )}
          </SectionCard>
        ) : null}

        {section === 'limits' ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile label="Requests / min" value="120" meta="of 600" />
              <StatTile label="Burst" value="40" meta="remaining" />
              <StatTile label="Daily" value="18.4k" meta="of 100k" />
            </div>
            <SectionCard
              title="Rate limits"
              description="Plan quotas for this workspace"
              actions={<Gauge className="h-4 w-4 text-muted-foreground" />}
            >
              <div className="space-y-3">
                {[
                  { label: 'REST API', value: '600 req/min' },
                  { label: 'Webhooks outbound', value: '100 / min' },
                  { label: 'File uploads', value: '30 / min' },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                  >
                    <span className="text-[13.5px] text-foreground">{row.label}</span>
                    <span className="text-[12.5px] text-muted-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </>
        ) : null}

        {section === 'playground' ? (
          <SectionCard
            title="API playground"
            description="Send a sample request without leaving Base"
            actions={<Terminal className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={playgroundMethod}
                  onChange={(e) => setPlaygroundMethod(e.target.value)}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-[13px] text-foreground"
                >
                  {['GET', 'POST', 'PATCH', 'DELETE'].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <Input
                  value={playgroundPath}
                  onChange={(e) => setPlaygroundPath(e.target.value)}
                  className="flex-1 font-mono text-[13px]"
                />
                <Button
                  type="button"
                  variant="accent"
                  onClick={() =>
                    setPlaygroundResult(
                      JSON.stringify(
                        { ok: true, method: playgroundMethod, path: playgroundPath, data: [] },
                        null,
                        2,
                      ),
                    )
                  }
                >
                  Send
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Response</Label>
                <pre
                  className={cn(
                    'min-h-[140px] overflow-auto rounded-xl border border-border bg-background p-4 text-[12.5px] text-muted-foreground',
                  )}
                >
                  {playgroundResult ?? '// Response will appear here'}
                </pre>
              </div>
            </div>
          </SectionCard>
        ) : null}
      </SettingsShell>
    </div>
  )
}
