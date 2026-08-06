import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Check,
  Clock,
  FileSpreadsheet,
  History,
  LayoutDashboard,
  Pencil,
  RefreshCw,
  Sparkles,
  Workflow,
  Zap,
} from 'lucide-react'

import { EmptyState } from '@/components/app/EmptyState'
import { ListRow } from '@/components/app/ListRow'
import { PageHeader } from '@/components/app/PageHeader'
import { SectionCard } from '@/components/app/SectionCard'
import { SegmentedTabs } from '@/components/app/SegmentedTabs'
import { StatTile } from '@/components/app/StatTile'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const SUGGESTED = [
  'Build a CRM with accounts, contacts, and deals',
  'Create a project tracker with Gantt and automations',
  'Inventory sheet with low-stock alerts',
  'Support inbox with SLA dashboards',
]

const TEMPLATES = [
  { name: 'Sales pipeline', meta: 'Sheets · Kanban · 3 automations' },
  { name: 'HR onboarding', meta: 'Forms · Tasks · Email' },
  { name: 'Content calendar', meta: 'Calendar view · Approvals' },
]

const HISTORY = [
  { id: 'h1', title: 'CRM v3', meta: 'Accepted · 2h ago' },
  { id: 'h2', title: 'CRM v2', meta: 'Edited · Yesterday' },
  { id: 'h3', title: 'CRM draft', meta: 'Regenerated · Aug 3' },
]

const PREVIEW_TABS = ['Sheets', 'Fields', 'Automations', 'Dashboards'] as const

export function AiBuilderPage() {
  const { workspaceId = 'ws-acme' } = useParams()
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [hasPreview, setHasPreview] = useState(true)
  const [previewTab, setPreviewTab] = useState<(typeof PREVIEW_TABS)[number]>('Sheets')
  const [activeHistory, setActiveHistory] = useState('h1')
  const [progress, setProgress] = useState(68)

  function startGenerate() {
    setGenerating(true)
    setHasPreview(false)
    setProgress(12)
    window.setTimeout(() => setProgress(45), 400)
    window.setTimeout(() => setProgress(78), 900)
    window.setTimeout(() => {
      setProgress(100)
      setGenerating(false)
      setHasPreview(true)
    }, 1400)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI Builder"
        title="Generate workspace structure"
        description={`Describe what you need — Base drafts sheets, fields, automations, and dashboards for ${workspaceId}.`}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => (generating ? setGenerating(false) : startGenerate())}
          >
            <Clock className="h-3.5 w-3.5" />
            {generating ? 'Hide progress' : 'Simulate progress'}
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[240px_1fr_300px]">
        <SectionCard title="Conversation" description="Prior builder sessions" padded={false}>
          <div className="divide-y divide-border">
            {HISTORY.map((item) => (
              <ListRow
                key={item.id}
                title={item.title}
                meta={item.meta}
                onClick={() => setActiveHistory(item.id)}
                className={cn(activeHistory === item.id && 'bg-primary/5')}
              />
            ))}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Prompt" description="Be specific about entities and workflows">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              placeholder="e.g. Build a B2B CRM with Accounts, Contacts, Deals, Activities, and automations that notify owners when a deal moves to Negotiation…"
              className="w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-[14px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="accent" onClick={startGenerate}>
                <Sparkles className="h-3.5 w-3.5" />
                Generate
              </Button>
              <Button type="button" variant="outline" onClick={() => setPrompt('')}>
                Clear
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Suggested prompts
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPrompt(item)}
                    className="rounded-full border border-border px-3 py-1.5 text-left text-[12.5px] text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>

          {generating ? (
            <SectionCard title="Generating" description="Drafting structure from your prompt">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">Working…</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full border border-border bg-background">
                  <div
                    className="h-full rounded-full bg-primary/40 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <ul className="space-y-1.5 text-[12.5px] text-muted-foreground">
                  <li className={cn(progress >= 20 && 'text-foreground')}>· Inferring entities</li>
                  <li className={cn(progress >= 50 && 'text-foreground')}>· Designing fields</li>
                  <li className={cn(progress >= 75 && 'text-foreground')}>· Wiring automations</li>
                  <li className={cn(progress >= 100 && 'text-foreground')}>· Building dashboards</li>
                </ul>
              </div>
            </SectionCard>
          ) : null}

          {hasPreview ? (
            <SectionCard
              title="Preview"
              description="Review before accepting into the workspace"
              actions={
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="accent">
                    <Check className="h-3.5 w-3.5" />
                    Accept
                  </Button>
                  <Button type="button" size="sm" variant="outline">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={startGenerate}>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Regenerate
                  </Button>
                </div>
              }
            >
              <SegmentedTabs
                value={previewTab}
                onChange={setPreviewTab}
                tabs={PREVIEW_TABS.map((id) => ({ id, label: id }))}
                className="mb-4"
              />
              <PreviewPanel tab={previewTab} />
            </SectionCard>
          ) : (
            <SectionCard>
              <EmptyState
                icon={<Sparkles className="h-5 w-5" />}
                title="No preview yet"
                description="Run generate to draft sheets, fields, automations, and dashboards."
                actionLabel="Generate"
                onAction={startGenerate}
              />
            </SectionCard>
          )}
        </div>

        <div className="space-y-6">
          <SectionCard title="Templates" description="Start from a proven layout" padded={false}>
            <div className="divide-y divide-border">
              {TEMPLATES.map((item) => (
                <ListRow
                  key={item.name}
                  title={item.name}
                  meta={item.meta}
                  onClick={() => setPrompt(`Use the ${item.name} template and customize for our team.`)}
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Version history" description="Accepted drafts" padded={false}>
            <div className="divide-y divide-border">
              {HISTORY.map((item) => (
                <ListRow
                  key={item.id}
                  title={item.title}
                  meta={item.meta}
                  trailing={<History className="h-3.5 w-3.5 text-muted-foreground" />}
                  onClick={() => setActiveHistory(item.id)}
                />
              ))}
            </div>
          </SectionCard>

          <div className="grid gap-3">
            <StatTile label="Sheets drafted" value="4" meta="Accounts, Contacts…" />
            <StatTile label="Automations" value="3" meta="Status, SLA, digest" />
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewPanel({ tab }: { tab: (typeof PREVIEW_TABS)[number] }) {
  if (tab === 'Sheets') {
    return (
      <ul className="space-y-2">
        {['Accounts', 'Contacts', 'Deals', 'Activities'].map((name) => (
          <li
            key={name}
            className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3"
          >
            <FileSpreadsheet className="h-4 w-4 text-primary" />
            <div>
              <p className="text-[13.5px] font-medium">{name}</p>
              <p className="text-[12px] text-muted-foreground">Table + Kanban defaults</p>
            </div>
          </li>
        ))}
      </ul>
    )
  }
  if (tab === 'Fields') {
    return (
      <ul className="space-y-2 text-[13.5px]">
        {[
          'Accounts.Name · Text · Required',
          'Deals.Stage · Select · Lead→Won',
          'Deals.Amount · Currency',
          'Contacts.Account · Relation',
        ].map((field) => (
          <li key={field} className="rounded-xl border border-border bg-background px-4 py-3">
            {field}
          </li>
        ))}
      </ul>
    )
  }
  if (tab === 'Automations') {
    return (
      <ul className="space-y-2">
        {[
          'Notify owner when Stage → Negotiation',
          'Create task when Deal created',
          'Weekly pipeline digest email',
        ].map((item) => (
          <li
            key={item}
            className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3"
          >
            <Workflow className="h-4 w-4 text-primary" />
            <span className="text-[13.5px]">{item}</span>
          </li>
        ))}
      </ul>
    )
  }
  return (
    <ul className="space-y-2">
      {[
        { name: 'Pipeline overview', icon: LayoutDashboard },
        { name: 'Owner workload', icon: Zap },
      ].map((item) => (
        <li
          key={item.name}
          className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3"
        >
          <item.icon className="h-4 w-4 text-primary" />
          <span className="text-[13.5px] font-medium">{item.name}</span>
        </li>
      ))}
    </ul>
  )
}
