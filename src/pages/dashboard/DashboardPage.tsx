import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Bell,
  Bot,
  Check,
  FileSpreadsheet,
  Mail,
  Pin,
  Plus,
  Sparkles,
  Upload,
  UserPlus,
  X,
} from 'lucide-react'

import { EmptyState } from '@/components/app/EmptyState'
import { PageHeader } from '@/components/app/PageHeader'
import { SectionCard } from '@/components/app/SectionCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ACTIVITY_FEED,
  AI_SUGGESTIONS,
  ASSIGNED_TASKS,
  DASHBOARD_STATS,
  FAVORITE_RESOURCES,
  NOTIFICATIONS,
  QUICK_ACCESS,
  RECENT_SHEETS,
  type ActivityItem,
} from '@/data/dashboard'
import { MOCK_WORKSPACES } from '@/data/workspaces'
import { cn } from '@/lib/utils'

const ACTIVITY_FILTERS = ['all', 'record', 'member', 'email', 'automation', 'ai', 'import'] as const

export function DashboardPage() {
  const { workspaceId = 'ws-acme' } = useParams()
  const workspace = MOCK_WORKSPACES.find((item) => item.id === workspaceId) ?? MOCK_WORKSPACES[0]

  const [activityFilter, setActivityFilter] = useState<(typeof ACTIVITY_FILTERS)[number]>('all')
  const [tasks, setTasks] = useState(ASSIGNED_TASKS)
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const [quickAccess, setQuickAccess] = useState(QUICK_ACCESS)
  const [aiPrompt, setAiPrompt] = useState('')
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([])

  const today = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date()),
    [],
  )

  const activity = ACTIVITY_FEED.filter(
    (item) => activityFilter === 'all' || item.type === activityFilter,
  )

  const unreadCount = notifications.filter((item) => !item.read).length

  function dismissTask(id: string) {
    setTasks((current) => current.filter((item) => item.id !== id))
  }

  function completeTask(id: string) {
    setTasks((current) => current.filter((item) => item.id !== id))
  }

  function markNotificationRead(id: string) {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item)),
    )
  }

  function markAllRead() {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })))
  }

  function togglePin(id: string) {
    setQuickAccess((current) =>
      current.map((item) => (item.id === id ? { ...item, pinned: !item.pinned } : item)),
    )
  }

  function toggleWidget(id: string) {
    setHiddenWidgets((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const visible = (id: string) => !hiddenWidgets.includes(id)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back, Jordan`}
        description={`${workspace.name} · ${today}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {(
              [
                { label: 'Create Sheet', icon: Plus },
                { label: 'Import Data', icon: Upload },
                { label: 'AI Builder', icon: Sparkles },
                { label: 'Invite Members', icon: UserPlus },
                { label: 'Send Email', icon: Mail },
              ] as const
            ).map((action) => (
              <Button key={action.label} type="button" variant="outline" size="sm">
                <action.icon className="h-3.5 w-3.5" />
                {action.label}
              </Button>
            ))}
          </div>
        }
      />

      <div className="rounded-2xl border border-border bg-card px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[13px] text-muted-foreground">Quick summary</p>
            <p className="mt-1 text-[14.5px] text-foreground">
              9 tasks need attention · 2 unread notifications · 3 sheets updated today
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['stats', 'activity', 'tasks', 'ai', 'notifications', 'sheets', 'favorites'].map(
              (widget) => (
                <button
                  key={widget}
                  type="button"
                  onClick={() => toggleWidget(widget)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[11.5px] font-medium capitalize transition-colors',
                    visible(widget)
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground',
                  )}
                >
                  {widget}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {visible('stats') ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {DASHBOARD_STATS.map((stat) => (
            <button
              key={stat.id}
              type="button"
              className="rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/30"
            >
              <p className="text-[12.5px] font-medium text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-[24px] font-semibold tracking-tight text-foreground">
                {stat.value}
              </p>
              <p
                className={cn(
                  'mt-1 text-[12.5px]',
                  stat.tone === 'up' && 'text-emerald-500',
                  stat.tone === 'down' && 'text-amber-500',
                  stat.tone === 'neutral' && 'text-muted-foreground',
                )}
              >
                {stat.change}
              </p>
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {visible('activity') ? (
            <SectionCard
              title="Activity feed"
              description="Recent workspace events"
              actions={
                <div className="flex flex-wrap gap-1.5">
                  {ACTIVITY_FILTERS.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActivityFilter(filter)}
                      className={cn(
                        'rounded-full px-2.5 py-1 text-[11.5px] font-medium capitalize transition-colors',
                        activityFilter === filter
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted/60',
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              }
            >
              {activity.length === 0 ? (
                <EmptyState
                  title="No activity"
                  description="Workspace activity will show up here as your team gets to work."
                  actionLabel="Create Sheet"
                  onAction={() => undefined}
                />
              ) : (
                <ul className="space-y-3">
                  {activity.map((item) => (
                    <ActivityRow key={item.id} item={item} />
                  ))}
                </ul>
              )}
            </SectionCard>
          ) : null}

          {visible('sheets') ? (
            <SectionCard title="Recent sheets" description="Jump back into recent work">
              {RECENT_SHEETS.length === 0 ? (
                <EmptyState
                  icon={<FileSpreadsheet className="h-5 w-5" />}
                  title="No sheets yet"
                  description="Create your first sheet to start organizing records."
                  actionLabel="Create Sheet"
                  onAction={() => undefined}
                />
              ) : (
                <ul className="divide-y divide-border">
                  {RECENT_SHEETS.map((sheet) => (
                    <li
                      key={sheet.id}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-[13px] font-semibold text-primary">
                          {sheet.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-medium text-foreground">
                            {sheet.name}
                          </p>
                          <p className="text-[12.5px] text-muted-foreground">
                            {sheet.records.toLocaleString()} records · {sheet.owner} ·{' '}
                            {sheet.lastModified}
                          </p>
                        </div>
                      </div>
                      <Button type="button" size="sm" variant="outline">
                        Open
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          ) : null}

          <SectionCard title="Quick access" description="Recently used resources">
            <div className="grid gap-2 sm:grid-cols-2">
              {quickAccess.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium text-foreground">{item.name}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {item.kind} · {item.meta}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={item.pinned ? 'Unpin' : 'Pin'}
                    onClick={() => togglePin(item.id)}
                    className={cn(
                      'rounded-full p-1.5 transition-colors',
                      item.pinned ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Pin className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          {visible('tasks') ? (
            <SectionCard title="Assigned tasks" description="Needs your attention">
              {tasks.length === 0 ? (
                <EmptyState
                  title="You're all caught up"
                  description="No pending tasks right now. New assignments will appear here."
                />
              ) : (
                <ul className="space-y-3">
                  {tasks.map((task) => (
                    <li key={task.id} className="rounded-xl border border-border bg-background p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[13.5px] font-medium text-foreground">{task.title}</p>
                          <p className="mt-1 text-[12px] text-muted-foreground">
                            {task.type} · {task.due}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[11px] font-medium capitalize',
                            task.priority === 'high' && 'bg-red-500/10 text-red-500',
                            task.priority === 'medium' && 'bg-amber-500/10 text-amber-500',
                            task.priority === 'low' && 'bg-muted text-muted-foreground',
                          )}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="accent"
                          onClick={() => completeTask(task.id)}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Complete
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => dismissTask(task.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                          Dismiss
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          ) : null}

          {visible('ai') ? (
            <SectionCard
              title="AI assistant"
              description="Ask about data, generate sheets, or build automations"
              actions={<Bot className="h-4 w-4 text-primary" />}
            >
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={aiPrompt}
                    onChange={(event) => setAiPrompt(event.target.value)}
                    placeholder="Ask anything about this workspace…"
                  />
                  <Button type="button" variant="accent">
                    Ask
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    Suggested
                  </p>
                  {AI_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setAiPrompt(suggestion)}
                      className="block w-full rounded-xl border border-border bg-background px-3 py-2 text-left text-[13px] text-foreground transition-colors hover:bg-muted/50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </SectionCard>
          ) : null}

          {visible('notifications') ? (
            <SectionCard
              title="Notifications"
              description={unreadCount ? `${unreadCount} unread` : 'All caught up'}
              actions={
                <Button type="button" size="sm" variant="ghost" onClick={markAllRead}>
                  Mark all read
                </Button>
              }
            >
              {notifications.length === 0 ? (
                <EmptyState
                  icon={<Bell className="h-5 w-5" />}
                  title="No notifications"
                  description="Workspace alerts and mentions will show up here."
                />
              ) : (
                <ul className="space-y-2">
                  {notifications.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => markNotificationRead(item.id)}
                        className={cn(
                          'w-full rounded-xl border px-3 py-2.5 text-left transition-colors',
                          item.read
                            ? 'border-border bg-background'
                            : 'border-primary/30 bg-primary/5',
                        )}
                      >
                        <p className="text-[13.5px] font-medium text-foreground">{item.title}</p>
                        <p className="mt-0.5 text-[12.5px] text-muted-foreground">{item.detail}</p>
                        <p className="mt-1 text-[11.5px] text-muted-foreground">{item.time}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          ) : null}

          {visible('favorites') ? (
            <SectionCard title="Favorite resources" description="Pinned for quick access">
              {FAVORITE_RESOURCES.length === 0 ? (
                <EmptyState
                  title="No favorites yet"
                  description="Pin sheets, reports, automations, and AI agents to keep them close."
                />
              ) : (
                <ul className="space-y-2">
                  {FAVORITE_RESOURCES.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5"
                    >
                      <div>
                        <p className="text-[13.5px] font-medium text-foreground">{item.name}</p>
                        <p className="text-[12px] text-muted-foreground">{item.kind}</p>
                      </div>
                      <Pin className="h-3.5 w-3.5 text-primary" />
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <li className="flex gap-3 rounded-xl border border-border bg-background px-3 py-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-[11px] font-semibold uppercase text-primary">
        {item.type.slice(0, 2)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-medium text-foreground">{item.title}</p>
        <p className="mt-0.5 text-[12.5px] text-muted-foreground">
          {item.detail} · {item.user}
        </p>
      </div>
      <span className="shrink-0 text-[12px] text-muted-foreground">{item.time}</span>
    </li>
  )
}
