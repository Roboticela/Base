import { Outlet, useLocation } from 'react-router-dom'

import { AppSidebar } from '@/components/app/AppSidebar'
import { AppTopbar } from '@/components/app/AppTopbar'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const location = useLocation()
  const isSheetBuilder =
    /\/sheets\/[^/]+$/.test(location.pathname) && !location.pathname.endsWith('/settings')
  const isAutomationBuilder = /\/automations\/[^/]+$/.test(location.pathname)
  const isImmersive = isSheetBuilder || isAutomationBuilder

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppSidebar pathname={location.pathname} />
      <div className="lg:pl-[268px]">
        {!isImmersive ? <AppTopbar /> : null}
        <main
          className={cn(
            isImmersive
              ? 'w-full'
              : 'mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 sm:py-8',
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
