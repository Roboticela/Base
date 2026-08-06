import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  ArrowDownUp,
  CalendarDays,
  Columns3,
  Filter,
  GanttChart,
  Group,
  Kanban,
  LayoutGrid,
  List,
  MapPin,
  Save,
  Table2,
  Timeline,
} from 'lucide-react'

import { EmptyState } from '@/components/app/EmptyState'
import { ListRow } from '@/components/app/ListRow'
import { PageHeader } from '@/components/app/PageHeader'
import { SectionCard } from '@/components/app/SectionCard'
import { SegmentedTabs } from '@/components/app/SegmentedTabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const VIEW_TYPES = [
  'Table',
  'Kanban',
  'Calendar',
  'Gallery',
  'Timeline',
  'Gantt',
  'List',
  'Cards',
  'Map',
] as const

type ViewType = (typeof VIEW_TYPES)[number]

const VIEW_ICONS: Record<ViewType, typeof Table2> = {
  Table: Table2,
  Kanban: Kanban,
  Calendar: CalendarDays,
  Gallery: LayoutGrid,
  Timeline: Timeline,
  Gantt: GanttChart,
  List: List,
  Cards: Columns3,
  Map: MapPin,
}

const SAMPLE_ROWS = [
  { id: '1', name: 'Contoso Ltd', status: 'Active', owner: 'Jordan', value: '$42k' },
  { id: '2', name: 'Fabrikam Inc', status: 'Lead', owner: 'Alex', value: '$18k' },
  { id: '3', name: 'Northwind', status: 'Negotiation', owner: 'Sam', value: '$95k' },
  { id: '4', name: 'Adventure Works', status: 'Won', owner: 'Jordan', value: '$120k' },
]

const SAVED_VIEWS = [
  { name: 'Open pipeline', meta: 'Kanban · Status · Owner' },
  { name: 'This week closes', meta: 'Calendar · Close date' },
  { name: 'Gallery — logos', meta: 'Gallery · Industry' },
]

const DEFAULT_SETTINGS: Record<
  ViewType,
  { filter: string; sort: string; group: string; denseness: string }
> = {
  Table: { filter: 'Status ≠ Archived', sort: 'Updated desc', group: 'None', denseness: 'Comfortable' },
  Kanban: { filter: 'Status in Active, Lead, Negotiation', sort: 'Value desc', group: 'Status', denseness: 'Compact' },
  Calendar: { filter: 'Close date is set', sort: 'Close date asc', group: 'Owner', denseness: 'Month' },
  Gallery: { filter: 'Has logo', sort: 'Name asc', group: 'Industry', denseness: 'Large' },
  Timeline: { filter: 'Created this year', sort: 'Created asc', group: 'Owner', denseness: 'Week' },
  Gantt: { filter: 'Has start/end', sort: 'Start asc', group: 'Project', denseness: 'Day' },
  List: { filter: 'Assigned to me', sort: 'Priority desc', group: 'None', denseness: 'Compact' },
  Cards: { filter: 'Favorite = true', sort: 'Updated desc', group: 'Folder', denseness: 'Medium' },
  Map: { filter: 'Has location', sort: 'Distance', group: 'Region', denseness: 'Cluster' },
}

export function ViewsPage() {
  const { workspaceId = 'ws-acme', sheetId = 'sheet-customers' } = useParams()
  const [mode, setMode] = useState<ViewType>('Table')
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const current = settings[mode]
  const Icon = VIEW_ICONS[mode]

  function patch(key: keyof typeof current, value: string) {
    setSettings((prev) => ({
      ...prev,
      [mode]: { ...prev[mode], [key]: value },
    }))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Views"
        title="Sheet views"
        description={`Configure how ${sheetId.replace('sheet-', '').replace(/-/g, ' ')} is displayed in workspace ${workspaceId}.`}
        actions={
          <>
            <Button type="button" variant="outline" size="sm">
              <Save className="h-3.5 w-3.5" />
              Save view
            </Button>
            <Button type="button" variant="accent" size="sm">
              New view
            </Button>
          </>
        }
      />

      <SegmentedTabs
        value={mode}
        onChange={setMode}
        tabs={VIEW_TYPES.map((id) => ({ id, label: id }))}
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-6">
          <SectionCard title={`${mode} controls`} description="Independent per view type">
            <div className="space-y-3">
              <Control
                icon={Filter}
                label="Filter"
                value={current.filter}
                onChange={(v) => patch('filter', v)}
              />
              <Control
                icon={ArrowDownUp}
                label="Sort"
                value={current.sort}
                onChange={(v) => patch('sort', v)}
              />
              <Control
                icon={Group}
                label="Group"
                value={current.group}
                onChange={(v) => patch('group', v)}
              />
              <Control
                icon={Icon}
                label="Display"
                value={current.denseness}
                onChange={(v) => patch('denseness', v)}
              />
            </div>
          </SectionCard>

          <SectionCard title="Saved settings" description="Mock presets for this mode" padded={false}>
            <div className="divide-y divide-border">
              {SAVED_VIEWS.map((item) => (
                <ListRow
                  key={item.name}
                  title={item.name}
                  meta={item.meta}
                  onClick={() => {
                    const match = VIEW_TYPES.find((t) => item.meta.startsWith(t))
                    if (match) setMode(match)
                  }}
                />
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title={`${mode} preview`}
          description={`${current.filter} · ${current.sort} · Group: ${current.group}`}
        >
          <ViewPreview mode={mode} />
        </SectionCard>
      </div>
    </div>
  )
}

function Control({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: typeof Filter
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label className="inline-flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        {label}
      </Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function ViewPreview({ mode }: { mode: ViewType }) {
  if (mode === 'Table') {
    return (
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[520px] text-[13px]">
          <thead className="bg-background">
            <tr className="border-b border-border text-left text-[12px] uppercase tracking-[0.06em] text-muted-foreground">
              <th className="px-3 py-2.5">Name</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Owner</th>
              <th className="px-3 py-2.5">Value</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_ROWS.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2.5 font-medium">{row.name}</td>
                <td className="px-3 py-2.5">{row.status}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{row.owner}</td>
                <td className="px-3 py-2.5">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (mode === 'Kanban') {
    const columns = ['Lead', 'Active', 'Negotiation', 'Won']
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => (
          <div key={col} className="rounded-xl border border-border bg-background p-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {col}
            </p>
            <div className="mt-2 space-y-2">
              {SAMPLE_ROWS.filter((r) => r.status === col).map((row) => (
                <div
                  key={row.id}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-[13px]"
                >
                  <p className="font-medium">{row.name}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {row.owner} · {row.value}
                  </p>
                </div>
              ))}
              {!SAMPLE_ROWS.some((r) => r.status === col) ? (
                <p className="text-[12px] text-muted-foreground">Empty</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (mode === 'Calendar') {
    return (
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 28 }, (_, i) => {
          const day = i + 1
          const hit = SAMPLE_ROWS[day % SAMPLE_ROWS.length]
          return (
            <div
              key={day}
              className={cn(
                'min-h-16 rounded-xl border border-border bg-background p-2 text-[11.5px]',
                day % 7 === 3 && 'border-primary/40 bg-primary/5',
              )}
            >
              <p className="font-medium text-muted-foreground">{day}</p>
              {day % 7 === 3 ? (
                <p className="mt-1 truncate text-foreground">{hit.name}</p>
              ) : null}
            </div>
          )
        })}
      </div>
    )
  }

  if (mode === 'Gallery' || mode === 'Cards') {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {SAMPLE_ROWS.map((row) => (
          <div key={row.id} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex h-20 items-center justify-center rounded-xl border border-border text-[13px] font-semibold text-primary">
              {row.name.slice(0, 2).toUpperCase()}
            </div>
            <p className="mt-3 text-[14px] font-medium">{row.name}</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              {row.status} · {row.value}
            </p>
          </div>
        ))}
      </div>
    )
  }

  if (mode === 'Timeline' || mode === 'Gantt') {
    return (
      <div className="space-y-3">
        {SAMPLE_ROWS.map((row, idx) => (
          <div key={row.id} className="flex items-center gap-3">
            <p className="w-28 shrink-0 truncate text-[12.5px] font-medium">{row.name}</p>
            <div className="relative h-8 flex-1 rounded-full border border-border bg-background">
              <div
                className="absolute top-1 bottom-1 rounded-full bg-primary/20"
                style={{ left: `${8 + idx * 12}%`, width: `${28 + idx * 8}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (mode === 'List') {
    return (
      <div className="divide-y divide-border rounded-xl border border-border">
        {SAMPLE_ROWS.map((row) => (
          <ListRow
            key={row.id}
            title={row.name}
            meta={`${row.status} · ${row.owner} · ${row.value}`}
          />
        ))}
      </div>
    )
  }

  if (mode === 'Map') {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-border bg-background">
        <EmptyState
          icon={<MapPin className="h-5 w-5" />}
          title="Map preview"
          description="Pins for Contoso (WA), Fabrikam (TX), Northwind (NY), Adventure Works (CA)."
        />
        <div className="mb-6 flex flex-wrap justify-center gap-2 px-4">
          {['WA', 'TX', 'NY', 'CA'].map((region) => (
            <span
              key={region}
              className="rounded-full border border-border px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground"
            >
              {region}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return null
}
