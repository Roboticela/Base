import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Archive,
  Building2,
  Download,
  Eye,
  LayoutTemplate,
  LogOut,
  MoreHorizontal,
  Pin,
  Plus,
  Search,
  Star,
  Users,
} from 'lucide-react'

import { EmptyState } from '@/components/app/EmptyState'
import { PageHeader } from '@/components/app/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MOCK_WORKSPACES, type Workspace } from '@/data/workspaces'
import { cn } from '@/lib/utils'

type FilterId = 'all' | 'recent' | 'favorites' | 'owned' | 'archived'

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'recent', label: 'Recently Used' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'owned', label: 'Owned by Me' },
  { id: 'archived', label: 'Archived' },
]

export function WorkspaceSelectionPage() {
  const navigate = useNavigate()
  const [workspaces, setWorkspaces] = useState(MOCK_WORKSPACES)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterId>('all')
  const [menuId, setMenuId] = useState<string | null>(null)
  const [detailsId, setDetailsId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = [...workspaces]
    if (filter === 'favorites') list = list.filter((item) => item.favorite)
    if (filter === 'owned') list = list.filter((item) => item.role === 'Owner')
    if (filter === 'archived') list = list.filter((item) => item.status === 'archived')
    else if (filter !== 'all') list = list.filter((item) => item.status !== 'archived')
    if (filter === 'recent') {
      list = list.filter((item) => item.status !== 'archived')
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q),
      )
    }
    if (filter === 'recent' || filter === 'all') {
      list.sort((a, b) => Number(b.pinned) - Number(a.pinned) || Number(b.favorite) - Number(a.favorite))
    }
    return list
  }, [workspaces, query, filter])

  function updateWorkspace(id: string, patch: Partial<Workspace>) {
    setWorkspaces((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    )
  }

  const details = workspaces.find((item) => item.id === detailsId)

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspaces"
        title="Choose a workspace"
        description="Open a workspace, create a new one, or join an existing team."
        actions={
          <>
            <Button type="button" variant="outline" onClick={() => navigate('/join-workspace')}>
              Join Workspace
            </Button>
            <Button type="button" variant="accent" onClick={() => navigate('/workspaces/new')}>
              <Plus className="h-4 w-4" />
              Create Workspace
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Create Workspace', icon: Plus, to: '/workspaces/new' },
          { label: 'Join Workspace', icon: Users, to: '/join-workspace' },
          { label: 'Browse Templates', icon: LayoutTemplate, to: '/workspaces/new?mode=template' },
          { label: 'Import Existing Data', icon: Download, to: '/workspaces/new?mode=import' },
        ].map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-[13.5px] font-medium text-foreground transition-colors hover:bg-muted/50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-primary">
              <action.icon className="h-4 w-4" />
            </span>
            {action.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search workspaces…"
            className="h-10 pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors',
                filter === item.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card">
          <EmptyState
            icon={<Building2 className="h-5 w-5" />}
            title="No workspaces found"
            description="Create a workspace from scratch or start from a template to get going."
            actionLabel="Create Workspace"
            onAction={() => navigate('/workspaces/new')}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((workspace) => (
            <article
              key={workspace.id}
              className="relative flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[13px] font-semibold text-white"
                    style={{ backgroundColor: workspace.color }}
                  >
                    {workspace.initials}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-[15px] font-semibold text-foreground">
                        {workspace.name}
                      </h2>
                      {workspace.favorite ? (
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ) : null}
                      {workspace.pinned ? <Pin className="h-3.5 w-3.5 text-primary" /> : null}
                    </div>
                    <p className="mt-0.5 text-[12.5px] text-muted-foreground">/{workspace.slug}</p>
                  </div>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    aria-label={`Actions for ${workspace.name}`}
                    onClick={() => setMenuId((current) => (current === workspace.id ? null : workspace.id))}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {menuId === workspace.id ? (
                    <div className="absolute right-0 top-10 z-10 w-48 overflow-hidden rounded-xl border border-border bg-background py-1">
                      <MenuAction
                        icon={Eye}
                        label="View details"
                        onClick={() => {
                          setDetailsId(workspace.id)
                          setMenuId(null)
                        }}
                      />
                      <MenuAction
                        icon={Star}
                        label={workspace.favorite ? 'Unfavorite' : 'Mark favorite'}
                        onClick={() => {
                          updateWorkspace(workspace.id, { favorite: !workspace.favorite })
                          setMenuId(null)
                        }}
                      />
                      <MenuAction
                        icon={Pin}
                        label={workspace.pinned ? 'Unpin' : 'Pin workspace'}
                        onClick={() => {
                          updateWorkspace(workspace.id, { pinned: !workspace.pinned })
                          setMenuId(null)
                        }}
                      />
                      {workspace.role === 'Owner' || workspace.role === 'Admin' ? (
                        <MenuAction
                          icon={Archive}
                          label={workspace.status === 'archived' ? 'Unarchive' : 'Archive'}
                          onClick={() => {
                            updateWorkspace(workspace.id, {
                              status: workspace.status === 'archived' ? 'active' : 'archived',
                            })
                            setMenuId(null)
                          }}
                        />
                      ) : null}
                      <MenuAction
                        icon={LogOut}
                        label="Leave workspace"
                        destructive
                        onClick={() => {
                          setWorkspaces((current) => current.filter((item) => item.id !== workspace.id))
                          setMenuId(null)
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <p className="mt-4 line-clamp-2 flex-1 text-[13.5px] leading-relaxed text-muted-foreground">
                {workspace.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
                <span className="rounded-full border border-border px-2.5 py-1 text-muted-foreground">
                  {workspace.memberCount} members
                </span>
                <span className="rounded-full border border-border px-2.5 py-1 text-muted-foreground">
                  {workspace.role}
                </span>
                <span
                  className={cn(
                    'rounded-full border px-2.5 py-1 capitalize',
                    workspace.status === 'active'
                      ? 'border-emerald-500/30 text-emerald-500'
                      : 'border-border text-muted-foreground',
                  )}
                >
                  {workspace.status}
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
                <p className="text-[12.5px] text-muted-foreground">Last accessed {workspace.lastAccessed}</p>
                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  onClick={() => navigate(`/w/${workspace.id}`)}
                >
                  Open
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {details ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6">
            <div className="flex items-center gap-3">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-[13px] font-semibold text-white"
                style={{ backgroundColor: details.color }}
              >
                {details.initials}
              </span>
              <div>
                <h3 className="text-[17px] font-semibold text-foreground">{details.name}</h3>
                <p className="text-[13px] text-muted-foreground">/{details.slug}</p>
              </div>
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">{details.description}</p>
            <dl className="mt-5 space-y-2.5 text-[13.5px]">
              <DetailRow label="Members" value={String(details.memberCount)} />
              <DetailRow label="Your role" value={details.role} />
              <DetailRow label="Status" value={details.status} />
              <DetailRow label="Last accessed" value={details.lastAccessed} />
            </dl>
            <div className="mt-6 flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setDetailsId(null)}>
                Close
              </Button>
              <Button
                type="button"
                variant="accent"
                className="flex-1"
                onClick={() => navigate(`/w/${details.id}`)}
              >
                Open workspace
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function MenuAction({
  icon: Icon,
  label,
  onClick,
  destructive,
}: {
  icon: typeof Star
  label: string
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-muted/60',
        destructive ? 'text-red-500' : 'text-foreground',
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium capitalize text-foreground">{value}</dd>
    </div>
  )
}
