import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Archive,
  ArrowLeft,
  Bell,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  FileText,
  History,
  Link2,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Pause,
  Pin,
  Play,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
  StickyNote,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react'

import { EmptyState } from '@/components/app/EmptyState'
import { SectionCard } from '@/components/app/SectionCard'
import { SegmentedTabs } from '@/components/app/SegmentedTabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BUILDER_FIELDS, BUILDER_RECORDS, MOCK_SHEETS } from '@/data/sheets'
import { cn } from '@/lib/utils'

const TABS = [
  'Details',
  'Activity',
  'Comments',
  'Attachments',
  'Related Records',
  'Emails',
  'Tasks',
  'Notes',
  'History',
  'AI Insights',
] as const

type Tab = (typeof TABS)[number]
type ActivityFilter = 'All' | 'Field' | 'Status' | 'Comment' | 'System'
type EmailFolder = 'Sent' | 'Received' | 'Drafts' | 'Scheduled'
type TaskStatus = 'Open' | 'In progress' | 'Done'
type TaskPriority = 'Low' | 'Medium' | 'High'

type FieldGroup = {
  id: string
  title: string
  fieldIds: string[]
}

type ActivityItem = {
  id: string
  user: string
  time: string
  action: string
  type: Exclude<ActivityFilter, 'All'>
  previous?: string
  next?: string
}

type CommentItem = {
  id: string
  user: string
  time: string
  text: string
  pinned: boolean
  reactions: number
  replies: { id: string; user: string; time: string; text: string }[]
}

type AttachmentItem = {
  id: string
  name: string
  size: string
  uploaded: string
  version: string
}

type RelatedItem = {
  id: string
  name: string
  type: 'Company' | 'Contact' | 'Deal' | 'Task'
  meta: string
}

type EmailItem = {
  id: string
  subject: string
  folder: EmailFolder
  meta: string
  preview: string
}

type TaskItem = {
  id: string
  title: string
  assignee: string
  status: TaskStatus
  priority: TaskPriority
  due: string
  done: boolean
}

type NoteItem = {
  id: string
  title: string
  body: string
  updated: string
}

type HistoryItem = {
  id: string
  version: string
  author: string
  time: string
  summary: string
}

const FIELD_GROUPS: FieldGroup[] = [
  { id: 'company', title: 'Company info', fieldIds: ['name', 'email', 'website', 'owner'] },
  { id: 'deal', title: 'Deal', fieldIds: ['status', 'value', 'rating'] },
  { id: 'system', title: 'System', fieldIds: ['updated'] },
]

const EXTRA_FIELDS = [
  {
    id: 'lookup_industry',
    label: 'Industry (lookup)',
    type: 'Lookup',
    value: 'Manufacturing',
    readOnly: true,
  },
  {
    id: 'formula_score',
    label: 'Health score (formula)',
    type: 'Formula',
    value: '82',
    readOnly: true,
  },
  {
    id: 'relation_parent',
    label: 'Parent account (relation)',
    type: 'Relation',
    value: 'Contoso Holdings',
    readOnly: true,
  },
]

const INITIAL_ACTIVITY: ActivityItem[] = [
  {
    id: 'a1',
    user: 'Jordan Lee',
    time: '12m ago',
    action: 'Changed Status',
    type: 'Status',
    previous: 'Negotiation',
    next: 'Open',
  },
  {
    id: 'a2',
    user: 'Alex Rivera',
    time: '2h ago',
    action: 'Updated Deal value',
    type: 'Field',
    previous: '$42,000',
    next: '$48,000',
  },
  {
    id: 'a3',
    user: 'Alex Rivera',
    time: 'Yesterday',
    action: 'Added a comment',
    type: 'Comment',
  },
  {
    id: 'a4',
    user: 'System',
    time: '2d ago',
    action: 'Automation ran: Notify owner on edit',
    type: 'System',
  },
]

const INITIAL_COMMENTS: CommentItem[] = [
  {
    id: 'c1',
    user: 'Alex Kim',
    time: '2h ago',
    text: 'Confirm Contoso ownership before Q3 renewal.',
    pinned: true,
    reactions: 3,
    replies: [
      {
        id: 'c1r1',
        user: 'Jordan Lee',
        time: '1h ago',
        text: 'Ownership confirmed with legal — good to proceed.',
      },
    ],
  },
  {
    id: 'c2',
    user: 'Jordan Lee',
    time: 'Yesterday',
    text: 'Intro call went well — follow up Friday with pricing.',
    pinned: false,
    reactions: 1,
    replies: [],
  },
]

const INITIAL_ATTACHMENTS: AttachmentItem[] = [
  {
    id: 'f1',
    name: 'MSA_Contoso_2026.pdf',
    size: '1.2 MB',
    uploaded: 'Aug 1, 2026',
    version: 'v3',
  },
  {
    id: 'f2',
    name: 'Org_chart.xlsx',
    size: '84 KB',
    uploaded: 'Jul 28, 2026',
    version: 'v1',
  },
  {
    id: 'f3',
    name: 'Discovery_notes.docx',
    size: '210 KB',
    uploaded: 'Jul 22, 2026',
    version: 'v2',
  },
]

const INITIAL_RELATED: RelatedItem[] = [
  { id: 'rel1', name: 'Contoso Holdings', type: 'Company', meta: 'Parent · Active' },
  { id: 'rel2', name: 'Priya Shah', type: 'Contact', meta: 'VP Ops · Primary' },
  { id: 'rel3', name: 'Contoso Expansion', type: 'Deal', meta: '$180k · Negotiation' },
  { id: 'rel4', name: 'Send pricing proposal', type: 'Task', meta: 'Due Aug 8 · High' },
]

const INITIAL_EMAILS: EmailItem[] = [
  {
    id: 'e1',
    subject: 'Q3 renewal kickoff',
    folder: 'Sent',
    meta: 'To: ops@contoso.com · Aug 4',
    preview: 'Sharing the agenda for our renewal conversation…',
  },
  {
    id: 'e2',
    subject: 'Intro — Base platform',
    folder: 'Received',
    meta: 'From: jordan@acme.example · Jul 29',
    preview: 'Thanks for the walkthrough. Looking forward to next steps.',
  },
  {
    id: 'e3',
    subject: 'Security review invite',
    folder: 'Drafts',
    meta: 'Draft · Updated Aug 5',
    preview: 'Hi team — proposing Thursday for the security review…',
  },
  {
    id: 'e4',
    subject: 'Proposal follow-up',
    folder: 'Scheduled',
    meta: 'Sends Aug 7 · 9:00 AM',
    preview: 'Circling back on the pricing proposal we shared…',
  },
]

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't1',
    title: 'Send pricing proposal',
    assignee: 'Jordan Lee',
    status: 'In progress',
    priority: 'High',
    due: 'Aug 8',
    done: false,
  },
  {
    id: 't2',
    title: 'Schedule security review',
    assignee: 'Alex Rivera',
    status: 'Open',
    priority: 'Medium',
    due: 'Aug 12',
    done: false,
  },
  {
    id: 't3',
    title: 'Attach signed MSA',
    assignee: 'You',
    status: 'Done',
    priority: 'Low',
    due: 'Aug 1',
    done: true,
  },
]

const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'n1',
    title: 'Discovery notes',
    body: 'Interested in multi-sheet CRM + automations. Decision makers: Priya (Ops), Jordan (Sponsor).',
    updated: 'Aug 4',
  },
  {
    id: 'n2',
    title: 'Competitive context',
    body: 'Evaluating against two incumbents. Price sensitivity medium; SLA is a key differentiator.',
    updated: 'Jul 30',
  },
]

const INITIAL_HISTORY: HistoryItem[] = [
  {
    id: 'h1',
    version: 'v12',
    author: 'Jordan Lee',
    time: '12m ago',
    summary: 'Status → Open',
  },
  {
    id: 'h2',
    version: 'v11',
    author: 'Alex Rivera',
    time: '2h ago',
    summary: 'Deal value → $48,000',
  },
  {
    id: 'h3',
    version: 'v10',
    author: 'You',
    time: 'Jul 22',
    summary: 'Record created',
  },
]

const TAG_OPTIONS = ['crm', 'renewal', 'enterprise', 'q3']
const FOLLOWERS = ['Jordan Lee', 'Alex Rivera', 'Morgan Lee']
const STATUS_OPTIONS = ['Open', 'Negotiation', 'Won', 'Lost']
const PRIORITY_OPTIONS: TaskPriority[] = ['Low', 'Medium', 'High']

function isValidEmail(value: string) {
  if (!value.trim()) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-0.5 text-[12px] font-medium text-foreground">
      {status}
    </span>
  )
}

function MetaChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-border bg-background px-2 py-0.5 text-[12px] text-muted-foreground">
      {children}
    </span>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-[12px] font-medium transition-colors',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function FieldEditor({
  label,
  type,
  value,
  required,
  readOnly,
  onChange,
  onCopy,
}: {
  label: string
  type: string
  value: string
  required?: boolean
  readOnly?: boolean
  onChange?: (value: string) => void
  onCopy?: () => void
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-[12.5px]">
          {label}
          {required ? <span className="ml-0.5 text-destructive">*</span> : null}
          <span className="ml-1.5 font-normal text-muted-foreground">· {type}</span>
        </Label>
        {onCopy ? (
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground hover:text-foreground"
            aria-label={`Copy ${label}`}
          >
            <Copy className="h-3 w-3" />
            Copy
          </button>
        ) : null}
      </div>
      {readOnly ? (
        <div className="flex h-10 items-center rounded-xl border border-border bg-muted/30 px-3 text-[13.5px] text-muted-foreground">
          {value || '—'}
        </div>
      ) : (
        <Input value={value} onChange={(e) => onChange?.(e.target.value)} />
      )}
    </div>
  )
}

export function RecordDetailsPage() {
  const navigate = useNavigate()
  const { workspaceId = 'ws-acme', sheetId = 'sheet-customers', recordId = 'r1' } = useParams()

  const sheet = MOCK_SHEETS.find((s) => s.id === sheetId) ?? MOCK_SHEETS[0]
  const source = BUILDER_RECORDS.find((r) => r.id === recordId) ?? BUILDER_RECORDS[0]

  const [tab, setTab] = useState<Tab>('Details')
  const [title, setTitle] = useState(source.values.name ?? 'Untitled')
  const [values, setValues] = useState<Record<string, string>>({ ...source.values })
  const [tags, setTags] = useState<string[]>(['crm', 'renewal'])
  const [status, setStatus] = useState(source.values.status || 'Open')
  const [priority, setPriority] = useState<TaskPriority>('High')
  const [assignee, setAssignee] = useState(source.values.owner || 'Jordan')
  const [followers, setFollowers] = useState(FOLLOWERS)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [aiMenuOpen, setAiMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('All')
  const [emailFolder, setEmailFolder] = useState<EmailFolder>('Received')
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [commentDraft, setCommentDraft] = useState('')
  const [noteDraft, setNoteDraft] = useState('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiChat, setAiChat] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: 'Ask anything about this record — timeline, risks, or next steps.',
    },
  ])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [activity, setActivity] = useState(INITIAL_ACTIVITY)
  const [comments, setComments] = useState(INITIAL_COMMENTS)
  const [attachments, setAttachments] = useState(INITIAL_ATTACHMENTS)
  const [related, setRelated] = useState(INITIAL_RELATED)
  const [emails] = useState(INITIAL_EMAILS)
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [notes, setNotes] = useState(INITIAL_NOTES)
  const [history, setHistory] = useState(INITIAL_HISTORY)
  const [automations, setAutomations] = useState([
    { id: 'auto1', name: 'Notify owner on edit', state: 'running' as 'running' | 'paused' },
    { id: 'auto2', name: 'Create follow-up task', state: 'paused' as 'running' | 'paused' },
  ])
  const [reminders, setReminders] = useState([
    { id: 'rem1', text: 'Follow up on proposal', when: 'Aug 8 · 10:00 AM' },
    { id: 'rem2', text: 'Security review prep', when: 'Aug 11 · 3:00 PM' },
  ])

  const markDirty = () => {
    setDirty(true)
    setSavedFlash(false)
  }

  const handleSave = () => {
    setDirty(false)
    setSavedFlash(true)
    setActivity((prev) => [
      {
        id: `a-${Date.now()}`,
        user: 'You',
        time: 'Just now',
        action: 'Saved record changes',
        type: 'System',
      },
      ...prev,
    ])
  }

  const setFieldValue = (id: string, next: string) => {
    setValues((prev) => ({ ...prev, [id]: next }))
    if (id === 'name') setTitle(next)
    if (id === 'status') setStatus(next)
    if (id === 'owner') setAssignee(next)
    markDirty()
  }

  const validationIssues = useMemo(() => {
    const issues: string[] = []
    for (const field of BUILDER_FIELDS) {
      if (field.required && !(values[field.id] ?? '').trim()) {
        issues.push(`${field.label} is required`)
      }
      if (field.type === 'Email' && !isValidEmail(values[field.id] ?? '')) {
        issues.push(`${field.label} looks invalid`)
      }
    }
    return issues
  }, [values])

  const q = searchQuery.trim().toLowerCase()

  const filteredActivity = activity.filter((item) => {
    if (activityFilter !== 'All' && item.type !== activityFilter) return false
    if (!q) return true
    return (
      item.action.toLowerCase().includes(q) ||
      item.user.toLowerCase().includes(q) ||
      (item.previous ?? '').toLowerCase().includes(q) ||
      (item.next ?? '').toLowerCase().includes(q)
    )
  })

  const filteredComments = comments.filter((item) => {
    if (!q) return true
    return (
      item.text.toLowerCase().includes(q) ||
      item.user.toLowerCase().includes(q) ||
      item.replies.some((r) => r.text.toLowerCase().includes(q))
    )
  })

  const visibleFieldIds = useMemo(() => {
    if (!q) return null
    return new Set(
      BUILDER_FIELDS.filter(
        (f) =>
          f.label.toLowerCase().includes(q) ||
          (values[f.id] ?? '').toLowerCase().includes(q) ||
          f.type.toLowerCase().includes(q),
      ).map((f) => f.id),
    )
  }, [q, values])

  const copyValue = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedId(id)
      window.setTimeout(() => setCopiedId(null), 1200)
    } catch {
      setCopiedId(id)
      window.setTimeout(() => setCopiedId(null), 1200)
    }
  }

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
    markDirty()
  }

  const postComment = () => {
    const text = commentDraft.trim()
    if (!text) return
    setComments((prev) => [
      {
        id: `c-${Date.now()}`,
        user: 'You',
        time: 'Just now',
        text,
        pinned: false,
        reactions: 0,
        replies: [],
      },
      ...prev,
    ])
    setCommentDraft('')
    markDirty()
  }

  const addTask = () => {
    const titleText = newTaskTitle.trim()
    if (!titleText) return
    setTasks((prev) => [
      {
        id: `t-${Date.now()}`,
        title: titleText,
        assignee: assignee || 'You',
        status: 'Open',
        priority: 'Medium',
        due: 'Aug 15',
        done: false,
      },
      ...prev,
    ])
    setNewTaskTitle('')
    markDirty()
  }

  const addNote = () => {
    const body = noteDraft.trim()
    if (!body) return
    setNotes((prev) => [
      {
        id: `n-${Date.now()}`,
        title: `Note ${prev.length + 1}`,
        body,
        updated: 'Just now',
      },
      ...prev,
    ])
    setNoteDraft('')
    markDirty()
  }

  const askAi = () => {
    const question = aiQuestion.trim()
    if (!question) return
    setAiChat((prev) => [
      ...prev,
      { role: 'user', text: question },
      {
        role: 'assistant',
        text: `Based on ${title}: prioritize the pricing proposal and confirm security review attendees before Aug 12.`,
      },
    ])
    setAiQuestion('')
  }

  const sheetName = sheet?.name ?? 'Sheet'
  const initial = (title || 'R').charAt(0).toUpperCase()

  return (
    <div className="relative space-y-4 pb-16">
      {/* Top bar */}
      <div className="sticky top-0 z-20 -mx-1 border-b border-border bg-background/95 px-1 py-3 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
          <Link
            to={`/w/${workspaceId}/sheets/${sheetId}`}
            className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
          <span className="text-border">/</span>
          <Link to={`/w/${workspaceId}/sheets`} className="hover:text-foreground">
            Sheets
          </Link>
          <span className="text-border">/</span>
          <Link
            to={`/w/${workspaceId}/sheets/${sheetId}`}
            className="hover:text-foreground"
          >
            {sheetName}
          </Link>
          <span className="text-border">/</span>
          <span className="font-medium text-foreground">Record</span>
        </div>
      </div>

      {/* Record header */}
      <SectionCard>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-[20px] font-semibold text-primary">
              {initial}
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setValues((prev) => ({ ...prev, name: e.target.value }))
                  markDirty()
                }}
                className="h-11 text-[18px] font-semibold"
                aria-label="Record title"
              />
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={status} />
                {tags.map((tag) => (
                  <MetaChip key={tag}>{tag}</MetaChip>
                ))}
                <MetaChip>
                  <Users className="mr-1 h-3 w-3" />
                  {assignee}
                </MetaChip>
                <span className="text-[12.5px] text-muted-foreground">
                  Created {source.created} · Modified {source.updated} by {source.updatedBy}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="accent" size="sm" onClick={handleSave}>
              <Check className="h-3.5 w-3.5" />
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setActivity((prev) => [
                  {
                    id: `a-${Date.now()}`,
                    user: 'You',
                    time: 'Just now',
                    action: 'Duplicated record',
                    type: 'System',
                  },
                  ...prev,
                ])
              }}
            >
              <Copy className="h-3.5 w-3.5" />
              Duplicate
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                markDirty()
                setActivity((prev) => [
                  {
                    id: `a-${Date.now()}`,
                    user: 'You',
                    time: 'Just now',
                    action: 'Archived record',
                    type: 'System',
                  },
                  ...prev,
                ])
              }}
            >
              <Archive className="h-3.5 w-3.5" />
              Archive
            </Button>
            {confirmDelete ? (
              <div className="flex items-center gap-1 rounded-xl border border-destructive/40 bg-background p-1">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => navigate(`/w/${workspaceId}/sheets/${sheetId}`)}
                >
                  Confirm delete
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => setConfirmDelete(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" size="sm">
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
            <Button type="button" variant="outline" size="sm">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAiMenuOpen((o) => !o)}
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI Actions
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              {aiMenuOpen ? (
                <div className="absolute right-0 z-30 mt-1 w-52 rounded-xl border border-border bg-card p-1">
                  {[
                    'Summarize record',
                    'Draft follow-up email',
                    'Find missing info',
                    'Suggest next tasks',
                  ].map((label) => (
                    <button
                      key={label}
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-foreground hover:bg-muted/50"
                      onClick={() => {
                        setAiMenuOpen(false)
                        setTab('AI Insights')
                      }}
                    >
                      <Bot className="h-3.5 w-3.5 text-primary" />
                      {label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? <ChevronRight className="h-4 w-4" /> : <MoreHorizontal className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* In-record search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search fields, comments, and activity…"
          className="pl-9"
        />
      </div>

      {/* Validation banner */}
      {validationIssues.length > 0 ? (
        <div className="rounded-2xl border border-destructive/40 bg-card px-4 py-3">
          <p className="text-[13.5px] font-medium text-destructive">
            {validationIssues.length} validation issue{validationIssues.length > 1 ? 's' : ''}
          </p>
          <ul className="mt-1.5 space-y-1 text-[13px] text-muted-foreground">
            {validationIssues.map((issue) => (
              <li key={issue}>· {issue}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Two-column layout */}
      <div className={cn('grid gap-4', sidebarOpen ? 'xl:grid-cols-[minmax(0,1fr)_300px]' : '')}>
        <div className="min-w-0 space-y-4">
          <div className="overflow-x-auto pb-1">
            <SegmentedTabs
              value={tab}
              onChange={setTab}
              tabs={TABS.map((id) => ({ id, label: id }))}
              className="min-w-max flex-nowrap"
            />
          </div>

          {/* Details */}
          {tab === 'Details' ? (
            <div className="space-y-4">
              {FIELD_GROUPS.map((group) => {
                const fields = BUILDER_FIELDS.filter((f) => group.fieldIds.includes(f.id)).filter(
                  (f) => !visibleFieldIds || visibleFieldIds.has(f.id),
                )
                if (fields.length === 0 && visibleFieldIds) return null
                return (
                  <SectionCard key={group.id} title={group.title} description="Inline edit fields">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {fields.map((field) => (
                        <FieldEditor
                          key={field.id}
                          label={field.label}
                          type={field.type}
                          value={values[field.id] ?? ''}
                          required={field.required}
                          readOnly={field.locked || field.id === 'updated'}
                          onChange={(next) => setFieldValue(field.id, next)}
                          onCopy={() => copyValue(field.id, values[field.id] ?? '')}
                        />
                      ))}
                    </div>
                    {group.id === 'system' ? (
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {EXTRA_FIELDS.filter(
                          (f) =>
                            !q ||
                            f.label.toLowerCase().includes(q) ||
                            f.value.toLowerCase().includes(q),
                        ).map((field) => (
                          <FieldEditor
                            key={field.id}
                            label={field.label}
                            type={field.type}
                            value={field.value}
                            readOnly
                            onCopy={() => copyValue(field.id, field.value)}
                          />
                        ))}
                      </div>
                    ) : null}
                    {copiedId ? (
                      <p className="mt-3 text-[12px] text-muted-foreground">Copied to clipboard</p>
                    ) : null}
                  </SectionCard>
                )
              })}
            </div>
          ) : null}

          {/* Activity */}
          {tab === 'Activity' ? (
            <SectionCard
              title="Activity"
              description="Timeline of changes on this record"
              actions={
                <div className="flex flex-wrap gap-1.5">
                  {(['All', 'Field', 'Status', 'Comment', 'System'] as ActivityFilter[]).map(
                    (filter) => (
                      <FilterChip
                        key={filter}
                        active={activityFilter === filter}
                        onClick={() => setActivityFilter(filter)}
                      >
                        {filter}
                      </FilterChip>
                    ),
                  )}
                </div>
              }
              padded={false}
            >
              {filteredActivity.length ? (
                <div className="divide-y divide-border">
                  {filteredActivity.map((item) => (
                    <div key={item.id} className="flex gap-3 px-5 py-4 sm:px-6">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-[11px] font-semibold text-primary">
                        {item.user.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[13.5px] font-medium text-foreground">{item.user}</span>
                          <span className="text-[12px] text-muted-foreground">{item.time}</span>
                          <MetaChip>{item.type}</MetaChip>
                        </div>
                        <p className="mt-1 text-[13.5px] text-foreground">{item.action}</p>
                        {item.previous || item.next ? (
                          <p className="mt-1 text-[12.5px] text-muted-foreground">
                            <span className="line-through">{item.previous ?? '—'}</span>
                            <span className="mx-1.5">→</span>
                            <span className="font-medium text-foreground">{item.next ?? '—'}</span>
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<History className="h-5 w-5" />}
                  title="No activity"
                  description="Nothing matches this filter or search."
                />
              )}
            </SectionCard>
          ) : null}

          {/* Comments */}
          {tab === 'Comments' ? (
            <SectionCard title="Comments" description="Discussion and mentions" padded={false}>
              {filteredComments.length ? (
                <div className="divide-y divide-border">
                  {filteredComments.map((item) => (
                    <div key={item.id} className="space-y-3 px-5 py-4 sm:px-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[13.5px] font-medium text-foreground">
                              {item.user}
                            </span>
                            <span className="text-[12px] text-muted-foreground">{item.time}</span>
                            {item.pinned ? (
                              <span className="inline-flex items-center gap-1 text-[11.5px] text-primary">
                                <Pin className="h-3 w-3" />
                                Pinned
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1.5 text-[13.5px] leading-relaxed text-foreground">
                            {item.text}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setComments((prev) =>
                              prev.map((c) =>
                                c.id === item.id
                                  ? {
                                      ...c,
                                      replies: [
                                        ...c.replies,
                                        {
                                          id: `r-${Date.now()}`,
                                          user: 'You',
                                          time: 'Just now',
                                          text: 'Noted — following up.',
                                        },
                                      ],
                                    }
                                  : c,
                              ),
                            )
                          }
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Reply
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setComments((prev) =>
                              prev.map((c) =>
                                c.id === item.id ? { ...c, pinned: !c.pinned } : c,
                              ),
                            )
                          }
                        >
                          <Pin className="h-3.5 w-3.5" />
                          {item.pinned ? 'Unpin' : 'Pin'}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setComments((prev) =>
                              prev.map((c) =>
                                c.id === item.id ? { ...c, reactions: c.reactions + 1 } : c,
                              ),
                            )
                          }
                        >
                          React · {item.reactions}
                        </Button>
                      </div>
                      {item.replies.length ? (
                        <div className="ml-4 space-y-2 border-l border-border pl-4">
                          {item.replies.map((reply) => (
                            <div key={reply.id}>
                              <div className="flex items-center gap-2 text-[12.5px]">
                                <span className="font-medium text-foreground">{reply.user}</span>
                                <span className="text-muted-foreground">{reply.time}</span>
                              </div>
                              <p className="mt-0.5 text-[13px] text-muted-foreground">{reply.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<MessageSquare className="h-5 w-5" />}
                  title="No comments"
                  description="Start a thread or search returned no matches."
                />
              )}
              <div className="space-y-2 border-t border-border p-4">
                <Label>Add a comment</Label>
                <Input
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder="Write a comment… use @ to mention"
                />
                <p className="text-[12px] text-muted-foreground">
                  Tip: type @name to mention teammates. Supports basic rich-text notes.
                </p>
                <div className="flex justify-end">
                  <Button type="button" variant="accent" size="sm" onClick={postComment}>
                    Post
                  </Button>
                </div>
              </div>
            </SectionCard>
          ) : null}

          {/* Attachments */}
          {tab === 'Attachments' ? (
            <SectionCard
              title="Attachments"
              description="Files linked to this record"
              actions={
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAttachments((prev) => [
                      {
                        id: `f-${Date.now()}`,
                        name: `Upload_${prev.length + 1}.pdf`,
                        size: '96 KB',
                        uploaded: 'Just now',
                        version: 'v1',
                      },
                      ...prev,
                    ])
                    markDirty()
                  }}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                </Button>
              }
            >
              <div className="mb-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background px-4 py-10 text-center">
                <Paperclip className="mb-2 h-5 w-5 text-muted-foreground" />
                <p className="text-[14px] font-medium text-foreground">Drop files to upload</p>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  PDF, images, sheets — mock upload only
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    setAttachments((prev) => [
                      {
                        id: `f-${Date.now()}`,
                        name: 'Dropped_file.pdf',
                        size: '240 KB',
                        uploaded: 'Just now',
                        version: 'v1',
                      },
                      ...prev,
                    ])
                    markDirty()
                  }}
                >
                  Browse files
                </Button>
              </div>
              {attachments.length ? (
                <div className="divide-y divide-border rounded-2xl border border-border">
                  {attachments.map((file) => (
                    <div
                      key={file.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-medium text-foreground">
                          {file.name}
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          {file.size} · {file.uploaded} · {file.version}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Button type="button" variant="ghost" size="sm">
                          <FileText className="h-3.5 w-3.5" />
                          Preview
                        </Button>
                        <Button type="button" variant="ghost" size="sm">
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const next = window.prompt('Rename file', file.name)
                            if (!next) return
                            setAttachments((prev) =>
                              prev.map((f) =>
                                f.id === file.id
                                  ? { ...f, name: next, version: `v${Number(f.version.slice(1) || 1) + 1}` }
                                  : f,
                              ),
                            )
                            markDirty()
                          }}
                        >
                          Rename
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAttachments((prev) => prev.filter((f) => f.id !== file.id))
                            markDirty()
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
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

          {/* Related Records */}
          {tab === 'Related Records' ? (
            <SectionCard
              title="Related records"
              description="Companies, contacts, deals, and tasks"
              actions={
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRelated((prev) => [
                      {
                        id: `rel-${Date.now()}`,
                        name: 'New linked contact',
                        type: 'Contact',
                        meta: 'Created just now',
                      },
                      ...prev,
                    ])
                    markDirty()
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create
                </Button>
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {related.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <MetaChip>{item.type}</MetaChip>
                        <p className="mt-2 text-[14px] font-medium text-foreground">{item.name}</p>
                        <p className="mt-0.5 text-[12.5px] text-muted-foreground">{item.meta}</p>
                      </div>
                      <Link2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button type="button" variant="outline" size="sm">
                        Open
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRelated((prev) => prev.filter((r) => r.id !== item.id))
                          markDirty()
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          {/* Emails */}
          {tab === 'Emails' ? (
            <div className="space-y-4">
              <SectionCard
                title="Emails"
                description="Threads linked to this record"
                actions={
                  <Button
                    type="button"
                    size="sm"
                    variant="accent"
                    onClick={() => setComposeOpen((o) => !o)}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Compose
                  </Button>
                }
              >
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {(['Received', 'Sent', 'Drafts', 'Scheduled'] as EmailFolder[]).map((folder) => (
                    <FilterChip
                      key={folder}
                      active={emailFolder === folder}
                      onClick={() => setEmailFolder(folder)}
                    >
                      {folder}
                    </FilterChip>
                  ))}
                </div>
                <div className="divide-y divide-border rounded-2xl border border-border">
                  {emails
                    .filter((e) => e.folder === emailFolder)
                    .map((email) => (
                      <div key={email.id} className="px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[13.5px] font-medium text-foreground">{email.subject}</p>
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">{email.meta}</p>
                        <p className="mt-1 text-[13px] text-muted-foreground">{email.preview}</p>
                      </div>
                    ))}
                  {emails.filter((e) => e.folder === emailFolder).length === 0 ? (
                    <EmptyState
                      icon={<Mail className="h-5 w-5" />}
                      title="No emails"
                      description={`Nothing in ${emailFolder} yet.`}
                    />
                  ) : null}
                </div>
              </SectionCard>

              {composeOpen ? (
                <SectionCard
                  title="Compose email"
                  description="Draft a message for this record"
                  actions={
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setComposeSubject(`Follow-up: ${title}`)
                        setComposeBody(
                          `Hi,\n\nFollowing up on ${title}. Happy to share next steps and timeline.\n\nBest,`,
                        )
                        setComposeTo(values.email || '')
                      }}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      AI generate
                    </Button>
                  }
                >
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>To</Label>
                      <Input value={composeTo} onChange={(e) => setComposeTo(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Subject</Label>
                      <Input
                        value={composeSubject}
                        onChange={(e) => setComposeSubject(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Body</Label>
                      <textarea
                        value={composeBody}
                        onChange={(e) => setComposeBody(e.target.value)}
                        rows={6}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-[13.5px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setComposeOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="accent"
                        size="sm"
                        onClick={() => {
                          setComposeOpen(false)
                          setComposeBody('')
                          setComposeSubject('')
                        }}
                      >
                        Send (mock)
                      </Button>
                    </div>
                  </div>
                </SectionCard>
              ) : null}
            </div>
          ) : null}

          {/* Tasks */}
          {tab === 'Tasks' ? (
            <SectionCard title="Tasks" description="Work items for this record">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="New task title…"
                />
                <Button type="button" variant="accent" size="sm" onClick={addTask}>
                  <Plus className="h-3.5 w-3.5" />
                  Create
                </Button>
              </div>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-border bg-background p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setTasks((prev) =>
                                prev.map((t) =>
                                  t.id === task.id
                                    ? {
                                        ...t,
                                        done: !t.done,
                                        status: !t.done ? 'Done' : 'Open',
                                      }
                                    : t,
                                ),
                              )
                              markDirty()
                            }}
                            className={cn(
                              'flex h-5 w-5 items-center justify-center rounded-md border border-border',
                              task.done ? 'bg-primary text-primary-foreground' : 'bg-background',
                            )}
                            aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
                          >
                            {task.done ? <Check className="h-3 w-3" /> : null}
                          </button>
                          <p
                            className={cn(
                              'text-[14px] font-medium text-foreground',
                              task.done && 'text-muted-foreground line-through',
                            )}
                          >
                            {task.title}
                          </p>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <MetaChip>{task.assignee}</MetaChip>
                          <MetaChip>{task.status}</MetaChip>
                          <MetaChip>{task.priority}</MetaChip>
                          <MetaChip>Due {task.due}</MetaChip>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {PRIORITY_OPTIONS.map((p) => (
                          <FilterChip
                            key={p}
                            active={task.priority === p}
                            onClick={() => {
                              setTasks((prev) =>
                                prev.map((t) => (t.id === task.id ? { ...t, priority: p } : t)),
                              )
                              markDirty()
                            }}
                          >
                            {p}
                          </FilterChip>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(['Open', 'In progress', 'Done'] as TaskStatus[]).map((s) => (
                        <Button
                          key={s}
                          type="button"
                          size="sm"
                          variant={task.status === s ? 'accent' : 'outline'}
                          onClick={() => {
                            setTasks((prev) =>
                              prev.map((t) =>
                                t.id === task.id
                                  ? { ...t, status: s, done: s === 'Done' }
                                  : t,
                              ),
                            )
                            markDirty()
                          }}
                        >
                          {s}
                        </Button>
                      ))}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setTasks((prev) =>
                            prev.map((t) =>
                              t.id === task.id ? { ...t, assignee: 'You' } : t,
                            ),
                          )
                          markDirty()
                        }}
                      >
                        Assign to me
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          {/* Notes */}
          {tab === 'Notes' ? (
            <SectionCard title="Notes" description="Internal rich notes">
              <div className="mb-4 space-y-2">
                <Label>New note</Label>
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={4}
                  placeholder="Write a rich note…"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-[13.5px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                />
                <div className="flex justify-end">
                  <Button type="button" variant="accent" size="sm" onClick={addNote}>
                    <StickyNote className="h-3.5 w-3.5" />
                    Add note
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px] font-medium text-foreground">{note.title}</p>
                      <span className="text-[12px] text-muted-foreground">{note.updated}</span>
                    </div>
                    <textarea
                      value={note.body}
                      onChange={(e) => {
                        const body = e.target.value
                        setNotes((prev) =>
                          prev.map((n) =>
                            n.id === note.id ? { ...n, body, updated: 'Just now' } : n,
                          ),
                        )
                        markDirty()
                      }}
                      rows={3}
                      className="mt-2 w-full rounded-xl border border-border bg-card px-3 py-2 text-[13.5px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    />
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          {/* History */}
          {tab === 'History' ? (
            <SectionCard title="History" description="Versions with compare and restore" padded={false}>
              <div className="divide-y divide-border">
                {history.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13.5px] font-medium text-foreground">
                          {item.version}
                        </span>
                        <span className="text-[12px] text-muted-foreground">
                          {item.author} · {item.time}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] text-muted-foreground">{item.summary}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={index === history.length - 1}
                        onClick={() => {
                          setActivity((prev) => [
                            {
                              id: `a-${Date.now()}`,
                              user: 'You',
                              time: 'Just now',
                              action: `Compared ${item.version} with previous`,
                              type: 'System',
                            },
                            ...prev,
                          ])
                        }}
                      >
                        Compare
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setHistory((prev) => [
                            {
                              id: `h-${Date.now()}`,
                              version: `v${12 + prev.length}`,
                              author: 'You',
                              time: 'Just now',
                              summary: `Restored from ${item.version}`,
                            },
                            ...prev,
                          ])
                          markDirty()
                        }}
                      >
                        Restore
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          {/* AI Insights */}
          {tab === 'AI Insights' ? (
            <div className="space-y-4">
              <SectionCard
                title="AI Insights"
                description={`Generated overview for ${title}`}
                actions={<Bot className="h-4 w-4 text-primary" />}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: 'Summary',
                      body: `${title} is an ${status} account owned by ${assignee}. Deal value is ${values.value || '—'} with priority ${values.rating || '—'}.`,
                    },
                    {
                      title: 'Action items',
                      body: 'Send pricing proposal by Aug 8. Confirm security review attendees. Link signed MSA.',
                    },
                    {
                      title: 'Missing info',
                      body: validationIssues.length
                        ? validationIssues.join(' · ')
                        : 'No required fields missing. Consider adding industry and billing contact.',
                    },
                    {
                      title: 'Follow-ups',
                      body: 'Schedule renewal kickoff. Share proposal. Set reminder for Aug 8 morning.',
                    },
                  ].map((card) => (
                    <div key={card.title} className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                        {card.title}
                      </p>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-foreground">{card.body}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTab('Emails')
                      setComposeOpen(true)
                      setComposeSubject(`Follow-up: ${title}`)
                      setComposeBody(
                        `Hi,\n\nQuick follow-up on ${title}. Let me know a good time this week.\n\nThanks,`,
                      )
                      setComposeTo(values.email || '')
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate email
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setTab('Tasks')}>
                    Create tasks from insights
                  </Button>
                </div>
              </SectionCard>

              <SectionCard title="Q&A" description="Ask questions about this record">
                <div className="mb-3 max-h-56 space-y-2 overflow-y-auto rounded-2xl border border-border bg-background p-3">
                  {aiChat.map((msg, i) => (
                    <div
                      key={`${msg.role}-${i}`}
                      className={cn(
                        'rounded-xl border border-border px-3 py-2 text-[13px]',
                        msg.role === 'assistant' ? 'bg-card text-foreground' : 'bg-primary/10 text-foreground',
                      )}
                    >
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                        {msg.role === 'assistant' ? 'Assistant' : 'You'}
                      </span>
                      {msg.text}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="Ask about this record…"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') askAi()
                    }}
                  />
                  <Button type="button" variant="accent" size="sm" onClick={askAi}>
                    Ask
                  </Button>
                </div>
              </SectionCard>
            </div>
          ) : null}
        </div>

        {/* Right sidebar */}
        {sidebarOpen ? (
          <aside className="space-y-4">
            <SectionCard
              title="Properties"
              description="Quick controls"
              actions={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Collapse sidebar"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              }
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Assignee</Label>
                  <Input
                    value={assignee}
                    onChange={(e) => {
                      setAssignee(e.target.value)
                      setFieldValue('owner', e.target.value)
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_OPTIONS.map((s) => (
                      <FilterChip
                        key={s}
                        active={status === s}
                        onClick={() => {
                          setStatus(s)
                          setFieldValue('status', s)
                        }}
                      >
                        {s}
                      </FilterChip>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Priority</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRIORITY_OPTIONS.map((p) => (
                      <FilterChip
                        key={p}
                        active={priority === p}
                        onClick={() => {
                          setPriority(p)
                          markDirty()
                        }}
                      >
                        {p}
                      </FilterChip>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {TAG_OPTIONS.map((tag) => (
                      <FilterChip key={tag} active={tags.includes(tag)} onClick={() => toggleTag(tag)}>
                        {tag}
                      </FilterChip>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Followers</Label>
                  <div className="space-y-2">
                    {followers.map((person) => (
                      <div
                        key={person}
                        className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-[13px]"
                      >
                        <span className="text-foreground">{person}</span>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            setFollowers((prev) => prev.filter((f) => f !== person))
                          }
                          aria-label={`Remove ${person}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setFollowers((prev) =>
                          prev.includes('Sam Patel') ? prev : [...prev, 'Sam Patel'],
                        )
                        markDirty()
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add follower
                    </Button>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Automations" description="Run, pause, or retry">
              <div className="space-y-2">
                {automations.map((auto) => (
                  <div
                    key={auto.id}
                    className="rounded-xl border border-border bg-background px-3 py-2"
                  >
                    <p className="text-[13px] font-medium text-foreground">{auto.name}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground capitalize">
                      {auto.state}
                    </p>
                    <div className="mt-2 flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setAutomations((prev) =>
                            prev.map((a) =>
                              a.id === auto.id ? { ...a, state: 'running' } : a,
                            ),
                          )
                        }
                      >
                        <Play className="h-3.5 w-3.5" />
                        Run
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setAutomations((prev) =>
                            prev.map((a) =>
                              a.id === auto.id ? { ...a, state: 'paused' } : a,
                            ),
                          )
                        }
                      >
                        <Pause className="h-3.5 w-3.5" />
                        Pause
                      </Button>
                      <Button type="button" variant="ghost" size="sm">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Retry
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Reminders" description="Upcoming nudges">
              <div className="space-y-2">
                {reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="flex items-start gap-2 rounded-xl border border-border bg-background px-3 py-2"
                  >
                    <Bell className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-[13px] text-foreground">{rem.text}</p>
                      <p className="text-[12px] text-muted-foreground">{rem.when}</p>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    setReminders((prev) => [
                      ...prev,
                      {
                        id: `rem-${Date.now()}`,
                        text: 'New reminder',
                        when: 'Tomorrow · 9:00 AM',
                      },
                    ])
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add reminder
                </Button>
              </div>
            </SectionCard>

            <SectionCard title="Quick stats">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Comments', value: String(comments.length) },
                  { label: 'Files', value: String(attachments.length) },
                  { label: 'Tasks open', value: String(tasks.filter((t) => !t.done).length) },
                  { label: 'Related', value: String(related.length) },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-border bg-background px-3 py-2 text-center"
                  >
                    <p className="text-[16px] font-semibold text-foreground">{stat.value}</p>
                    <p className="text-[11.5px] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Linked records" padded={false}>
              <div className="divide-y divide-border">
                {related.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-foreground">{item.name}</p>
                      <p className="text-[12px] text-muted-foreground">{item.type}</p>
                    </div>
                    <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Sharing">
              <div className="space-y-2 text-[13px]">
                {[
                  { role: 'Owner', who: source.createdBy, access: 'Full' },
                  { role: 'Editor', who: 'Sales team', access: 'Edit' },
                  { role: 'Viewer', who: 'Finance', access: 'View' },
                ].map((row) => (
                  <div
                    key={row.role + row.who}
                    className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2"
                  >
                    <div>
                      <p className="font-medium text-foreground">{row.who}</p>
                      <p className="text-[12px] text-muted-foreground">{row.role}</p>
                    </div>
                    <MetaChip>{row.access}</MetaChip>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="w-full">
                  <Share2 className="h-3.5 w-3.5" />
                  Manage permissions
                </Button>
              </div>
            </SectionCard>
          </aside>
        ) : null}
      </div>

      {/* Floating save indicator */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-40">
        <div
          className={cn(
            'pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-[12.5px] font-medium',
            dirty ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {dirty ? (
            <>
              <span className="h-2 w-2 rounded-full bg-primary" />
              Unsaved changes
              <Button
                type="button"
                variant="accent"
                size="sm"
                className="pointer-events-auto h-7 px-2.5"
                onClick={handleSave}
              >
                Save
              </Button>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              {savedFlash ? 'Saved' : 'All changes saved'}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
