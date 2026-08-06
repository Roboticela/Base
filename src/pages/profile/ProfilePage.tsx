import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Activity,
  Camera,
  KeyRound,
  Link2,
  LogOut,
  Shield,
  Trash2,
} from 'lucide-react'

import { ListRow } from '@/components/app/ListRow'
import { PageHeader } from '@/components/app/PageHeader'
import { SectionCard } from '@/components/app/SectionCard'
import { SettingsNav, SettingsShell } from '@/components/app/SettingsShell'
import { StatTile } from '@/components/app/StatTile'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type ProfileSection =
  | 'personal'
  | 'avatar'
  | 'password'
  | 'sessions'
  | 'security'
  | 'connected'
  | 'preferences'
  | 'tokens'
  | 'activity'

const SECTIONS: { id: ProfileSection; label: string }[] = [
  { id: 'personal', label: 'Personal Information' },
  { id: 'avatar', label: 'Avatar' },
  { id: 'password', label: 'Password' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'security', label: 'Security' },
  { id: 'connected', label: 'Connected Accounts' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'tokens', label: 'API Tokens' },
  { id: 'activity', label: 'Activity' },
]

export function ProfilePage() {
  const { workspaceId = 'ws-acme' } = useParams()
  const [section, setSection] = useState<ProfileSection>('personal')
  const [name, setName] = useState('Jordan Lee')
  const [email, setEmail] = useState('jordan@acme.co')
  const [title, setTitle] = useState('Head of Operations')
  const [timezone, setTimezone] = useState('America/Los_Angeles')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [twoFactor, setTwoFactor] = useState(true)
  const [emailDigest, setEmailDigest] = useState(true)
  const [productTips, setProductTips] = useState(false)
  const [tokenName, setTokenName] = useState('')
  const [initials, setInitials] = useState('JL')

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Manage your personal details, security, and connected services."
        actions={
          <Link
            to={`/w/${workspaceId}`}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/60"
          >
            Back to workspace
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Active sessions" value="3" meta="2 browsers · 1 mobile" />
        <StatTile label="2FA" value={twoFactor ? 'On' : 'Off'} meta="Authenticator app" />
        <StatTile label="API tokens" value="2" meta="1 expires soon" />
      </div>

      <SettingsShell
        nav={<SettingsNav items={SECTIONS} value={section} onChange={(id) => setSection(id as ProfileSection)} />}
      >
        {section === 'personal' ? (
          <SectionCard title="Personal Information" description="How you appear across workspaces.">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full name</Label>
                  <Input id="full-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job-title">Title</Label>
                  <Input id="job-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                />
              </div>
              <Button type="button" variant="accent" size="sm">
                Save changes
              </Button>
            </div>
          </SectionCard>
        ) : null}

        {section === 'avatar' ? (
          <SectionCard title="Avatar" description="Upload a photo or use initials.">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-background text-[22px] font-semibold text-primary">
                {initials.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="initials">Initials</Label>
                  <Input
                    id="initials"
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.slice(0, 2))}
                    className="max-w-[120px]"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline">
                    <Camera className="h-3.5 w-3.5" />
                    Upload photo
                  </Button>
                  <Button type="button" size="sm" variant="ghost">
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </SectionCard>
        ) : null}

        {section === 'password' ? (
          <SectionCard title="Password" description="Update your sign-in password.">
            <div className="max-w-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button type="button" variant="accent" size="sm">
                Update password
              </Button>
            </div>
          </SectionCard>
        ) : null}

        {section === 'sessions' ? (
          <SectionCard
            title="Sessions"
            description="Devices currently signed in to your account."
            actions={
              <Button type="button" size="sm" variant="outline">
                <LogOut className="h-3.5 w-3.5" />
                Sign out all
              </Button>
            }
            padded={false}
          >
            {[
              { title: 'Chrome · Windows', meta: 'Los Angeles · Current session' },
              { title: 'Safari · iPhone', meta: 'Los Angeles · Active 2h ago' },
              { title: 'Firefox · Mac', meta: 'Seattle · Active yesterday' },
            ].map((item) => (
              <ListRow
                key={item.title}
                title={item.title}
                meta={item.meta}
                trailing={
                  <Button type="button" size="sm" variant="ghost">
                    Revoke
                  </Button>
                }
              />
            ))}
          </SectionCard>
        ) : null}

        {section === 'security' ? (
          <SectionCard
            title="Security"
            description="Two-factor authentication and recovery."
            actions={<Shield className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="space-y-4">
              <label
                className={cn(
                  'flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-3',
                )}
              >
                <Checkbox
                  checked={twoFactor}
                  onChange={(e) => setTwoFactor(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  <span className="block text-[13.5px] font-medium text-foreground">
                    Two-factor authentication
                  </span>
                  <span className="mt-0.5 block text-[12.5px] text-muted-foreground">
                    Require a code from your authenticator app at sign-in.
                  </span>
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline">
                  View recovery codes
                </Button>
                <Button type="button" size="sm" variant="outline">
                  Reset authenticator
                </Button>
              </div>
            </div>
          </SectionCard>
        ) : null}

        {section === 'connected' ? (
          <SectionCard
            title="Connected Accounts"
            description="OAuth providers linked to your profile."
            actions={<Link2 className="h-4 w-4 text-muted-foreground" />}
            padded={false}
          >
            {[
              { title: 'Google', meta: 'Connected · jordan@acme.co' },
              { title: 'GitHub', meta: 'Not connected' },
              { title: 'Slack', meta: 'Connected · Acme workspace' },
            ].map((item) => (
              <ListRow
                key={item.title}
                title={item.title}
                meta={item.meta}
                trailing={
                  <Button type="button" size="sm" variant="outline">
                    {item.meta.startsWith('Connected') ? 'Disconnect' : 'Connect'}
                  </Button>
                }
              />
            ))}
          </SectionCard>
        ) : null}

        {section === 'preferences' ? (
          <SectionCard title="Preferences" description="Email and product communication.">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[13px] text-foreground">
                <Checkbox
                  checked={emailDigest}
                  onChange={(e) => setEmailDigest(e.target.checked)}
                />
                Daily unread digest
              </label>
              <label className="flex items-center gap-2 text-[13px] text-foreground">
                <Checkbox
                  checked={productTips}
                  onChange={(e) => setProductTips(e.target.checked)}
                />
                Product tips and feature announcements
              </label>
              <Button type="button" variant="accent" size="sm" className="mt-2">
                Save preferences
              </Button>
            </div>
          </SectionCard>
        ) : null}

        {section === 'tokens' ? (
          <SectionCard
            title="API Tokens"
            description="Personal tokens for scripts and integrations."
            actions={<KeyRound className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="token-name">Token name</Label>
                  <Input
                    id="token-name"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="e.g. Local CLI"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="button" variant="accent" size="sm">
                    Create token
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-border rounded-xl border border-border">
                {[
                  { name: 'Local CLI', meta: 'Created Mar 2 · Expires never' },
                  { name: 'Zapier bridge', meta: 'Created Jan 14 · Expires in 12 days' },
                ].map((token) => (
                  <ListRow
                    key={token.name}
                    title={token.name}
                    meta={token.meta}
                    trailing={
                      <Button type="button" size="sm" variant="ghost">
                        <Trash2 className="h-3.5 w-3.5" />
                        Revoke
                      </Button>
                    }
                  />
                ))}
              </div>
            </div>
          </SectionCard>
        ) : null}

        {section === 'activity' ? (
          <SectionCard
            title="Activity"
            description="Recent account events."
            actions={<Activity className="h-4 w-4 text-muted-foreground" />}
            padded={false}
          >
            {[
              { title: 'Signed in from Chrome on Windows', meta: 'Today · 8:02 AM' },
              { title: 'Password changed', meta: 'Mar 12 · 6:40 PM' },
              { title: 'API token “Zapier bridge” created', meta: 'Jan 14 · 11:05 AM' },
            ].map((item) => (
              <ListRow key={item.title} title={item.title} meta={item.meta} />
            ))}
          </SectionCard>
        ) : null}
      </SettingsShell>
    </div>
  )
}
