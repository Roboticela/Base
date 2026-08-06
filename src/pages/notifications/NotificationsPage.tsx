import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Bell,
  Bot,
  CheckCheck,
  CreditCard,
  Mail,
  Sparkles,
  UserCheck,
  Workflow,
} from 'lucide-react'

import { EmptyState } from '@/components/app/EmptyState'
import { ListRow } from '@/components/app/ListRow'
import { PageHeader } from '@/components/app/PageHeader'
import { SectionCard } from '@/components/app/SectionCard'
import { SegmentedTabs } from '@/components/app/SegmentedTabs'
import { SettingsNav, SettingsShell } from '@/components/app/SettingsShell'
import { StatTile } from '@/components/app/StatTile'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type NotifFilter =
  | 'all'
  | 'mentions'
  | 'assignments'
  | 'automation'
  | 'email'
  | 'billing'
  | 'ai'

type NotifSection = 'feed' | 'preferences'

type NotificationItem = {
  id: string
  title: string
  detail: string
  time: string
  type: Exclude<NotifFilter, 'all'>
  read: boolean
}

const INITIAL: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Sam mentioned you in Pipeline',
    detail: 'Can you review the enterprise deal notes?',
    time: '12m ago',
    type: 'mentions',
    read: false,
  },
  {
    id: 'n2',
    title: 'Assigned: Follow up with Northwind',
    detail: 'Due tomorrow · Sales sheet',
    time: '1h ago',
    type: 'assignments',
    read: false,
  },
  {
    id: 'n3',
    title: 'Automation “Lead enrich” failed',
    detail: 'Step 2 timed out · Retry available',
    time: '3h ago',
    type: 'automation',
    read: false,
  },
  {
    id: 'n4',
    title: 'Campaign open spike',
    detail: 'Welcome series · +18% opens',
    time: 'Yesterday',
    type: 'email',
    read: true,
  },
  {
    id: 'n5',
    title: 'Invoice paid',
    detail: 'Pro plan · $249',
    time: 'Yesterday',
    type: 'billing',
    read: true,
  },
  {
    id: 'n6',
    title: 'AI suggests a new report',
    detail: 'Win-rate by owner for last 30 days',
    time: '2d ago',
    type: 'ai',
    read: false,
  },
]

const FILTER_TABS: { id: NotifFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'mentions', label: 'Mentions' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'automation', label: 'Automation Alerts' },
  { id: 'email', label: 'Email Alerts' },
  { id: 'billing', label: 'Billing Alerts' },
  { id: 'ai', label: 'AI Suggestions' },
]

const PREF_KEYS = [
  { id: 'mentions', label: 'Mentions', icon: Bell },
  { id: 'assignments', label: 'Assignments', icon: UserCheck },
  { id: 'automation', label: 'Automation Alerts', icon: Workflow },
  { id: 'email', label: 'Email Alerts', icon: Mail },
  { id: 'billing', label: 'Billing Alerts', icon: CreditCard },
  { id: 'ai', label: 'AI Suggestions', icon: Bot },
] as const

export function NotificationsPage() {
  const { workspaceId = 'ws-acme' } = useParams()
  const [section, setSection] = useState<NotifSection>('feed')
  const [filter, setFilter] = useState<NotifFilter>('all')
  const [items, setItems] = useState(INITIAL)
  const [prefs, setPrefs] = useState<Record<string, { inApp: boolean; email: boolean }>>({
    mentions: { inApp: true, email: true },
    assignments: { inApp: true, email: true },
    automation: { inApp: true, email: false },
    email: { inApp: true, email: false },
    billing: { inApp: true, email: true },
    ai: { inApp: true, email: false },
  })

  const filtered = items.filter((item) => filter === 'all' || item.type === filter)
  const unread = items.filter((item) => !item.read).length

  function markRead(id: string) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)))
  }

  function markAllRead() {
    setItems((current) => current.map((item) => ({ ...item, read: true })))
  }

  function togglePref(id: string, channel: 'inApp' | 'email') {
    setPrefs((current) => ({
      ...current,
      [id]: { ...current[id], [channel]: !current[id][channel] },
    }))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Notifications"
        title="Notifications"
        description="Mentions, assignments, automation alerts, and AI suggestions."
        actions={
          <>
            <Link
              to={`/w/${workspaceId}/settings`}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/60"
            >
              Preferences
            </Link>
            <Button type="button" variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Unread" value={String(unread)} meta="Needs attention" />
        <StatTile label="Today" value="4" meta="Across channels" />
        <StatTile label="Muted types" value="1" meta="Email digests off" />
      </div>

      <SettingsShell
        nav={
          <SettingsNav
            items={[
              { id: 'feed', label: 'Inbox' },
              { id: 'preferences', label: 'Preferences' },
            ]}
            value={section}
            onChange={(id) => setSection(id as NotifSection)}
          />
        }
      >
        {section === 'feed' ? (
          <div className="space-y-4">
            <SegmentedTabs value={filter} onChange={setFilter} tabs={FILTER_TABS} />

            <SectionCard
              title="Inbox"
              description={unread ? `${unread} unread` : 'All caught up'}
              actions={
                <Button type="button" size="sm" variant="ghost" onClick={markAllRead}>
                  Mark read
                </Button>
              }
              padded={false}
            >
              {filtered.length === 0 ? (
                <EmptyState
                  icon={<Bell className="h-5 w-5" />}
                  title="No notifications"
                  description="You’re all clear for this filter."
                />
              ) : (
                <div className="divide-y divide-border">
                  {filtered.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => markRead(item.id)}
                      className={cn(
                        'flex w-full items-start justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-muted/40',
                        !item.read && 'bg-primary/5',
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {!item.read ? <span className="h-1.5 w-1.5 rounded-full bg-primary" /> : null}
                          <p className="truncate text-[13.5px] font-medium text-foreground">{item.title}</p>
                        </div>
                        <p className="mt-0.5 text-[12.5px] text-muted-foreground">{item.detail}</p>
                        <p className="mt-1 text-[11.5px] capitalize text-muted-foreground">
                          {item.type.replace('-', ' ')} · {item.time}
                        </p>
                      </div>
                      {item.type === 'ai' ? <Sparkles className="mt-1 h-4 w-4 shrink-0 text-primary" /> : null}
                    </button>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        ) : null}

        {section === 'preferences' ? (
          <SectionCard
            title="Preferences"
            description="Choose how each notification type reaches you."
          >
            <div className="space-y-3">
              {PREF_KEYS.map((pref) => {
                const Icon = pref.icon
                const value = prefs[pref.id]
                return (
                  <div
                    key={pref.id}
                    className="rounded-xl border border-border bg-background px-4 py-3"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <p className="text-[13.5px] font-medium text-foreground">{pref.label}</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 text-[13px] text-foreground">
                        <Checkbox
                          checked={value.inApp}
                          onChange={() => togglePref(pref.id, 'inApp')}
                        />
                        In-app
                      </label>
                      <label className="flex items-center gap-2 text-[13px] text-foreground">
                        <Checkbox
                          checked={value.email}
                          onChange={() => togglePref(pref.id, 'email')}
                        />
                        Email
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 space-y-2">
              <Label>Digest</Label>
              <p className="text-[13px] text-muted-foreground">
                Unread notifications are summarized daily at 9:00 AM in your timezone.
              </p>
            </div>
          </SectionCard>
        ) : null}
      </SettingsShell>

      {section === 'feed' ? (
        <SectionCard title="Quick links" padded={false}>
          <ListRow
            title="Open Email Center"
            meta="Campaign and delivery alerts"
            onClick={() => undefined}
            trailing={
              <Link to={`/w/${workspaceId}/email`} className="text-[12.5px] font-medium text-primary">
                View
              </Link>
            }
          />
          <ListRow
            title="Billing alerts"
            meta="Invoices and plan changes"
            trailing={
              <Link
                to={`/w/${workspaceId}/billing`}
                className="text-[12.5px] font-medium text-primary"
              >
                View
              </Link>
            }
          />
        </SectionCard>
      ) : null}
    </div>
  )
}
