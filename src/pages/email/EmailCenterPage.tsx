import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  FileText,
  Inbox,
  Mail,
  Paperclip,
  Plus,
  Reply,
  Search,
  Send,
  Sparkles,
  Trash2,
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type EmailSection =
  | 'smtp'
  | 'inbox'
  | 'outbox'
  | 'sent'
  | 'drafts'
  | 'templates'
  | 'campaigns'
  | 'sequences'
  | 'analytics'
  | 'scheduling'
  | 'tracking'
  | 'variables'
  | 'attachments'
  | 'ai-writer'
  | 'bulk'
  | 'bounces'

const SECTIONS: { id: EmailSection; label: string }[] = [
  { id: 'smtp', label: 'SMTP Accounts' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'outbox', label: 'Outbox' },
  { id: 'sent', label: 'Sent' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'templates', label: 'Templates' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'sequences', label: 'Sequences' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'scheduling', label: 'Scheduling' },
  { id: 'tracking', label: 'Tracking' },
  { id: 'variables', label: 'Variables' },
  { id: 'attachments', label: 'Attachments' },
  { id: 'ai-writer', label: 'AI Email Writer' },
  { id: 'bulk', label: 'Bulk Sending' },
  { id: 'bounces', label: 'Bounce Management' },
]

const MOCK_MAIL = [
  {
    id: 'm1',
    from: 'Alex Rivera',
    email: 'alex@acme.co',
    subject: 'Q3 pipeline follow-up',
    preview: 'Can we schedule a call to review the open opportunities…',
    time: '10:24 AM',
    unread: true,
  },
  {
    id: 'm2',
    from: 'Priya Shah',
    email: 'priya@northwind.io',
    subject: 'Proposal revision attached',
    preview: 'Updated pricing and timeline based on yesterday\'s notes…',
    time: 'Yesterday',
    unread: true,
  },
  {
    id: 'm3',
    from: 'Support Desk',
    email: 'support@roboticela.com',
    subject: 'Your SMTP account is verified',
    preview: 'smtp.acme.co is ready to send from jordan@acme.co…',
    time: 'Mon',
    unread: false,
  },
]

const SMTP_ACCOUNTS = [
  { id: 's1', host: 'smtp.acme.co', from: 'jordan@acme.co', status: 'Connected' },
  { id: 's2', host: 'mail.workspace.io', from: 'hello@workspace.io', status: 'Paused' },
]

export function EmailCenterPage() {
  const { workspaceId = 'ws-acme' } = useParams()
  const [section, setSection] = useState<EmailSection>('inbox')
  const [selectedId, setSelectedId] = useState('m1')
  const [query, setQuery] = useState('')
  const [to, setTo] = useState('alex@acme.co')
  const [subject, setSubject] = useState('Re: Q3 pipeline follow-up')
  const [body, setBody] = useState('Hi Alex,\n\nThanks for the note — happy to review the pipeline this week.\n\nBest,\nJordan')
  const [trackOpens, setTrackOpens] = useState(true)
  const [trackClicks, setTrackClicks] = useState(true)
  const [aiPrompt, setAiPrompt] = useState('')
  const [folder, setFolder] = useState<'all' | 'unread' | 'starred'>('all')

  const selected = MOCK_MAIL.find((m) => m.id === selectedId) ?? MOCK_MAIL[0]
  const filteredMail = MOCK_MAIL.filter((m) => {
    if (folder === 'unread' && !m.unread) return false
    if (query.trim()) {
      const q = query.toLowerCase()
      return (
        m.subject.toLowerCase().includes(q) ||
        m.from.toLowerCase().includes(q) ||
        m.preview.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Email"
        title="Email Center"
        description="Compose, schedule, and track workspace email from one place."
        actions={
          <>
            <Link
              to={`/w/${workspaceId}/templates`}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/60"
            >
              <FileText className="h-3.5 w-3.5" />
              Templates
            </Link>
            <Button type="button" variant="accent" size="sm">
              <Plus className="h-3.5 w-3.5" />
              Compose
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Inbox unread" value="12" meta="3 priority" />
        <StatTile label="Sent today" value="48" meta="+12% vs yesterday" />
        <StatTile label="Open rate" value="41%" meta="Last 7 days" />
        <StatTile label="Bounces" value="2" meta="Needs review" />
      </div>

      <SettingsShell
        nav={<SettingsNav items={SECTIONS} value={section} onChange={(id) => setSection(id as EmailSection)} />}
      >
        {section === 'smtp' ? (
          <SectionCard
            title="SMTP Accounts"
            description="Sending domains and credentials for this workspace."
            actions={
              <Button type="button" size="sm" variant="accent">
                <Plus className="h-3.5 w-3.5" />
                Add account
              </Button>
            }
            padded={false}
          >
            <div className="divide-y divide-border">
              {SMTP_ACCOUNTS.map((account) => (
                <ListRow
                  key={account.id}
                  title={account.from}
                  meta={`${account.host} · ${account.status}`}
                  trailing={
                    <Button type="button" size="sm" variant="outline">
                      Configure
                    </Button>
                  }
                />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {['inbox', 'outbox', 'sent', 'drafts'].includes(section) ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${section}…`}
                  className="h-10 pl-9"
                />
              </div>
              <SegmentedTabs
                value={folder}
                onChange={setFolder}
                tabs={[
                  { id: 'all', label: 'All' },
                  { id: 'unread', label: 'Unread' },
                  { id: 'starred', label: 'Starred' },
                ]}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
              <SectionCard
                title={section.charAt(0).toUpperCase() + section.slice(1)}
                description={`${filteredMail.length} messages`}
                padded={false}
              >
                {filteredMail.length === 0 ? (
                  <EmptyState
                    icon={<Inbox className="h-5 w-5" />}
                    title="No messages"
                    description="Nothing here yet. Compose a new email or sync an inbox."
                    actionLabel="Compose"
                    onAction={() => undefined}
                  />
                ) : (
                  <div className="divide-y divide-border">
                    {filteredMail.map((mail) => (
                      <ListRow
                        key={mail.id}
                        title={
                          <span className="inline-flex items-center gap-2">
                            {mail.unread ? (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            ) : null}
                            {mail.subject}
                          </span>
                        }
                        meta={`${mail.from} · ${mail.preview}`}
                        trailing={<span className="text-[12px] text-muted-foreground">{mail.time}</span>}
                        onClick={() => setSelectedId(mail.id)}
                        className={cn(selectedId === mail.id && 'bg-primary/5')}
                      />
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard
                title="Composer"
                description={`Reply to ${selected.from}`}
                actions={
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline">
                      <Paperclip className="h-3.5 w-3.5" />
                      Attach
                    </Button>
                    <Button type="button" size="sm" variant="accent">
                      <Send className="h-3.5 w-3.5" />
                      Send
                    </Button>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-[13.5px] font-medium text-foreground">{selected.subject}</p>
                    <p className="mt-1 text-[12.5px] text-muted-foreground">
                      {selected.from} &lt;{selected.email}&gt; · {selected.time}
                    </p>
                    <p className="mt-3 text-[13.5px] leading-relaxed text-foreground">{selected.preview}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-to">To</Label>
                    <Input id="email-to" value={to} onChange={(e) => setTo(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-subject">Subject</Label>
                    <Input
                      id="email-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-body">Message</Label>
                    <textarea
                      id="email-body"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={8}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-[13.5px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
                    />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-[13px] text-foreground">
                      <Checkbox
                        checked={trackOpens}
                        onChange={(e) => setTrackOpens(e.target.checked)}
                      />
                      Track opens
                    </label>
                    <label className="flex items-center gap-2 text-[13px] text-foreground">
                      <Checkbox
                        checked={trackClicks}
                        onChange={(e) => setTrackClicks(e.target.checked)}
                      />
                      Track clicks
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="outline">
                      <Reply className="h-3.5 w-3.5" />
                      Reply all
                    </Button>
                    <Button type="button" size="sm" variant="ghost">
                      Save draft
                    </Button>
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        ) : null}

        {section === 'templates' ? (
          <SectionCard title="Email templates" description="Reusable layouts for outreach and alerts." padded={false}>
            <div className="divide-y divide-border">
              {[
                { name: 'Welcome series', meta: 'Onboarding · Updated 2d ago' },
                { name: 'Deal won', meta: 'Sales · Updated 1w ago' },
                { name: 'Payment reminder', meta: 'Billing · Updated 3w ago' },
              ].map((item) => (
                <ListRow
                  key={item.name}
                  title={item.name}
                  meta={item.meta}
                  trailing={
                    <Button type="button" size="sm" variant="outline">
                      Edit
                    </Button>
                  }
                />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'campaigns' ? (
          <SectionCard title="Campaigns" description="Broadcast sends and A/B tests." padded={false}>
            <div className="divide-y divide-border">
              {[
                { name: 'Spring product launch', meta: 'Scheduled · 1,240 recipients' },
                { name: 'Nurture wave B', meta: 'Draft · 860 recipients' },
              ].map((item) => (
                <ListRow key={item.name} title={item.name} meta={item.meta} trailing={<Mail className="h-4 w-4 text-muted-foreground" />} />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'sequences' ? (
          <SectionCard title="Sequences" description="Multi-step automated outreach.">
            <div className="grid gap-3 sm:grid-cols-2">
              {['New lead nurture', 'Re-engage cold', 'Trial conversion', 'Churn save'].map((name) => (
                <div key={name} className="rounded-xl border border-border bg-background px-4 py-3">
                  <p className="text-[13.5px] font-medium text-foreground">{name}</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">4 steps · Active</p>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'analytics' ? (
          <SectionCard title="Analytics" description="Delivery, opens, clicks, and replies.">
            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile label="Delivered" value="98.2%" />
              <StatTile label="Opens" value="41%" />
              <StatTile label="Clicks" value="12%" />
            </div>
            <div className="mt-4 flex h-40 items-end gap-2 rounded-xl border border-border bg-background p-4">
              {[40, 65, 48, 72, 55, 80, 62].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-md bg-primary/25"
                  style={{ height: `${h}%` }}
                  title={`Day ${i + 1}`}
                />
              ))}
            </div>
            <p className="mt-2 text-[12px] text-muted-foreground">Mock open volume · last 7 days</p>
          </SectionCard>
        ) : null}

        {section === 'scheduling' ? (
          <SectionCard
            title="Scheduling"
            description="Queue sends for recipient timezones."
            actions={<Calendar className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="space-y-3">
              {[
                { when: 'Today · 4:00 PM', what: 'Pipeline follow-up to Alex' },
                { when: 'Fri · 9:00 AM', what: 'Welcome drip step 2' },
              ].map((item) => (
                <div key={item.what} className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
                  <div>
                    <p className="text-[13.5px] font-medium text-foreground">{item.what}</p>
                    <p className="text-[12px] text-muted-foreground">{item.when}</p>
                  </div>
                  <Button type="button" size="sm" variant="outline">
                    Reschedule
                  </Button>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'tracking' ? (
          <SectionCard title="Tracking" description="Open and click events across campaigns." padded={false}>
            <div className="divide-y divide-border">
              {[
                { title: 'Alex opened “Q3 pipeline follow-up”', meta: '10:24 AM · Inbox' },
                { title: 'Priya clicked pricing link', meta: 'Yesterday · Campaign' },
              ].map((item) => (
                <ListRow key={item.title} title={item.title} meta={item.meta} />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'variables' ? (
          <SectionCard title="Variables" description="Merge fields available in templates and composer.">
            <div className="flex flex-wrap gap-2">
              {['{{first_name}}', '{{company}}', '{{owner}}', '{{deal_value}}', '{{meeting_link}}'].map(
                (v) => (
                  <button
                    key={v}
                    type="button"
                    className="rounded-full border border-border px-3 py-1.5 font-mono text-[12px] text-foreground hover:bg-muted/50"
                  >
                    {v}
                  </button>
                ),
              )}
            </div>
          </SectionCard>
        ) : null}

        {section === 'attachments' ? (
          <SectionCard title="Attachments" description="Recent files used in email." padded={false}>
            {['proposal-q3.pdf', 'pricing-sheet.xlsx', 'brand-kit.zip'].map((file) => (
              <ListRow
                key={file}
                title={file}
                meta="Shared attachment"
                trailing={<Paperclip className="h-4 w-4 text-muted-foreground" />}
              />
            ))}
          </SectionCard>
        ) : null}

        {section === 'ai-writer' ? (
          <SectionCard
            title="AI Email Writer"
            description="Draft outreach from a short brief."
            actions={<Sparkles className="h-4 w-4 text-primary" />}
          >
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="ai-prompt">Brief</Label>
                <Input
                  id="ai-prompt"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Follow up on demo, mention pricing tier…"
                />
              </div>
              <Button type="button" variant="accent" size="sm">
                <Sparkles className="h-3.5 w-3.5" />
                Generate draft
              </Button>
              <div className="rounded-xl border border-border bg-background p-4 text-[13.5px] leading-relaxed text-muted-foreground">
                Generated copy will appear here for review before sending.
              </div>
            </div>
          </SectionCard>
        ) : null}

        {section === 'bulk' ? (
          <SectionCard title="Bulk Sending" description="Upload a list and send personalized mail.">
            <div className="space-y-4">
              <div className="rounded-xl border border-dashed border-border bg-background px-4 py-8 text-center">
                <p className="text-[13.5px] font-medium text-foreground">Drop a CSV of recipients</p>
                <p className="mt-1 text-[12.5px] text-muted-foreground">email, first_name, company</p>
                <Button type="button" size="sm" variant="outline" className="mt-4">
                  Choose file
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <p className="text-[13px] text-muted-foreground">Estimated send: 0 recipients · Rate limit aware</p>
              </div>
            </div>
          </SectionCard>
        ) : null}

        {section === 'bounces' ? (
          <SectionCard
            title="Bounce Management"
            description="Suppress hard bounces and review soft failures."
            actions={
              <Button type="button" size="sm" variant="outline">
                <Trash2 className="h-3.5 w-3.5" />
                Clear list
              </Button>
            }
            padded={false}
          >
            {[
              { email: 'old@example.com', meta: 'Hard bounce · Invalid mailbox' },
              { email: 'temp@blocked.co', meta: 'Soft bounce · Mailbox full' },
            ].map((item) => (
              <ListRow
                key={item.email}
                title={item.email}
                meta={item.meta}
                trailing={<AlertTriangle className="h-4 w-4 text-amber-500" />}
              />
            ))}
          </SectionCard>
        ) : null}
      </SettingsShell>
    </div>
  )
}
