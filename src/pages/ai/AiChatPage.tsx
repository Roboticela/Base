import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  BarChart3,
  Database,
  FileUp,
  Globe,
  MessageSquare,
  Mic,
  Send,
  Sheet,
  Sparkles,
  SquareFunction,
  Workflow,
} from 'lucide-react'

import { PageHeader } from '@/components/app/PageHeader'
import { SectionCard } from '@/components/app/SectionCard'
import { SegmentedTabs } from '@/components/app/SegmentedTabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const MODES = ['Chat', 'Voice', 'File upload', 'Website analysis', 'Data analysis'] as const
type Mode = (typeof MODES)[number]

const ACTIONS = [
  { id: 'db', label: 'Query DB', icon: Database },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'sheets', label: 'Sheets', icon: Sheet },
  { id: 'formulas', label: 'Formulas', icon: SquareFunction },
  { id: 'automations', label: 'Automations', icon: Workflow },
  { id: 'explain', label: 'Explain', icon: Sparkles },
  { id: 'sql', label: 'SQL', icon: Database },
  { id: 'workflows', label: 'Workflows', icon: Workflow },
] as const

type Message = {
  id: string
  role: 'user' | 'assistant'
  text: string
  mode: Mode
}

const SEED: Message[] = [
  {
    id: '1',
    role: 'assistant',
    text: 'Hi — I can query your workspace, draft reports, explain formulas, or help design automations. What should we tackle?',
    mode: 'Chat',
  },
  {
    id: '2',
    role: 'user',
    text: 'Show open deals over $50k owned by Jordan.',
    mode: 'Chat',
  },
  {
    id: '3',
    role: 'assistant',
    text: 'Found 3 deals: Contoso Expansion ($180k), Northwind Renewal ($95k), Adventure Works Upsell ($120k). Want a sheet filter or a chart?',
    mode: 'Chat',
  },
]

export function AiChatPage() {
  const { workspaceId = 'ws-acme' } = useParams()
  const [mode, setMode] = useState<Mode>('Chat')
  const [messages, setMessages] = useState(SEED)
  const [draft, setDraft] = useState('')
  const [action, setAction] = useState<string | null>(null)

  function send(raw?: string) {
    const text = (raw ?? draft).trim()
    if (!text) return
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: action ? `[${action}] ${text}` : text,
      mode,
    }
    const reply: Message = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      text: mockReply(mode, text, action),
      mode,
    }
    setMessages((current) => [...current, userMsg, reply])
    setDraft('')
    setAction(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Assistant"
        title="Workspace chat"
        description={`Ask questions, analyze data, and take actions in ${workspaceId}.`}
      />

      <SegmentedTabs
        value={mode}
        onChange={setMode}
        tabs={MODES.map((id) => ({ id, label: id }))}
      />

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <SectionCard title="Suggested" description="Quick actions" padded={false}>
          <div className="flex flex-col gap-1 p-2">
            {ACTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setAction(item.label)
                  setDraft((d) => d || `${item.label}: `)
                }}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-medium transition-colors',
                  action === item.label
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title={mode}
          description={modeHint(mode)}
          className="flex min-h-[480px] flex-col"
          padded={false}
        >
          <div className="flex-1 space-y-3 overflow-y-auto p-5 sm:p-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'max-w-[90%] rounded-2xl border px-4 py-3 text-[13.5px] leading-relaxed',
                  msg.role === 'user'
                    ? 'ml-auto border-primary/30 bg-primary/5 text-foreground'
                    : 'border-border bg-background text-foreground',
                )}
              >
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {msg.role === 'user' ? 'You' : 'Base AI'} · {msg.mode}
                </p>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="border-t border-border p-4">
            <ModeComposer
              mode={mode}
              draft={draft}
              onDraft={setDraft}
              onSend={send}
            />
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

function ModeComposer({
  mode,
  draft,
  onDraft,
  onSend,
}: {
  mode: Mode
  draft: string
  onDraft: (v: string) => void
  onSend: (raw?: string) => void
}) {
  if (mode === 'Voice') {
    return (
      <div className="flex flex-col items-center gap-3 py-2">
        <button
          type="button"
          className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background text-primary transition-colors hover:bg-muted/50"
          aria-label="Hold to talk"
        >
          <Mic className="h-5 w-5" />
        </button>
        <p className="text-[12.5px] text-muted-foreground">Tap to simulate voice input</p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onSend('Summarize this week’s pipeline in under a minute.')}
        >
          Use sample transcript
        </Button>
      </div>
    )
  }

  if (mode === 'File upload') {
    return (
      <div className="space-y-3">
        <button
          type="button"
          className="flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-background px-4 py-8 text-[13px] text-muted-foreground transition-colors hover:bg-muted/30"
        >
          <FileUp className="h-5 w-5" />
          Drop CSV, PDF, or images — or click to browse
        </button>
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => onDraft(e.target.value)}
            placeholder="What should I extract from the file?"
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
          />
          <Button type="button" variant="accent" onClick={() => onSend()}>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    )
  }

  if (mode === 'Website analysis') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <Input
            value={draft}
            onChange={(e) => onDraft(e.target.value)}
            placeholder="https://example.com/pricing"
            className="border-0 bg-transparent px-0 focus-visible:ring-0"
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
          />
        </div>
        <Button type="button" variant="accent" className="w-full sm:w-auto" onClick={() => onSend()}>
          Analyze site
        </Button>
      </div>
    )
  }

  if (mode === 'Data analysis') {
    return (
      <div className="space-y-3">
        <p className="text-[12.5px] text-muted-foreground">
          Ask about sheets, join trends, or request a chart from live data.
        </p>
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => onDraft(e.target.value)}
            placeholder="Compare win rate by owner this quarter…"
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
          />
          <Button type="button" variant="accent" onClick={() => onSend()}>
            <BarChart3 className="h-3.5 w-3.5" />
            Analyze
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <MessageSquare className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={draft}
          onChange={(e) => onDraft(e.target.value)}
          placeholder="Message Base AI…"
          className="pl-9"
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
        />
      </div>
      <Button type="button" variant="accent" onClick={() => onSend()}>
        <Send className="h-3.5 w-3.5" />
        Send
      </Button>
    </div>
  )
}

function modeHint(mode: Mode) {
  switch (mode) {
    case 'Voice':
      return 'Speak prompts; transcript appears in the thread'
    case 'File upload':
      return 'Extract structure from documents and spreadsheets'
    case 'Website analysis':
      return 'Summarize pages and map fields into sheets'
    case 'Data analysis':
      return 'Charts, SQL, and trend explanations'
    default:
      return 'General Q&A across your workspace'
  }
}

function mockReply(mode: Mode, text: string, action: string | null) {
  if (mode === 'Website analysis') {
    return `Analyzed ${text || 'the URL'}: detected pricing tiers, CTA, and 4 feature sections. I can draft a Competitive sheet from this.`
  }
  if (mode === 'File upload') {
    return `Ready to parse the upload. ${text || 'Tell me which columns to map.'}`
  }
  if (mode === 'Data analysis') {
    return `Draft analysis for “${text}”: win rate up 6% QoQ; Jordan leads volume. Toggle Reports for a chart mock.`
  }
  if (mode === 'Voice') {
    return `Heard: “${text}”. Here’s a 45-second spoken summary mock of your pipeline.`
  }
  if (action) {
    return `Ran suggested action “${action}” on: ${text}. (Design mock — no backend.)`
  }
  return `Got it — “${text}”. I can open a filtered sheet view or draft an automation next.`
}
