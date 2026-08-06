import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Building2,
  KeyRound,
  Shield,
  UserPlus,
  Users,
} from 'lucide-react'

import { EmptyState } from '@/components/app/EmptyState'
import { ListRow } from '@/components/app/ListRow'
import { PageHeader } from '@/components/app/PageHeader'
import { SectionCard } from '@/components/app/SectionCard'
import { SegmentedTabs } from '@/components/app/SegmentedTabs'
import { SettingsNav, SettingsShell } from '@/components/app/SettingsShell'
import { StatTile } from '@/components/app/StatTile'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type TeamSection =
  | 'members'
  | 'invitations'
  | 'roles'
  | 'permissions'
  | 'departments'
  | 'groups'
  | 'activity'
  | 'access'
  | 'security'

const SECTIONS: { id: TeamSection; label: string }[] = [
  { id: 'members', label: 'Members' },
  { id: 'invitations', label: 'Invitations' },
  { id: 'roles', label: 'Roles' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'departments', label: 'Departments' },
  { id: 'groups', label: 'Groups' },
  { id: 'activity', label: 'Activity' },
  { id: 'access', label: 'Access Requests' },
  { id: 'security', label: 'Security Logs' },
]

const MEMBERS = [
  { id: 'u1', name: 'Jordan Lee', email: 'jordan@acme.co', role: 'Admin', dept: 'Ops' },
  { id: 'u2', name: 'Sam Ortiz', email: 'sam@acme.co', role: 'Editor', dept: 'Sales' },
  { id: 'u3', name: 'Casey Kim', email: 'casey@acme.co', role: 'Viewer', dept: 'Marketing' },
]

const PERMISSIONS = [
  { id: 'p1', label: 'Manage sheets', description: 'Create, edit, and archive sheets' },
  { id: 'p2', label: 'Invite members', description: 'Send and revoke workspace invites' },
  { id: 'p3', label: 'Billing access', description: 'View invoices and update plan' },
  { id: 'p4', label: 'Automations', description: 'Publish and edit workflows' },
]

export function TeamPage() {
  const { workspaceId = 'ws-acme' } = useParams()
  const [section, setSection] = useState<TeamSection>('members')
  const [filter, setFilter] = useState<'all' | 'admin' | 'editor' | 'viewer'>('all')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Editor')
  const [enabledPerms, setEnabledPerms] = useState<string[]>(['p1', 'p2', 'p4'])
  const [query, setQuery] = useState('')

  const members = MEMBERS.filter((m) => {
    if (filter !== 'all' && m.role.toLowerCase() !== filter) return false
    if (query.trim()) {
      const q = query.toLowerCase()
      return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    }
    return true
  })

  function togglePerm(id: string) {
    setEnabledPerms((current) =>
      current.includes(id) ? current.filter((p) => p !== id) : [...current, id],
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Team"
        title="Team"
        description="Manage members, roles, departments, and access across this workspace."
        actions={
          <>
            <Link
              to={`/w/${workspaceId}/settings`}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/60"
            >
              <Shield className="h-3.5 w-3.5" />
              Workspace settings
            </Link>
            <Button type="button" variant="accent" size="sm" onClick={() => setSection('invitations')}>
              <UserPlus className="h-3.5 w-3.5" />
              Invite
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Members" value="18" meta="3 pending invites" />
        <StatTile label="Roles" value="5" meta="Custom + system" />
        <StatTile label="Departments" value="6" meta="Org chart" />
        <StatTile label="Open requests" value="2" meta="Access review" />
      </div>

      <SettingsShell
        nav={<SettingsNav items={SECTIONS} value={section} onChange={(id) => setSection(id as TeamSection)} />}
      >
        {section === 'members' ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search members…"
                className="h-10 lg:max-w-sm"
              />
              <SegmentedTabs
                value={filter}
                onChange={setFilter}
                tabs={[
                  { id: 'all', label: 'All' },
                  { id: 'admin', label: 'Admin' },
                  { id: 'editor', label: 'Editor' },
                  { id: 'viewer', label: 'Viewer' },
                ]}
              />
            </div>
            <SectionCard title="Members" description={`${members.length} people`} padded={false}>
              {members.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-5 w-5" />}
                  title="No members found"
                  description="Invite teammates or clear your filters."
                  actionLabel="Invite"
                  onAction={() => setSection('invitations')}
                />
              ) : (
                <div className="divide-y divide-border">
                  {members.map((member) => (
                    <ListRow
                      key={member.id}
                      title={member.name}
                      meta={`${member.email} · ${member.role} · ${member.dept}`}
                      trailing={
                        <Button type="button" size="sm" variant="outline">
                          Manage
                        </Button>
                      }
                    />
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        ) : null}

        {section === 'invitations' ? (
          <SectionCard title="Invitations" description="Send email invites with a default role.">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="name@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <Input
                    id="invite-role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  />
                </div>
              </div>
              <Button type="button" variant="accent" size="sm">
                <UserPlus className="h-3.5 w-3.5" />
                Send invite
              </Button>
              <div className="divide-y divide-border rounded-xl border border-border">
                {[
                  { email: 'alex@northwind.io', meta: 'Editor · Expires in 5 days' },
                  { email: 'priya@northwind.io', meta: 'Viewer · Expires in 2 days' },
                ].map((item) => (
                  <ListRow
                    key={item.email}
                    title={item.email}
                    meta={item.meta}
                    trailing={
                      <Button type="button" size="sm" variant="ghost">
                        Revoke
                      </Button>
                    }
                  />
                ))}
              </div>
            </div>
          </SectionCard>
        ) : null}

        {section === 'roles' ? (
          <SectionCard title="Roles" description="System and custom roles for this workspace." padded={false}>
            {[
              { name: 'Admin', meta: 'Full control · 3 members' },
              { name: 'Editor', meta: 'Create & edit · 11 members' },
              { name: 'Viewer', meta: 'Read only · 4 members' },
              { name: 'Billing', meta: 'Invoices & plan · 1 member' },
            ].map((role) => (
              <ListRow
                key={role.name}
                title={role.name}
                meta={role.meta}
                trailing={
                  <Button type="button" size="sm" variant="outline">
                    Edit
                  </Button>
                }
              />
            ))}
          </SectionCard>
        ) : null}

        {section === 'permissions' ? (
          <SectionCard title="Permissions" description="Toggle capabilities for the selected role.">
            <div className="space-y-3">
              {PERMISSIONS.map((perm) => (
                <label
                  key={perm.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background px-4 py-3',
                  )}
                >
                  <Checkbox
                    checked={enabledPerms.includes(perm.id)}
                    onChange={() => togglePerm(perm.id)}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="block text-[13.5px] font-medium text-foreground">{perm.label}</span>
                    <span className="mt-0.5 block text-[12.5px] text-muted-foreground">
                      {perm.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'departments' ? (
          <SectionCard
            title="Departments"
            description="Organize members by function."
            actions={<Building2 className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {['Ops', 'Sales', 'Marketing', 'Finance', 'Product', 'Support'].map((dept, index) => (
                <div key={dept} className="rounded-xl border border-border bg-background px-4 py-3">
                  <p className="text-[13.5px] font-medium text-foreground">{dept}</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">{[4, 6, 3, 2, 5, 3][index]} members</p>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'groups' ? (
          <SectionCard title="Groups" description="Cross-functional groups for sharing." padded={false}>
            {[
              { name: 'Launch squad', meta: '8 members · Shared sheets' },
              { name: 'Revenue ops', meta: '5 members · Reports + email' },
            ].map((group) => (
              <ListRow
                key={group.name}
                title={group.name}
                meta={group.meta}
                trailing={
                  <Button type="button" size="sm" variant="outline">
                    Open
                  </Button>
                }
              />
            ))}
          </SectionCard>
        ) : null}

        {section === 'activity' ? (
          <SectionCard title="Activity" description="Recent team events." padded={false}>
            {[
              { title: 'Sam invited alex@northwind.io', meta: '2 hours ago' },
              { title: 'Casey changed role to Viewer', meta: 'Yesterday' },
              { title: 'Jordan created group Launch squad', meta: '3 days ago' },
            ].map((item) => (
              <ListRow key={item.title} title={item.title} meta={item.meta} />
            ))}
          </SectionCard>
        ) : null}

        {section === 'access' ? (
          <SectionCard title="Access Requests" description="Pending elevation and sheet access." padded={false}>
            {[
              { title: 'Casey · Editor role', meta: 'Requested 1 day ago' },
              { title: 'Sam · Billing access', meta: 'Requested 3 days ago' },
            ].map((item) => (
              <ListRow
                key={item.title}
                title={item.title}
                meta={item.meta}
                trailing={
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="accent">
                      Approve
                    </Button>
                    <Button type="button" size="sm" variant="ghost">
                      Deny
                    </Button>
                  </div>
                }
              />
            ))}
          </SectionCard>
        ) : null}

        {section === 'security' ? (
          <SectionCard
            title="Security Logs"
            description="Authentication and permission events."
            actions={<KeyRound className="h-4 w-4 text-muted-foreground" />}
            padded={false}
          >
            {[
              { title: 'Failed login · casey@acme.co', meta: 'Today · 9:14 AM · IP 203.0.113.10' },
              { title: '2FA enabled · jordan@acme.co', meta: 'Mon · 4:02 PM' },
              { title: 'API token created · Sam Ortiz', meta: 'Sun · 11:20 AM' },
            ].map((item) => (
              <ListRow key={item.title} title={item.title} meta={item.meta} />
            ))}
          </SectionCard>
        ) : null}
      </SettingsShell>
    </div>
  )
}
