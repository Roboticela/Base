import { Link } from 'react-router-dom'

import { AuthCard } from '@/components/auth/AuthCard'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { ThemeToggle } from '@/components/theme-toggle'

const AUTH_PAGES = [
  { to: '/login', label: 'Login', description: 'Email, password, social, remember me' },
  { to: '/register', label: 'Register', description: 'Profile fields, strength meter, terms' },
  { to: '/forgot-password', label: 'Forgot Password', description: 'Reset link request + resend' },
  { to: '/reset-password', label: 'Reset Password', description: 'New password + confirmation' },
  { to: '/email-verification', label: 'Email Verification', description: 'Status, resend, countdown' },
  { to: '/email-verified', label: 'Email Verified', description: 'Success + auto redirect' },
  { to: '/two-factor', label: 'Two-Factor Authentication', description: 'OTP inputs + recovery codes' },
  { to: '/accept-invitation', label: 'Accept Invitation', description: 'Workspace invite review' },
  { to: '/join-workspace', label: 'Join Workspace', description: 'Code, URL, or request access' },
  { to: '/session-expired', label: 'Session Expired', description: 'Re-authenticate after timeout' },
  { to: '/account-locked', label: 'Account Locked', description: 'Lock reason + recovery paths' },
]

export function AuthIndexPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-background px-4 py-12 sm:px-6">
      <div className="absolute right-5 top-5 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[640px]">
        <AuthCard>
          <AuthHeader
            eyebrow="Design preview"
            title="Authentication"
            description="Centered auth layouts matching the redesign system. UI only — no backend."
          />

          <ul className="divide-y divide-border rounded-xl border border-border">
            {AUTH_PAGES.map((page) => (
              <li key={page.to}>
                <Link
                  to={page.to}
                  className="flex items-start justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/50"
                >
                  <span>
                    <span className="block text-[14.5px] font-medium text-foreground">{page.label}</span>
                    <span className="mt-0.5 block text-[13px] text-muted-foreground">
                      {page.description}
                    </span>
                  </span>
                  <span className="shrink-0 pt-0.5 text-[13px] font-medium text-primary">{page.to}</span>
                </Link>
              </li>
            ))}
          </ul>
        </AuthCard>
      </div>
    </div>
  )
}
