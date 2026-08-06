import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@/hooks/use-theme'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all duration-200 hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95',
        className,
      )}
    >
      {theme === 'dark' ? (
        <Sun className="h-[17px] w-[17px]" />
      ) : (
        <Moon className="h-[17px] w-[17px]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
