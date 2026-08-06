import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  AlertTriangle,
  Clock,
  GripVertical,
  History,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  Variable,
  Zap,
} from 'lucide-react'

import { EmptyState } from '@/components/app/EmptyState'
import { ListRow } from '@/components/app/ListRow'
import { PageHeader } from '@/components/app/PageHeader'
import { SectionCard } from '@/components/app/SectionCard'
import { SegmentedTabs } from '@/components/app/SegmentedTabs'
import { StatTile } from '@/components/app/StatTile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const PANELS = [
  'Builder',
  'Testing',
  'Logs',
  'Execution history',
  'Variables',
  'Scheduling',
  'Retry',
  'Error handling',
  'Templates',
] as const

type Panel = (typeof PANELS)[number]

const AUTOMATIONS = [
  { id: 'a1', name: 'Notify on stage change', meta: 'Active · Deals · 142 runs', status: 'active' },
  { id: 'a2', name: 'Create task for new lead', meta: 'Paused · Customers · 18 runs', status: 'paused' },
  { id: 'a3', name: 'Weekly pipeline digest', meta: 'Active · Scheduled · 12 runs', status: 'active' },
]

const NODES = [
  {
    id: 'trigger',
    kind: 'Trigger',
    title: 'Record updated',
    detail: 'Sheet: Deals · Field: Stage',
    tone: 'trigger' as const,
  },
  {
    id: 'condition',
    kind: 'Condition',
    title: 'Stage equals Negotiation',
    detail: 'AND Owner is not empty',
    tone: 'condition' as const,
  },
  {
    id: 'action',
    kind: 'Action',
    title: 'Send notification',
    detail: 'To: Owner · Channel: In-app + Email',
    tone: 'action' as const,
  },
]

const TEMPLATES = [
  { name: 'New record → Slack', meta: 'Trigger + Action' },
  { name: 'Status gate + assign', meta: 'Trigger + Condition + Action' },
  { name: 'Scheduled digest', meta: 'Schedule + Query + Email' },
]

export function AutomationsPage() {
  const { workspaceId = 'ws-acme' } = useParams()
  const [panel, setPanel] = useState<Panel>('Builder')
  const [selected, setSelected] = useState('a1')
  const [nodes, setNodes] = useState(NODES)
  const [testResult, setTestResult] = useState<string | null>(null)

  const current = AUTOMATIONS.find((a) => a.id === selected) ?? AUTOMATIONS[0]

  function addNode(kind: 'Trigger' | 'Condition' | 'Action') {
    const id = `${kind.toLowerCase()}-${Date.now()}`
    setNodes((c) => [
      ...c,
      {
        id,
        kind,
        title: `New ${kind.toLowerCase()}`,
        detail: 'Configure this step',
        tone: kind.toLowerCase() as 'trigger' | 'condition' | 'action',
      },
    ])
    setPanel('Builder')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Automations"
        title="Workflows"
        description={`Build triggers, conditions, and actions for ${workspaceId}.`}
        actions={
          <>
            <Button type="button" variant="outline" size="sm">
              <Sparkles className="h-3.5 w-3.5" />
              Generate with AI
            </Button>
            <Button type="button" variant="accent" size="sm">
              <Plus className="h-3.5 w-3.5" />
              New automation
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Active" value="12" meta="Running in this workspace" />
        <StatTile label="Runs today" value="386" meta="98.4% success" />
        <StatTile label="Failed" value="6" meta="Needs retry review" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <SectionCard title="Automations" description="Select to edit" padded={false}>
          <div className="divide-y divide-border">
            {AUTOMATIONS.map((item) => (
              <ListRow
                key={item.id}
                title={item.name}
                meta={item.meta}
                onClick={() => setSelected(item.id)}
                className={cn(selected === item.id && 'bg-primary/5')}
                trailing={
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[11px] font-medium capitalize',
                      item.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {item.status}
                  </span>
                }
              />
            ))}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[16px] font-semibold tracking-tight">{current.name}</h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{current.meta}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => addNode('Trigger')}>
                + Trigger
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => addNode('Condition')}>
                + Condition
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => addNode('Action')}>
                + Action
              </Button>
            </div>
          </div>

          <SegmentedTabs
            value={panel}
            onChange={setPanel}
            tabs={PANELS.map((id) => ({ id, label: id }))}
          />

          {panel === 'Builder' ? (
            <SectionCard
              title="Visual builder"
              description="Drag-style cards — reorder is simulated"
            >
              <div className="space-y-3">
                {nodes.map((node, index) => (
                  <div key={node.id}>
                    <div
                      className={cn(
                        'flex cursor-grab items-start gap-3 rounded-2xl border bg-background p-4',
                        node.tone === 'trigger' && 'border-primary/40',
                        node.tone === 'condition' && 'border-amber-500/40',
                        node.tone === 'action' && 'border-emerald-500/40',
                      )}
                    >
                      <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                          {node.kind}
                        </p>
                        <p className="mt-1 text-[14px] font-medium text-foreground">{node.title}</p>
                        <p className="mt-0.5 text-[12.5px] text-muted-foreground">{node.detail}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setNodes((c) => c.filter((n) => n.id !== node.id))}
                      >
                        Remove
                      </Button>
                    </div>
                    {index < nodes.length - 1 ? (
                      <div className="flex justify-center py-1">
                        <span className="h-6 w-px bg-border" />
                      </div>
                    ) : null}
                  </div>
                ))}
                {nodes.length === 0 ? (
                  <EmptyState
                    icon={<Zap className="h-5 w-5" />}
                    title="Empty flow"
                    description="Add a trigger to start this automation."
                    actionLabel="Add trigger"
                    onAction={() => addNode('Trigger')}
                  />
                ) : null}
              </div>
            </SectionCard>
          ) : null}

          {panel === 'Testing' ? (
            <SectionCard title="Testing" description="Dry-run against sample records">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Sample record</Label>
                  <Input defaultValue="Contoso Expansion · Stage: Negotiation" />
                </div>
                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  onClick={() =>
                    setTestResult('Passed · Trigger matched · Condition true · Action queued')
                  }
                >
                  <Play className="h-3.5 w-3.5" />
                  Run test
                </Button>
                {testResult ? (
                  <p className="rounded-xl border border-border bg-background px-4 py-3 text-[13.5px]">
                    {testResult}
                  </p>
                ) : null}
              </div>
            </SectionCard>
          ) : null}

          {panel === 'Logs' ? (
            <SectionCard title="Logs" description="Recent runtime messages" padded={false}>
              <div className="divide-y divide-border">
                {[
                  { title: 'Action delivered', meta: 'Email · 8:01 PM' },
                  { title: 'Condition evaluated true', meta: '8:01 PM' },
                  { title: 'Trigger fired', meta: 'Stage update · 8:01 PM' },
                ].map((item) => (
                  <ListRow key={item.title + item.meta} title={item.title} meta={item.meta} />
                ))}
              </div>
            </SectionCard>
          ) : null}

          {panel === 'Execution history' ? (
            <SectionCard title="Execution history" description="Past runs" padded={false}>
              <div className="divide-y divide-border">
                {[
                  { title: 'Success · 842ms', meta: 'Contoso Expansion · Aug 6' },
                  { title: 'Success · 610ms', meta: 'Northwind Renewal · Aug 5' },
                  { title: 'Failed · timeout', meta: 'Adventure Works · Aug 4' },
                ].map((item) => (
                  <ListRow
                    key={item.meta}
                    title={item.title}
                    meta={item.meta}
                    trailing={<History className="h-3.5 w-3.5 text-muted-foreground" />}
                  />
                ))}
              </div>
            </SectionCard>
          ) : null}

          {panel === 'Variables' ? (
            <SectionCard title="Variables" description="Flow-scoped values">
              <div className="space-y-3">
                {[
                  { key: 'record.id', value: '{{trigger.recordId}}' },
                  { key: 'owner.email', value: '{{record.owner.email}}' },
                  { key: 'stage.from', value: '{{trigger.before.stage}}' },
                ].map((v) => (
                  <div
                    key={v.key}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3"
                  >
                    <Variable className="h-3.5 w-3.5 text-primary" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium">{v.key}</p>
                      <p className="truncate text-[12px] text-muted-foreground">{v.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          {panel === 'Scheduling' ? (
            <SectionCard title="Scheduling" description="When this flow may run">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Cadence</Label>
                  <Input defaultValue="Event-driven · also weekly Fri 9:00 AM" />
                </div>
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Timezone: America/Los_Angeles
                </div>
              </div>
            </SectionCard>
          ) : null}

          {panel === 'Retry' ? (
            <SectionCard title="Retry" description="Failure recovery policy">
              <div className="grid gap-3 sm:grid-cols-3">
                <StatTile label="Max attempts" value="3" />
                <StatTile label="Backoff" value="2×" meta="Exponential" />
                <StatTile label="Window" value="15m" meta="Per run" />
              </div>
              <Button type="button" size="sm" variant="outline" className="mt-4">
                <RefreshCw className="h-3.5 w-3.5" />
                Retry failed runs
              </Button>
            </SectionCard>
          ) : null}

          {panel === 'Error handling' ? (
            <SectionCard title="Error handling" description="What happens when a step fails">
              <ul className="space-y-2">
                {[
                  'On action failure → notify Owners channel',
                  'On timeout → mark run failed, keep partial logs',
                  'On validation error → skip remaining actions',
                ].map((rule) => (
                  <li
                    key={rule}
                    className="flex items-start gap-2 rounded-xl border border-border bg-background px-4 py-3 text-[13.5px]"
                  >
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                    {rule}
                  </li>
                ))}
              </ul>
            </SectionCard>
          ) : null}

          {panel === 'Templates' ? (
            <SectionCard title="Templates" description="Start from a pattern" padded={false}>
              <div className="divide-y divide-border">
                {TEMPLATES.map((item) => (
                  <ListRow
                    key={item.name}
                    title={item.name}
                    meta={item.meta}
                    onClick={() => setPanel('Builder')}
                  />
                ))}
              </div>
            </SectionCard>
          ) : null}
        </div>
      </div>
    </div>
  )
}
