import { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Building2,
  Cpu,
  Flag,
  HardDrive,
  Mail,
  Server,
  Shield,
  Users,
  Wallet,
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
  { id: 'users', label: 'Users' },
  { id: 'orgs', label: 'Organizations' },
  { id: 'billing', label: 'Billing' },
  { id: 'storage', label: 'Storage' },
  { id: 'ai', label: 'AI Usage' },
  { id: 'smtp', label: 'SMTP Usage' },
  { id: 'api', label: 'API Usage' },
  { id: 'abuse', label: 'Abuse Reports' },
  { id: 'flags', label: 'Feature Flags' },
  { id: 'plans', label: 'Plans' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'audit', label: 'Audit Logs' },
  { id: 'health', label: 'System Health' },
  { id: 'jobs', label: 'Background Jobs' },
  { id: 'queue', label: 'Queue Monitoring' },
  { id: 'email', label: 'Email Queue' },
  { id: 'workers', label: 'Worker Status' },
] as const

type SectionId = (typeof NAV)[number]['id']

const USERS = [
  { id: 'u1', name: 'Jordan Lee', meta: 'jordan@acme.co · Active' },
  { id: 'u2', name: 'Sam Rivera', meta: 'sam@acme.co · Active' },
  { id: 'u3', name: 'Casey Wu', meta: 'casey@north.io · Suspended' },
]

const ORGS = [
  { id: 'o1', name: 'Acme Co', meta: 'Pro · 12 seats · $79/mo' },
  { id: 'o2', name: 'North Labs', meta: 'Business · 40 seats · $199/mo' },
  { id: 'o3', name: 'Orbit Studio', meta: 'Starter · 3 seats · $29/mo' },
]

const FLAGS = [
  { id: 'ff1', name: 'ai.form_generator', enabled: true },
  { id: 'ff2', name: 'billing.yearly_discount', enabled: true },
  { id: 'ff3', name: 'sheets.bulk_edit', enabled: false },
  { id: 'ff4', name: 'admin.queue_v2', enabled: false },
]

const AUDIT = [
  { title: 'Superadmin toggled sheets.bulk_edit', meta: 'Today · 1:22 PM' },
  { title: 'Plan Business price updated', meta: 'Yesterday · 4:05 PM' },
  { title: 'User casey@north.io suspended', meta: 'Mar 12 · 9:41 AM' },
]

export function AdminPanelPage() {
  const [section, setSection] = useState<SectionId>('users')
  const [userQuery, setUserQuery] = useState('')
  const [flags, setFlags] = useState(FLAGS)
  const [healthTab, setHealthTab] = useState<'overview' | 'services' | 'incidents'>('overview')

  const users = USERS.filter(
    (u) =>
      !userQuery.trim() ||
      u.name.toLowerCase().includes(userQuery.toLowerCase()) ||
      u.meta.toLowerCase().includes(userQuery.toLowerCase()),
  )

  function toggleFlag(id: string) {
    setFlags((c) => c.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Super admin panel"
        description="Platform-wide users, billing, usage, queues, and system health."
        actions={
          <Button type="button" variant="outline" size="sm">
            <Shield className="h-3.5 w-3.5" />
            Elevate session
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Users" value="18.4k" meta="+240 this week" />
        <StatTile label="Organizations" value="2,106" meta="142 on Business" />
        <StatTile label="MRR" value="$184k" meta="+4.2%" />
        <StatTile label="Open abuse" value="7" meta="3 high priority" />
      </div>

      <SettingsShell
        nav={<SettingsNav items={[...NAV]} value={section} onChange={(id) => setSection(id as SectionId)} />}
      >
        {section === 'users' ? (
          <SectionCard
            title="Users"
            description="Search and manage platform accounts"
            actions={<Users className="h-4 w-4 text-muted-foreground" />}
            padded={false}
          >
            <div className="border-b border-border px-5 py-3">
              <Input
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Search users…"
                className="h-9"
              />
            </div>
            {users.length === 0 ? (
              <EmptyState title="No users" description="No accounts match that search." />
            ) : (
              <div className="divide-y divide-border">
                {users.map((u) => (
                  <ListRow
                    key={u.id}
                    title={u.name}
                    meta={u.meta}
                    trailing={
                      <Button type="button" size="sm" variant="ghost">
                        View
                      </Button>
                    }
                  />
                ))}
              </div>
            )}
          </SectionCard>
        ) : null}

        {section === 'orgs' ? (
          <SectionCard
            title="Organizations"
            description="Workspaces and billing entities"
            actions={<Building2 className="h-4 w-4 text-muted-foreground" />}
            padded={false}
          >
            <div className="divide-y divide-border">
              {ORGS.map((org) => (
                <ListRow key={org.id} title={org.name} meta={org.meta} />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'billing' ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile label="MRR" value="$184,220" meta="All plans" />
              <StatTile label="Churn" value="1.8%" meta="30-day" />
              <StatTile label="Failed payments" value="23" meta="Needs retry" />
            </div>
            <SectionCard title="Billing overview" description="Platform revenue snapshot" actions={<Wallet className="h-4 w-4 text-muted-foreground" />}>
              <div className="space-y-3">
                {[
                  { plan: 'Starter', count: '1,102', mrr: '$31.9k' },
                  { plan: 'Pro', count: '862', mrr: '$68.1k' },
                  { plan: 'Business', count: '142', mrr: '$84.2k' },
                ].map((row) => (
                  <div
                    key={row.plan}
                    className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                  >
                    <span className="text-[13.5px] font-medium text-foreground">{row.plan}</span>
                    <span className="text-[12.5px] text-muted-foreground">
                      {row.count} orgs · {row.mrr}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </>
        ) : null}

        {section === 'storage' ? (
          <SectionCard
            title="Storage"
            description="Aggregate attachment usage"
            actions={<HardDrive className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile label="Total used" value="42.6 TB" meta="across orgs" />
              <StatTile label="Largest tenant" value="1.8 TB" meta="North Labs" />
              <StatTile label="Growth" value="+6%" meta="30 days" />
            </div>
          </SectionCard>
        ) : null}

        {section === 'ai' ? (
          <SectionCard title="AI usage" description="Token and credit consumption" actions={<Cpu className="h-4 w-4 text-muted-foreground" />}>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile label="Credits used" value="2.4M" meta="this month" />
              <StatTile label="Avg / org" value="1.1k" meta="active orgs" />
              <StatTile label="Errors" value="0.4%" meta="provider failures" />
            </div>
          </SectionCard>
        ) : null}

        {section === 'smtp' ? (
          <SectionCard title="SMTP usage" description="Outbound email volume" actions={<Mail className="h-4 w-4 text-muted-foreground" />}>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile label="Sent today" value="186k" meta="92% delivered" />
              <StatTile label="Bounces" value="1.2%" meta="within SLO" />
              <StatTile label="Complaints" value="0.08%" meta="last 7 days" />
            </div>
          </SectionCard>
        ) : null}

        {section === 'api' ? (
          <SectionCard title="API usage" description="Platform request volume">
            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile label="Requests / day" value="14.2M" meta="p95 180ms" />
              <StatTile label="Error rate" value="0.6%" meta="5xx only" />
              <StatTile label="Top consumer" value="Acme Co" meta="2.1M / day" />
            </div>
          </SectionCard>
        ) : null}

        {section === 'abuse' ? (
          <SectionCard
            title="Abuse reports"
            description="Flagged accounts and content"
            actions={<AlertTriangle className="h-4 w-4 text-amber-500" />}
            padded={false}
          >
            <div className="divide-y divide-border">
              {[
                { title: 'Spam form submissions', meta: 'High · Orbit Studio · Open' },
                { title: 'Suspicious API spike', meta: 'Medium · Unknown key · Investigating' },
                { title: 'Phishing email report', meta: 'High · Resolved' },
              ].map((row) => (
                <ListRow key={row.title} title={row.title} meta={row.meta} />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'flags' ? (
          <SectionCard
            title="Feature flags"
            description="Toggle platform experiments"
            actions={<Flag className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="space-y-2">
              {flags.map((flag) => (
                <label
                  key={flag.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3"
                >
                  <span className="font-mono text-[13px] text-foreground">{flag.name}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={flag.enabled}
                    onClick={() => toggleFlag(flag.id)}
                    className={cn(
                      'relative h-6 w-11 rounded-full border transition-colors',
                      flag.enabled ? 'border-primary bg-primary/20' : 'border-border bg-muted/40',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 h-4 w-4 rounded-full bg-foreground transition-transform',
                        flag.enabled ? 'left-6' : 'left-0.5',
                      )}
                    />
                  </button>
                </label>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'plans' ? (
          <SectionCard title="Plans" description="Catalog pricing (design mock)">
            <div className="space-y-3">
              {[
                { name: 'Starter', price: '$29', seats: '5' },
                { name: 'Pro', price: '$79', seats: '20' },
                { name: 'Business', price: '$199', seats: 'Unlimited' },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-background px-4 py-3 sm:flex-row sm:items-end"
                >
                  <div className="flex-1 space-y-2">
                    <Label>{plan.name}</Label>
                    <Input defaultValue={plan.price} />
                  </div>
                  <div className="w-full space-y-2 sm:w-40">
                    <Label>Seats</Label>
                    <Input defaultValue={plan.seats} />
                  </div>
                  <Button type="button" size="sm" variant="outline">
                    Save
                  </Button>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'analytics' ? (
          <SectionCard title="Analytics" description="High-level product metrics">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile label="DAU" value="6,420" meta="+3%" />
              <StatTile label="WAU" value="11,800" meta="+1%" />
              <StatTile label="Sheets created" value="892" meta="today" />
              <StatTile label="Forms submitted" value="4,210" meta="today" />
            </div>
          </SectionCard>
        ) : null}

        {section === 'audit' ? (
          <SectionCard title="Audit logs" description="Privileged admin actions" padded={false}>
            <div className="divide-y divide-border">
              {AUDIT.map((row) => (
                <ListRow key={row.title} title={row.title} meta={row.meta} />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'health' ? (
          <SectionCard
            title="System health"
            description="Service status across the platform"
            actions={
              <SegmentedTabs
                value={healthTab}
                onChange={setHealthTab}
                tabs={[
                  { id: 'overview', label: 'Overview' },
                  { id: 'services', label: 'Services' },
                  { id: 'incidents', label: 'Incidents' },
                ]}
              />
            }
          >
            {healthTab === 'overview' ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <StatTile label="API" value="Healthy" meta="99.98% uptime" />
                <StatTile label="Workers" value="Healthy" meta="24 / 24 online" />
                <StatTile label="Database" value="Degraded" meta="Replica lag 120ms" />
              </div>
            ) : null}
            {healthTab === 'services' ? (
              <div className="divide-y divide-border rounded-xl border border-border">
                {['api-gateway', 'auth', 'sheets', 'mailer', 'ai-proxy'].map((svc) => (
                  <ListRow
                    key={svc}
                    title={svc}
                    meta="OK · region us-east-1"
                    trailing={<Activity className="h-4 w-4 text-emerald-500" />}
                  />
                ))}
              </div>
            ) : null}
            {healthTab === 'incidents' ? (
              <EmptyState
                title="No active incidents"
                description="Resolved events will appear here with timelines and impact."
              />
            ) : null}
          </SectionCard>
        ) : null}

        {section === 'jobs' ? (
          <SectionCard title="Background jobs" description="Scheduled and async work" padded={false}>
            <div className="divide-y divide-border">
              {[
                { title: 'workspace.backup', meta: 'Succeeded · 02:00 UTC' },
                { title: 'usage.rollup', meta: 'Running · 64%' },
                { title: 'search.reindex', meta: 'Queued · low priority' },
              ].map((row) => (
                <ListRow key={row.title} title={row.title} meta={row.meta} />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'queue' ? (
          <SectionCard title="Queue monitoring" description="Depth and lag by queue" actions={<Server className="h-4 w-4 text-muted-foreground" />}>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile label="default" value="128" meta="depth" />
              <StatTile label="mail" value="42" meta="depth" />
              <StatTile label="webhooks" value="9" meta="depth" />
            </div>
          </SectionCard>
        ) : null}

        {section === 'email' ? (
          <SectionCard title="Email queue" description="Outbound messages waiting to send" padded={false}>
            <div className="divide-y divide-border">
              {[
                { title: 'Invite · alex@acme.co', meta: 'Queued · 12s' },
                { title: 'Invoice · billing@north.io', meta: 'Sending · attempt 1' },
                { title: 'Password reset · casey@…', meta: 'Failed · retry in 2m' },
              ].map((row) => (
                <ListRow key={row.title} title={row.title} meta={row.meta} />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'workers' ? (
          <SectionCard title="Worker status" description="Process heartbeats">
            <div className="space-y-2">
              {[
                { name: 'worker-01', status: 'Online', meta: 'cpu 22% · mem 1.1 GB' },
                { name: 'worker-02', status: 'Online', meta: 'cpu 18% · mem 980 MB' },
                { name: 'worker-03', status: 'Draining', meta: 'cpu 4% · mem 640 MB' },
              ].map((w) => (
                <div
                  key={w.name}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3"
                >
                  <div>
                    <p className="text-[13.5px] font-medium text-foreground">{w.name}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{w.meta}</p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[11.5px] font-medium',
                      w.status === 'Online'
                        ? 'border-emerald-500/30 text-emerald-600'
                        : 'border-amber-500/30 text-amber-600',
                    )}
                  >
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}
      </SettingsShell>
    </div>
  )
}
