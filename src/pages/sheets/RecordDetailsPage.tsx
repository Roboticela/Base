import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Bot,
  ChevronLeft,
  Clock,
  Link2,
  Mail,
  MessageSquare,
  Paperclip,
  Plus,
  ScrollText,
  Sparkles,
  StickyNote,
} from 'lucide-react'

import { EmptyState } from '@/components/app/EmptyState'
import { ListRow } from '@/components/app/ListRow'
import { PageHeader } from '@/components/app/PageHeader'
import { SectionCard } from '@/components/app/SectionCard'
import { SegmentedTabs } from '@/components/app/SegmentedTabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const TABS = [
  'Details',
  'Comments',
  'Activity',
  'Attachments',
  'Related Records',
  'Emails',
  'Tasks',
  'Notes',
  'History',
  'AI Summary',
  'Audit Logs',
] as const

type Tab = (typeof TABS)[number]

const FIELDS = [
  { label: 'Company', value: 'Contoso Ltd' },
  { label: 'Status', value: 'Active' },
  { label: 'Owner', value: 'Jordan Lee' },
  { label: 'Industry', value: 'Manufacturing' },
  { label: 'Annual revenue', value: '$4.2M' },
  { label: 'Employees', value: '280' },
  { label: 'Website', value: 'contoso.example' },
  { label: 'Phone', value: '+1 (425) 555-0142' },
  { label: 'Billing city', value: 'Redmond, WA' },
  { label: 'Last contacted', value: 'Aug 4, 2026' },
]

const COMMENTS = [
  { user: 'Alex Kim', time: '2h ago', text: 'Confirm Contoso ownership before Q3 renewal.' },
  { user: 'Jordan Lee', time: 'Yesterday', text: 'Intro call went well — follow up Friday.' },
]

const ACTIVITY = [
  { text: 'Status changed to Active', meta: 'Jordan · 12m ago' },
  { text: 'Owner assigned to Jordan Lee', meta: 'Alex · 2h ago' },
  { text: 'Deal linked: Contoso Expansion', meta: 'System · Yesterday' },
]

const ATTACHMENTS = [
  { name: 'MSA_Contoso_2026.pdf', meta: '1.2 MB · Uploaded Aug 1' },
  { name: 'Org_chart.xlsx', meta: '84 KB · Uploaded Jul 28' },
]

const RELATED = [
  { name: 'Contoso Expansion', meta: 'Deal · $180k · Negotiation' },
  { name: 'Priya Shah', meta: 'Contact · VP Ops' },
  { name: 'Support ticket #4821', meta: 'Open · High' },
]

const EMAILS = [
  { subject: 'Q3 renewal kickoff', meta: 'To: ops@contoso.example · Aug 4' },
  { subject: 'Intro — Base platform', meta: 'From: jordan@acme.example · Jul 29' },
]

const TASKS = [
  { title: 'Send pricing proposal', meta: 'Due Aug 8 · High' },
  { title: 'Schedule security review', meta: 'Due Aug 12 · Medium' },
]

const NOTES = [
  { title: 'Discovery notes', meta: 'Interested in multi-sheet CRM + automations' },
  { title: 'Competitive context', meta: 'Evaluating against two incumbents' },
]

const HISTORY = [
  { text: 'Created record', meta: 'Alex · Jul 22' },
  { text: 'Industry updated', meta: 'Jordan · Jul 30' },
  { text: 'Revenue updated to $4.2M', meta: 'Import · Aug 2' },
]

const AUDIT = [
  { text: 'VIEW · Record opened', meta: 'Jordan · 8:02 PM' },
  { text: 'UPDATE · Status', meta: 'Jordan · 7:48 PM' },
  { text: 'SHARE · Shared with Sales', meta: 'Alex · Aug 3' },
]

export function RecordDetailsPage() {
  const { workspaceId = 'ws-acme', sheetId = 'sheet-customers', recordId = 'row-1' } =
    useParams()
  const [tab, setTab] = useState<Tab>('Details')
  const [comment, setComment] = useState('')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <Link
          to={`/w/${workspaceId}/sheets/${sheetId}`}
          className="inline-flex items-center gap-1 font-medium hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Customers
        </Link>
        <span>/</span>
        <span className="text-foreground">{recordId}</span>
      </div>

      <PageHeader
        eyebrow="Record"
        title="Contoso Ltd"
        description="Customer account · Active · Owned by Jordan Lee"
        actions={
          <>
            <Button type="button" variant="outline" size="sm">
              <Mail className="h-3.5 w-3.5" />
              Email
            </Button>
            <Button type="button" variant="outline" size="sm">
              <Sparkles className="h-3.5 w-3.5" />
              AI summary
            </Button>
            <Button type="button" variant="accent" size="sm">
              Edit
            </Button>
          </>
        }
      />

      <SegmentedTabs
        value={tab}
        onChange={setTab}
        tabs={TABS.map((id) => ({ id, label: id }))}
      />

      {tab === 'Details' ? (
        <SectionCard title="Fields" description="Primary record attributes">
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <div key={field.label} className="space-y-1.5">
                <Label>{field.label}</Label>
                <Input defaultValue={field.value} readOnly />
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      {tab === 'Comments' ? (
        <SectionCard
          title="Comments"
          description="Team discussion on this record"
          actions={
            <Button type="button" size="sm" variant="outline">
              <Plus className="h-3.5 w-3.5" />
              Mention
            </Button>
          }
          padded={false}
        >
          <div className="divide-y divide-border">
            {COMMENTS.map((item) => (
              <ListRow
                key={item.text}
                title={item.user}
                meta={`${item.time} · ${item.text}`}
                trailing={<MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />}
              />
            ))}
          </div>
          <div className="flex gap-2 border-t border-border p-4">
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment…"
            />
            <Button type="button" variant="accent" size="sm">
              Post
            </Button>
          </div>
        </SectionCard>
      ) : null}

      {tab === 'Activity' ? (
        <SectionCard title="Activity" description="Recent events" padded={false}>
          <div className="divide-y divide-border">
            {ACTIVITY.map((item) => (
              <ListRow
                key={item.text}
                title={item.text}
                meta={item.meta}
                trailing={<Clock className="h-3.5 w-3.5 text-muted-foreground" />}
              />
            ))}
          </div>
        </SectionCard>
      ) : null}

      {tab === 'Attachments' ? (
        <SectionCard
          title="Attachments"
          description="Files linked to Contoso Ltd"
          actions={
            <Button type="button" size="sm" variant="outline">
              <Paperclip className="h-3.5 w-3.5" />
              Upload
            </Button>
          }
          padded={false}
        >
          {ATTACHMENTS.length ? (
            <div className="divide-y divide-border">
              {ATTACHMENTS.map((item) => (
                <ListRow key={item.name} title={item.name} meta={item.meta} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Paperclip className="h-5 w-5" />}
              title="No attachments"
              description="Upload contracts, decks, or images for this record."
              actionLabel="Upload"
              onAction={() => undefined}
            />
          )}
        </SectionCard>
      ) : null}

      {tab === 'Related Records' ? (
        <SectionCard title="Related records" description="Linked deals, contacts, and tickets" padded={false}>
          <div className="divide-y divide-border">
            {RELATED.map((item) => (
              <ListRow
                key={item.name}
                title={item.name}
                meta={item.meta}
                trailing={<Link2 className="h-3.5 w-3.5 text-muted-foreground" />}
              />
            ))}
          </div>
        </SectionCard>
      ) : null}

      {tab === 'Emails' ? (
        <SectionCard title="Emails" description="Thread history" padded={false}>
          <div className="divide-y divide-border">
            {EMAILS.map((item) => (
              <ListRow
                key={item.subject}
                title={item.subject}
                meta={item.meta}
                trailing={<Mail className="h-3.5 w-3.5 text-muted-foreground" />}
              />
            ))}
          </div>
        </SectionCard>
      ) : null}

      {tab === 'Tasks' ? (
        <SectionCard
          title="Tasks"
          description="Open work for Contoso"
          actions={
            <Button type="button" size="sm" variant="outline">
              <Plus className="h-3.5 w-3.5" />
              Add task
            </Button>
          }
          padded={false}
        >
          <div className="divide-y divide-border">
            {TASKS.map((item) => (
              <ListRow key={item.title} title={item.title} meta={item.meta} />
            ))}
          </div>
        </SectionCard>
      ) : null}

      {tab === 'Notes' ? (
        <SectionCard title="Notes" description="Internal notes" padded={false}>
          <div className="divide-y divide-border">
            {NOTES.map((item) => (
              <ListRow
                key={item.title}
                title={item.title}
                meta={item.meta}
                trailing={<StickyNote className="h-3.5 w-3.5 text-muted-foreground" />}
              />
            ))}
          </div>
        </SectionCard>
      ) : null}

      {tab === 'History' ? (
        <SectionCard title="History" description="Field-level changes" padded={false}>
          <div className="divide-y divide-border">
            {HISTORY.map((item) => (
              <ListRow key={item.text} title={item.text} meta={item.meta} />
            ))}
          </div>
        </SectionCard>
      ) : null}

      {tab === 'AI Summary' ? (
        <SectionCard
          title="AI summary"
          description="Generated overview of Contoso Ltd"
          actions={<Bot className="h-4 w-4 text-primary" />}
        >
          <div className="space-y-4 text-[14px] leading-relaxed text-foreground">
            <p>
              Contoso Ltd is an active manufacturing account owned by Jordan Lee, with ~280
              employees and $4.2M annual revenue. Recent activity centers on a Q3 renewal and an
              expansion deal in negotiation ($180k).
            </p>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Suggested next steps
              </p>
              <ul className="mt-2 space-y-1.5 text-[13.5px] text-muted-foreground">
                <li>· Send pricing proposal by Aug 8</li>
                <li>· Confirm security review attendees</li>
                <li>· Link signed MSA to Attachments</li>
              </ul>
            </div>
            <Button type="button" variant="outline" size="sm">
              <Sparkles className="h-3.5 w-3.5" />
              Regenerate
            </Button>
          </div>
        </SectionCard>
      ) : null}

      {tab === 'Audit Logs' ? (
        <SectionCard title="Audit logs" description="Security and access events" padded={false}>
          <div className="divide-y divide-border">
            {AUDIT.map((item) => (
              <ListRow
                key={item.text}
                title={item.text}
                meta={item.meta}
                trailing={<ScrollText className="h-3.5 w-3.5 text-muted-foreground" />}
              />
            ))}
          </div>
        </SectionCard>
      ) : null}

    </div>
  )
}
