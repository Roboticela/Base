import { Link } from 'react-router-dom'

import { AuthCard } from '@/components/auth/AuthCard'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { ThemeToggle } from '@/components/theme-toggle'

const SECTIONS: { title: string; pages: { to: string; label: string; description: string }[] }[] = [
  {
    title: 'Auth',
    pages: [
      { to: '/login', label: 'Login', description: 'Sign in' },
      { to: '/register', label: 'Register', description: 'Create account' },
      { to: '/workspaces', label: 'Workspaces', description: 'Selection + create' },
    ],
  },
  {
    title: 'Core workspace',
    pages: [
      { to: '/w/ws-acme', label: 'Dashboard', description: 'Workspace home' },
      { to: '/w/ws-acme/sheets', label: 'Sheets', description: 'All sheets + folders' },
      {
        to: '/w/ws-acme/sheets/sheet-customers',
        label: 'Sheet Builder',
        description: 'Table, panels, views',
      },
      {
        to: '/w/ws-acme/sheets/sheet-customers/records/r1',
        label: 'Record Details',
        description: 'Single record hub',
      },
      {
        to: '/w/ws-acme/sheets/sheet-customers/views',
        label: 'Views',
        description: 'Table through Map',
      },
      {
        to: '/w/ws-acme/sheets/sheet-customers/settings',
        label: 'Sheet Settings',
        description: 'Fields, rules, API',
      },
    ],
  },
  {
    title: 'AI & Automations',
    pages: [
      { to: '/w/ws-acme/ai-builder', label: 'AI Workspace Builder', description: 'Generate workspace' },
      { to: '/w/ws-acme/ai', label: 'AI Chat', description: 'Assistant' },
      { to: '/w/ws-acme/automations', label: 'Automations', description: 'Visual builder' },
    ],
  },
  {
    title: 'Ops & growth',
    pages: [
      { to: '/w/ws-acme/email', label: 'Email Center', description: 'Inbox to campaigns' },
      { to: '/w/ws-acme/reports', label: 'Reports', description: 'Analytics' },
      { to: '/w/ws-acme/templates', label: 'Templates', description: 'Marketplace' },
      { to: '/w/ws-acme/forms', label: 'Public Forms', description: 'Form builder' },
      { to: '/w/ws-acme/team', label: 'Team', description: 'Members & roles' },
    ],
  },
  {
    title: 'Account & platform',
    pages: [
      { to: '/w/ws-acme/notifications', label: 'Notifications', description: 'Alerts & prefs' },
      { to: '/w/ws-acme/profile', label: 'Profile', description: 'Personal settings' },
      { to: '/w/ws-acme/settings', label: 'Workspace Settings', description: 'General & AI' },
      { to: '/w/ws-acme/billing', label: 'Billing', description: 'Plans & invoices' },
      { to: '/w/ws-acme/integrations', label: 'Integrations', description: 'Connect apps' },
      { to: '/w/ws-acme/developers', label: 'API & Developers', description: 'Keys & playground' },
      { to: '/help', label: 'Help Center', description: 'Docs & support' },
      { to: '/admin', label: 'Admin Panel', description: 'Super admin' },
    ],
  },
]

export function AuthIndexPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-background px-4 py-12 sm:px-6">
      <div className="absolute right-5 top-5 z-10">
        <ThemeToggle />
      </div>

      <div className="flex w-full max-w-[720px] flex-col gap-6">
        <AuthCard>
          <AuthHeader
            eyebrow="Design preview"
            title="Base application"
            description="UI-only routes for auth, workspaces, sheets, AI, and platform admin."
          />
        </AuthCard>

        {SECTIONS.map((section) => (
          <AuthCard key={section.title}>
            <h2 className="mb-4 text-[15px] font-semibold text-foreground">{section.title}</h2>
            <ul className="divide-y divide-border rounded-xl border border-border">
              {section.pages.map((page) => (
                <li key={page.to}>
                  <Link
                    to={page.to}
                    className="flex items-start justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/50"
                  >
                    <span>
                      <span className="block text-[14.5px] font-medium text-foreground">
                        {page.label}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-muted-foreground">
                        {page.description}
                      </span>
                    </span>
                    <span className="shrink-0 pt-0.5 text-[12px] font-medium text-primary">
                      Open
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </AuthCard>
        ))}
      </div>
    </div>
  )
}
