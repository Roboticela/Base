import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Archive,
  ArrowDownUp,
  Copy,
  Download,
  Grid2X2,
  LayoutList,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Share2,
  Sparkles,
  Star,
  Trash2,
  Workflow,
  X,
  Zap,
} from 'lucide-react'

import { EmptyState } from '@/components/app/EmptyState'
import { PageHeader } from '@/components/app/PageHeader'
import { SectionCard } from '@/components/app/SectionCard'
import { SegmentedTabs } from '@/components/app/SegmentedTabs'
import { StatTile } from '@/components/app/StatTile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AUTOMATIONS,
  AUTOMATION_FOLDERS,
  AUTOMATION_TEMPLATES,
  DEFAULT_WORKFLOW,
  type AutomationItem,
  type AutomationStatus,
} from '@/data/automations'
import { MOCK_WORKSPACES } from '@/data/workspaces'
import { cn } from '@/lib/utils'

type ViewMode = 'grid' | 'list'
type SortKey = 'name' | 'modified' | 'executions' | 'success'
type Modal = null | 'create' | 'ai' | 'templates' | 'share' | 'confirm-delete'

const ALL_TAGS = Array.from(new Set(AUTOMATIONS.flatMap((a) => a.tags))).sort()
const AI_EXAMPLE =
  'When a new lead is created, wait 2 days, send a follow-up email if they have not replied, then notify the owner on Slack.'

const selectCls =
  'h-9 rounded-xl border border-border bg-background px-2.5 text-[13px] text-foreground outline-none'

function statusClass(status: AutomationStatus) {
  if (status === 'Active') return 'bg-emerald-500/10 text-emerald-600'
  if (status === 'Paused') return 'bg-amber-500/10 text-amber-700'
  return 'bg-muted text-muted-foreground'
}

function draftItem(
  partial: Pick<AutomationItem, 'id' | 'name' | 'description' | 'trigger' | 'folder' | 'tags'>,
): AutomationItem {
  return {
    status: 'Draft',
    lastRun: 'Never',
    nextRun: '—',
    successRate: '—',
    executions: 0,
    createdBy: 'You',
    modified: 'Just now',
    favorite: false,
    ...partial,
  }
}

export function AutomationsPage() {
  const { workspaceId = 'ws-acme' } = useParams()
  const navigate = useNavigate()
  const workspace = MOCK_WORKSPACES.find((w) => w.id === workspaceId) ?? MOCK_WORKSPACES[0]

  const [items, setItems] = useState(AUTOMATIONS)
  const [query, setQuery] = useState('')
  const [folder, setFolder] = useState('All')
  const [status, setStatus] = useState<'any' | AutomationStatus>('any')
  const [tag, setTag] = useState('any')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('modified')
  const [sortAsc, setSortAsc] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selected, setSelected] = useState<string[]>([])
  const [menuId, setMenuId] = useState<string | null>(null)
  const [modal, setModal] = useState<Modal>(null)
  const [aiPrompt, setAiPrompt] = useState(AI_EXAMPLE)
  const [aiPreview, setAiPreview] = useState(false)
  const [templateQuery, setTemplateQuery] = useState('')
  const [templatePreviewId, setTemplatePreviewId] = useState(AUTOMATION_TEMPLATES[0]?.id ?? '')
  const [duplicateSourceId, setDuplicateSourceId] = useState(AUTOMATIONS[0]?.id ?? '')

  const filtered = useMemo(() => {
    let list = [...items]
    if (folder === 'Archived') list = list.filter((a) => a.folder === 'Archived')
    else if (folder !== 'All') list = list.filter((a) => a.folder === folder)
    else list = list.filter((a) => a.folder !== 'Archived')
    if (status !== 'any') list = list.filter((a) => a.status === status)
    if (tag !== 'any') list = list.filter((a) => a.tags.includes(tag))
    if (favoritesOnly) list = list.filter((a) => a.favorite)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((a) =>
        [a.name, a.description, a.trigger, a.createdBy, a.folder, a.tags.join(' '), a.status]
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    }
    list.sort((a, b) => {
      const cmp =
        sortKey === 'name'
          ? a.name.localeCompare(b.name)
          : sortKey === 'executions'
            ? a.executions - b.executions
            : sortKey === 'success'
              ? a.successRate.localeCompare(b.successRate)
              : a.modified.localeCompare(b.modified)
      return sortAsc ? cmp : -cmp
    })
    return list
  }, [items, folder, status, tag, favoritesOnly, query, sortKey, sortAsc])

  const templates = AUTOMATION_TEMPLATES.filter((t) => {
    if (!templateQuery.trim()) return true
    const q = templateQuery.toLowerCase()
    return t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
  })
  const templatePreview =
    AUTOMATION_TEMPLATES.find((t) => t.id === templatePreviewId) ?? AUTOMATION_TEMPLATES[0]

  const openAutomation = (id: string) => navigate(`/w/${workspaceId}/automations/${id}`)

  function patch(id: string, next: Partial<AutomationItem>) {
    setItems((c) => c.map((a) => (a.id === id ? { ...a, ...next } : a)))
  }

  function addAndOpen(item: AutomationItem) {
    setItems((c) => [item, ...c])
    setModal(null)
    setAiPreview(false)
    openAutomation(item.id)
  }

  function createBlank() {
    addAndOpen(
      draftItem({
        id: `auto-blank-${Date.now()}`,
        name: 'Untitled automation',
        description: 'Blank workflow — add a trigger to begin.',
        trigger: 'Not configured',
        folder: folder === 'All' || folder === 'Archived' ? 'Sales' : folder,
        tags: [],
      }),
    )
  }

  function duplicateAutomation(source: AutomationItem) {
    addAndOpen({
      ...source,
      id: `${source.id}-copy-${Date.now()}`,
      name: `${source.name} copy`,
      status: 'Draft',
      executions: 0,
      lastRun: 'Never',
      modified: 'Just now',
      favorite: false,
    })
  }

  function installTemplate(templateId: string) {
    const t = AUTOMATION_TEMPLATES.find((x) => x.id === templateId)
    if (!t) return
    addAndOpen(
      draftItem({
        id: `auto-${t.id}-${Date.now()}`,
        name: t.name,
        description: `Installed from template · ${t.blocks} blocks`,
        trigger: 'Template trigger',
        folder: t.category === 'Finance' ? 'Ops' : t.category === 'Data' ? 'AI' : 'Sales',
        tags: [t.category.toLowerCase()],
      }),
    )
  }

  function acceptAi() {
    addAndOpen(
      draftItem({
        id: `auto-ai-${Date.now()}`,
        name: 'Lead follow-up sequence',
        description: aiPrompt.slice(0, 120),
        trigger: 'Record Created',
        folder: 'Sales',
        tags: ['email', 'crm', 'ai'],
      }),
    )
  }

  function applyBulk(action: 'enable' | 'disable' | 'archive' | 'delete') {
    if (action === 'delete') setItems((c) => c.filter((a) => !selected.includes(a.id)))
    else if (action === 'archive')
      setItems((c) =>
        c.map((a) => (selected.includes(a.id) ? { ...a, folder: 'Archived', status: 'Disabled' } : a)),
      )
    else
      setItems((c) =>
        c.map((a) =>
          selected.includes(a.id) ? { ...a, status: action === 'enable' ? 'Active' : 'Disabled' } : a,
        ),
      )
    setSelected([])
    setModal(null)
  }

  function handleAction(action: string, item: AutomationItem) {
    setMenuId(null)
    if (action === 'open') openAutomation(item.id)
    if (action === 'duplicate') duplicateAutomation(item)
    if (action === 'rename') {
      const next = window.prompt('Rename automation', item.name)
      if (next?.trim()) patch(item.id, { name: next.trim(), modified: 'Just now' })
    }
    if (action === 'archive') patch(item.id, { folder: 'Archived', status: 'Disabled' })
    if (action === 'delete') setItems((c) => c.filter((a) => a.id !== item.id))
    if (action === 'toggle') patch(item.id, { status: item.status === 'Active' ? 'Paused' : 'Active' })
    if (action === 'share') setModal('share')
    if (action === 'favorite') patch(item.id, { favorite: !item.favorite })
  }

  const empty = filtered.length === 0
    ? query.trim()
      ? { title: 'No matching automations', description: 'Try a different search or clear filters.', action: 'Clear search', onAction: () => setQuery('') }
      : favoritesOnly || status !== 'any' || tag !== 'any' || folder !== 'All'
        ? {
            title: 'Nothing in this view',
            description: 'Adjust filters or folder chips to see more workflows.',
            action: 'Reset filters',
            onAction: () => {
              setFolder('All'); setStatus('any'); setTag('any'); setFavoritesOnly(false)
            },
          }
        : {
            title: 'No automations yet',
            description: 'Create a blank flow, generate with AI, or install a template.',
            action: 'Create automation',
            onAction: () => setModal('create'),
          }
    : null

  const cardProps = (item: AutomationItem) => ({
    item,
    selected: selected.includes(item.id),
    menuOpen: menuId === item.id,
    onOpen: () => openAutomation(item.id),
    onSelect: () =>
      setSelected((c) => (c.includes(item.id) ? c.filter((x) => x !== item.id) : [...c, item.id])),
    onMenu: () => setMenuId((c) => (c === item.id ? null : item.id)),
    onAction: (action: string) => handleAction(action, item),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Automations"
        title="Automations"
        description={`${items.length} workflows · ${workspace.name}`}
        actions={
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => setModal('templates')}>
              Templates
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => { setAiPreview(false); setModal('ai') }}>
              <Sparkles className="h-3.5 w-3.5" />
              AI Generate
            </Button>
            <Button type="button" variant="accent" size="sm" onClick={() => setModal('create')}>
              <Plus className="h-3.5 w-3.5" />
              Create
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Active" value={String(items.filter((a) => a.status === 'Active').length)} meta="Running now" />
        <StatTile label="Paused" value={String(items.filter((a) => a.status === 'Paused').length)} meta="Awaiting review" />
        <StatTile label="Executions" value={items.reduce((s, a) => s + a.executions, 0).toLocaleString()} meta="All time" />
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, trigger, tags, owner…" className="h-11 pl-9" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={selectCls} aria-label="Filter by status">
              {(['any', 'Active', 'Draft', 'Paused', 'Disabled'] as const).map((s) => (
                <option key={s} value={s}>{s === 'any' ? 'Any status' : s}</option>
              ))}
            </select>
            <select value={tag} onChange={(e) => setTag(e.target.value)} className={selectCls} aria-label="Filter by tag">
              <option value="any">Any tag</option>
              {ALL_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <label className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-[12.5px]">
              <input type="checkbox" checked={favoritesOnly} onChange={(e) => setFavoritesOnly(e.target.checked)} />
              Favorites
            </label>
            <div className="inline-flex items-center gap-1 rounded-xl border border-border p-1">
              {([['grid', Grid2X2], ['list', LayoutList]] as const).map(([mode, Icon]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={cn('inline-flex h-8 w-8 items-center justify-center rounded-lg', viewMode === mode ? 'bg-primary/10 text-primary' : 'text-muted-foreground')}
                  aria-label={`${mode} view`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            <label className="inline-flex items-center gap-2 text-[12.5px] text-muted-foreground">
              <ArrowDownUp className="h-3.5 w-3.5" />
              <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className={selectCls}>
                <option value="modified">Modified</option>
                <option value="name">Name</option>
                <option value="executions">Executions</option>
                <option value="success">Success rate</option>
              </select>
              <button type="button" onClick={() => setSortAsc((c) => !c)} className="rounded-lg border border-border px-2 py-1.5 text-[12px] hover:bg-muted/50">
                {sortAsc ? 'Asc' : 'Desc'}
              </button>
            </label>
          </div>
        </div>
        <SegmentedTabs value={folder} onChange={setFolder} tabs={AUTOMATION_FOLDERS.map((id) => ({ id, label: id }))} />
      </div>

      {selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
          <span className="text-[13px] font-medium">{selected.length} selected</span>
          <Button type="button" size="sm" variant="outline" onClick={() => applyBulk('enable')}>Enable</Button>
          <Button type="button" size="sm" variant="outline" onClick={() => applyBulk('disable')}>Disable</Button>
          <Button type="button" size="sm" variant="outline" onClick={() => applyBulk('archive')}>Archive</Button>
          <Button type="button" size="sm" variant="destructive" onClick={() => setModal('confirm-delete')}>Delete</Button>
          <button type="button" className="ml-auto text-[12.5px] font-medium text-muted-foreground hover:text-foreground" onClick={() => setSelected([])}>
            Clear
          </button>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-[13.5px] text-muted-foreground">Showing {filtered.length} of {items.length}</p>
        <button
          type="button"
          className="text-[12.5px] font-medium text-primary"
          onClick={() => {
            const ids = filtered.map((a) => a.id)
            const all = ids.length > 0 && ids.every((id) => selected.includes(id))
            setSelected((c) => (all ? c.filter((id) => !ids.includes(id)) : [...new Set([...c, ...ids])]))
          }}
        >
          {filtered.length > 0 && filtered.every((a) => selected.includes(a.id)) ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      {empty ? (
        <SectionCard>
          <EmptyState icon={<Workflow className="h-5 w-5" />} title={empty.title} description={empty.description} actionLabel={empty.action} onAction={empty.onAction} />
        </SectionCard>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => <AutomationCard key={item.id} layout="grid" {...cardProps(item)} />)}
        </div>
      ) : (
        <SectionCard padded={false}>
          <div className="divide-y divide-border">
            {filtered.map((item) => <AutomationCard key={item.id} layout="list" {...cardProps(item)} />)}
          </div>
        </SectionCard>
      )}

      <p className="text-[12.5px] text-muted-foreground">
        Prefer the builder?{' '}
        <Link to={`/w/${workspaceId}/automations/${items[0]?.id ?? 'auto-followup'}`} className="font-medium text-primary hover:underline">
          Open a recent automation
        </Link>
      </p>

      {modal === 'create' ? (
        <Modal title="Create automation" onClose={() => setModal(null)}>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Blank', desc: 'Start empty and configure triggers', action: createBlank },
              { label: 'AI Generation', desc: 'Describe the workflow in plain language', action: () => { setAiPreview(false); setModal('ai') } },
              { label: 'Template', desc: 'Install a ready-made flow', action: () => setModal('templates') },
              { label: 'Duplicate existing', desc: 'Copy an automation below', action: () => undefined },
            ].map((opt) => (
              <button key={opt.label} type="button" onClick={opt.action} className="rounded-2xl border border-border bg-background p-4 text-left hover:bg-muted/40">
                <p className="text-[14px] font-medium">{opt.label}</p>
                <p className="mt-1 text-[12.5px] text-muted-foreground">{opt.desc}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center">
            <select value={duplicateSourceId} onChange={(e) => setDuplicateSourceId(e.target.value)} className={cn(selectCls, 'h-10 flex-1')}>
              {items.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <Button type="button" variant="outline" size="sm" onClick={() => { const s = items.find((a) => a.id === duplicateSourceId); if (s) duplicateAutomation(s) }}>
              <Copy className="h-3.5 w-3.5" />
              Duplicate
            </Button>
          </div>
        </Modal>
      ) : null}

      {modal === 'ai' ? (
        <Modal title="AI Generate" onClose={() => setModal(null)}>
          <label htmlFor="ai-auto-prompt" className="block text-[13px] font-medium">Describe the automation</label>
          <textarea
            id="ai-auto-prompt"
            rows={4}
            value={aiPrompt}
            onChange={(e) => { setAiPrompt(e.target.value); setAiPreview(false) }}
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-3 text-[14px] outline-none focus:border-primary/40"
          />
          <p className="mt-2 text-[12.5px] text-muted-foreground">Example: lead follow-up with wait, email, and owner notify.</p>
          {!aiPreview ? (
            <Button type="button" variant="accent" size="sm" className="mt-4" onClick={() => setAiPreview(true)}>
              <Sparkles className="h-3.5 w-3.5" />
              Generate preview
            </Button>
          ) : (
            <div className="mt-4 space-y-2">
              <p className="text-[13px] font-medium">Preview blocks</p>
              {DEFAULT_WORKFLOW.slice(0, 5).map((block) => (
                <div key={block.id} className="flex items-start gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
                  <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{block.kind}</p>
                    <p className="text-[13.5px] font-medium">{block.title}</p>
                    <p className="text-[12px] text-muted-foreground">{block.detail}</p>
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="button" variant="accent" size="sm" onClick={acceptAi}>Accept & open builder</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setAiPreview(false)}>Edit prompt</Button>
              </div>
            </div>
          )}
        </Modal>
      ) : null}

      {modal === 'templates' ? (
        <Modal title="Automation templates" onClose={() => setModal(null)}>
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={templateQuery} onChange={(e) => setTemplateQuery(e.target.value)} placeholder="Search templates…" className="h-10 pl-9" />
          </div>
          {templates.length === 0 ? (
            <EmptyState icon={<Workflow className="h-5 w-5" />} title="No templates" description="Try another search term." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplatePreviewId(t.id)}
                    className={cn('w-full rounded-xl border border-border px-3 py-3 text-left hover:bg-muted/40', templatePreviewId === t.id && 'border-primary/40 bg-primary/5')}
                  >
                    <p className="text-[13.5px] font-medium">{t.name}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{t.category} · {t.blocks} blocks</p>
                  </button>
                ))}
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-[15px] font-semibold">{templatePreview?.name}</p>
                <p className="mt-1 text-[13px] text-muted-foreground">{templatePreview?.category} · {templatePreview?.blocks} workflow blocks</p>
                <ul className="mt-4 space-y-2 text-[12.5px] text-muted-foreground">
                  <li>Trigger + conditions included</li>
                  <li>Editable after install</li>
                  <li>Opens in automation builder</li>
                </ul>
                <Button type="button" variant="accent" size="sm" className="mt-4" onClick={() => templatePreview && installTemplate(templatePreview.id)}>
                  Install
                </Button>
              </div>
            </div>
          )}
        </Modal>
      ) : null}

      {modal === 'share' ? (
        <Modal title="Share automation" onClose={() => setModal(null)}>
          <p className="text-[13.5px] text-muted-foreground">Invite teammates to view or edit this workflow. Link sharing is design-only.</p>
          <Input className="mt-3" readOnly value={`${window.location.origin}/w/${workspaceId}/automations`} />
          <div className="mt-4 flex justify-end">
            <Button type="button" variant="accent" size="sm" onClick={() => setModal(null)}>Done</Button>
          </div>
        </Modal>
      ) : null}

      {modal === 'confirm-delete' ? (
        <Modal title="Delete automations" onClose={() => setModal(null)}>
          <p className="text-[13.5px] text-muted-foreground">Delete {selected.length} selected automation{selected.length === 1 ? '' : 's'}?</p>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="button" variant="destructive" size="sm" onClick={() => applyBulk('delete')}>Delete</Button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

function AutomationCard({
  item,
  layout,
  selected,
  menuOpen,
  onOpen,
  onSelect,
  onMenu,
  onAction,
}: {
  item: AutomationItem
  layout: ViewMode
  selected: boolean
  menuOpen: boolean
  onOpen: () => void
  onSelect: () => void
  onMenu: () => void
  onAction: (action: string) => void
}) {
  const menuBtn = (
    <div className="relative">
      <button type="button" onClick={onMenu} aria-label="Automation menu" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted/50">
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {menuOpen ? <CardMenu item={item} onAction={onAction} onClose={onMenu} /> : null}
    </div>
  )

  if (layout === 'list') {
    return (
      <div className={cn('flex items-center gap-3 px-4 py-3', selected && 'bg-primary/5')}>
        <input type="checkbox" checked={selected} onChange={onSelect} />
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[14px] font-medium">{item.name}</p>
            <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', statusClass(item.status))}>{item.status}</span>
            {item.favorite ? <Star className="h-3 w-3 fill-current text-primary" /> : null}
          </div>
          <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
            {item.trigger} · Last {item.lastRun} · Next {item.nextRun} · {item.successRate} · {item.executions} runs · {item.createdBy} · {item.modified}
            {item.tags.length ? ` · ${item.tags.join(', ')}` : ''}
          </p>
        </button>
        {menuBtn}
      </div>
    )
  }

  return (
    <div className={cn('relative flex flex-col rounded-2xl border border-border bg-card p-4', selected && 'border-primary/40 bg-primary/5')}>
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={selected} onChange={onSelect} className="mt-1" />
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[14.5px] font-semibold">{item.name}</p>
            {item.favorite ? <Star className="h-3.5 w-3.5 shrink-0 fill-current text-primary" /> : null}
          </div>
          <p className="mt-1 line-clamp-2 text-[12.5px] text-muted-foreground">{item.description}</p>
        </button>
        {menuBtn}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', statusClass(item.status))}>{item.status}</span>
        <span className="text-[12px] text-muted-foreground">{item.trigger}</span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
        {([['Last run', item.lastRun], ['Next run', item.nextRun], ['Success', item.successRate], ['Executions', String(item.executions)], ['Created by', item.createdBy], ['Modified', item.modified]] as const).map(([label, value]) => (
          <div key={label}>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
      {item.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tags.map((t) => (
            <span key={t} className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">{t}</span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function CardMenu({ item, onAction, onClose }: { item: AutomationItem; onAction: (a: string) => void; onClose: () => void }) {
  const entries = [
    { id: 'open', label: 'Open', icon: Workflow },
    { id: 'duplicate', label: 'Duplicate', icon: Copy },
    { id: 'rename', label: 'Rename', icon: Pencil },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'archive', label: 'Archive', icon: Archive },
    { id: 'delete', label: 'Delete', icon: Trash2 },
    { id: 'toggle', label: item.status === 'Active' ? 'Disable' : 'Enable', icon: item.status === 'Active' ? Pause : Play },
    { id: 'share', label: 'Share', icon: Share2 },
    { id: 'favorite', label: item.favorite ? 'Unfavorite' : 'Favorite', icon: Star },
  ]
  return (
    <>
      <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Dismiss menu" onClick={onClose} />
      <div className="absolute right-0 top-9 z-50 w-44 rounded-xl border border-border bg-card p-1">
        {entries.map((e) => (
          <button key={e.id} type="button" onClick={() => onAction(e.id)} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] hover:bg-muted/50">
            <e.icon className="h-3.5 w-3.5 text-muted-foreground" />
            {e.label}
          </button>
        ))}
      </div>
    </>
  )
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted/50">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
