import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Archive,
  ArrowDownUp,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  Filter,
  Folder,
  FolderPlus,
  Grid2X2,
  History,
  LayoutList,
  Link2,
  MoreHorizontal,
  Pin,
  Plus,
  Search,
  Settings2,
  Share2,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

import { EmptyState } from '@/components/app/EmptyState'
import { PageHeader } from '@/components/app/PageHeader'
import { SectionCard } from '@/components/app/SectionCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  MOCK_SHEETS,
  SHEET_ACTIVITY,
  SHEET_FOLDERS,
  SHEET_TEMPLATES,
  type SheetFolder,
  type SheetItem,
} from '@/data/sheets'
import { MOCK_WORKSPACES } from '@/data/workspaces'
import { cn } from '@/lib/utils'

type ViewMode = 'grid' | 'list'
type SortKey = 'name' | 'created' | 'updated' | 'opened' | 'records' | 'owner'
type Modal =
  | null
  | 'create'
  | 'ai'
  | 'import'
  | 'export'
  | 'share'
  | 'details'
  | 'templates'
  | 'confirm-delete'
  | 'confirm-archive'

type AdvancedFilters = {
  owner: string
  tag: string
  status: string
  sharedOnly: boolean
  favoritesOnly: boolean
  minRecords: string
}

const FILTER_PRESETS = [
  { id: 'my-fav', label: 'My favorites' },
  { id: 'shared-edit', label: 'Shared · Edit+' },
  { id: 'large', label: '1k+ records' },
]

export function SheetsPage() {
  const { workspaceId = 'ws-acme' } = useParams()
  const navigate = useNavigate()
  const workspace = MOCK_WORKSPACES.find((w) => w.id === workspaceId) ?? MOCK_WORKSPACES[0]

  const [sheets, setSheets] = useState(MOCK_SHEETS)
  const [folders, setFolders] = useState(SHEET_FOLDERS)
  const [query, setQuery] = useState('')
  const [folderId, setFolderId] = useState('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortKey, setSortKey] = useState<SortKey>('updated')
  const [sortAsc, setSortAsc] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [menuId, setMenuId] = useState<string | null>(null)
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [modal, setModal] = useState<Modal>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null)
  const [filters, setFilters] = useState<AdvancedFilters>({
    owner: 'any',
    tag: 'any',
    status: 'any',
    sharedOnly: false,
    favoritesOnly: false,
    minRecords: '',
  })
  const [savedPreset, setSavedPreset] = useState<string | null>(null)
  const [aiPrompt, setAiPrompt] = useState('Build a CRM with accounts, contacts, and deals')
  const [importStep, setImportStep] = useState(1)
  const pageSize = 6

  const activeCount = sheets.filter((s) => !s.archived).length

  const filtered = useMemo(() => {
    let list = [...sheets]

    if (folderId === 'favorites') list = list.filter((s) => s.favorite && !s.archived)
    else if (folderId === 'recent') list = list.filter((s) => !s.archived)
    else if (folderId === 'shared') list = list.filter((s) => s.shared && !s.archived)
    else if (folderId === 'archived') list = list.filter((s) => s.archived)
    else if (folderId === 'all') list = list.filter((s) => !s.archived)
    else list = list.filter((s) => s.folderId === folderId && !s.archived)

    if (filters.favoritesOnly) list = list.filter((s) => s.favorite)
    if (filters.sharedOnly) list = list.filter((s) => s.shared)
    if (filters.owner !== 'any') list = list.filter((s) => s.owner === filters.owner)
    if (filters.tag !== 'any') list = list.filter((s) => s.tags.includes(filters.tag))
    if (filters.status !== 'any') list = list.filter((s) => s.status === filters.status)
    if (filters.minRecords) {
      const min = Number(filters.minRecords) || 0
      list = list.filter((s) => s.records >= min)
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((s) =>
        [
          s.name,
          s.description,
          s.owner,
          s.createdBy,
          s.modifiedBy,
          s.folder,
          s.tags.join(' '),
          s.status,
          String(s.records),
          String(s.fields),
        ]
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    }

    list.sort((a, b) => {
      const pin = Number(b.pinned) - Number(a.pinned)
      if (pin !== 0) return pin
      let cmp = 0
      if (sortKey === 'name' || sortKey === 'owner') cmp = a[sortKey].localeCompare(b[sortKey])
      else if (sortKey === 'records') cmp = a.records - b.records
      else if (sortKey === 'created') cmp = a.created.localeCompare(b.created)
      else if (sortKey === 'opened') cmp = a.lastOpened.localeCompare(b.lastOpened)
      else cmp = a.updated.localeCompare(b.updated)
      return sortAsc ? cmp : -cmp
    })

    if (folderId === 'recent') {
      list = [...list].sort((a, b) => a.lastOpened.localeCompare(b.lastOpened) * -1)
    }

    return list
  }, [sheets, folderId, filters, query, sortKey, sortAsc])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  function patch(id: string, next: Partial<SheetItem>) {
    setSheets((current) => current.map((s) => (s.id === id ? { ...s, ...next } : s)))
  }

  function toggleSelect(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    )
  }

  function selectAllVisible() {
    const ids = pageItems.map((s) => s.id)
    const allSelected = ids.every((id) => selected.includes(id))
    setSelected((current) =>
      allSelected ? current.filter((id) => !ids.includes(id)) : [...new Set([...current, ...ids])],
    )
  }

  function openSheet(id: string) {
    navigate(`/w/${workspaceId}/sheets/${id}`)
  }

  function createBlank() {
    const id = `sheet-${Date.now()}`
    setSheets((current) => [
      {
        id,
        name: 'Untitled sheet',
        description: 'Blank sheet',
        folderId: folderId.startsWith('sales') || folderId === 'ops' || folderId === 'support' || folderId === 'personal' ? folderId : 'personal',
        folder: 'Personal',
        records: 0,
        fields: 3,
        owner: 'You',
        createdBy: 'You',
        modifiedBy: 'You',
        created: 'Just now',
        updated: 'Just now',
        lastOpened: 'Just now',
        favorite: false,
        pinned: false,
        shared: false,
        archived: false,
        permission: 'Admin',
        status: 'draft',
        tags: [],
        icon: 'U',
        storage: '0 MB',
      },
      ...current,
    ])
    setModal(null)
    navigate(`/w/${workspaceId}/sheets/${id}`)
  }

  function applyBulk(action: 'archive' | 'delete' | 'favorite' | 'unfavorite') {
    if (action === 'delete') {
      setSheets((current) => current.filter((s) => !selected.includes(s.id)))
    } else if (action === 'archive') {
      setSheets((current) =>
        current.map((s) => (selected.includes(s.id) ? { ...s, archived: true, status: 'archived' } : s)),
      )
    } else if (action === 'favorite') {
      setSheets((current) =>
        current.map((s) => (selected.includes(s.id) ? { ...s, favorite: true } : s)),
      )
    } else {
      setSheets((current) =>
        current.map((s) => (selected.includes(s.id) ? { ...s, favorite: false } : s)),
      )
    }
    setSelected([])
    setModal(null)
  }

  function moveToFolder(sheetId: string, targetFolderId: string) {
    const folder = folders.find((f) => f.id === targetFolderId)
    if (!folder || ['all', 'favorites', 'recent', 'shared', 'archived'].includes(targetFolderId)) return
    patch(sheetId, { folderId: targetFolderId, folder: folder.name })
  }

  const rootFolders = folders.filter(
    (f) => f.parentId === null && !['all', 'favorites', 'recent', 'shared', 'archived'].includes(f.id),
  )
  const smartFolders = folders.filter((f) =>
    ['all', 'favorites', 'recent', 'shared', 'archived'].includes(f.id),
  )

  const emptyCopy = getEmptyCopy(folderId, query)

  function handleAction(action: string, sheet: SheetItem) {
    setMenuId(null)
    if (action === 'open') openSheet(sheet.id)
    if (action === 'favorite') patch(sheet.id, { favorite: !sheet.favorite })
    if (action === 'pin') patch(sheet.id, { pinned: !sheet.pinned })
    if (action === 'duplicate') {
      setSheets((current) => [
        { ...sheet, id: `${sheet.id}-copy-${Date.now()}`, name: `${sheet.name} copy` },
        ...current,
      ])
    }
    if (action === 'archive') {
      patch(sheet.id, {
        archived: !sheet.archived,
        status: sheet.archived ? 'active' : 'archived',
      })
    }
    if (action === 'delete') setSheets((current) => current.filter((s) => s.id !== sheet.id))
    if (action === 'share') setModal('share')
    if (action === 'export') setModal('export')
    if (action === 'details') setDetailsId(sheet.id)
    if (action === 'settings') navigate(`/w/${workspaceId}/sheets/${sheet.id}/settings`)
    if (action === 'copy-link') {
      void navigator.clipboard?.writeText(
        `${window.location.origin}/w/${workspaceId}/sheets/${sheet.id}`,
      )
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sheets"
        title="Sheets"
        description={`${activeCount} sheets · ${workspace.name} · Updated just now`}
        actions={
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => setModal('templates')}>
              Browse templates
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => { setImportStep(1); setModal('import') }}>
              <Upload className="h-3.5 w-3.5" />
              Import
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setModal('ai')}>
              <Sparkles className="h-3.5 w-3.5" />
              AI generate
            </Button>
            <Button type="button" variant="accent" size="sm" onClick={() => setModal('create')}>
              <Plus className="h-3.5 w-3.5" />
              Create sheet
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Search name, description, owner, tags, folder, fields…"
              className="h-11 pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={showFilters ? 'accent' : 'outline'}
              size="sm"
              onClick={() => setShowFilters((c) => !c)}
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
            </Button>
            <div className="inline-flex items-center gap-1 rounded-xl border border-border p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-lg',
                  viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground',
                )}
                aria-label="Grid view"
              >
                <Grid2X2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-lg',
                  viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground',
                )}
                aria-label="List view"
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>
            <label className="inline-flex items-center gap-2 text-[12.5px] text-muted-foreground">
              <ArrowDownUp className="h-3.5 w-3.5" />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="h-9 rounded-xl border border-border bg-background px-2 text-[13px] text-foreground outline-none"
              >
                <option value="updated">Last updated</option>
                <option value="opened">Last opened</option>
                <option value="created">Date created</option>
                <option value="name">Name</option>
                <option value="records">Record count</option>
                <option value="owner">Owner</option>
              </select>
              <button
                type="button"
                onClick={() => setSortAsc((c) => !c)}
                className="rounded-lg border border-border px-2 py-1.5 text-[12px] hover:bg-muted/50"
              >
                {sortAsc ? 'Asc' : 'Desc'}
              </button>
            </label>
          </div>
        </div>

        {showFilters ? (
          <div className="grid gap-3 border-t border-border pt-3 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label="Owner"
              value={filters.owner}
              onChange={(owner) => setFilters((f) => ({ ...f, owner }))}
              options={['any', 'You', 'Alex Rivera', 'Morgan Lee']}
            />
            <FilterSelect
              label="Tag"
              value={filters.tag}
              onChange={(tag) => setFilters((f) => ({ ...f, tag }))}
              options={['any', 'crm', 'ops', 'support', 'ai', 'revenue']}
            />
            <FilterSelect
              label="Status"
              value={filters.status}
              onChange={(status) => setFilters((f) => ({ ...f, status }))}
              options={['any', 'active', 'draft', 'archived']}
            />
            <div className="space-y-1.5">
              <Label>Min records</Label>
              <Input
                value={filters.minRecords}
                onChange={(e) => setFilters((f) => ({ ...f, minRecords: e.target.value }))}
                placeholder="e.g. 1000"
              />
            </div>
            <label className="flex items-center gap-2 text-[13px] text-foreground sm:col-span-2">
              <input
                type="checkbox"
                checked={filters.favoritesOnly}
                onChange={(e) => setFilters((f) => ({ ...f, favoritesOnly: e.target.checked }))}
              />
              Favorites only
            </label>
            <label className="flex items-center gap-2 text-[13px] text-foreground sm:col-span-2">
              <input
                type="checkbox"
                checked={filters.sharedOnly}
                onChange={(e) => setFilters((f) => ({ ...f, sharedOnly: e.target.checked }))}
              />
              Shared with me
            </label>
            <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-4">
              <span className="text-[12px] font-medium text-muted-foreground">Presets:</span>
              {FILTER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setSavedPreset(preset.id)
                    if (preset.id === 'my-fav') {
                      setFilters((f) => ({ ...f, favoritesOnly: true, sharedOnly: false }))
                    } else if (preset.id === 'shared-edit') {
                      setFilters((f) => ({ ...f, sharedOnly: true, favoritesOnly: false }))
                    } else {
                      setFilters((f) => ({ ...f, minRecords: '1000' }))
                    }
                  }}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[12px]',
                    savedPreset === preset.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground',
                  )}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                className="text-[12px] font-medium text-primary"
                onClick={() =>
                  setFilters({
                    owner: 'any',
                    tag: 'any',
                    status: 'any',
                    sharedOnly: false,
                    favoritesOnly: false,
                    minRecords: '',
                  })
                }
              >
                Clear filters
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
          <span className="text-[13px] font-medium text-foreground">{selected.length} selected</span>
          <Button type="button" size="sm" variant="outline" onClick={() => applyBulk('favorite')}>
            Add favorites
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setModal('export')}>
            Export
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setModal('share')}>
            Share
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setModal('confirm-archive')}>
            Archive
          </Button>
          <Button type="button" size="sm" variant="destructive" onClick={() => setModal('confirm-delete')}>
            Delete
          </Button>
          <button
            type="button"
            className="ml-auto text-[12.5px] font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setSelected([])}
          >
            Clear
          </button>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <SectionCard
          title="Folders"
          actions={
            <button
              type="button"
              aria-label="Create folder"
              onClick={() =>
                setFolders((current) => [
                  ...current,
                  {
                    id: `folder-${Date.now()}`,
                    name: 'New folder',
                    parentId: null,
                    favorite: false,
                  },
                ])
              }
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted/50"
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </button>
          }
          padded={false}
        >
          <div className="py-2">
            {smartFolders.map((folder) => (
              <FolderButton
                key={folder.id}
                folder={folder}
                active={folderId === folder.id}
                onClick={() => {
                  setFolderId(folder.id)
                  setPage(1)
                }}
                dragOver={dragOverFolder === folder.id}
              />
            ))}
            <div className="my-2 border-t border-border" />
            {rootFolders.map((folder) => (
              <div key={folder.id}>
                <FolderButton
                  folder={folder}
                  active={folderId === folder.id}
                  expandable={folders.some((f) => f.parentId === folder.id)}
                  collapsed={collapsed[folder.id]}
                  onToggle={() =>
                    setCollapsed((c) => ({ ...c, [folder.id]: !c[folder.id] }))
                  }
                  onClick={() => {
                    setFolderId(folder.id)
                    setPage(1)
                  }}
                  onDragOver={() => setDragOverFolder(folder.id)}
                  onDragLeave={() => setDragOverFolder(null)}
                  onDrop={(sheetId) => {
                    moveToFolder(sheetId, folder.id)
                    setDragOverFolder(null)
                  }}
                  dragOver={dragOverFolder === folder.id}
                  onFavorite={() =>
                    setFolders((current) =>
                      current.map((f) =>
                        f.id === folder.id ? { ...f, favorite: !f.favorite } : f,
                      ),
                    )
                  }
                />
                {!collapsed[folder.id]
                  ? folders
                      .filter((f) => f.parentId === folder.id)
                      .map((child) => (
                        <FolderButton
                          key={child.id}
                          folder={child}
                          nested
                          active={folderId === child.id}
                          onClick={() => {
                            setFolderId(child.id)
                            setPage(1)
                          }}
                          onDragOver={() => setDragOverFolder(child.id)}
                          onDragLeave={() => setDragOverFolder(null)}
                          onDrop={(sheetId) => {
                            moveToFolder(sheetId, child.id)
                            setDragOverFolder(null)
                          }}
                          dragOver={dragOverFolder === child.id}
                        />
                      ))
                  : null}
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13.5px] text-muted-foreground">
              Showing {pageItems.length} of {filtered.length}
            </p>
            <button
              type="button"
              onClick={selectAllVisible}
              className="text-[12.5px] font-medium text-primary"
            >
              {pageItems.every((s) => selected.includes(s.id)) && pageItems.length > 0
                ? 'Deselect page'
                : 'Select page'}
            </button>
          </div>

          {pageItems.length === 0 ? (
            <SectionCard>
              <EmptyState
                icon={<FileSpreadsheet className="h-5 w-5" />}
                title={emptyCopy.title}
                description={emptyCopy.description}
                actionLabel={emptyCopy.action}
                onAction={() => {
                  if (query.trim()) {
                    setQuery('')
                    return
                  }
                  if (folderId === 'favorites' || folderId === 'shared' || folderId === 'archived') {
                    setFolderId('all')
                    return
                  }
                  if (emptyCopy.modal) setModal(emptyCopy.modal)
                }}
              />
            </SectionCard>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {pageItems.map((sheet) => (
                <SheetCard
                  key={sheet.id}
                  sheet={sheet}
                  selected={selected.includes(sheet.id)}
                  menuOpen={menuId === sheet.id}
                  onOpen={() => openSheet(sheet.id)}
                  onSelect={() => toggleSelect(sheet.id)}
                  onMenu={() => setMenuId((c) => (c === sheet.id ? null : sheet.id))}
                  onAction={(action) => handleAction(action, sheet)}
                  onDragStart={() => undefined}
                />
              ))}
            </div>
          ) : (
            <SectionCard padded={false}>
              <div className="divide-y divide-border">
                {pageItems.map((sheet) => (
                  <SheetListRow
                    key={sheet.id}
                    sheet={sheet}
                    selected={selected.includes(sheet.id)}
                    menuOpen={menuId === sheet.id}
                    onOpen={() => openSheet(sheet.id)}
                    onSelect={() => toggleSelect(sheet.id)}
                    onMenu={() => setMenuId((c) => (c === sheet.id ? null : sheet.id))}
                    onAction={(action) => handleAction(action, sheet)}
                  />
                ))}
              </div>
            </SectionCard>
          )}

          <div className="flex items-center justify-between">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-[12.5px] text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {modal === 'create' ? (
        <Modal title="Create sheet" onClose={() => setModal(null)}>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Blank sheet', desc: 'Start empty and add fields', action: createBlank },
              { label: 'From template', desc: 'Install a starter structure', action: () => setModal('templates') },
              { label: 'AI generation', desc: 'Describe the system you need', action: () => setModal('ai') },
              { label: 'CSV / Excel import', desc: 'Upload a file and map columns', action: () => { setImportStep(1); setModal('import') } },
              { label: 'Google Sheets', desc: 'Connect and sync a sheet', action: () => { setImportStep(1); setModal('import') } },
              { label: 'Database import', desc: 'Pull from SQL or another workspace', action: () => { setImportStep(1); setModal('import') } },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className="rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:bg-muted/40"
              >
                <p className="text-[14px] font-medium text-foreground">{item.label}</p>
                <p className="mt-1 text-[12.5px] text-muted-foreground">{item.desc}</p>
              </button>
            ))}
          </div>
        </Modal>
      ) : null}

      {modal === 'ai' ? (
        <Modal title="AI generate sheet" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ai-prompt">Describe the system</Label>
              <textarea
                id="ai-prompt"
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-[14px] text-foreground outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['CRM', 'Inventory', 'School Management', 'HR', 'Project Tracker', 'Tender Management'].map(
                (example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setAiPrompt(`Build a ${example} sheet with common fields`)}
                    className="rounded-full border border-border px-2.5 py-1 text-[12px] text-muted-foreground hover:text-foreground"
                  >
                    {example}
                  </button>
                ),
              )}
            </div>
            <SectionCard title="Preview" description="Generated before creation">
              <ul className="space-y-2 text-[13px] text-muted-foreground">
                <li>Accounts · 12 fields</li>
                <li>Contacts · related to Accounts</li>
                <li>Deals · currency + stage select</li>
              </ul>
            </SectionCard>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModal(null)}>
                Edit later
              </Button>
              <Button type="button" variant="accent" onClick={createBlank}>
                Create & open builder
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}

      {modal === 'templates' ? (
        <Modal title="Browse templates" onClose={() => setModal(null)}>
          <div className="mb-4">
            <Input placeholder="Search templates…" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {SHEET_TEMPLATES.map((template) => (
              <div key={template.id} className="rounded-2xl border border-border bg-background p-4">
                <p className="text-[14px] font-medium text-foreground">{template.name}</p>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  {template.category} · {template.fields} fields
                </p>
                <div className="mt-3 flex gap-2">
                  <Button type="button" size="sm" variant="outline">
                    Preview
                  </Button>
                  <Button type="button" size="sm" variant="accent" onClick={createBlank}>
                    Install
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      ) : null}

      {modal === 'import' ? (
        <Modal title="Import sheet" onClose={() => setModal(null)}>
          <div className="mb-4 flex flex-wrap gap-2">
            {['Source', 'Preview', 'Map columns', 'Validate', 'Summary'].map((step, index) => (
              <span
                key={step}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[11.5px] font-medium',
                  importStep === index + 1
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground',
                )}
              >
                {index + 1}. {step}
              </span>
            ))}
          </div>
          {importStep === 1 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {['CSV', 'Excel', 'Google Sheets', 'Airtable', 'Notion', 'JSON', 'SQL', 'Existing workspace'].map(
                (source) => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => setImportStep(2)}
                    className="rounded-xl border border-border px-3 py-3 text-left text-[13px] font-medium hover:bg-muted/40"
                  >
                    {source}
                  </button>
                ),
              )}
            </div>
          ) : null}
          {importStep === 2 ? (
            <div className="space-y-3 text-[13px] text-muted-foreground">
              <p>Previewing 250 rows · 14 columns detected</p>
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="grid grid-cols-3 border-b border-border bg-card px-3 py-2 text-[12px] font-semibold text-foreground">
                  <span>Name</span>
                  <span>Email</span>
                  <span>Status</span>
                </div>
                <div className="grid grid-cols-3 px-3 py-2">
                  <span>Acme</span>
                  <span>a@acme.com</span>
                  <span>Open</span>
                </div>
              </div>
              <Button type="button" variant="accent" onClick={() => setImportStep(3)}>
                Continue mapping
              </Button>
            </div>
          ) : null}
          {importStep === 3 ? (
            <div className="space-y-3 text-[13px]">
              <p className="text-muted-foreground">Map source columns to sheet fields. Missing fields can be created automatically.</p>
              {['Name → Name', 'Email → Email (unique)', 'Amount → Deal value (new field)'].map((row) => (
                <div key={row} className="rounded-xl border border-border px-3 py-2">
                  {row}
                </div>
              ))}
              <Button type="button" variant="accent" onClick={() => setImportStep(4)}>
                Validate
              </Button>
            </div>
          ) : null}
          {importStep === 4 ? (
            <div className="space-y-3 text-[13px] text-muted-foreground">
              <p>3 duplicate emails detected · 2 missing required values</p>
              <p>Create 1 new field · Merge 5 existing records</p>
              <Button type="button" variant="accent" onClick={() => setImportStep(5)}>
                Review summary
              </Button>
            </div>
          ) : null}
          {importStep === 5 ? (
            <div className="space-y-3">
              <SectionCard title="Import summary">
                <ul className="space-y-1 text-[13px] text-muted-foreground">
                  <li>248 rows ready</li>
                  <li>1 new field</li>
                  <li>5 merges</li>
                  <li>2 rows skipped</li>
                </ul>
              </SectionCard>
              <Button type="button" variant="accent" className="w-full" onClick={createBlank}>
                Confirm import & open
              </Button>
            </div>
          ) : null}
        </Modal>
      ) : null}

      {modal === 'export' ? (
        <Modal title="Export" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <p className="text-[13px] text-muted-foreground">
              Export {selected.length > 0 ? `${selected.length} selected sheets` : 'current sheet / view'}.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {['CSV', 'Excel', 'JSON', 'PDF', 'Google Sheets'].map((format) => (
                <button
                  key={format}
                  type="button"
                  className="rounded-xl border border-border px-3 py-3 text-left text-[13px] font-medium hover:bg-muted/40"
                  onClick={() => setModal(null)}
                >
                  {format}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 text-[12.5px]">
              {['Entire sheet', 'Current view', 'Selected records', 'Filtered records'].map((scope) => (
                <span key={scope} className="rounded-full border border-border px-2.5 py-1 text-muted-foreground">
                  {scope}
                </span>
              ))}
            </div>
          </div>
        </Modal>
      ) : null}

      {modal === 'share' ? (
        <Modal title="Share sheet" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <Input placeholder="Invite by email…" />
            <div className="flex flex-wrap gap-2">
              {['View', 'Comment', 'Edit', 'Admin'].map((level) => (
                <span key={level} className="rounded-full border border-border px-2.5 py-1 text-[12px] text-muted-foreground">
                  {level}
                </span>
              ))}
            </div>
            <p className="text-[13px] text-muted-foreground">Share with users, teams, roles, or a public link.</p>
            <Button type="button" variant="outline" className="w-full">
              <Link2 className="h-3.5 w-3.5" />
              Copy secure link
            </Button>
          </div>
        </Modal>
      ) : null}

      {modal === 'confirm-delete' || modal === 'confirm-archive' ? (
        <Modal
          title={modal === 'confirm-delete' ? 'Delete sheets?' : 'Archive sheets?'}
          onClose={() => setModal(null)}
        >
          <p className="text-[14px] text-muted-foreground">
            {modal === 'confirm-delete'
              ? 'This permanently removes the selected sheets and cannot be undone.'
              : 'Archived sheets can be restored later from the Archived folder.'}
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={modal === 'confirm-delete' ? 'destructive' : 'accent'}
              onClick={() => applyBulk(modal === 'confirm-delete' ? 'delete' : 'archive')}
            >
              Confirm
            </Button>
          </div>
        </Modal>
      ) : null}

      {detailsId ? (
        <DetailsDrawer
          sheet={sheets.find((s) => s.id === detailsId)!}
          onClose={() => setDetailsId(null)}
          onOpen={() => openSheet(detailsId)}
        />
      ) : null}
    </div>
  )
}

function getEmptyCopy(folderId: string, query: string) {
  if (query.trim()) {
    return {
      title: 'No search results',
      description: 'Try another keyword or clear filters to broaden results.',
      action: 'Clear search',
      modal: null as Modal,
    }
  }
  if (folderId === 'favorites') {
    return {
      title: 'No favorites yet',
      description: 'Star sheets you use often to keep them one click away.',
      action: 'Browse all sheets',
      modal: null as Modal,
    }
  }
  if (folderId === 'archived') {
    return {
      title: 'No archived sheets',
      description: 'Archive unused sheets to keep your library focused.',
      action: 'Create sheet',
      modal: 'create' as Modal,
    }
  }
  if (folderId === 'shared') {
    return {
      title: 'No shared sheets',
      description: 'Sheets shared with you will appear here with permission level.',
      action: 'Create sheet',
      modal: 'create' as Modal,
    }
  }
  return {
    title: 'No sheets yet',
    description: 'Create a blank sheet, install a template, or generate one with AI.',
    action: 'Create sheet',
    modal: 'create' as Modal,
  }
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-11 w-full rounded-xl border border-border bg-background px-3 text-[14px] text-foreground outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

function FolderButton({
  folder,
  active,
  nested,
  expandable,
  collapsed,
  onToggle,
  onClick,
  onFavorite,
  onDragOver,
  onDragLeave,
  onDrop,
  dragOver,
}: {
  folder: SheetFolder
  active?: boolean
  nested?: boolean
  expandable?: boolean
  collapsed?: boolean
  onToggle?: () => void
  onClick: () => void
  onFavorite?: () => void
  onDragOver?: () => void
  onDragLeave?: () => void
  onDrop?: (sheetId: string) => void
  dragOver?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 px-2',
        nested && 'pl-6',
        dragOver && 'bg-primary/10',
      )}
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver?.()
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault()
        const sheetId = e.dataTransfer.getData('text/sheet-id')
        if (sheetId) onDrop?.(sheetId)
      }}
    >
      {expandable ? (
        <button type="button" onClick={onToggle} className="text-muted-foreground">
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      ) : (
        <span className="w-3.5" />
      )}
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-2 text-left text-[13px] font-medium',
          active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
        )}
      >
        <Folder className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{folder.name}</span>
      </button>
      {onFavorite ? (
        <button type="button" onClick={onFavorite} className="p-1 text-muted-foreground hover:text-foreground">
          <Star className={cn('h-3.5 w-3.5', folder.favorite && 'fill-amber-400 text-amber-400')} />
        </button>
      ) : null}
    </div>
  )
}

function SheetCard({
  sheet,
  selected,
  menuOpen,
  onOpen,
  onSelect,
  onMenu,
  onAction,
}: {
  sheet: SheetItem
  selected: boolean
  menuOpen: boolean
  onOpen: () => void
  onSelect: () => void
  onMenu: () => void
  onAction: (action: string) => void
  onDragStart: () => void
}) {
  return (
    <article
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/sheet-id', sheet.id)}
      className={cn(
        'relative flex flex-col rounded-2xl border bg-card p-4 transition-colors',
        selected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/20',
      )}
    >
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={selected} onChange={onSelect} className="mt-1" />
        <button
          type="button"
          onClick={onOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-[13px] font-semibold text-primary"
        >
          {sheet.icon}
        </button>
        <div className="min-w-0 flex-1">
          <button type="button" onClick={onOpen} className="flex items-center gap-1.5 text-left">
            <span className="truncate text-[14px] font-semibold text-foreground">{sheet.name}</span>
            {sheet.favorite ? <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> : null}
            {sheet.pinned ? <Pin className="h-3.5 w-3.5 text-primary" /> : null}
          </button>
          <p className="mt-1 line-clamp-2 text-[12.5px] text-muted-foreground">{sheet.description}</p>
        </div>
        <div className="relative">
          <button
            type="button"
            aria-label="Quick actions"
            onClick={onMenu}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted/50"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen ? <QuickMenu sheet={sheet} onAction={onAction} /> : null}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {sheet.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
            {tag}
          </span>
        ))}
        {sheet.shared ? (
          <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
            Shared · {sheet.permission}
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[12px] text-muted-foreground">
        <span>
          {sheet.folder} · {sheet.records.toLocaleString()} records · {sheet.fields} fields
        </span>
        <span>{sheet.updated}</span>
      </div>
    </article>
  )
}

function SheetListRow({
  sheet,
  selected,
  menuOpen,
  onOpen,
  onSelect,
  onMenu,
  onAction,
}: {
  sheet: SheetItem
  selected: boolean
  menuOpen: boolean
  onOpen: () => void
  onSelect: () => void
  onMenu: () => void
  onAction: (action: string) => void
}) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/sheet-id', sheet.id)}
      className={cn('flex items-center gap-3 px-4 py-3', selected && 'bg-primary/5')}
    >
      <input type="checkbox" checked={selected} onChange={onSelect} />
      <button
        type="button"
        onClick={onOpen}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-[12px] font-semibold text-primary"
      >
        {sheet.icon}
      </button>
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <p className="truncate text-[13.5px] font-medium text-foreground">
          {sheet.name}{' '}
          {sheet.favorite ? <Star className="inline h-3 w-3 fill-amber-400 text-amber-400" /> : null}
        </p>
        <p className="truncate text-[12px] text-muted-foreground">
          {sheet.folder} · {sheet.owner} · {sheet.records.toLocaleString()} records · {sheet.permission} ·{' '}
          {sheet.updated}
        </p>
      </button>
      <div className="relative">
        <button
          type="button"
          onClick={onMenu}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {menuOpen ? <QuickMenu sheet={sheet} onAction={onAction} /> : null}
      </div>
    </div>
  )
}

function QuickMenu({
  sheet,
  onAction,
}: {
  sheet: SheetItem
  onAction: (action: string) => void
}) {
  const items: { id: string; label: string; icon: typeof Eye; destructive?: boolean }[] = [
    { id: 'open', label: 'Open', icon: ExternalLink },
    { id: 'favorite', label: sheet.favorite ? 'Unfavorite' : 'Add to favorites', icon: Star },
    { id: 'pin', label: sheet.pinned ? 'Unpin' : 'Pin', icon: Pin },
    { id: 'duplicate', label: 'Duplicate', icon: Copy },
    { id: 'share', label: 'Share', icon: Share2 },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'copy-link', label: 'Copy link', icon: Link2 },
    { id: 'details', label: 'View details', icon: Eye },
    { id: 'settings', label: 'Open settings', icon: Settings2 },
    { id: 'archive', label: sheet.archived ? 'Restore' : 'Archive', icon: Archive },
    { id: 'delete', label: 'Delete', icon: Trash2, destructive: true },
  ]
  return (
    <div className="absolute right-0 top-9 z-20 w-48 overflow-hidden rounded-xl border border-border bg-background py-1">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onAction(item.id)}
          className={cn(
            'flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] hover:bg-muted/60',
            item.destructive ? 'text-red-500' : 'text-foreground',
          )}
        >
          <item.icon className="h-3.5 w-3.5" />
          {item.label}
        </button>
      ))}
    </div>
  )
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function DetailsDrawer({
  sheet,
  onClose,
  onOpen,
}: {
  sheet: SheetItem
  onClose: () => void
  onOpen: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-overlay">
      <div className="flex h-full w-full max-w-md flex-col border-l border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Sheet details
            </p>
            <h2 className="text-[18px] font-semibold text-foreground">{sheet.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close details">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-5 text-[13.5px]">
          <p className="text-muted-foreground">{sheet.description}</p>
          <dl className="space-y-2">
            <Detail label="Owner" value={sheet.owner} />
            <Detail label="Created" value={sheet.created} />
            <Detail label="Last modified" value={sheet.updated} />
            <Detail label="Last opened" value={sheet.lastOpened} />
            <Detail label="Records" value={sheet.records.toLocaleString()} />
            <Detail label="Fields" value={String(sheet.fields)} />
            <Detail label="Storage" value={sheet.storage} />
            <Detail label="Permission" value={sheet.permission} />
          </dl>
          <div>
            <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-foreground">
              <History className="h-3.5 w-3.5" />
              Activity summary
            </div>
            <ul className="space-y-2 text-[12.5px] text-muted-foreground">
              {SHEET_ACTIVITY.map((item) => (
                <li key={item.id} className="rounded-xl border border-border px-3 py-2">
                  {item.text}
                  <span className="mt-1 block text-[11px]">{item.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border p-4">
          <Button type="button" variant="accent" className="w-full" onClick={onOpen}>
            Open in Sheet Builder
          </Button>
        </div>
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  )
}
