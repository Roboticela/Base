import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  Braces,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  Clock,
  Copy,
  GitBranch,
  History,
  LayoutTemplate,
  Pause,
  Play,
  Plus,
  Redo2,
  Repeat,
  Save,
  Settings,
  Share2,
  Sparkles,
  Trash2,
  Undo2,
  Variable,
  Workflow,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ACTION_LIBRARY,
  AUTOMATIONS,
  AUTOMATION_TEMPLATES,
  DEFAULT_WORKFLOW,
  EXECUTION_LOGS,
  TRIGGER_LIBRARY,
  type AutomationStatus,
  type WorkflowBlock,
} from '@/data/automations'
import { cn } from '@/lib/utils'

type LibraryTab = 'triggers' | 'actions' | 'flow' | 'variables' | 'templates'
type BottomTab = 'testing' | 'logs' | 'versions'
type DelayUnit = 'minutes' | 'hours' | 'days' | 'until'
type ErrorMode = 'retry' | 'continue' | 'stop' | 'alert'
type CondOp = 'IF' | 'ELSE IF' | 'AND' | 'OR'

type CondRow = { id: string; op: CondOp; field: string; comparator: string; value: string }
type VersionItem = { id: string; label: string; when: string; author: string }

const BLOCK_W = 200
const BLOCK_H = 72
const SNAP = 20

const VARIABLE_GROUPS = [
  { group: 'Record Fields', items: ['Name', 'Email', 'Status', 'Owner', 'Created At'] },
  { group: 'User', items: ['Current User', 'Assignee', 'Workspace Admin'] },
  { group: 'AI Outputs', items: ['Summary', 'Category', 'Score', 'Generated Text'] },
  { group: 'Previous Action', items: ['Result', 'Status Code', 'Message Id', 'Duration'] },
]

const FLOW_ITEMS: { kind: WorkflowBlock['kind']; title: string; detail: string }[] = [
  { kind: 'condition', title: 'Condition', detail: 'IF / ELSE IF / AND / OR' },
  { kind: 'delay', title: 'Delay', detail: 'Wait minutes, hours, or until date' },
  { kind: 'loop', title: 'Loop', detail: 'Iterate records, lists, or API pages' },
  { kind: 'branch', title: 'Branch', detail: 'Split into parallel paths' },
]

const VERSIONS: VersionItem[] = [
  { id: 'v3', label: 'v3 — Current', when: '1h ago', author: 'You' },
  { id: 'v2', label: 'v2 — Added Slack notify', when: 'Yesterday', author: 'You' },
  { id: 'v1', label: 'v1 — Initial draft', when: '3d ago', author: 'Alex Rivera' },
]

const STATUS_CYCLE: AutomationStatus[] = ['Active', 'Paused', 'Draft']

function kindStyles(kind: WorkflowBlock['kind']) {
  if (kind === 'trigger') return 'border-primary bg-primary/10'
  if (kind === 'condition') return 'border-amber-500/50 bg-amber-500/10'
  if (kind === 'action') return 'border-emerald-500/50 bg-emerald-500/10'
  if (kind === 'delay') return 'border-sky-500/50 bg-sky-500/10'
  if (kind === 'loop') return 'border-violet-500/50 bg-violet-500/10'
  return 'border-border bg-muted/40'
}

function kindIcon(kind: WorkflowBlock['kind']) {
  if (kind === 'trigger') return Zap
  if (kind === 'condition') return GitBranch
  if (kind === 'action') return Workflow
  if (kind === 'delay') return Clock
  if (kind === 'loop') return Repeat
  return GitBranch
}

function snap(n: number) {
  return Math.round(n / SNAP) * SNAP
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

function cloneBlocks(blocks: WorkflowBlock[]) {
  return blocks.map((b) => ({ ...b }))
}

export function AutomationBuilderPage() {
  const { workspaceId = 'ws-acme', automationId } = useParams()

  const automation = AUTOMATIONS.find((a) => a.id === automationId) ?? AUTOMATIONS[0]

  const [name, setName] = useState(automation.name)
  const [status, setStatus] = useState<AutomationStatus>(
    automation.status === 'Disabled' ? 'Paused' : automation.status,
  )
  const [blocks, setBlocks] = useState<WorkflowBlock[]>(() => cloneBlocks(DEFAULT_WORKFLOW))
  const [history, setHistory] = useState<WorkflowBlock[][]>([cloneBlocks(DEFAULT_WORKFLOW)])
  const [historyIndex, setHistoryIndex] = useState(0)

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [clipboard, setClipboard] = useState<WorkflowBlock[]>([])

  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [bottomOpen, setBottomOpen] = useState(true)
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('triggers')
  const [bottomTab, setBottomTab] = useState<BottomTab>('testing')

  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [aiPrompt, setAiPrompt] = useState(
    'When a new lead is created, wait 2 days, email if no reply, then notify owner.',
  )
  const [aiMessage, setAiMessage] = useState('')
  const [logFilter, setLogFilter] = useState<'All' | 'Success' | 'Failed'>('All')
  const [testNote, setTestNote] = useState('')

  // Config panel state
  const [condRows, setCondRows] = useState<CondRow[]>([
    { id: 'c1', op: 'IF', field: 'Email Replied', comparator: 'is false', value: '' },
  ])
  const [delayAmount, setDelayAmount] = useState('2')
  const [delayUnit, setDelayUnit] = useState<DelayUnit>('days')
  const [loopSource, setLoopSource] = useState<'records' | 'lists' | 'api'>('records')
  const [errorMode, setErrorMode] = useState<ErrorMode>('retry')
  const [canEdit, setCanEdit] = useState('Editors')
  const [canRun, setCanRun] = useState('Anyone with access')
  const [pickedVars, setPickedVars] = useState<string[]>([])
  const [compareVersion, setCompareVersion] = useState<string | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    mode: 'block' | 'pan' | null
    ids: string[]
    startX: number
    startY: number
    origin: Record<string, { x: number; y: number }>
    panOrigin: { x: number; y: number }
  }>({ mode: null, ids: [], startX: 0, startY: 0, origin: {}, panOrigin: { x: 0, y: 0 } })

  const selectedBlock = useMemo(
    () => (selectedIds.length === 1 ? blocks.find((b) => b.id === selectedIds[0]) ?? null : null),
    [blocks, selectedIds],
  )

  const filteredLogs = useMemo(() => {
    if (logFilter === 'All') return EXECUTION_LOGS
    return EXECUTION_LOGS.filter((l) => l.status === logFilter)
  }, [logFilter])

  function pushHistory(next: WorkflowBlock[]) {
    const trimmed = history.slice(0, historyIndex + 1)
    const updated = [...trimmed, cloneBlocks(next)]
    setHistory(updated)
    setHistoryIndex(updated.length - 1)
    setBlocks(next)
  }

  function undo() {
    if (historyIndex <= 0) return
    const i = historyIndex - 1
    setHistoryIndex(i)
    setBlocks(cloneBlocks(history[i]))
  }

  function redo() {
    if (historyIndex >= history.length - 1) return
    const i = historyIndex + 1
    setHistoryIndex(i)
    setBlocks(cloneBlocks(history[i]))
  }

  function addBlock(partial: Omit<WorkflowBlock, 'id' | 'x' | 'y'> & Partial<Pick<WorkflowBlock, 'x' | 'y'>>) {
    const offset = blocks.length * 24
    const next: WorkflowBlock = {
      id: uid('b'),
      x: partial.x ?? 80 + offset,
      y: partial.y ?? 80 + offset,
      kind: partial.kind,
      title: partial.title,
      detail: partial.detail,
    }
    pushHistory([...blocks, next])
    setSelectedIds([next.id])
    setRightOpen(true)
  }

  function deleteSelected() {
    if (selectedIds.length === 0) return
    pushHistory(blocks.filter((b) => !selectedIds.includes(b.id)))
    setSelectedIds([])
  }

  function copySelected() {
    const copies = blocks.filter((b) => selectedIds.includes(b.id)).map((b) => ({ ...b }))
    setClipboard(copies)
  }

  function pasteClipboard() {
    if (clipboard.length === 0) return
    const pasted = clipboard.map((b) => ({
      ...b,
      id: uid('b'),
      x: b.x + 40,
      y: b.y + 40,
    }))
    pushHistory([...blocks, ...pasted])
    setSelectedIds(pasted.map((b) => b.id))
  }

  function updateBlock(id: string, patch: Partial<WorkflowBlock>) {
    pushHistory(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  function cycleStatus() {
    const idx = STATUS_CYCLE.indexOf(status === 'Disabled' ? 'Paused' : status)
    setStatus(STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length])
  }

  function runAiRegen() {
    const prompt = aiPrompt.trim()
    if (!prompt) return
    const generated: WorkflowBlock[] = [
      { id: uid('b'), kind: 'trigger', title: 'Record Created', detail: 'From AI prompt', x: 80, y: 120 },
      { id: uid('b'), kind: 'delay', title: 'Wait 2 days', detail: 'Inferred delay', x: 320, y: 120 },
      { id: uid('b'), kind: 'condition', title: 'No reply', detail: 'IF Email Replied is false', x: 560, y: 120 },
      { id: uid('b'), kind: 'action', title: 'Send follow-up email', detail: 'AI template', x: 800, y: 40 },
      { id: uid('b'), kind: 'action', title: 'Notify owner', detail: 'Slack + in-app', x: 1040, y: 40 },
    ]
    pushHistory(generated)
    setSelectedIds([])
    setAiMessage(`Regenerated ${generated.length} blocks from prompt.`)
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        deleteSelected()
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        copySelected()
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        pasteClipboard()
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, blocks, clipboard, history, historyIndex])

  function onCanvasPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return
    const target = e.target as HTMLElement
    if (target.closest('[data-block-id]')) return
    setSelectedIds([])
    dragRef.current = {
      mode: 'pan',
      ids: [],
      startX: e.clientX,
      startY: e.clientY,
      origin: {},
      panOrigin: { ...pan },
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onBlockPointerDown(e: ReactPointerEvent<HTMLDivElement>, id: string) {
    e.stopPropagation()
    e.preventDefault()
    const multi = e.shiftKey || e.metaKey || e.ctrlKey
    let nextSelected = selectedIds
    if (multi) {
      nextSelected = selectedIds.includes(id)
        ? selectedIds.filter((s) => s !== id)
        : [...selectedIds, id]
    } else if (!selectedIds.includes(id)) {
      nextSelected = [id]
    }
    setSelectedIds(nextSelected)
    const ids = nextSelected.includes(id) ? nextSelected : [id]
    const origin: Record<string, { x: number; y: number }> = {}
    for (const bid of ids) {
      const b = blocks.find((x) => x.id === bid)
      if (b) origin[bid] = { x: b.x, y: b.y }
    }
    dragRef.current = {
      mode: 'block',
      ids,
      startX: e.clientX,
      startY: e.clientY,
      origin,
      panOrigin: { ...pan },
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = dragRef.current
    if (!d.mode) return
    const dx = (e.clientX - d.startX) / zoom
    const dy = (e.clientY - d.startY) / zoom
    if (d.mode === 'pan') {
      setPan({ x: d.panOrigin.x + (e.clientX - d.startX), y: d.panOrigin.y + (e.clientY - d.startY) })
      return
    }
    setBlocks((prev) =>
      prev.map((b) => {
        if (!d.ids.includes(b.id) || !d.origin[b.id]) return b
        return {
          ...b,
          x: snap(d.origin[b.id].x + dx),
          y: snap(d.origin[b.id].y + dy),
        }
      }),
    )
  }

  function onPointerUp() {
    const d = dragRef.current
    if (d.mode === 'block') {
      pushHistory(blocks)
    }
    dragRef.current = { mode: null, ids: [], startX: 0, startY: 0, origin: {}, panOrigin: { x: 0, y: 0 } }
  }

  const connections = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; key: string }[] = []
    for (let i = 0; i < blocks.length - 1; i++) {
      const a = blocks[i]
      const b = blocks[i + 1]
      lines.push({
        key: `${a.id}-${b.id}`,
        x1: a.x + BLOCK_W,
        y1: a.y + BLOCK_H / 2,
        x2: b.x,
        y2: b.y + BLOCK_H / 2,
      })
    }
    return lines
  }, [blocks])

  const minimapScale = 0.08

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3">
        <Link
          to={`/w/${workspaceId}/automations`}
          className="inline-flex h-9 items-center gap-2 rounded-xl px-4 text-[13px] font-medium text-foreground hover:bg-muted/60"
        >
          <ChevronsLeft className="size-4" />
          Automations
        </Link>
        <div className="mx-1 h-5 w-px bg-border" />
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-9 max-w-[260px] border-transparent bg-transparent px-2 text-[15px] font-semibold hover:border-border focus-visible:border-border"
          aria-label="Automation name"
        />
        <button
          type="button"
          onClick={cycleStatus}
          className={cn(
            'inline-flex h-8 items-center rounded-xl border border-border px-2.5 text-[12px] font-medium',
            status === 'Active' && 'bg-emerald-500/10 text-emerald-600',
            status === 'Paused' && 'bg-amber-500/10 text-amber-700',
            status === 'Draft' && 'bg-muted text-muted-foreground',
          )}
        >
          {status === 'Active' ? <Play className="mr-1 size-3.5" /> : null}
          {status === 'Paused' ? <Pause className="mr-1 size-3.5" /> : null}
          {status}
        </button>
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={undo} disabled={historyIndex <= 0} title="Undo">
            <Undo2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
          >
            <Redo2 className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setTestNote('Test run queued (mock).')}>
            <Play className="size-3.5" />
            Test
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAiMessage('Saved (mock).')}>
            <Save className="size-3.5" />
            Save
          </Button>
          <Button variant="ghost" size="icon" title="Share" onClick={() => setAiMessage('Share link copied (mock).')}>
            <Share2 className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Settings" onClick={() => setRightOpen(true)}>
            <Settings className="size-4" />
          </Button>
        </div>
      </header>

      {/* AI strip */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-3 py-2">
        <Sparkles className="size-4 shrink-0 text-primary" />
        <Input
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Describe the workflow in natural language…"
          className="h-9 flex-1 rounded-xl"
        />
        <Button variant="accent" size="sm" onClick={runAiRegen}>
          Regenerate
        </Button>
        {aiMessage ? <span className="max-w-[220px] truncate text-[12px] text-muted-foreground">{aiMessage}</span> : null}
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside
          className={cn(
            'flex shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200',
            leftOpen ? 'w-[260px]' : 'w-10',
          )}
        >
          <div className="flex h-10 items-center justify-between border-b border-border px-2">
            {leftOpen ? <span className="px-1 text-[12px] font-medium text-muted-foreground">Libraries</span> : null}
            <Button variant="ghost" size="icon" className="size-8" onClick={() => setLeftOpen((v) => !v)}>
              {leftOpen ? <ChevronsLeft className="size-4" /> : <ChevronsRight className="size-4" />}
            </Button>
          </div>
          {leftOpen ? (
            <>
              <div className="flex flex-wrap gap-1 border-b border-border p-2">
                {(
                  [
                    ['triggers', 'Triggers'],
                    ['actions', 'Actions'],
                    ['flow', 'Conditions'],
                    ['variables', 'Variables'],
                    ['templates', 'Templates'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setLibraryTab(key)}
                    className={cn(
                      'rounded-xl border px-2 py-1 text-[11px]',
                      libraryTab === key
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border text-muted-foreground hover:bg-muted/60',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {libraryTab === 'triggers'
                  ? TRIGGER_LIBRARY.map((g) => (
                      <div key={g.group} className="mb-3">
                        <p className="mb-1 px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          {g.group}
                        </p>
                        <ul className="space-y-1">
                          {g.items.map((item) => (
                            <li key={item}>
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 rounded-xl border border-transparent px-2 py-1.5 text-left text-[13px] hover:border-border hover:bg-muted/60"
                                onClick={() =>
                                  addBlock({ kind: 'trigger', title: item, detail: g.group })
                                }
                              >
                                <Zap className="size-3.5 shrink-0 text-primary" />
                                {item}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  : null}

                {libraryTab === 'actions'
                  ? ACTION_LIBRARY.map((g) => (
                      <div key={g.group} className="mb-3">
                        <p className="mb-1 px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          {g.group}
                        </p>
                        <ul className="space-y-1">
                          {g.items.map((item) => (
                            <li key={item}>
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 rounded-xl border border-transparent px-2 py-1.5 text-left text-[13px] hover:border-border hover:bg-muted/60"
                                onClick={() =>
                                  addBlock({ kind: 'action', title: item, detail: g.group })
                                }
                              >
                                <Workflow className="size-3.5 shrink-0 text-emerald-600" />
                                {item}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  : null}

                {libraryTab === 'flow' ? (
                  <ul className="space-y-1">
                    {FLOW_ITEMS.map((item) => (
                      <li key={item.title}>
                        <button
                          type="button"
                          className="flex w-full flex-col gap-0.5 rounded-xl border border-border bg-background px-2.5 py-2 text-left hover:bg-muted/60"
                          onClick={() =>
                            addBlock({ kind: item.kind, title: item.title, detail: item.detail })
                          }
                        >
                          <span className="text-[13px] font-medium">{item.title}</span>
                          <span className="text-[11px] text-muted-foreground">{item.detail}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {libraryTab === 'variables' ? (
                  <div className="space-y-3">
                    {VARIABLE_GROUPS.map((g) => (
                      <div key={g.group}>
                        <p className="mb-1 flex items-center gap-1 px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          <Variable className="size-3" />
                          {g.group}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {g.items.map((item) => (
                            <button
                              key={item}
                              type="button"
                              className="rounded-xl border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground hover:border-primary hover:text-foreground"
                              onClick={() =>
                                setPickedVars((prev) =>
                                  prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item],
                                )
                              }
                            >
                              {`{{${item}}}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {pickedVars.length > 0 ? (
                      <p className="text-[11px] text-muted-foreground">
                        Picked: {pickedVars.join(', ')}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {libraryTab === 'templates' ? (
                  <ul className="space-y-1.5">
                    {AUTOMATION_TEMPLATES.map((t) => (
                      <li key={t.id}>
                        <button
                          type="button"
                          className="flex w-full items-start gap-2 rounded-xl border border-border bg-background px-2.5 py-2 text-left hover:bg-muted/60"
                          onClick={() => {
                            pushHistory(cloneBlocks(DEFAULT_WORKFLOW))
                            setName(t.name)
                            setAiMessage(`Loaded template: ${t.name}`)
                          }}
                        >
                          <LayoutTemplate className="mt-0.5 size-3.5 shrink-0 text-primary" />
                          <span>
                            <span className="block text-[13px] font-medium">{t.name}</span>
                            <span className="text-[11px] text-muted-foreground">
                              {t.category} · {t.blocks} blocks
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </>
          ) : null}
        </aside>

        {/* Center column */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div
            ref={canvasRef}
            className="relative flex-1 overflow-hidden border-b border-border bg-background"
            onPointerDown={onCanvasPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {/* Grid — dotted with border-color only */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='1' cy='1' r='1' fill='%2394a3b8' fill-opacity='0.45'/%3E%3C/svg%3E\")",
                backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                backgroundPosition: `${pan.x}px ${pan.y}px`,
              }}
            />

            {/* Zoom controls */}
            <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-xl border border-border bg-card p-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setZoom((z) => Math.min(1.6, Number((z + 0.1).toFixed(2))))}
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
              >
                <ZoomOut className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-[12px]" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}>
                {Math.round(zoom * 100)}%
              </Button>
            </div>

            {/* Selection toolbar */}
            {selectedIds.length > 0 ? (
              <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-xl border border-border bg-card p-1">
                <span className="px-2 text-[11px] text-muted-foreground">{selectedIds.length} selected</span>
                <Button variant="ghost" size="icon" className="size-8" onClick={copySelected} title="Copy">
                  <Copy className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="size-8" onClick={pasteClipboard} title="Paste">
                  <Plus className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="size-8" onClick={deleteSelected} title="Delete">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ) : null}

            <p className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-xl border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground">
              Snap to {SNAP}px grid · Shift-click multi-select · Delete to remove
            </p>

            {/* World */}
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                width: 2000,
                height: 1200,
              }}
            >
              <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden>
                {connections.map((c) => (
                  <line
                    key={c.key}
                    x1={c.x1}
                    y1={c.y1}
                    x2={c.x2}
                    y2={c.y2}
                    stroke="var(--border)"
                    strokeWidth={2}
                  />
                ))}
              </svg>

              {blocks.map((block) => {
                const Icon = kindIcon(block.kind)
                const selected = selectedIds.includes(block.id)
                return (
                  <div
                    key={block.id}
                    data-block-id={block.id}
                    onPointerDown={(e) => onBlockPointerDown(e, block.id)}
                    className={cn(
                      'absolute cursor-grab select-none rounded-2xl border-2 bg-card active:cursor-grabbing',
                      kindStyles(block.kind),
                      selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                    )}
                    style={{ left: block.x, top: block.y, width: BLOCK_W, height: BLOCK_H }}
                  >
                    <div className="flex h-full flex-col justify-center gap-0.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <Icon className="size-3.5 shrink-0" />
                        <span className="truncate text-[13px] font-semibold">{block.title}</span>
                      </div>
                      <span className="truncate text-[11px] text-muted-foreground">{block.detail}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Minimap */}
            <div className="absolute bottom-3 right-3 z-10 h-[100px] w-[160px] overflow-hidden rounded-xl border border-border bg-card">
              <div className="relative size-full p-1">
                {blocks.map((b) => (
                  <div
                    key={`mm-${b.id}`}
                    className={cn('absolute rounded-sm border', kindStyles(b.kind))}
                    style={{
                      left: b.x * minimapScale,
                      top: b.y * minimapScale,
                      width: BLOCK_W * minimapScale,
                      height: BLOCK_H * minimapScale,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom execution panel */}
          <div
            className={cn(
              'flex shrink-0 flex-col border-t border-border bg-card transition-[height] duration-200',
              bottomOpen ? 'h-[200px]' : 'h-10',
            )}
          >
            <div className="flex h-10 items-center gap-2 border-b border-border px-2">
              <Button variant="ghost" size="icon" className="size-8" onClick={() => setBottomOpen((v) => !v)}>
                <ChevronsUpDown className="size-4" />
              </Button>
              {(['testing', 'logs', 'versions'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setBottomTab(tab)
                    setBottomOpen(true)
                  }}
                  className={cn(
                    'rounded-xl px-2.5 py-1 text-[12px] capitalize',
                    bottomTab === tab ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-muted/60',
                  )}
                >
                  {tab}
                </button>
              ))}
              {testNote ? <span className="ml-auto truncate text-[11px] text-muted-foreground">{testNote}</span> : null}
            </div>
            {bottomOpen ? (
              <div className="min-h-0 flex-1 overflow-auto p-3">
                {bottomTab === 'testing' ? (
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="space-y-2">
                      <Label>Manual run</Label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="accent"
                          onClick={() => setTestNote('Manual run started (mock).')}
                        >
                          <Play className="size-3.5" />
                          Run manually
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setTestNote('Trigger simulated (mock).')}
                        >
                          <Zap className="size-3.5" />
                          Simulate trigger
                        </Button>
                      </div>
                    </div>
                    <div className="min-w-[240px] flex-1 space-y-2">
                      <Label>Inspect variables</Label>
                      <div className="rounded-xl border border-border bg-background p-2 text-[12px] text-muted-foreground">
                        <p>{`{{Record.Email}} = lead@example.com`}</p>
                        <p>{`{{User.Name}} = You`}</p>
                        <p>{`{{Previous.Status}} = pending`}</p>
                        {pickedVars.map((v) => (
                          <p key={v}>{`{{${v}}} = mock_value`}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {bottomTab === 'logs' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-muted-foreground">Status</Label>
                      {(['All', 'Success', 'Failed'] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setLogFilter(f)}
                          className={cn(
                            'rounded-xl border px-2 py-0.5 text-[11px]',
                            logFilter === f
                              ? 'border-primary bg-primary/10'
                              : 'border-border text-muted-foreground',
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <table className="w-full text-left text-[12px]">
                      <thead className="text-muted-foreground">
                        <tr className="border-b border-border">
                          <th className="py-1.5 font-medium">Start</th>
                          <th className="py-1.5 font-medium">End</th>
                          <th className="py-1.5 font-medium">Duration</th>
                          <th className="py-1.5 font-medium">Status</th>
                          <th className="py-1.5 font-medium">Trigger</th>
                          <th className="py-1.5 font-medium">Actions</th>
                          <th className="py-1.5 font-medium">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLogs.map((log) => (
                          <tr key={log.id} className="border-b border-border/60">
                            <td className="py-1.5">{log.start}</td>
                            <td className="py-1.5">{log.end}</td>
                            <td className="py-1.5">{log.duration}</td>
                            <td className="py-1.5">
                              <span
                                className={cn(
                                  'rounded-xl px-1.5 py-0.5 text-[11px]',
                                  log.status === 'Success'
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : 'bg-destructive/10 text-destructive',
                                )}
                              >
                                {log.status}
                              </span>
                            </td>
                            <td className="py-1.5">{log.trigger}</td>
                            <td className="py-1.5">{log.actions}</td>
                            <td className="py-1.5 text-muted-foreground">{log.error || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                {bottomTab === 'versions' ? (
                  <ul className="space-y-1.5">
                    {VERSIONS.map((v) => (
                      <li
                        key={v.id}
                        className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-background px-3 py-2"
                      >
                        <History className="size-3.5 text-muted-foreground" />
                        <span className="text-[13px] font-medium">{v.label}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {v.when} · {v.author}
                        </span>
                        <div className="ml-auto flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7"
                            onClick={() => {
                              pushHistory(cloneBlocks(DEFAULT_WORKFLOW))
                              setAiMessage(`Restored ${v.label}`)
                            }}
                          >
                            Restore
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7"
                            onClick={() =>
                              setCompareVersion(compareVersion === v.id ? null : v.id)
                            }
                          >
                            Compare
                          </Button>
                        </div>
                        {compareVersion === v.id ? (
                          <p className="w-full text-[11px] text-muted-foreground">
                            Diff vs current: +1 delay block, action title rename (mock).
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right config panel */}
        <aside
          className={cn(
            'flex shrink-0 flex-col border-l border-border bg-card transition-[width] duration-200',
            rightOpen ? 'w-[300px]' : 'w-10',
          )}
        >
          <div className="flex h-10 items-center justify-between border-b border-border px-2">
            <Button variant="ghost" size="icon" className="size-8" onClick={() => setRightOpen((v) => !v)}>
              {rightOpen ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
            </Button>
            {rightOpen ? <span className="px-1 text-[12px] font-medium text-muted-foreground">Config</span> : null}
          </div>

          {rightOpen ? (
            <div className="flex-1 space-y-4 overflow-y-auto p-3">
              {!selectedBlock ? (
                <div className="space-y-3">
                  <p className="text-[13px] text-muted-foreground">
                    Select a block to configure it, or edit workflow settings below.
                  </p>
                  <section className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5" />
                      Error handling
                    </Label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(
                        [
                          ['retry', 'Retry'],
                          ['continue', 'Continue'],
                          ['stop', 'Stop'],
                          ['alert', 'Alert'],
                        ] as const
                      ).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setErrorMode(key)}
                          className={cn(
                            'rounded-xl border px-2 py-1.5 text-[12px]',
                            errorMode === key
                              ? 'border-primary bg-primary/10'
                              : 'border-border text-muted-foreground',
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </section>
                  <section className="space-y-2">
                    <Label>Permissions</Label>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground">Who can edit</Label>
                      <select
                        className="h-9 w-full rounded-xl border border-border bg-background px-2.5 text-[13px] outline-none"
                        value={canEdit}
                        onChange={(e) => setCanEdit(e.target.value)}
                      >
                        <option>Editors</option>
                        <option>Admins only</option>
                        <option>Owner only</option>
                      </select>
                      <Label className="text-[11px] text-muted-foreground">Who can run</Label>
                      <select
                        className="h-9 w-full rounded-xl border border-border bg-background px-2.5 text-[13px] outline-none"
                        value={canRun}
                        onChange={(e) => setCanRun(e.target.value)}
                      >
                        <option>Anyone with access</option>
                        <option>Editors</option>
                        <option>Admins only</option>
                      </select>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{selectedBlock.kind}</p>
                    <Input
                      value={selectedBlock.title}
                      onChange={(e) => updateBlock(selectedBlock.id, { title: e.target.value })}
                      className="mt-1 h-9 rounded-xl font-medium"
                    />
                    <Input
                      value={selectedBlock.detail}
                      onChange={(e) => updateBlock(selectedBlock.id, { detail: e.target.value })}
                      className="mt-1.5 h-9 rounded-xl text-[13px]"
                    />
                  </div>

                  {selectedBlock.kind === 'trigger' ? (
                    <section className="space-y-2">
                      <Label>Pick trigger</Label>
                      <div className="max-h-[280px] space-y-2 overflow-y-auto">
                        {TRIGGER_LIBRARY.map((g) => (
                          <div key={g.group}>
                            <p className="mb-1 text-[11px] text-muted-foreground">{g.group}</p>
                            <div className="flex flex-wrap gap-1">
                              {g.items.map((item) => (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() =>
                                    updateBlock(selectedBlock.id, { title: item, detail: g.group })
                                  }
                                  className={cn(
                                    'rounded-xl border px-2 py-1 text-[11px]',
                                    selectedBlock.title === item
                                      ? 'border-primary bg-primary/10'
                                      : 'border-border text-muted-foreground',
                                  )}
                                >
                                  {item}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {selectedBlock.kind === 'condition' || selectedBlock.kind === 'branch' ? (
                    <section className="space-y-2">
                      <Label>Condition builder</Label>
                      {condRows.map((row, idx) => (
                        <div key={row.id} className="space-y-1 rounded-xl border border-border p-2">
                          <div className="flex gap-1">
                            {(['IF', 'ELSE IF', 'AND', 'OR'] as const).map((op) => (
                              <button
                                key={op}
                                type="button"
                                disabled={idx === 0 && op !== 'IF'}
                                onClick={() =>
                                  setCondRows((rows) =>
                                    rows.map((r) => (r.id === row.id ? { ...r, op } : r)),
                                  )
                                }
                                className={cn(
                                  'rounded-xl border px-1.5 py-0.5 text-[10px]',
                                  row.op === op
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border text-muted-foreground',
                                )}
                              >
                                {op}
                              </button>
                            ))}
                          </div>
                          <Input
                            value={row.field}
                            onChange={(e) =>
                              setCondRows((rows) =>
                                rows.map((r) =>
                                  r.id === row.id ? { ...r, field: e.target.value } : r,
                                ),
                              )
                            }
                            placeholder="Field"
                            className="h-8 rounded-xl text-[12px]"
                          />
                          <Input
                            value={row.comparator}
                            onChange={(e) =>
                              setCondRows((rows) =>
                                rows.map((r) =>
                                  r.id === row.id ? { ...r, comparator: e.target.value } : r,
                                ),
                              )
                            }
                            placeholder="Comparator"
                            className="h-8 rounded-xl text-[12px]"
                          />
                          <Input
                            value={row.value}
                            onChange={(e) =>
                              setCondRows((rows) =>
                                rows.map((r) =>
                                  r.id === row.id ? { ...r, value: e.target.value } : r,
                                ),
                              )
                            }
                            placeholder="Value"
                            className="h-8 rounded-xl text-[12px]"
                          />
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setCondRows((rows) => [
                            ...rows,
                            {
                              id: uid('c'),
                              op: 'AND',
                              field: '',
                              comparator: 'equals',
                              value: '',
                            },
                          ])
                        }
                      >
                        <Plus className="size-3.5" />
                        Add row
                      </Button>
                    </section>
                  ) : null}

                  {selectedBlock.kind === 'action' ? (
                    <section className="space-y-3">
                      <div>
                        <Label>Pick action</Label>
                        <div className="mt-1.5 max-h-[180px] space-y-2 overflow-y-auto">
                          {ACTION_LIBRARY.map((g) => (
                            <div key={g.group}>
                              <p className="mb-1 text-[11px] text-muted-foreground">{g.group}</p>
                              <div className="flex flex-wrap gap-1">
                                {g.items.map((item) => (
                                  <button
                                    key={item}
                                    type="button"
                                    onClick={() =>
                                      updateBlock(selectedBlock.id, {
                                        title: item,
                                        detail: g.group,
                                      })
                                    }
                                    className={cn(
                                      'rounded-xl border px-2 py-1 text-[11px]',
                                      selectedBlock.title === item
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border text-muted-foreground',
                                    )}
                                  >
                                    {item}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="flex items-center gap-1">
                          <Braces className="size-3.5" />
                          Variables
                        </Label>
                        <div className="mt-1.5 space-y-2">
                          {VARIABLE_GROUPS.map((g) => (
                            <div key={g.group}>
                              <p className="mb-1 text-[11px] text-muted-foreground">{g.group}</p>
                              <div className="flex flex-wrap gap-1">
                                {g.items.map((item) => (
                                  <button
                                    key={item}
                                    type="button"
                                    onClick={() =>
                                      setPickedVars((prev) =>
                                        prev.includes(item)
                                          ? prev.filter((v) => v !== item)
                                          : [...prev, item],
                                      )
                                    }
                                    className={cn(
                                      'rounded-xl border px-2 py-1 text-[11px]',
                                      pickedVars.includes(item)
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border text-muted-foreground',
                                    )}
                                  >
                                    {item}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  ) : null}

                  {selectedBlock.kind === 'delay' ? (
                    <section className="space-y-2">
                      <Label>Delay</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min={1}
                          value={delayAmount}
                          onChange={(e) => setDelayAmount(e.target.value)}
                          className="h-9 w-20 rounded-xl"
                          disabled={delayUnit === 'until'}
                        />
                        <select
                          className="h-9 flex-1 rounded-xl border border-border bg-background px-2 text-[13px] outline-none"
                          value={delayUnit}
                          onChange={(e) => setDelayUnit(e.target.value as DelayUnit)}
                        >
                          <option value="minutes">Minutes</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                          <option value="until">Until date</option>
                        </select>
                      </div>
                      {delayUnit === 'until' ? (
                        <Input type="datetime-local" className="h-9 rounded-xl" />
                      ) : null}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateBlock(selectedBlock.id, {
                            title:
                              delayUnit === 'until'
                                ? 'Wait until date'
                                : `Wait ${delayAmount} ${delayUnit}`,
                            detail: delayUnit === 'until' ? 'Absolute time' : 'Relative delay',
                          })
                        }
                      >
                        Apply delay
                      </Button>
                    </section>
                  ) : null}

                  {selectedBlock.kind === 'loop' ? (
                    <section className="space-y-2">
                      <Label>Loop over</Label>
                      <div className="flex flex-col gap-1.5">
                        {(
                          [
                            ['records', 'Records'],
                            ['lists', 'Lists'],
                            ['api', 'API pages'],
                          ] as const
                        ).map(([key, label]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setLoopSource(key)
                              updateBlock(selectedBlock.id, {
                                title: `Loop ${label.toLowerCase()}`,
                                detail: `Source: ${label}`,
                              })
                            }}
                            className={cn(
                              'rounded-xl border px-2.5 py-1.5 text-left text-[12px]',
                              loopSource === key
                                ? 'border-primary bg-primary/10'
                                : 'border-border text-muted-foreground',
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  <section className="space-y-2 border-t border-border pt-3">
                    <Label className="flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5" />
                      Error handling
                    </Label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(
                        [
                          ['retry', 'Retry'],
                          ['continue', 'Continue'],
                          ['stop', 'Stop'],
                          ['alert', 'Alert'],
                        ] as const
                      ).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setErrorMode(key)}
                          className={cn(
                            'rounded-xl border px-2 py-1.5 text-[12px]',
                            errorMode === key
                              ? 'border-primary bg-primary/10'
                              : 'border-border text-muted-foreground',
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </section>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      deleteSelected()
                    }}
                  >
                    <Trash2 className="size-3.5" />
                    Delete block
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
