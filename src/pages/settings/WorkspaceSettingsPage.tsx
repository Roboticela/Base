import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Download,
  Globe,
  HardDrive,
  KeyRound,
  Languages,
  Palette,
  Save,
  Shield,
  Sparkles,
  Upload,
  Users,
} from 'lucide-react'

import { EmptyState } from '@/components/app/EmptyState'
import { ListRow } from '@/components/app/ListRow'
import { PageHeader } from '@/components/app/PageHeader'
import { SectionCard } from '@/components/app/SectionCard'
import { SettingsNav, SettingsShell } from '@/components/app/SettingsShell'
import { StatTile } from '@/components/app/StatTile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const NAV = [
  { id: 'general', label: 'General' },
  { id: 'branding', label: 'Branding' },
  { id: 'domains', label: 'Domains' },
  { id: 'members', label: 'Members' },
  { id: 'roles', label: 'Roles' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'storage', label: 'Storage' },
  { id: 'localization', label: 'Localization' },
  { id: 'backup', label: 'Backup' },
  { id: 'import', label: 'Import' },
  { id: 'export', label: 'Export' },
  { id: 'audit', label: 'Audit Logs' },
  { id: 'ai', label: 'AI Settings' },
] as const

type SectionId = (typeof NAV)[number]['id']

const MEMBERS = [
  { id: '1', name: 'Jordan Lee', email: 'jordan@acme.co', role: 'Owner' },
  { id: '2', name: 'Sam Rivera', email: 'sam@acme.co', role: 'Admin' },
  { id: '3', name: 'Alex Chen', email: 'alex@acme.co', role: 'Editor' },
  { id: '4', name: 'Morgan Blake', email: 'morgan@acme.co', role: 'Viewer' },
]

const ROLES = [
  { id: 'owner', name: 'Owner', desc: 'Full control including billing and deletion' },
  { id: 'admin', name: 'Admin', desc: 'Manage members, settings, and content' },
  { id: 'editor', name: 'Editor', desc: 'Create and edit sheets, forms, and automations' },
  { id: 'viewer', name: 'Viewer', desc: 'Read-only access across the workspace' },
]

const AUDIT = [
  { id: 'a1', title: 'Jordan updated branding colors', meta: 'Today · 2:14 PM' },
  { id: 'a2', title: 'Sam invited alex@acme.co', meta: 'Yesterday · 11:02 AM' },
  { id: 'a3', title: 'Export job completed (CSV)', meta: 'Mar 12 · 4:40 PM' },
  { id: 'a4', title: 'Domain verification started', meta: 'Mar 10 · 9:18 AM' },
]

export function WorkspaceSettingsPage() {
  const { workspaceId = 'ws-acme' } = useParams()
  const [section, setSection] = useState<SectionId>('general')
  const [name, setName] = useState('Acme Workspace')
  const [slug, setSlug] = useState('acme')
  const [primaryColor, setPrimaryColor] = useState('#2563eb')
  const [timezone, setTimezone] = useState('America/New_York')
  const [locale, setLocale] = useState('en-US')
  const [aiEnabled, setAiEnabled] = useState(true)
  const [domain, setDomain] = useState('')

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description={`Configure ${workspaceId} — identity, access, storage, and AI.`}
        actions={
          <Button type="button" variant="accent" size="sm">
            <Save className="h-3.5 w-3.5" />
            Save changes
          </Button>
        }
      />

      <SettingsShell
        nav={<SettingsNav items={[...NAV]} value={section} onChange={(id) => setSection(id as SectionId)} />}
      >
        {section === 'general' ? (
          <SectionCard title="General" description="Workspace name and identity">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ws-name">Workspace name</Label>
                <Input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ws-slug">URL slug</Label>
                <Input id="ws-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
                <p className="text-[12px] text-muted-foreground">base.app/w/{slug || '…'}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ws-tz">Default timezone</Label>
                <Input id="ws-tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
              </div>
            </div>
          </SectionCard>
        ) : null}

        {section === 'branding' ? (
          <SectionCard
            title="Branding"
            description="Logo and accent color for this workspace"
            actions={<Palette className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="space-y-4">
              <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-border bg-background">
                <div className="text-center">
                  <Upload className="mx-auto h-5 w-5 text-muted-foreground" />
                  <p className="mt-2 text-[13px] text-muted-foreground">Upload logo (PNG, SVG)</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand-color">Primary color</Label>
                <div className="flex items-center gap-3">
                  <input
                    id="brand-color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-background"
                  />
                  <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                </div>
              </div>
            </div>
          </SectionCard>
        ) : null}

        {section === 'domains' ? (
          <SectionCard title="Custom domains" description="Map a branded domain to this workspace">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <div className="flex gap-2">
                  <Input
                    id="domain"
                    placeholder="app.acme.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                  />
                  <Button type="button" variant="outline">
                    <Globe className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>
              </div>
              <EmptyState
                icon={<Globe className="h-5 w-5" />}
                title="No custom domains"
                description="Add a domain, then verify DNS to serve the workspace on your brand."
              />
            </div>
          </SectionCard>
        ) : null}

        {section === 'members' ? (
          <SectionCard
            title="Members"
            description="People with access to this workspace"
            actions={
              <Button type="button" size="sm" variant="outline">
                <Users className="h-3.5 w-3.5" />
                Invite
              </Button>
            }
            padded={false}
          >
            <div className="divide-y divide-border">
              {MEMBERS.map((m) => (
                <ListRow
                  key={m.id}
                  title={m.name}
                  meta={m.email}
                  trailing={
                    <span className="rounded-full border border-border px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground">
                      {m.role}
                    </span>
                  }
                />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'roles' ? (
          <SectionCard title="Roles" description="Built-in roles for this workspace" padded={false}>
            <div className="divide-y divide-border">
              {ROLES.map((role) => (
                <ListRow
                  key={role.id}
                  title={role.name}
                  meta={role.desc}
                  trailing={<Shield className="h-4 w-4 text-muted-foreground" />}
                />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'permissions' ? (
          <SectionCard title="Permissions" description="Fine-grained access toggles">
            <div className="space-y-3">
              {[
                'Allow editors to invite viewers',
                'Require 2FA for admins',
                'Restrict export to owners',
                'Public form submissions without login',
              ].map((label) => (
                <label
                  key={label}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3"
                >
                  <span className="text-[13.5px] text-foreground">{label}</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
                </label>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'storage' ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile label="Used" value="12.4 GB" meta="of 50 GB" />
              <StatTile label="Files" value="1,842" meta="attachments" />
              <StatTile label="Largest" value="Sheets" meta="8.1 GB" />
            </div>
            <SectionCard
              title="Storage"
              description="Usage across sheets, forms, and uploads"
              actions={<HardDrive className="h-4 w-4 text-muted-foreground" />}
            >
              <div className="h-3 overflow-hidden rounded-full border border-border bg-muted/40">
                <div className="h-full w-[25%] rounded-full bg-primary" />
              </div>
              <p className="mt-3 text-[13px] text-muted-foreground">25% of plan storage used</p>
            </SectionCard>
          </>
        ) : null}

        {section === 'localization' ? (
          <SectionCard
            title="Localization"
            description="Language and regional defaults"
            actions={<Languages className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="locale">Locale</Label>
                <Input id="locale" value={locale} onChange={(e) => setLocale(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-fmt">Date format</Label>
                <Input id="date-fmt" defaultValue="MMM D, YYYY" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" defaultValue="USD" />
              </div>
            </div>
          </SectionCard>
        ) : null}

        {section === 'backup' ? (
          <SectionCard title="Backup" description="Scheduled workspace backups">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <StatTile label="Last backup" value="Mar 14" meta="02:00 UTC · Success" />
                <StatTile label="Retention" value="30 days" meta="Daily schedule" />
              </div>
              <Button type="button" variant="outline">
                <Download className="h-3.5 w-3.5" />
                Download latest backup
              </Button>
            </div>
          </SectionCard>
        ) : null}

        {section === 'import' ? (
          <SectionCard title="Import" description="Bring data from CSV, Excel, or another workspace">
            <EmptyState
              icon={<Upload className="h-5 w-5" />}
              title="Import data"
              description="Upload a file or connect an external source to populate sheets."
              actionLabel="Choose file"
              onAction={() => undefined}
            />
          </SectionCard>
        ) : null}

        {section === 'export' ? (
          <SectionCard title="Export" description="Download workspace data">
            <div className="space-y-3">
              {['All sheets (CSV zip)', 'Forms & responses', 'Members roster', 'Audit log (JSON)'].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3"
                  >
                    <span className="text-[13.5px] font-medium text-foreground">{item}</span>
                    <Button type="button" size="sm" variant="outline">
                      <Download className="h-3.5 w-3.5" />
                      Export
                    </Button>
                  </div>
                ),
              )}
            </div>
          </SectionCard>
        ) : null}

        {section === 'audit' ? (
          <SectionCard title="Audit logs" description="Recent security and admin events" padded={false}>
            <div className="divide-y divide-border">
              {AUDIT.map((row) => (
                <ListRow key={row.id} title={row.title} meta={row.meta} />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'ai' ? (
          <SectionCard
            title="AI settings"
            description="Control assistant features for this workspace"
            actions={<Sparkles className="h-4 w-4 text-primary" />}
          >
            <div className="space-y-4">
              <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
                <div>
                  <p className="text-[13.5px] font-medium text-foreground">Enable AI assistant</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    Sheet generation, summaries, and form suggestions
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={aiEnabled}
                  onClick={() => setAiEnabled((v) => !v)}
                  className={cn(
                    'relative h-6 w-11 rounded-full border transition-colors',
                    aiEnabled ? 'border-primary bg-primary/20' : 'border-border bg-muted/40',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-4 w-4 rounded-full bg-foreground transition-transform',
                      aiEnabled ? 'left-6' : 'left-0.5',
                    )}
                  />
                </button>
              </label>
              <div className="space-y-2">
                <Label htmlFor="ai-model">Preferred model</Label>
                <Input id="ai-model" defaultValue="Base Default" />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-[13px] text-muted-foreground">
                <KeyRound className="h-4 w-4 shrink-0" />
                Workspace uses the organization AI quota. Bring-your-own keys live under Integrations.
              </div>
            </div>
          </SectionCard>
        ) : null}
      </SettingsShell>
    </div>
  )
}
