import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowDownUp,
  Bot,
  Columns3,
  Filter,
  Group,
  History,
  MessageSquare,
  Plus,
  Redo2,
  Search,
  Settings2,
  Trash2,
  Undo2,
  Download,
  Upload,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SHEET_COLUMNS, SHEET_ROWS } from '@/data/sheets'
import { cn } from '@/lib/utils'

const LEFT_NAV = [
  'Fields',
  'Views',
  'Filters',
  'Sort',
  'Group',
  'Relations',
  'Automations',
  'Forms',
  'Settings',
]

const RIGHT_TABS = [
  'Properties',
  'Validation',
  'Formatting',
  'Duplicates',
  'Comments',
  'Activity',
  'Permissions',
] as const

export function SheetBuilderPage() {
  const { workspaceId = 'ws-acme', sheetId = 'sheet-customers' } = useParams()
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [leftPanel, setLeftPanel] = useState('Fields')
  const [rightTab, setRightTab] = useState<(typeof RIGHT_TABS)[number]>('Properties')
  const [viewMode, setViewMode] = useState('Table')
  const [showRight, setShowRight] = useState(true)

  const allSelected = selectedRows.length === SHEET_ROWS.length

  function toggleRow(id: string) {
    setSelectedRows((current) =>
      current.includes(id) ? current.filter((row) => row !== id) : [...current, id],
    )
  }

  function toggleAll() {
    setSelectedRows(allSelected ? [] : SHEET_ROWS.map((row) => row.id))
  }

  return (
    <div className="-mx-4 -my-6 flex h-[calc(100vh-4rem)] flex-col overflow-hidden border-t border-border bg-background sm:-mx-6 sm:-my-8">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
        <Link
          to={`/w/${workspaceId}/sheets`}
          className="text-[12.5px] font-medium text-muted-foreground hover:text-foreground"
        >
          Sheets
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="truncate text-[13.5px] font-semibold text-foreground">
          {sheetId.replace('sheet-', '').replace(/-/g, ' ')}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {['Table', 'Kanban', 'Calendar', 'Gallery', 'Timeline', 'Gantt', 'List', 'Cards', 'Map'].map(
            (mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-[11.5px] font-medium',
                  viewMode === mode
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50',
                )}
              >
                {mode}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="flex h-12 shrink-0 items-center gap-2 overflow-x-auto border-b border-border px-3">
        <Tool icon={Undo2} label="Undo" />
        <Tool icon={Redo2} label="Redo" />
        <Sep />
        <Tool icon={Filter} label="Filter" />
        <Tool icon={ArrowDownUp} label="Sort" />
        <Tool icon={Group} label="Group" />
        <Tool icon={Columns3} label="Fields" />
        <Tool icon={Search} label="Find" />
        <Sep />
        <Tool icon={Upload} label="Import" />
        <Tool icon={Download} label="Export" />
        <Tool icon={Bot} label="AI" />
        <Tool icon={History} label="History" />
        <Tool icon={MessageSquare} label="Comments" />
        <div className="ml-auto flex items-center gap-2">
          {selectedRows.length > 0 ? (
            <span className="text-[12px] text-muted-foreground">{selectedRows.length} selected</span>
          ) : null}
          <Button type="button" size="sm" variant="outline">
            Bulk actions
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowRight((c) => !c)}
          >
            <Settings2 className="h-3.5 w-3.5" />
            Properties
          </Button>
          <Link
            to={`/w/${workspaceId}/sheets/${sheetId}/settings`}
            className="inline-flex h-9 items-center rounded-xl border border-border px-3 text-[13px] font-medium text-foreground hover:bg-muted/50"
          >
            Sheet settings
          </Link>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-52 shrink-0 overflow-y-auto border-r border-border bg-card p-2 md:block">
          <p className="px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Sheet
          </p>
          {LEFT_NAV.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setLeftPanel(item)}
              className={cn(
                'flex w-full rounded-xl px-3 py-2 text-left text-[13px] font-medium',
                leftPanel === item
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              )}
            >
              {item}
            </button>
          ))}
          <div className="mt-4 space-y-1 border-t border-border px-2 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Field manager
            </p>
            {SHEET_COLUMNS.map((col) => (
              <div
                key={col.id}
                className="flex cursor-grab items-center justify-between rounded-lg px-2 py-1.5 text-[12.5px] text-foreground hover:bg-muted/40"
              >
                <span>{col.label}</span>
                <span className="text-muted-foreground">{col.type}</span>
              </div>
            ))}
            <button
              type="button"
              className="mt-1 flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12.5px] font-medium text-primary hover:bg-primary/10"
            >
              <Plus className="h-3.5 w-3.5" />
              Add field
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 overflow-auto">
          {viewMode === 'Table' ? (
            <table className="w-full min-w-[900px] border-collapse text-[13px]">
              <thead className="sticky top-0 z-10 bg-card">
                <tr className="border-b border-border">
                  <th className="w-10 px-3 py-2.5">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                  </th>
                  {SHEET_COLUMNS.map((col) => (
                    <th
                      key={col.id}
                      className="px-3 py-2.5 text-left text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SHEET_ROWS.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b border-border transition-colors hover:bg-muted/30',
                      selectedRows.includes(row.id) && 'bg-primary/5',
                    )}
                  >
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => toggleRow(row.id)}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <Link
                        to={`/w/${workspaceId}/sheets/${sheetId}/records/${row.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{row.email}</td>
                    <td className="px-3 py-2.5">
                      <span className="rounded-full border border-border px-2 py-0.5 text-[11.5px]">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">{row.owner}</td>
                    <td className="px-3 py-2.5">{row.value}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{row.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {SHEET_ROWS.map((row) => (
                <Link
                  key={row.id}
                  to={`/w/${workspaceId}/sheets/${sheetId}/records/${row.id}`}
                  className="rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/30"
                >
                  <p className="font-medium text-foreground">{row.name}</p>
                  <p className="mt-1 text-[12.5px] text-muted-foreground">
                    {viewMode} view · {row.status} · {row.value}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {showRight ? (
          <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-border bg-card xl:block">
            <div className="flex flex-wrap gap-1 border-b border-border p-2">
              {RIGHT_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRightTab(tab)}
                  className={cn(
                    'rounded-lg px-2 py-1 text-[11px] font-medium',
                    rightTab === tab
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted/50',
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="space-y-4 p-4">
              <RightPanelContent tab={rightTab} />
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  )
}

function Tool({ icon: Icon, label }: { icon: typeof Filter; label: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

function Sep() {
  return <span className="mx-1 h-4 w-px bg-border" />
}

function RightPanelContent({ tab }: { tab: (typeof RIGHT_TABS)[number] }) {
  if (tab === 'Properties') {
    return (
      <>
        <Field label="Field type" value="Text" />
        <Field label="Lookup / Relation" value="Accounts.name" />
        <Field label="Rollup" value="SUM(Deals.value)" />
        <Field label="Formula" value={'IF({Status}="Won", {Value}, 0)'} />
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-muted-foreground">Attachments / Images</label>
          <Input placeholder="Upload or paste URL" />
        </div>
      </>
    )
  }
  if (tab === 'Validation') {
    return (
      <ul className="space-y-2 text-[13px] text-muted-foreground">
        <li className="rounded-xl border border-border px-3 py-2">Email must be unique</li>
        <li className="rounded-xl border border-border px-3 py-2">Deal value &gt; 0</li>
        <li className="rounded-xl border border-border px-3 py-2">Status required</li>
      </ul>
    )
  }
  if (tab === 'Formatting') {
    return (
      <ul className="space-y-2 text-[13px] text-muted-foreground">
        <li className="rounded-xl border border-border px-3 py-2">Won → green background</li>
        <li className="rounded-xl border border-border px-3 py-2">Value &gt; 50k → bold</li>
      </ul>
    )
  }
  if (tab === 'Duplicates') {
    return (
      <div className="space-y-3 text-[13px]">
        <p className="text-muted-foreground">2 possible duplicate clusters detected.</p>
        <Button type="button" size="sm" variant="outline" className="w-full">
          Review duplicates
        </Button>
      </div>
    )
  }
  if (tab === 'Comments') {
    return (
      <div className="space-y-3 text-[13px]">
        <p className="rounded-xl border border-border px-3 py-2 text-muted-foreground">
          Alex: Can we confirm Contoso ownership?
        </p>
        <Input placeholder="Add a comment…" />
      </div>
    )
  }
  if (tab === 'Activity') {
    return (
      <ul className="space-y-2 text-[12.5px] text-muted-foreground">
        <li>Jordan updated Status · 12m ago</li>
        <li>Import completed · 2h ago</li>
        <li>View “Open deals” saved · Yesterday</li>
      </ul>
    )
  }
  return (
    <ul className="space-y-2 text-[13px] text-muted-foreground">
      <li className="rounded-xl border border-border px-3 py-2">Editors can edit all rows</li>
      <li className="rounded-xl border border-border px-3 py-2">Viewers: read-only</li>
      <Button type="button" size="sm" variant="outline" className="w-full">
        <Trash2 className="h-3.5 w-3.5" />
        Manage access
      </Button>
    </ul>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-medium text-muted-foreground">{label}</label>
      <Input defaultValue={value} readOnly />
    </div>
  )
}
