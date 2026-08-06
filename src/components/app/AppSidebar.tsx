import { Link, useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'

import { Logo } from '@/components/shared/Logo'
import { getWorkspaceNav } from '@/lib/app-nav'
import { cn } from '@/lib/utils'
import { MOCK_WORKSPACES } from '@/data/workspaces'

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  active: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      to={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium leading-snug transition-colors duration-200',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
      )}
    >
      <Icon
        className={cn(
          'h-[17px] w-[17px] shrink-0',
          active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
        )}
        strokeWidth={1.75}
      />
      <span className="min-w-0">{label}</span>
    </Link>
  )
}

export function SidebarNav({
  onNavigate,
  pathname,
}: {
  onNavigate?: () => void
  pathname: string
}) {
  const { workspaceId = 'ws-acme' } = useParams()
  const workspace = MOCK_WORKSPACES.find((item) => item.id === workspaceId) ?? MOCK_WORKSPACES[0]
  const { primary, secondary } = getWorkspaceNav(workspace.id)

  function isActive(href: string) {
    if (href === `/w/${workspace.id}`) return pathname === href
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className="flex h-full flex-col">
      <Link
        to={`/w/${workspace.id}`}
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-2"
      >
        <Logo showWordmark={false} markClassName="h-8 w-8" />
        <span className="min-w-0 truncate text-[14px] font-semibold text-foreground">
          {workspace.name}
        </span>
      </Link>

      <div className="mt-5 px-2">
        <Link
          to={`/w/${workspace.id}/sheets`}
          onClick={onNavigate}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Create Sheet
        </Link>
      </div>

      <nav className="mt-5 flex flex-1 flex-col gap-0.5 overflow-y-auto px-2" aria-label="Primary">
        {primary.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={isActive(item.href)}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="mt-3 flex flex-col gap-0.5 border-t border-border px-2 pt-3">
        {secondary.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={isActive(item.href)}
            onNavigate={onNavigate}
          />
        ))}
        <Link
          to={`/w/${workspace.id}/profile`}
          onClick={onNavigate}
          className="rounded-xl px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          Profile
        </Link>
        <Link
          to="/help"
          onClick={onNavigate}
          className="rounded-xl px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          Help
        </Link>
        <Link
          to="/admin"
          onClick={onNavigate}
          className="rounded-xl px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          Admin
        </Link>
        <Link
          to="/workspaces"
          onClick={onNavigate}
          className="rounded-xl px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          Switch workspace
        </Link>
      </div>
    </div>
  )
}

export function AppSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[268px] shrink-0 border-r border-border bg-card pt-3 pb-5 lg:flex">
      <div className="flex h-full w-full flex-col px-3">
        <SidebarNav pathname={pathname} />
      </div>
    </aside>
  )
}
