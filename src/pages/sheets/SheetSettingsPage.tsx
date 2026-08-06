import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Bot,
  ChevronLeft,
  KeyRound,
  Plus,
  Shield,
  Trash2,
} from 'lucide-react'

import { ListRow } from '@/components/app/ListRow'
import { PageHeader } from '@/components/app/PageHeader'
import { SectionCard } from '@/components/app/SectionCard'
import { SettingsNav, SettingsShell } from '@/components/app/SettingsShell'
import { StatTile } from '@/components/app/StatTile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const NAV = [
  { id: 'general', label: 'General' },
  { id: 'fields', label: 'Fields' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'duplicates', label: 'Duplicate Rules' },
  { id: 'validation', label: 'Validation' },
  { id: 'views', label: 'Views' },
  { id: 'automations', label: 'Automations' },
  { id: 'imports', label: 'Imports' },
  { id: 'exports', label: 'Exports' },
  { id: 'api', label: 'API' },
  { id: 'ai', label: 'AI Configuration' },
] as const

type NavId = (typeof NAV)[number]['id']

const FIELDS = [
  { name: 'Company', type: 'Text', required: true },
  { name: 'Status', type: 'Select', required: true },
  { name: 'Owner', type: 'User', required: false },
  { name: 'Revenue', type: 'Currency', required: false },
  { name: 'Website', type: 'URL', required: false },
]

export function SheetSettingsPage() {
  const { workspaceId = 'ws-acme', sheetId = 'sheet-customers' } = useParams()
  const [section, setSection] = useState<NavId>('general')
  const [sheetName, setSheetName] = useState('Customers')
  const [description, setDescription] = useState('Account and prospect records for sales.')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <Link
          to={`/w/${workspaceId}/sheets/${sheetId}`}
          className="inline-flex items-center gap-1 font-medium hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to sheet
        </Link>
      </div>

      <PageHeader
        eyebrow="Sheet settings"
        title={sheetName}
        description="Configure fields, access, validation, and integrations for this sheet."
        actions={
          <Button type="button" variant="accent" size="sm">
            Save changes
          </Button>
        }
      />

      <SettingsShell
        nav={<SettingsNav items={[...NAV]} value={section} onChange={(id) => setSection(id as NavId)} />}
      >
        {section === 'general' ? (
          <SectionCard title="General" description="Identity and defaults">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="sheet-name">Name</Label>
                <Input
                  id="sheet-name"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sheet-desc">Description</Label>
                <Input
                  id="sheet-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatTile label="Records" value="1,284" meta="Active rows" />
                <StatTile label="Fields" value="24" meta="Including computed" />
                <StatTile label="Views" value="7" meta="Shared + personal" />
              </div>
            </div>
          </SectionCard>
        ) : null}

        {section === 'fields' ? (
          <SectionCard
            title="Fields"
            description="Manage column definitions"
            actions={
              <Button type="button" size="sm" variant="outline">
                <Plus className="h-3.5 w-3.5" />
                Add field
              </Button>
            }
            padded={false}
          >
            <div className="divide-y divide-border">
              {FIELDS.map((field) => (
                <ListRow
                  key={field.name}
                  title={field.name}
                  meta={`${field.type}${field.required ? ' · Required' : ''}`}
                  trailing={
                    <Button type="button" size="sm" variant="ghost">
                      Edit
                    </Button>
                  }
                />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'permissions' ? (
          <SectionCard title="Permissions" description="Who can view and edit">
            <ul className="space-y-2">
              {[
                { role: 'Owners', access: 'Full control' },
                { role: 'Editors', access: 'Create & edit records' },
                { role: 'Viewers', access: 'Read-only' },
              ].map((item) => (
                <li
                  key={item.role}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[13.5px] font-medium">{item.role}</span>
                  </div>
                  <span className="text-[12.5px] text-muted-foreground">{item.access}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        ) : null}

        {section === 'duplicates' ? (
          <SectionCard title="Duplicate rules" description="Match keys and merge policy">
            <div className="space-y-3">
              {['Email exact match', 'Company + City fuzzy', 'Phone normalized'].map((rule) => (
                <div
                  key={rule}
                  className="rounded-xl border border-border bg-background px-4 py-3 text-[13.5px]"
                >
                  {rule}
                </div>
              ))}
              <Button type="button" size="sm" variant="outline">
                Add rule
              </Button>
            </div>
          </SectionCard>
        ) : null}

        {section === 'validation' ? (
          <SectionCard title="Validation" description="Field and row constraints">
            <ul className="space-y-2 text-[13.5px]">
              {[
                'Email must be unique',
                'Revenue ≥ 0',
                'Status required when Owner is set',
              ].map((rule) => (
                <li key={rule} className="rounded-xl border border-border bg-background px-4 py-3">
                  {rule}
                </li>
              ))}
            </ul>
          </SectionCard>
        ) : null}

        {section === 'views' ? (
          <SectionCard title="Views" description="Default and shared views" padded={false}>
            <div className="divide-y divide-border">
              {[
                { name: 'All customers', meta: 'Table · Default' },
                { name: 'Open pipeline', meta: 'Kanban · Shared' },
                { name: 'Map by region', meta: 'Map · Personal' },
              ].map((view) => (
                <ListRow key={view.name} title={view.name} meta={view.meta} />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'automations' ? (
          <SectionCard title="Automations" description="Sheet-scoped workflows" padded={false}>
            <div className="divide-y divide-border">
              {[
                { name: 'Notify owner on status change', meta: 'Active · 142 runs' },
                { name: 'Create task on new lead', meta: 'Paused · 18 runs' },
              ].map((item) => (
                <ListRow key={item.name} title={item.name} meta={item.meta} />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'imports' ? (
          <SectionCard title="Imports" description="Recent import jobs">
            <div className="space-y-2">
              {[
                { name: 'customers_q3.csv', meta: 'Completed · 420 rows · Aug 2' },
                { name: 'crm_export.xlsx', meta: 'Failed · 12 errors · Jul 28' },
              ].map((job) => (
                <div
                  key={job.name}
                  className="rounded-xl border border-border bg-background px-4 py-3"
                >
                  <p className="text-[13.5px] font-medium">{job.name}</p>
                  <p className="mt-0.5 text-[12.5px] text-muted-foreground">{job.meta}</p>
                </div>
              ))}
              <Button type="button" size="sm" variant="outline">
                New import
              </Button>
            </div>
          </SectionCard>
        ) : null}

        {section === 'exports' ? (
          <SectionCard title="Exports" description="Scheduled and one-off exports">
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-background px-4 py-3 text-[13.5px]">
                Weekly CSV to Sales Ops · Next: Fri 9:00 AM
              </div>
              <Button type="button" size="sm" variant="outline">
                Export now
              </Button>
            </div>
          </SectionCard>
        ) : null}

        {section === 'api' ? (
          <SectionCard title="API" description="Programmatic access to this sheet">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Sheet ID</Label>
                <Input readOnly value={sheetId} />
              </div>
              <div className="space-y-1.5">
                <Label>Endpoint</Label>
                <Input readOnly value={`/api/v1/sheets/${sheetId}/records`} />
              </div>
              <Button type="button" size="sm" variant="outline">
                <KeyRound className="h-3.5 w-3.5" />
                Manage API keys
              </Button>
            </div>
          </SectionCard>
        ) : null}

        {section === 'ai' ? (
          <SectionCard title="AI configuration" description="Sheet-aware assistant behavior">
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
                <Bot className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-[13.5px] font-medium">Context packing</p>
                  <p className="mt-1 text-[12.5px] text-muted-foreground">
                    Include Status, Owner, and Revenue when summarizing records.
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>System hint</Label>
                <Input defaultValue="Prioritize open deals and overdue tasks." />
              </div>
              <Button type="button" size="sm" variant="outline">
                Save AI settings
              </Button>
            </div>
          </SectionCard>
        ) : null}

        <SectionCard title="Danger zone" description="Irreversible actions">
          <Button type="button" size="sm" variant="outline" className="text-red-500">
            <Trash2 className="h-3.5 w-3.5" />
            Delete sheet
          </Button>
        </SectionCard>
      </SettingsShell>
    </div>
  )
}
