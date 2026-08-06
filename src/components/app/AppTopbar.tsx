import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Bell, Menu, Search, X } from 'lucide-react'

import { SidebarNav } from '@/components/app/AppSidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Input } from '@/components/ui/input'
import { MOCK_WORKSPACES } from '@/data/workspaces'
import { cn } from '@/lib/utils'

export function AppTopbar() {
  const location = useLocation()
  const { workspaceId = 'ws-acme' } = useParams()
  const workspace = MOCK_WORKSPACES.find((item) => item.id === workspaceId) ?? MOCK_WORKSPACES[0]
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted/60 lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="hidden min-w-0 flex-1 items-center gap-2 lg:flex">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search sheets, records, users…"
              className="h-10 pl-9"
              aria-label="Global workspace search"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSearchOpen((current) => !current)}
          aria-label="Toggle search"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted/60 lg:hidden"
        >
          <Search className="h-4 w-4" />
        </button>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/workspaces"
            className="hidden max-w-[160px] truncate rounded-full border border-border px-3 py-1.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground sm:inline-flex"
          >
            {workspace.name}
          </Link>
          <button
            type="button"
            aria-label="Notifications"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted/60"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          </button>
          <ThemeToggle />
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-primary/10 text-[12px] font-semibold text-primary">
            JA
          </div>
        </div>
      </header>

      {searchOpen ? (
        <div className="border-b border-border bg-background px-4 py-3 lg:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search workspace…"
              className="h-10 pl-9"
              autoFocus
            />
          </div>
        </div>
      ) : null}

      {query.trim() ? (
        <div className="border-b border-border bg-card px-4 py-3 sm:px-6">
          <p className="text-[12.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Quick results
          </p>
          <ul className="mt-2 space-y-1">
            {['Customers sheet', 'Jordan Avery', 'Weekly revenue report', 'Lead nurture automation']
              .filter((item) => item.toLowerCase().includes(query.toLowerCase()))
              .map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="w-full rounded-lg px-3 py-2 text-left text-[13.5px] text-foreground transition-colors hover:bg-muted/60"
                    onClick={() => setQuery('')}
                  >
                    {item}
                  </button>
                </li>
              ))}
          </ul>
        </div>
      ) : null}

      {mobileOpen ? (
        <>
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="fixed inset-0 z-40 bg-overlay lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={cn(
              'fixed inset-y-0 left-0 z-50 w-[260px] border-r border-border bg-card pt-3 pb-5 lg:hidden',
            )}
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted/60"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="px-3 pt-6">
              <SidebarNav pathname={location.pathname} onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </>
      ) : null}
    </>
  )
}
