import { Outlet } from 'react-router-dom'

import { ThemeToggle } from '@/components/theme-toggle'

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-12 sm:px-6">
      <div className="absolute right-5 top-5 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        <Outlet />
      </div>
    </div>
  )
}
