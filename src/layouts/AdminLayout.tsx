import { Link, Outlet } from 'react-router-dom'

import { ThemeToggle } from '@/components/theme-toggle'

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
        <nav className="flex items-center gap-4 text-[13.5px] font-medium">
          <span className="text-foreground">Admin</span>
          <Link
            to="/workspaces"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to workspaces
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-primary/10 text-[12px] font-semibold text-primary">
            SA
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
