import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Archive,
  ArrowDownUp,
  Bot,
  CalendarDays,
  Check,
  ChevronDown,
  Columns3,
  Copy,
  Download,
  Eye,
  EyeOff,
  Filter,
  GanttChart,
  Group,
  Kanban,
  LayoutGrid,
  List,
  MapPin,
  MoreHorizontal,
  PanelLeft,
  PanelRight,
  Pin,
  Plus,
  Redo2,
  RefreshCw,
  Search,
  Settings2,
  Share2,
  Snowflake,
  Sparkles,
  Star,
  Table2,
  Timeline,
  Trash2,
  Undo2,
  Upload,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BUILDER_FIELDS,
  BUILDER_RECORDS,
  BUILDER_VIEWS,
  FIELD_TYPES,
  MOCK_SHEETS,
  type BuilderField,
  type BuilderRecord,
  type BuilderView,
} from '@/data/sheets'
import { cn } from '@/lib/utils'

type Density = 'compact' | 'comfortable'
type SortKey = 'name' | 'value' | null
type SortDir = 'asc' | 'desc'
type RightPanel =
  | 'Record Details'
  | 'Field Settings'
  | 'Comments'
  | 'Attachments'
  | 'Activity'
  | 'AI Assistant'
  | 'Automations'
  | 'Related'
  | 'Sharing'
  | 'Validation'
type ModalKind = null | 'add-field' | 'filters' | 'import' | 'export' | 'ai' | 'share' | 'view-settings'
type ContextMenuState =
  | null
  | { kind: 'row'; x: number; y: number; recordId: string }
  | { kind: 'header'; x: number; y: number; fieldId: string }
  | { kind: 'empty'; x: number; y: number }

type FilterRule = {
  id: string
  field: string
  op: 'is' | 'is_not' | 'contains'
  value: string
}

type FilterGroup = {
  id: string
  logic: 'AND' | 'OR'
  rules: FilterRule[]
}

type Snapshot = {
  records: BuilderRecord[]
  fields: BuilderField[]
  views: BuilderView[]
}

const RIGHT_PANELS: RightPanel[] = [
  'Record Details',
  'Field Settings',
  'Comments',
  'Attachments',
  'Activity',
  'AI Assistant',
  'Automations',
  'Related',
  'Sharing',
  'Validation',
]

const VIEW_ICONS: Record<BuilderView['type'], typeof Table2> = {
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

const STATUS_COLUMNS = ['Open', 'Negotiation', 'Won', 'Lost']

const PRESENCE = [
  { id: 'ja', initials: 'JA', label: 'Jordan A.', online: true },
  { id: 'ar', initials: 'AR', label: 'Alex Rivera', online: true },
  { id: 'ml', initials: 'ML', label: 'Morgan Lee', online: false },
]

function cloneSnapshot(s: Snapshot): Snapshot {
  return {
    records: s.records.map((r) => ({ ...r, values: { ...r.values } })),
    fields: s.fields.map((f) => ({ ...f })),
    views: s.views.map((v) => ({ ...v })),
  }
}

function formatCurrency(raw: string) {
  const n = Number(raw)
  if (Number.isNaN(n)) return raw || '—'
  return `$${n.toLocaleString()}`
}

function emptyRecord(fields: BuilderField[], index: number): BuilderRecord {
  const values: Record<string, string> = {}
  for (const f of fields) values[f.id] = ''
  values.name = `New record ${index}`
  return {
    id: `r-${Date.now()}-${index}`,
    values,
    created: 'Just now',
    updated: 'Just now',
    createdBy: 'You',
    updatedBy: 'You',
  }
}

function ModalShell({
  title,
  onClose,
  children,
  wide,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
      <div
        className={cn(
          'max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-border bg-card',
          wide ? 'max-w-2xl' : 'max-w-lg',
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

function ContextMenu({
  state,
  onClose,
  onAction,
}: {
  state: NonNullable<ContextMenuState>
  onClose: () => void
  onAction: (action: string) => void
}) {
  const items =
    state.kind === 'row'
      ? ['Open details', 'Duplicate', 'Archive', 'Delete', 'Copy link']
      : state.kind === 'header'
        ? ['Sort ascending', 'Sort descending', 'Hide column', 'Freeze', 'Field settings']
        : ['Add record', 'Paste', 'Import', 'Refresh']

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Dismiss menu" onClick={onClose} />
      <div
        className="fixed z-50 min-w-[180px] rounded-xl border border-border bg-card p-1"
        style={{ left: state.x, top: state.y }}
      >
        {items.map((item) => (
          <button
            key={item}
            type="button"
            className="flex w-full rounded-lg px-3 py-2 text-left text-[13px] text-foreground hover:bg-muted/60"
            onClick={() => {
              onAction(item)
              onClose()
            }}
          >
            {item}
          </button>
        ))}
      </div>
    </>
  )
}

export function SheetBuilderPage() {
  const { workspaceId = 'ws-acme', sheetId = 'sheet-customers' } = useParams()
  const navigate = useNavigate()

  const sheetMeta = MOCK_SHEETS.find((s) => s.id === sheetId) ?? MOCK_SHEETS[0]

  const [sheetName, setSheetName] = useState(sheetMeta.name)
  const [editingName, setEditingName] = useState(false)
  const [description] = useState(sheetMeta.description)
  const [lastSaved] = useState('Saved just now')

  const [fields, setFields] = useState<BuilderField[]>(() => BUILDER_FIELDS.map((f) => ({ ...f })))
  const [records, setRecords] = useState<BuilderRecord[]>(() =>
    BUILDER_RECORDS.map((r) => ({ ...r, values: { ...r.values } })),
  )
  const [views, setViews] = useState<BuilderView[]>(() => BUILDER_VIEWS.map((v) => ({ ...v })))
  const [activeViewId, setActiveViewId] = useState(BUILDER_VIEWS[0].id)
  const [viewMenuId, setViewMenuId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([
    {
      id: 'g1',
      logic: 'AND',
      rules: [{ id: 'r1', field: 'status', op: 'is', value: '' }],
    },
  ])
  const [sortKey, setSortKey] = useState<SortKey>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [groupByStatus, setGroupByStatus] = useState(false)
  const [hiddenCols, setHiddenCols] = useState<string[]>([])
  const [freezeFirst, setFreezeFirst] = useState(true)
  const [density, setDensity] = useState<Density>('comfortable')
  const [colWidths, setColWidths] = useState<Record<string, number>>(() =>
    Object.fromEntries(BUILDER_FIELDS.map((f) => [f.id, f.width ?? 140])),
  )

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeRecordId, setActiveRecordId] = useState<string | null>(BUILDER_RECORDS[0]?.id ?? null)
  const [activeFieldId, setActiveFieldId] = useState<string | null>(BUILDER_FIELDS[0]?.id ?? null)
  const [editingCell, setEditingCell] = useState<{ recordId: string; fieldId: string } | null>(null)
  const [focusNewId, setFocusNewId] = useState<string | null>(null)

  const [showFieldsRail, setShowFieldsRail] = useState(true)
  const [showRight, setShowRight] = useState(true)
  const [rightPinned, setRightPinned] = useState(true)
  const [rightPanel, setRightPanel] = useState<RightPanel>('Record Details')

  const [modal, setModal] = useState<ModalKind>(null)
  const [newFieldLabel, setNewFieldLabel] = useState('')
  const [newFieldType, setNewFieldType] = useState(FIELD_TYPES[0])
  const [aiPrompt, setAiPrompt] = useState('')
  const [importProgress, setImportProgress] = useState<number | null>(null)
  const [exportProgress, setExportProgress] = useState<number | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null)

  const [undoStack, setUndoStack] = useState<Snapshot[]>([])
  const [redoStack, setRedoStack] = useState<Snapshot[]>([])

  const nameInputRef = useRef<HTMLInputElement>(null)
  const cellInputRef = useRef<HTMLInputElement>(null)
  const newRowRef = useRef<HTMLTableRowElement>(null)

  const activeView = views.find((v) => v.id === activeViewId) ?? views[0]
  const visibleFields = fields.filter((f) => !f.hidden && !hiddenCols.includes(f.id))

  const emailCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of records) {
      const email = (r.values.email ?? '').toLowerCase()
      if (!email) continue
      map.set(email, (map.get(email) ?? 0) + 1)
    }
    return map
  }, [records])

  const activeFiltersCount = useMemo(() => {
    return filterGroups.reduce(
      (n, g) => n + g.rules.filter((r) => r.value.trim() !== '').length,
      0,
    )
  }, [filterGroups])

  const filteredRecords = useMemo(() => {
    let list = [...records]

    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((r) =>
        Object.values(r.values).some((v) => String(v).toLowerCase().includes(q)),
      )
    }

    if (activeFiltersCount > 0) {
      list = list.filter((record) => {
        return filterGroups.every((group) => {
          const activeRules = group.rules.filter((r) => r.value.trim() !== '')
          if (activeRules.length === 0) return true
          const results = activeRules.map((rule) => {
            const cell = (record.values[rule.field] ?? '').toLowerCase()
            const val = rule.value.toLowerCase()
            if (rule.op === 'is') return cell === val
            if (rule.op === 'is_not') return cell !== val
            return cell.includes(val)
          })
          return group.logic === 'AND' ? results.every(Boolean) : results.some(Boolean)
        })
      })
    }

    if (activeView.name === 'Open deals') {
      list = list.filter((r) => r.values.status === 'Open')
    }

    if (sortKey) {
      list.sort((a, b) => {
        const av = a.values[sortKey] ?? ''
        const bv = b.values[sortKey] ?? ''
        let cmp = 0
        if (sortKey === 'value') {
          cmp = Number(av) - Number(bv)
        } else {
          cmp = av.localeCompare(bv)
        }
        return sortDir === 'asc' ? cmp : -cmp
      })
    }

    return list
  }, [records, search, filterGroups, activeFiltersCount, sortKey, sortDir, activeView.name])

  const grouped = useMemo(() => {
    if (!groupByStatus) return null
    const map = new Map<string, BuilderRecord[]>()
    for (const status of STATUS_COLUMNS) map.set(status, [])
    map.set('Other', [])
    for (const r of filteredRecords) {
      const s = r.values.status || 'Other'
      if (!map.has(s)) map.set(s, [])
      map.get(s)!.push(r)
    }
    return map
  }, [filteredRecords, groupByStatus])

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus()
  }, [editingName])

  useEffect(() => {
    if (editingCell) cellInputRef.current?.focus()
  }, [editingCell])

  useEffect(() => {
    if (!focusNewId) return
    newRowRef.current?.scrollIntoView({ block: 'nearest' })
    setEditingCell({ recordId: focusNewId, fieldId: 'name' })
    setFocusNewId(null)
  }, [focusNewId, records])

  function pushUndo() {
    setUndoStack((stack) => [...stack.slice(-29), cloneSnapshot({ records, fields, views })])
    setRedoStack([])
  }

  function undo() {
    setUndoStack((stack) => {
      if (stack.length === 0) return stack
      const prev = stack[stack.length - 1]
      setRedoStack((r) => [...r, cloneSnapshot({ records, fields, views })])
      setRecords(prev.records)
      setFields(prev.fields)
      setViews(prev.views)
      return stack.slice(0, -1)
    })
  }

  function redo() {
    setRedoStack((stack) => {
      if (stack.length === 0) return stack
      const next = stack[stack.length - 1]
      setUndoStack((u) => [...u, cloneSnapshot({ records, fields, views })])
      setRecords(next.records)
      setFields(next.fields)
      setViews(next.views)
      return stack.slice(0, -1)
    })
  }

  function updateCell(recordId: string, fieldId: string, value: string) {
    pushUndo()
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              values: { ...r.values, [fieldId]: value },
              updated: 'Just now',
              updatedBy: 'You',
            }
          : r,
      ),
    )
  }

  function addRecord() {
    pushUndo()
    const row = emptyRecord(fields, records.length + 1)
    setRecords((prev) => [...prev, row])
    setSelectedIds([row.id])
    setActiveRecordId(row.id)
    setRightPanel('Record Details')
    setFocusNewId(row.id)
  }

  function deleteSelected() {
    if (selectedIds.length === 0) return
    pushUndo()
    setRecords((prev) => prev.filter((r) => !selectedIds.includes(r.id)))
    setSelectedIds([])
    setActiveRecordId(null)
  }

  function duplicateSelected() {
    if (selectedIds.length === 0) return
    pushUndo()
    setRecords((prev) => {
      const copies: BuilderRecord[] = []
      for (const id of selectedIds) {
        const src = prev.find((r) => r.id === id)
        if (!src) continue
        copies.push({
          ...src,
          id: `r-copy-${Date.now()}-${src.id}`,
          values: { ...src.values, name: `${src.values.name} (copy)` },
          created: 'Just now',
          updated: 'Just now',
          createdBy: 'You',
          updatedBy: 'You',
        })
      }
      return [...prev, ...copies]
    })
  }

  function archiveSelected() {
    if (selectedIds.length === 0) return
    pushUndo()
    setRecords((prev) => prev.filter((r) => !selectedIds.includes(r.id)))
    setSelectedIds([])
  }

  function addField(label: string, type: string) {
    pushUndo()
    const id = `f-${Date.now()}`
    const field: BuilderField = { id, label, type, width: 140 }
    setFields((prev) => [...prev, field])
    setColWidths((prev) => ({ ...prev, [id]: 140 }))
    setRecords((prev) => prev.map((r) => ({ ...r, values: { ...r.values, [id]: '' } })))
    setActiveFieldId(id)
    setRightPanel('Field Settings')
    setModal(null)
    setNewFieldLabel('')
    setNewFieldType(FIELD_TYPES[0])
  }

  function createView() {
    pushUndo()
    const view: BuilderView = {
      id: `v-${Date.now()}`,
      name: `View ${views.length + 1}`,
      type: 'Table',
    }
    setViews((prev) => [...prev, view])
    setActiveViewId(view.id)
  }

  function renameView(id: string) {
    const current = views.find((v) => v.id === id)
    if (!current) return
    const name = window.prompt('Rename view', current.name)
    if (!name?.trim()) return
    pushUndo()
    setViews((prev) => prev.map((v) => (v.id === id ? { ...v, name: name.trim() } : v)))
  }

  function toggleFavoriteView(id: string) {
    pushUndo()
    setViews((prev) => prev.map((v) => (v.id === id ? { ...v, favorite: !v.favorite } : v)))
  }

  function duplicateView(id: string) {
    const src = views.find((v) => v.id === id)
    if (!src) return
    pushUndo()
    const copy: BuilderView = {
      ...src,
      id: `v-${Date.now()}`,
      name: `${src.name} (copy)`,
      favorite: false,
    }
    setViews((prev) => [...prev, copy])
    setActiveViewId(copy.id)
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    setActiveRecordId(id)
    setRightPanel('Record Details')
  }

  function toggleSelectAll() {
    if (selectedIds.length === filteredRecords.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredRecords.map((r) => r.id))
    }
  }

  function cycleSort(key: 'name' | 'value') {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
      return
    }
    if (sortDir === 'asc') setSortDir('desc')
    else {
      setSortKey(null)
      setSortDir('asc')
    }
  }

  function runMockProgress(kind: 'import' | 'export') {
    const setter = kind === 'import' ? setImportProgress : setExportProgress
    setter(0)
    let p = 0
    const timer = window.setInterval(() => {
      p += 20
      if (p >= 100) {
        setter(100)
        window.clearInterval(timer)
        window.setTimeout(() => setter(null), 800)
      } else {
        setter(p)
      }
    }, 200)
  }

  function cellClass(record: BuilderRecord, fieldId: string) {
    const status = record.values.status
    const value = Number(record.values.value)
    const email = (record.values.email ?? '').toLowerCase()
    const isDupEmail = fieldId === 'email' && email && (emailCounts.get(email) ?? 0) > 1

    return cn(
      status === 'Won' && fieldId === 'status' && 'font-medium text-emerald-600 dark:text-emerald-400',
      status === 'Lost' && fieldId === 'status' && 'text-muted-foreground',
      fieldId === 'value' && value >= 50000 && 'font-bold text-foreground',
      isDupEmail && 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    )
  }

  function displayValue(record: BuilderRecord, field: BuilderField) {
    const raw = record.values[field.id] ?? ''
    if (field.type === 'Currency') return formatCurrency(raw)
    if (field.type === 'Rating') return raw ? `${raw} / 5` : '—'
    return raw || '—'
  }

  function onGridKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      setEditingCell(null)
      setContextMenu(null)
    }
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length && !editingCell) {
      e.preventDefault()
      deleteSelected()
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
      e.preventDefault()
      if (e.shiftKey) redo()
      else undo()
    }
  }

  function openContext(
    e: MouseEvent,
    state: NonNullable<ContextMenuState>,
  ) {
    e.preventDefault()
    setContextMenu(state)
  }

  function handleContextAction(action: string) {
    if (!contextMenu) return
    if (contextMenu.kind === 'row') {
      const id = contextMenu.recordId
      setActiveRecordId(id)
      if (action === 'Open details') {
        setRightPanel('Record Details')
        setShowRight(true)
      } else if (action === 'Duplicate') {
        setSelectedIds([id])
        duplicateSelected()
      } else if (action === 'Archive') {
        setSelectedIds([id])
        archiveSelected()
      } else if (action === 'Delete') {
        setSelectedIds([id])
        deleteSelected()
      }
    } else if (contextMenu.kind === 'header') {
      const fid = contextMenu.fieldId
      if (action === 'Sort ascending') {
        setSortKey(fid === 'value' ? 'value' : 'name')
        setSortDir('asc')
      } else if (action === 'Sort descending') {
        setSortKey(fid === 'value' ? 'value' : 'name')
        setSortDir('desc')
      } else if (action === 'Hide column') {
        setHiddenCols((prev) => [...prev, fid])
      } else if (action === 'Freeze') {
        setFreezeFirst(true)
      } else if (action === 'Field settings') {
        setActiveFieldId(fid)
        setRightPanel('Field Settings')
        setShowRight(true)
      }
    } else {
      if (action === 'Add record') addRecord()
      if (action === 'Import') setModal('import')
      if (action === 'Refresh') {
        /* mock refresh */
      }
    }
  }

  const rowPad = density === 'compact' ? 'py-1.5' : 'py-2.5'
  const activeRecord = records.find((r) => r.id === activeRecordId) ?? null
  const activeField = fields.find((f) => f.id === activeFieldId) ?? null

  function renderRecordCard(record: BuilderRecord) {
    return (
      <button
        key={record.id}
        type="button"
        onClick={() => {
          setActiveRecordId(record.id)
          setRightPanel('Record Details')
          setShowRight(true)
        }}
        className={cn(
          'w-full rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-muted/40',
          activeRecordId === record.id && 'border-primary',
        )}
      >
        <p className="truncate text-[13.5px] font-semibold text-foreground">
          {record.values.name || 'Untitled'}
        </p>
        <p className="mt-1 truncate text-[12px] text-muted-foreground">{record.values.email || '—'}</p>
        <div className="mt-2 flex items-center justify-between text-[11.5px]">
          <span
            className={cn(
              'rounded-lg border border-border px-2 py-0.5',
              record.values.status === 'Won' && 'text-emerald-600 dark:text-emerald-400',
              record.values.status === 'Lost' && 'text-muted-foreground',
            )}
          >
            {record.values.status || '—'}
          </span>
          <span className="font-medium text-foreground">{formatCurrency(record.values.value ?? '')}</span>
        </div>
      </button>
    )
  }

  function renderNonTableView() {
    const type = activeView.type

    if (type === 'Kanban') {
      return (
        <div className="flex h-full gap-3 overflow-x-auto p-3">
          {STATUS_COLUMNS.map((status) => {
            const cards = filteredRecords.filter((r) => r.values.status === status)
            return (
              <div
                key={status}
                className="flex w-64 shrink-0 flex-col rounded-2xl border border-border bg-card"
              >
                <div className="flex items-center justify-between border-b border-border px-3 py-2">
                  <span className="text-[13px] font-semibold text-foreground">{status}</span>
                  <span className="text-[11.5px] text-muted-foreground">{cards.length}</span>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto p-2">
                  {cards.length === 0 ? (
                    <p className="px-1 py-4 text-center text-[12px] text-muted-foreground">No cards</p>
                  ) : (
                    cards.map(renderRecordCard)
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    if (type === 'List') {
      return (
        <div className="h-full overflow-y-auto p-3">
          <div className="mx-auto max-w-3xl space-y-1">
            {filteredRecords.length === 0 ? (
              <EmptyBoard message="No records match" />
            ) : (
              filteredRecords.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setActiveRecordId(r.id)
                    setRightPanel('Record Details')
                    setShowRight(true)
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left hover:bg-muted/40',
                    activeRecordId === r.id && 'border-primary',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-foreground">
                    {r.values.name}
                  </span>
                  <span className="text-[12px] text-muted-foreground">{r.values.status}</span>
                  <span className="text-[12px] font-medium text-foreground">
                    {formatCurrency(r.values.value ?? '')}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )
    }

    const title =
      type === 'Gallery'
        ? 'Gallery'
        : type === 'Cards'
          ? 'Cards'
          : type === 'Calendar'
            ? 'Calendar'
            : type === 'Timeline'
              ? 'Timeline'
              : type === 'Gantt'
                ? 'Gantt'
                : type === 'Map'
                  ? 'Map'
                  : type

    return (
      <div className="h-full overflow-y-auto p-3">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] font-medium text-muted-foreground">
            {title} view · {filteredRecords.length} records
          </p>
        </div>
        {filteredRecords.length === 0 ? (
          <EmptyBoard message="No records to display" />
        ) : (
          <div
            className={cn(
              'grid gap-3',
              type === 'Timeline' || type === 'Gantt' || type === 'Map'
                ? 'grid-cols-1'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
            )}
          >
            {type === 'Calendar' && (
              <div className="col-span-full rounded-2xl border border-border bg-card p-4">
                <div className="mb-3 grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 28 }, (_, i) => (
                    <div
                      key={i}
                      className="min-h-16 rounded-lg border border-border bg-background p-1 text-[11px] text-muted-foreground"
                    >
                      {i + 1}
                      {filteredRecords[i % filteredRecords.length] && i % 4 === 0 && (
                        <p className="mt-1 truncate rounded-md bg-primary/10 px-1 py-0.5 text-[10px] text-primary">
                          {filteredRecords[i % filteredRecords.length].values.name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(type === 'Timeline' || type === 'Gantt') && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="space-y-3">
                  {filteredRecords.map((r, i) => (
                    <div key={r.id} className="flex items-center gap-3">
                      <span className="w-36 shrink-0 truncate text-[12.5px] font-medium text-foreground">
                        {r.values.name}
                      </span>
                      <div className="relative h-7 flex-1 rounded-lg border border-border bg-background">
                        <div
                          className="absolute inset-y-1 rounded-md bg-primary/20"
                          style={
                            {
                              left: `${8 + (i % 5) * 12}%`,
                              width: `${20 + (i % 4) * 10}%`,
                            } as CSSProperties
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {type === 'Map' && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-background">
                  <div className="text-center">
                    <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-[13px] font-medium text-foreground">Map placeholder</p>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      {filteredRecords.length} pinned accounts
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">{filteredRecords.map(renderRecordCard)}</div>
              </div>
            )}
            {(type === 'Gallery' || type === 'Cards') && filteredRecords.map(renderRecordCard)}
          </div>
        )}
      </div>
    )
  }

  function renderTableRows(list: BuilderRecord[], startIndex = 0) {
    return list.map((record, i) => {
      const idx = startIndex + i
      const selected = selectedIds.includes(record.id)
      return (
        <tr
          key={record.id}
          ref={focusNewId === record.id || record.id === activeRecordId ? newRowRef : undefined}
          className={cn(
            'border-b border-border transition-colors hover:bg-muted/30',
            selected && 'bg-primary/5',
            activeRecordId === record.id && 'bg-muted/40',
          )}
          onClick={() => {
            setActiveRecordId(record.id)
            setRightPanel('Record Details')
          }}
          onContextMenu={(e) => openContext(e, { kind: 'row', x: e.clientX, y: e.clientY, recordId: record.id })}
        >
          <td
            className={cn(
              'sticky left-0 z-[1] border-r border-border bg-card px-2',
              rowPad,
              selected && 'bg-primary/5',
            )}
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggleSelect(record.id)}
                onClick={(e) => e.stopPropagation()}
                className="h-3.5 w-3.5 rounded border-border"
                aria-label={`Select row ${idx + 1}`}
              />
              <span className="w-5 text-[11.5px] tabular-nums text-muted-foreground">{idx + 1}</span>
            </div>
          </td>
          {visibleFields.map((field, fi) => {
            const editing =
              editingCell?.recordId === record.id && editingCell?.fieldId === field.id
            const stickyData = freezeFirst && fi === 0
            return (
              <td
                key={field.id}
                className={cn(
                  'relative border-r border-border px-2 text-[13px]',
                  rowPad,
                  stickyData && 'sticky z-[1] bg-card',
                  stickyData && 'left-14',
                  cellClass(record, field.id),
                )}
                style={{
                  width: colWidths[field.id],
                  minWidth: colWidths[field.id],
                  maxWidth: colWidths[field.id],
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveRecordId(record.id)
                  setActiveFieldId(field.id)
                  setEditingCell({ recordId: record.id, fieldId: field.id })
                }}
              >
                {editing ? (
                  <Input
                    ref={cellInputRef}
                    defaultValue={record.values[field.id] ?? ''}
                    onBlur={(e) => {
                      const next = e.target.value
                      if (next !== (record.values[field.id] ?? '')) {
                        updateCell(record.id, field.id, next)
                      }
                      setEditingCell(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const next = (e.target as HTMLInputElement).value
                        if (next !== (record.values[field.id] ?? '')) {
                          updateCell(record.id, field.id, next)
                        }
                        setEditingCell(null)
                      }
                      if (e.key === 'Escape') setEditingCell(null)
                    }}
                    className="h-8 rounded-lg px-2 text-[13px]"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="block truncate">{displayValue(record, field)}</span>
                )}
                <span
                  className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/40"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const startX = e.clientX
                    const startW = colWidths[field.id] ?? 140
                    function onMove(ev: globalThis.MouseEvent) {
                      const next = Math.max(80, startW + (ev.clientX - startX))
                      setColWidths((prev) => ({ ...prev, [field.id]: next }))
                    }
                    function onUp() {
                      window.removeEventListener('mousemove', onMove)
                      window.removeEventListener('mouseup', onUp)
                    }
                    window.addEventListener('mousemove', onMove)
                    window.addEventListener('mouseup', onUp)
                  }}
                />
              </td>
            )
          })}
        </tr>
      )
    })
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background" onKeyDown={onGridKeyDown}>
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-card px-3 py-2.5">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-[12.5px]">
              <Link
                to={`/w/${workspaceId}/sheets`}
                className="font-medium text-muted-foreground hover:text-foreground"
              >
                Sheets
              </Link>
              <span className="text-muted-foreground">{'>'}</span>
              {editingName ? (
                <Input
                  ref={nameInputRef}
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  onBlur={() => setEditingName(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Escape') setEditingName(false)
                  }}
                  className="h-8 max-w-[240px] rounded-lg px-2 text-[13.5px] font-semibold"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingName(true)}
                  className="truncate text-[14px] font-semibold text-foreground hover:underline"
                >
                  {sheetName}
                </button>
              )}
            </div>
            <p className="mt-0.5 max-w-2xl truncate text-[12px] text-muted-foreground">{description}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11.5px] text-muted-foreground">
              <span className="rounded-lg border border-border px-2 py-0.5 text-foreground">{lastSaved}</span>
              <span>
                View · <span className="text-foreground">{activeView.name}</span>
              </span>
              <span>
                {records.length} records · {fields.length} fields
              </span>
              <div className="flex items-center -space-x-1.5 pl-1">
                {PRESENCE.map((p) => (
                  <span
                    key={p.id}
                    title={`${p.label}${p.online ? ' · online' : ''}`}
                    className={cn(
                      'inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-[10px] font-semibold text-foreground',
                      p.online && 'ring-1 ring-primary/40',
                    )}
                  >
                    {p.initials}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button type="button" size="sm" variant="accent" onClick={addRecord}>
              <Plus className="h-3.5 w-3.5" />
              Add Record
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setModal('add-field')}>
              <Plus className="h-3.5 w-3.5" />
              Add Field
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setModal('ai')}>
              <Sparkles className="h-3.5 w-3.5" />
              AI
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setModal('import')}>
              <Upload className="h-3.5 w-3.5" />
              Import
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setModal('export')}>
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setModal('share')}>
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
            <Button type="button" size="icon" variant="ghost" onClick={undo} disabled={undoStack.length === 0} aria-label="Undo">
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button type="button" size="icon" variant="ghost" onClick={redo} disabled={redoStack.length === 0} aria-label="Redo">
              <Redo2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => navigate(`/w/${workspaceId}/sheets/${sheetId}/settings`)}
            >
              <Settings2 className="h-3.5 w-3.5" />
              Sheet Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Views bar */}
      <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-border bg-background px-2 py-1.5">
        {views.map((view) => {
          const Icon = VIEW_ICONS[view.type]
          const active = view.id === activeViewId
          return (
            <div key={view.id} className="relative flex shrink-0 items-center">
              <button
                type="button"
                onClick={() => setActiveViewId(view.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12.5px] font-medium',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {view.name}
                {view.favorite && <Star className="h-3 w-3 fill-current text-primary" />}
              </button>
              <button
                type="button"
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                aria-label={`View menu ${view.name}`}
                onClick={() => setViewMenuId(viewMenuId === view.id ? null : view.id)}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
              {viewMenuId === view.id && (
                <div className="absolute left-0 top-full z-20 mt-1 min-w-[160px] rounded-xl border border-border bg-card p-1">
                  {[
                    { label: 'Rename', fn: () => renameView(view.id) },
                    {
                      label: view.favorite ? 'Unfavorite' : 'Favorite',
                      fn: () => toggleFavoriteView(view.id),
                    },
                    { label: 'Duplicate', fn: () => duplicateView(view.id) },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className="flex w-full rounded-lg px-3 py-2 text-left text-[12.5px] text-foreground hover:bg-muted/60"
                      onClick={() => {
                        item.fn()
                        setViewMenuId(null)
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        <Button type="button" size="sm" variant="ghost" className="shrink-0" onClick={createView}>
          <Plus className="h-3.5 w-3.5" />
          Create view
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border px-2 py-1.5">
        <div className="relative min-w-[180px] flex-1 max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records…"
            className="h-8 rounded-xl pl-8 text-[13px]"
          />
        </div>
        <Button
          type="button"
          size="sm"
          variant={showFilters || activeFiltersCount > 0 ? 'outline' : 'ghost'}
          onClick={() => {
            setShowFilters((v) => !v)
            setModal(showFilters ? null : 'filters')
          }}
        >
          <Filter className="h-3.5 w-3.5" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="rounded-md bg-primary/10 px-1.5 text-[11px] text-primary">
              {activeFiltersCount}
            </span>
          )}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => cycleSort('name')}>
          <ArrowDownUp className="h-3.5 w-3.5" />
          Sort
          {sortKey && (
            <span className="text-[11px] text-muted-foreground">
              {sortKey} {sortDir}
            </span>
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={groupByStatus ? 'outline' : 'ghost'}
          onClick={() => setGroupByStatus((v) => !v)}
        >
          <Group className="h-3.5 w-3.5" />
          Group
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() =>
            setHiddenCols((prev) =>
              prev.length ? [] : fields.slice(-2).map((f) => f.id),
            )
          }
        >
          {hiddenCols.length ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          Hide columns
        </Button>
        <Button
          type="button"
          size="sm"
          variant={freezeFirst ? 'outline' : 'ghost'}
          onClick={() => setFreezeFirst((v) => !v)}
        >
          <Snowflake className="h-3.5 w-3.5" />
          Freeze
        </Button>
        <div className="inline-flex rounded-xl border border-border p-0.5">
          {(['compact', 'comfortable'] as Density[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDensity(d)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-[11.5px] font-medium capitalize',
                density === d ? 'bg-primary/10 text-primary' : 'text-muted-foreground',
              )}
            >
              {d}
            </button>
          ))}
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={() => setSearch((s) => s)}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setModal('ai')}>
          <Bot className="h-3.5 w-3.5" />
          AI actions
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setModal('view-settings')}>
          <Settings2 className="h-3.5 w-3.5" />
          View settings
        </Button>
        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Toggle fields rail"
            onClick={() => setShowFieldsRail((v) => !v)}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Toggle right sidebar"
            onClick={() => setShowRight((v) => !v)}
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex w-full flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card px-2 py-1.5">
            <span className="text-[12.5px] font-medium text-foreground">
              {selectedIds.length} selected
            </span>
            <Button type="button" size="sm" variant="ghost" onClick={duplicateSelected}>
              <Copy className="h-3.5 w-3.5" />
              Duplicate
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={archiveSelected}>
              <Archive className="h-3.5 w-3.5" />
              Archive
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={deleteSelected}>
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex min-h-0 flex-1">
        {showFieldsRail && (
          <aside className="hidden w-52 shrink-0 flex-col overflow-y-auto border-r border-border bg-card md:flex">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-[12.5px] font-semibold text-foreground">Fields</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setModal('add-field')}
                aria-label="Add field"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <ul className="space-y-0.5 p-2">
              {fields.map((field) => (
                <li key={field.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFieldId(field.id)
                      setRightPanel('Field Settings')
                      setShowRight(true)
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[12.5px]',
                      activeFieldId === field.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-muted/50',
                      field.hidden && 'opacity-50',
                    )}
                  >
                    <span className="cursor-grab text-muted-foreground" title="Drag to reorder">
                      ::
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">{field.label}</span>
                    <span className="truncate text-[10.5px] text-muted-foreground">{field.type}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-auto border-t border-border p-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => setModal('add-field')}
              >
                <Plus className="h-3.5 w-3.5" />
                Add field
              </Button>
            </div>
          </aside>
        )}

        <main className="min-w-0 flex-1 overflow-hidden bg-background">
          {activeView.type === 'Table' ? (
            <div
              className="h-full overflow-auto"
              onContextMenu={(e) => {
                if ((e.target as HTMLElement).closest('tr, th')) return
                openContext(e, { kind: 'empty', x: e.clientX, y: e.clientY })
              }}
            >
              {filteredRecords.length === 0 ? (
                <div className="flex h-full items-center justify-center p-6">
                  <EmptyBoard
                    message={
                      search || activeFiltersCount
                        ? 'No search results'
                        : 'No records yet'
                    }
                    actionLabel={search || activeFiltersCount ? 'Clear filters' : 'Add record'}
                    onAction={() => {
                      if (search || activeFiltersCount) {
                        setSearch('')
                        setFilterGroups([
                          {
                            id: 'g1',
                            logic: 'AND',
                            rules: [{ id: 'r1', field: 'status', op: 'is', value: '' }],
                          },
                        ])
                      } else {
                        addRecord()
                      }
                    }}
                  />
                </div>
              ) : (
                <table className="w-max min-w-full border-collapse text-left">
                  <thead className="sticky top-0 z-10 bg-card">
                    <tr className="border-b border-border">
                      <th className="sticky left-0 z-[2] w-14 border-r border-border bg-card px-2 py-2">
                        <input
                          type="checkbox"
                          checked={
                            filteredRecords.length > 0 &&
                            selectedIds.length === filteredRecords.length
                          }
                          onChange={toggleSelectAll}
                          className="h-3.5 w-3.5 rounded border-border"
                          aria-label="Select all"
                        />
                      </th>
                      {visibleFields.map((field, fi) => (
                        <th
                          key={field.id}
                          className={cn(
                            'relative border-r border-border px-2 py-2 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground',
                            freezeFirst && fi === 0 && 'sticky z-[2] bg-card left-14',
                          )}
                          style={{
                            width: colWidths[field.id],
                            minWidth: colWidths[field.id],
                          }}
                          onContextMenu={(e) =>
                            openContext(e, {
                              kind: 'header',
                              x: e.clientX,
                              y: e.clientY,
                              fieldId: field.id,
                            })
                          }
                        >
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 hover:text-foreground"
                            onClick={() => {
                              if (field.id === 'name' || field.id === 'value') {
                                cycleSort(field.id)
                              }
                              setActiveFieldId(field.id)
                            }}
                          >
                            {field.label}
                            {sortKey === field.id && (
                              <ChevronDown
                                className={cn('h-3 w-3', sortDir === 'asc' && 'rotate-180')}
                              />
                            )}
                          </button>
                          <span
                            className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/40"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              const startX = e.clientX
                              const startW = colWidths[field.id] ?? 140
                              function onMove(ev: globalThis.MouseEvent) {
                                const next = Math.max(80, startW + (ev.clientX - startX))
                                setColWidths((prev) => ({ ...prev, [field.id]: next }))
                              }
                              function onUp() {
                                window.removeEventListener('mousemove', onMove)
                                window.removeEventListener('mouseup', onUp)
                              }
                              window.addEventListener('mousemove', onMove)
                              window.addEventListener('mouseup', onUp)
                            }}
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {grouped
                      ? Array.from(grouped.entries()).flatMap(([status, rows]) => {
                          if (rows.length === 0) return []
                          return [
                            <tr key={`g-${status}`} className="border-b border-border bg-muted/40">
                              <td
                                colSpan={visibleFields.length + 1}
                                className="px-3 py-2 text-[12px] font-semibold text-foreground"
                              >
                                {status}
                                <span className="ml-2 font-normal text-muted-foreground">
                                  {rows.length}
                                </span>
                              </td>
                            </tr>,
                            ...renderTableRows(rows),
                          ]
                        })
                      : renderTableRows(filteredRecords)}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            renderNonTableView()
          )}
        </main>

        {showRight && (
          <aside
            className={cn(
              'hidden w-72 shrink-0 flex-col overflow-hidden border-l border-border bg-card xl:flex',
              !rightPinned && 'absolute right-0 top-[auto] z-10 h-[calc(100%-8rem)]',
            )}
          >
            <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
              <span className="px-1 text-[12px] font-semibold text-foreground">Sidebar</span>
              <div className="flex items-center gap-0.5">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  aria-label={rightPinned ? 'Unpin sidebar' : 'Pin sidebar'}
                  onClick={() => setRightPinned((v) => !v)}
                >
                  <Pin className={cn('h-3.5 w-3.5', rightPinned && 'text-primary')} />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  aria-label="Close sidebar"
                  onClick={() => setShowRight(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex gap-1 overflow-x-auto border-b border-border p-1.5">
              {RIGHT_PANELS.map((panel) => (
                <button
                  key={panel}
                  type="button"
                  onClick={() => setRightPanel(panel)}
                  className={cn(
                    'shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium',
                    rightPanel === panel
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted/50',
                  )}
                >
                  {panel}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-3 text-[13px]">
              <RightSidebarContent
                panel={rightPanel}
                record={activeRecord}
                field={activeField}
                onUpdateRecord={(fieldId, value) => {
                  if (!activeRecord) return
                  updateCell(activeRecord.id, fieldId, value)
                }}
                onPatchField={(patch) => {
                  if (!activeField) return
                  pushUndo()
                  setFields((prev) =>
                    prev.map((f) => (f.id === activeField.id ? { ...f, ...patch } : f)),
                  )
                }}
              />
            </div>
          </aside>
        )}
      </div>

      {/* Status bar */}
      <footer className="flex shrink-0 flex-wrap items-center gap-3 border-t border-border bg-card px-3 py-1.5 text-[11.5px] text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">{records.length}</span> total
        </span>
        <span>
          <span className="font-medium text-foreground">{selectedIds.length}</span> selected
        </span>
        <span>
          <span className="font-medium text-foreground">{activeFiltersCount}</span> filters
        </span>
        <span className="inline-flex items-center gap-1 text-foreground">
          <Check className="h-3 w-3 text-primary" />
          Synced
        </span>
        <span>{lastSaved}</span>
        {importProgress !== null && (
          <span className="text-foreground">Import {importProgress}%</span>
        )}
        {exportProgress !== null && (
          <span className="text-foreground">Export {exportProgress}%</span>
        )}
        <span className="ml-auto">
          Showing {filteredRecords.length} of {records.length}
        </span>
      </footer>

      {contextMenu && (
        <ContextMenu
          state={contextMenu}
          onClose={() => setContextMenu(null)}
          onAction={handleContextAction}
        />
      )}

      {modal === 'add-field' && (
        <ModalShell title="Add field" onClose={() => setModal(null)}>
          <form
            className="space-y-3"
            onSubmit={(e: FormEvent) => {
              e.preventDefault()
              if (!newFieldLabel.trim()) return
              addField(newFieldLabel.trim(), newFieldType)
            }}
          >
            <label className="block space-y-1.5">
              <span className="text-[12.5px] font-medium text-foreground">Label</span>
              <Input
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                placeholder="Field name"
                className="h-10 rounded-xl"
                autoFocus
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[12.5px] font-medium text-foreground">Type</span>
              <select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px] text-foreground"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {FIELD_TYPES.slice(0, 12).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNewFieldType(t)}
                  className={cn(
                    'rounded-lg border border-border px-2 py-1 text-[11.5px]',
                    newFieldType === t
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" size="sm">
                Add field
              </Button>
            </div>
          </form>
        </ModalShell>
      )}

      {modal === 'filters' && (
        <ModalShell title="Filters" onClose={() => setModal(null)} wide>
          <div className="space-y-4">
            {filterGroups.map((group, gi) => (
              <div key={group.id} className="rounded-2xl border border-border p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[12px] font-medium text-muted-foreground">Match</span>
                  <div className="inline-flex rounded-xl border border-border p-0.5">
                    {(['AND', 'OR'] as const).map((logic) => (
                      <button
                        key={logic}
                        type="button"
                        onClick={() =>
                          setFilterGroups((prev) =>
                            prev.map((g, i) => (i === gi ? { ...g, logic } : g)),
                          )
                        }
                        className={cn(
                          'rounded-lg px-2.5 py-1 text-[11.5px] font-medium',
                          group.logic === logic
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground',
                        )}
                      >
                        {logic}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  {group.rules.map((rule, ri) => (
                    <div key={rule.id} className="flex flex-wrap items-center gap-2">
                      <select
                        value={rule.field}
                        onChange={(e) =>
                          setFilterGroups((prev) =>
                            prev.map((g, i) =>
                              i === gi
                                ? {
                                    ...g,
                                    rules: g.rules.map((r, j) =>
                                      j === ri ? { ...r, field: e.target.value } : r,
                                    ),
                                  }
                                : g,
                            ),
                          )
                        }
                        className="h-9 rounded-xl border border-border bg-background px-2 text-[12.5px]"
                      >
                        {fields.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={rule.op}
                        onChange={(e) =>
                          setFilterGroups((prev) =>
                            prev.map((g, i) =>
                              i === gi
                                ? {
                                    ...g,
                                    rules: g.rules.map((r, j) =>
                                      j === ri
                                        ? { ...r, op: e.target.value as FilterRule['op'] }
                                        : r,
                                    ),
                                  }
                                : g,
                            ),
                          )
                        }
                        className="h-9 rounded-xl border border-border bg-background px-2 text-[12.5px]"
                      >
                        <option value="is">is</option>
                        <option value="is_not">is not</option>
                        <option value="contains">contains</option>
                      </select>
                      {rule.field === 'status' ? (
                        <select
                          value={rule.value}
                          onChange={(e) =>
                            setFilterGroups((prev) =>
                              prev.map((g, i) =>
                                i === gi
                                  ? {
                                      ...g,
                                      rules: g.rules.map((r, j) =>
                                        j === ri ? { ...r, value: e.target.value } : r,
                                      ),
                                    }
                                  : g,
                              ),
                            )
                          }
                          className="h-9 min-w-[120px] rounded-xl border border-border bg-background px-2 text-[12.5px]"
                        >
                          <option value="">Any</option>
                          {STATUS_COLUMNS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          value={rule.value}
                          onChange={(e) =>
                            setFilterGroups((prev) =>
                              prev.map((g, i) =>
                                i === gi
                                  ? {
                                      ...g,
                                      rules: g.rules.map((r, j) =>
                                        j === ri ? { ...r, value: e.target.value } : r,
                                      ),
                                    }
                                  : g,
                              ),
                            )
                          }
                          className="h-9 max-w-[160px] rounded-xl text-[12.5px]"
                          placeholder="Value"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="mt-2"
                  onClick={() =>
                    setFilterGroups((prev) =>
                      prev.map((g, i) =>
                        i === gi
                          ? {
                              ...g,
                              rules: [
                                ...g.rules,
                                {
                                  id: `r-${Date.now()}`,
                                  field: 'status',
                                  op: 'is',
                                  value: '',
                                },
                              ],
                            }
                          : g,
                      ),
                    )
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add rule
                </Button>
              </div>
            ))}
            <div className="flex justify-between">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() =>
                  setFilterGroups((prev) => [
                    ...prev,
                    {
                      id: `g-${Date.now()}`,
                      logic: 'OR',
                      rules: [{ id: `r-${Date.now()}`, field: 'status', op: 'is', value: '' }],
                    },
                  ])
                }
              >
                Add group
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setFilterGroups([
                      {
                        id: 'g1',
                        logic: 'AND',
                        rules: [{ id: 'r1', field: 'status', op: 'is', value: '' }],
                      },
                    ])
                  }}
                >
                  Clear
                </Button>
                <Button type="button" size="sm" variant="accent" onClick={() => setModal(null)}>
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </ModalShell>
      )}

      {modal === 'import' && (
        <ModalShell title="Import records" onClose={() => setModal(null)}>
          <p className="text-[13px] text-muted-foreground">
            Upload CSV or paste rows. This is a design mock — no files are uploaded.
          </p>
          <div className="mt-3 rounded-xl border border-dashed border-border bg-background px-4 py-8 text-center">
            <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-2 text-[13px] font-medium text-foreground">Drop a CSV file here</p>
            <p className="mt-1 text-[12px] text-muted-foreground">or choose from your computer</p>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="accent"
              size="sm"
              onClick={() => {
                setModal(null)
                runMockProgress('import')
              }}
            >
              Start import
            </Button>
          </div>
        </ModalShell>
      )}

      {modal === 'export' && (
        <ModalShell title="Export sheet" onClose={() => setModal(null)}>
          <p className="text-[13px] text-muted-foreground">
            Export {filteredRecords.length} visible records as CSV or JSON.
          </p>
          <div className="mt-3 space-y-2">
            {['CSV', 'JSON', 'Excel'].map((fmt) => (
              <label
                key={fmt}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-2.5 hover:bg-muted/40"
              >
                <input type="radio" name="export-fmt" defaultChecked={fmt === 'CSV'} />
                <span className="text-[13px] font-medium text-foreground">{fmt}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="accent"
              size="sm"
              onClick={() => {
                setModal(null)
                runMockProgress('export')
              }}
            >
              Export
            </Button>
          </div>
        </ModalShell>
      )}

      {modal === 'ai' && (
        <ModalShell title="AI actions" onClose={() => setModal(null)} wide>
          <p className="text-[13px] text-muted-foreground">
            Describe what you want in natural language. Examples: filter open deals, fill missing
            owners, highlight duplicates.
          </p>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={4}
            placeholder="Show deals where status is Open and value > 20000…"
            className="mt-3 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-[13px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[
              'Highlight duplicate emails',
              'Group by status',
              'Sort by deal value descending',
              'Filter status is Won',
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setAiPrompt(chip)}
                className="rounded-lg border border-border px-2.5 py-1 text-[11.5px] text-muted-foreground hover:text-foreground"
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="accent"
              size="sm"
              onClick={() => {
                const p = aiPrompt.toLowerCase()
                if (p.includes('duplicate')) {
                  /* already highlighted */
                }
                if (p.includes('group')) setGroupByStatus(true)
                if (p.includes('sort') && p.includes('value')) {
                  setSortKey('value')
                  setSortDir('desc')
                }
                if (p.includes('won')) {
                  setFilterGroups([
                    {
                      id: 'g1',
                      logic: 'AND',
                      rules: [{ id: 'r1', field: 'status', op: 'is', value: 'Won' }],
                    },
                  ])
                }
                if (p.includes('open')) {
                  setFilterGroups([
                    {
                      id: 'g1',
                      logic: 'AND',
                      rules: [{ id: 'r1', field: 'status', op: 'is', value: 'Open' }],
                    },
                  ])
                }
                setModal(null)
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Run
            </Button>
          </div>
        </ModalShell>
      )}

      {modal === 'share' && (
        <ModalShell title="Share sheet" onClose={() => setModal(null)}>
          <label className="block space-y-1.5">
            <span className="text-[12.5px] font-medium text-foreground">Invite by email</span>
            <Input placeholder="name@company.com" className="h-10 rounded-xl" />
          </label>
          <div className="mt-3 space-y-2">
            {['Can view', 'Can comment', 'Can edit', 'Admin'].map((role, i) => (
              <label
                key={role}
                className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
              >
                <span className="text-[13px] text-foreground">{role}</span>
                <input type="radio" name="share-role" defaultChecked={i === 2} />
              </label>
            ))}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button type="button" variant="accent" size="sm" onClick={() => setModal(null)}>
              Share
            </Button>
          </div>
        </ModalShell>
      )}

      {modal === 'view-settings' && (
        <ModalShell title="View settings" onClose={() => setModal(null)}>
          <div className="space-y-3 text-[13px]">
            <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
              <span className="text-foreground">View name</span>
              <span className="font-medium text-foreground">{activeView.name}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
              <span className="text-foreground">Type</span>
              <span className="text-muted-foreground">{activeView.type}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
              <span className="text-foreground">Density</span>
              <span className="capitalize text-muted-foreground">{density}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
              <span className="text-foreground">Frozen column</span>
              <span className="text-muted-foreground">{freezeFirst ? 'First data column' : 'None'}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="button" size="sm" variant="accent" onClick={() => setModal(null)}>
              Done
            </Button>
          </div>
        </ModalShell>
      )}
    </div>
  )
}

function EmptyBoard({
  message,
  actionLabel,
  onAction,
}: {
  message: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-border bg-card px-6 py-10 text-center">
      <p className="text-[14px] font-semibold text-foreground">{message}</p>
      <p className="mt-1 text-[12.5px] text-muted-foreground">
        Add a record or adjust filters to populate this view.
      </p>
      {actionLabel && onAction && (
        <Button type="button" size="sm" variant="accent" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

function RightSidebarContent({
  panel,
  record,
  field,
  onUpdateRecord,
  onPatchField,
}: {
  panel: RightPanel
  record: BuilderRecord | null
  field: BuilderField | null
  onUpdateRecord: (fieldId: string, value: string) => void
  onPatchField: (patch: Partial<BuilderField>) => void
}) {
  if (panel === 'Record Details') {
    if (!record) {
      return <p className="text-muted-foreground">Select a record to view details.</p>
    }
    return (
      <div className="space-y-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Record
          </p>
          <p className="mt-0.5 text-[14px] font-semibold text-foreground">
            {record.values.name || 'Untitled'}
          </p>
        </div>
        {Object.entries(record.values).map(([key, value]) => (
          <label key={key} className="block space-y-1">
            <span className="text-[11.5px] font-medium capitalize text-muted-foreground">{key}</span>
            <Input
              value={value}
              onChange={(e) => onUpdateRecord(key, e.target.value)}
              className="h-9 rounded-xl text-[13px]"
            />
          </label>
        ))}
        <p className="text-[11.5px] text-muted-foreground">
          Created {record.created} by {record.createdBy} · Updated {record.updated} by{' '}
          {record.updatedBy}
        </p>
      </div>
    )
  }

  if (panel === 'Field Settings') {
    if (!field) {
      return <p className="text-muted-foreground">Select a field from the rail or header.</p>
    }
    return (
      <div className="space-y-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Field
          </p>
          <p className="mt-0.5 text-[14px] font-semibold text-foreground">{field.label}</p>
          <p className="text-[12px] text-muted-foreground">{field.type}</p>
        </div>
        <label className="block space-y-1">
          <span className="text-[11.5px] font-medium text-muted-foreground">Label</span>
          <Input
            value={field.label}
            onChange={(e) => onPatchField({ label: e.target.value })}
            className="h-9 rounded-xl text-[13px]"
          />
        </label>
        {(
          [
            ['required', 'Required'],
            ['unique', 'Unique'],
            ['hidden', 'Hidden'],
            ['locked', 'Locked'],
          ] as const
        ).map(([key, label]) => (
          <label
            key={key}
            className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
          >
            <span className="text-[13px] text-foreground">{label}</span>
            <input
              type="checkbox"
              checked={Boolean(field[key])}
              onChange={(e) => onPatchField({ [key]: e.target.checked })}
            />
          </label>
        ))}
      </div>
    )
  }

  if (panel === 'Comments') {
    return (
      <ul className="space-y-2">
        {[
          { who: 'Alex', text: 'Can we confirm Contoso duplicate?', time: '12m' },
          { who: 'You', text: 'Flagged for merge review.', time: '8m' },
        ].map((c) => (
          <li key={c.time + c.who} className="rounded-xl border border-border px-3 py-2">
            <p className="text-[12.5px] font-medium text-foreground">{c.who}</p>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">{c.text}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{c.time} ago</p>
          </li>
        ))}
      </ul>
    )
  }

  if (panel === 'Attachments') {
    return (
      <ul className="space-y-2">
        {['proposal.pdf', 'logo.png', 'contract.docx'].map((f) => (
          <li
            key={f}
            className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
          >
            <span className="text-[12.5px] text-foreground">{f}</span>
            <span className="text-[11px] text-muted-foreground">Mock</span>
          </li>
        ))}
      </ul>
    )
  }

  if (panel === 'Activity') {
    return (
      <ul className="space-y-2">
        {[
          'You edited Deal value on Fabrikam',
          'Alex added Contoso Ltd',
          'Jordan updated status to Negotiation',
        ].map((t) => (
          <li key={t} className="rounded-xl border border-border px-3 py-2 text-[12.5px] text-muted-foreground">
            {t}
          </li>
        ))}
      </ul>
    )
  }

  if (panel === 'AI Assistant') {
    return (
      <div className="space-y-3">
        <p className="text-[12.5px] text-muted-foreground">
          Ask for cleanups, summaries, or formula suggestions.
        </p>
        <Input placeholder="Ask AI…" className="h-9 rounded-xl text-[13px]" />
        <Button type="button" size="sm" variant="outline" className="w-full">
          <Bot className="h-3.5 w-3.5" />
          Suggest next steps
        </Button>
      </div>
    )
  }

  if (panel === 'Automations') {
    return (
      <ul className="space-y-2">
        {[
          'When status becomes Won, notify owner',
          'When value exceeds 50k, set priority 5',
          'Daily digest of open deals',
        ].map((a) => (
          <li key={a} className="rounded-xl border border-border px-3 py-2 text-[12.5px] text-foreground">
            {a}
          </li>
        ))}
      </ul>
    )
  }

  if (panel === 'Related') {
    return (
      <ul className="space-y-2">
        {['Contacts · 3 linked', 'Invoices · 1 linked', 'Tasks · 5 linked'].map((r) => (
          <li key={r} className="rounded-xl border border-border px-3 py-2 text-[12.5px] text-foreground">
            {r}
          </li>
        ))}
      </ul>
    )
  }

  if (panel === 'Sharing') {
    return (
      <ul className="space-y-2">
        {[
          { name: 'Jordan A.', role: 'Edit' },
          { name: 'Alex Rivera', role: 'Admin' },
          { name: 'Workspace viewers', role: 'View' },
        ].map((s) => (
          <li
            key={s.name}
            className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
          >
            <span className="text-[12.5px] text-foreground">{s.name}</span>
            <span className="text-[11.5px] text-muted-foreground">{s.role}</span>
          </li>
        ))}
      </ul>
    )
  }

  // Validation
  return (
    <ul className="space-y-2">
      <li className="rounded-xl border border-border px-3 py-2 text-[12.5px] text-foreground">
        Email must be unique
      </li>
      <li className="rounded-xl border border-border px-3 py-2 text-[12.5px] text-foreground">
        Deal value {'>'} 0
      </li>
      <li className="rounded-xl border border-border px-3 py-2 text-[12.5px] text-foreground">
        Status required
      </li>
      <li className="rounded-xl border border-border px-3 py-2 text-[12.5px] text-amber-700 dark:text-amber-400">
        Duplicate email detected: hello@contoso.com
      </li>
    </ul>
  )
}
