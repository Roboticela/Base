import { useState } from 'react'
import {
  FileUp,
  GitBranch,
  LayoutTemplate,
  MessageSquareHeart,
  Plus,
  ArrowRightLeft,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react'

import { EmptyState } from '@/components/app/EmptyState'
import { ListRow } from '@/components/app/ListRow'
import { PageHeader } from '@/components/app/PageHeader'
import { SectionCard } from '@/components/app/SectionCard'
import { SegmentedTabs } from '@/components/app/SegmentedTabs'
import { SettingsNav, SettingsShell } from '@/components/app/SettingsShell'
import { StatTile } from '@/components/app/StatTile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const NAV = [
  { id: 'builder', label: 'Form Builder' },
  { id: 'themes', label: 'Themes' },
  { id: 'logic', label: 'Conditional Logic' },
  { id: 'upload', label: 'File Upload' },
  { id: 'captcha', label: 'CAPTCHA' },
  { id: 'thanks', label: 'Thank You Page' },
  { id: 'redirects', label: 'Redirects' },
  { id: 'responses', label: 'Responses' },
  { id: 'ai', label: 'AI Form Generator' },
] as const

type SectionId = (typeof NAV)[number]['id']

type FieldType = 'text' | 'email' | 'select' | 'file'

type BuilderField = {
  id: string
  label: string
  type: FieldType
  required: boolean
}

const RESPONSES = [
  { id: 'r1', title: 'Maya Torres', meta: 'Contact form · 2 hours ago' },
  { id: 'r2', title: 'Chris Park', meta: 'Lead intake · Yesterday' },
  { id: 'r3', title: 'Riley Quinn', meta: 'Support request · Mar 12' },
]

const THEMES = [
  { id: 't1', name: 'Clean light', tone: 'Neutral borders, spacious fields' },
  { id: 't2', name: 'Brand accent', tone: 'Primary focus rings and CTA' },
  { id: 't3', name: 'Compact', tone: 'Dense layout for internal tools' },
]

export function FormsPage() {
  const [section, setSection] = useState<SectionId>('builder')
  const [fields, setFields] = useState<BuilderField[]>([
    { id: 'f1', label: 'Full name', type: 'text', required: true },
    { id: 'f2', label: 'Work email', type: 'email', required: true },
    { id: 'f3', label: 'Department', type: 'select', required: false },
  ])
  const [themeId, setThemeId] = useState('t1')
  const [captchaOn, setCaptchaOn] = useState(true)
  const [thanksMessage, setThanksMessage] = useState('Thanks — we received your submission.')
  const [redirectUrl, setRedirectUrl] = useState('https://acme.com/welcome')
  const [aiPrompt, setAiPrompt] = useState('')
  const [logicWhen, setLogicWhen] = useState('Department equals Sales')
  const [responseFilter, setResponseFilter] = useState<'all' | 'new' | 'archived'>('all')

  function addField() {
    setFields((c) => [
      ...c,
      {
        id: `f${Date.now()}`,
        label: 'New field',
        type: 'text',
        required: false,
      },
    ])
  }

  function removeField(id: string) {
    setFields((c) => c.filter((f) => f.id !== id))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Forms"
        title="Forms studio"
        description="Build intake forms, themes, logic, and response workflows."
        actions={
          <Button type="button" variant="accent" size="sm">
            <Plus className="h-3.5 w-3.5" />
            New form
          </Button>
        }
      />

      <SettingsShell
        nav={<SettingsNav items={[...NAV]} value={section} onChange={(id) => setSection(id as SectionId)} />}
      >
        {section === 'builder' ? (
          <SectionCard
            title="Form builder"
            description="Drag-free mock — add and reorder fields"
            actions={
              <Button type="button" size="sm" variant="outline" onClick={addField}>
                <Plus className="h-3.5 w-3.5" />
                Add field
              </Button>
            }
          >
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-end"
                >
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`label-${field.id}`}>Label</Label>
                    <Input
                      id={`label-${field.id}`}
                      value={field.label}
                      onChange={(e) =>
                        setFields((c) =>
                          c.map((f) => (f.id === field.id ? { ...f, label: e.target.value } : f)),
                        )
                      }
                    />
                  </div>
                  <div className="w-full space-y-2 sm:w-36">
                    <Label htmlFor={`type-${field.id}`}>Type</Label>
                    <select
                      id={`type-${field.id}`}
                      value={field.type}
                      onChange={(e) =>
                        setFields((c) =>
                          c.map((f) =>
                            f.id === field.id ? { ...f, type: e.target.value as FieldType } : f,
                          ),
                        )
                      }
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px]"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="select">Select</option>
                      <option value="file">File</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 pb-2 text-[12.5px] text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) =>
                        setFields((c) =>
                          c.map((f) =>
                            f.id === field.id ? { ...f, required: e.target.checked } : f,
                          ),
                        )
                      }
                      className="h-4 w-4 accent-primary"
                    />
                    Required
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={fields.length === 1}
                    onClick={() => removeField(field.id)}
                    aria-label={`Remove field ${index + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'themes' ? (
          <SectionCard
            title="Themes"
            description="Visual style for public forms"
            actions={<LayoutTemplate className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setThemeId(theme.id)}
                  className={cn(
                    'rounded-2xl border p-4 text-left transition-colors',
                    themeId === theme.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background hover:bg-muted/40',
                  )}
                >
                  <p className="text-[14px] font-semibold text-foreground">{theme.name}</p>
                  <p className="mt-1 text-[12.5px] text-muted-foreground">{theme.tone}</p>
                </button>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'logic' ? (
          <SectionCard
            title="Conditional logic"
            description="Show or hide fields based on answers"
            actions={<GitBranch className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logic-when">When</Label>
                <Input
                  id="logic-when"
                  value={logicWhen}
                  onChange={(e) => setLogicWhen(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logic-then">Then</Label>
                <Input id="logic-then" defaultValue="Show field: Deal size" />
              </div>
              <Button type="button" variant="outline" size="sm">
                Add rule
              </Button>
            </div>
          </SectionCard>
        ) : null}

        {section === 'upload' ? (
          <SectionCard
            title="File upload"
            description="Attachment limits for form submissions"
            actions={<FileUp className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="max-size">Max file size (MB)</Label>
                <Input id="max-size" defaultValue="25" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-files">Max files per response</Label>
                <Input id="max-files" defaultValue="3" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="mime">Allowed types</Label>
                <Input id="mime" defaultValue="pdf, png, jpg, docx" />
              </div>
            </div>
          </SectionCard>
        ) : null}

        {section === 'captcha' ? (
          <SectionCard
            title="CAPTCHA"
            description="Reduce spam on public forms"
            actions={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
          >
            <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
              <div>
                <p className="text-[13.5px] font-medium text-foreground">Enable CAPTCHA</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  Challenge anonymous submitters before save
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={captchaOn}
                onClick={() => setCaptchaOn((v) => !v)}
                className={cn(
                  'relative h-6 w-11 rounded-full border transition-colors',
                  captchaOn ? 'border-primary bg-primary/20' : 'border-border bg-muted/40',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-4 w-4 rounded-full bg-foreground transition-transform',
                    captchaOn ? 'left-6' : 'left-0.5',
                  )}
                />
              </button>
            </label>
          </SectionCard>
        ) : null}

        {section === 'thanks' ? (
          <SectionCard
            title="Thank you page"
            description="Message shown after a successful submit"
            actions={<MessageSquareHeart className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="space-y-2">
              <Label htmlFor="thanks">Message</Label>
              <Input
                id="thanks"
                value={thanksMessage}
                onChange={(e) => setThanksMessage(e.target.value)}
              />
            </div>
            <div className="mt-4 rounded-xl border border-border bg-background px-4 py-6 text-center">
              <p className="text-[15px] font-semibold text-foreground">{thanksMessage}</p>
              <p className="mt-1 text-[12.5px] text-muted-foreground">Preview</p>
            </div>
          </SectionCard>
        ) : null}

        {section === 'redirects' ? (
          <SectionCard
            title="Redirects"
            description="Send respondents to an external URL"
            actions={<ArrowRightLeft className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="space-y-2">
              <Label htmlFor="redirect">Redirect URL</Label>
              <Input
                id="redirect"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
              />
            </div>
            <p className="mt-3 text-[12.5px] text-muted-foreground">
              Leave empty to show the thank you page instead.
            </p>
          </SectionCard>
        ) : null}

        {section === 'responses' ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile label="Total" value="328" meta="all time" />
              <StatTile label="This week" value="41" meta="+12%" />
              <StatTile label="Completion" value="86%" meta="avg" />
            </div>
            <SectionCard
              title="Responses"
              description="Latest form submissions"
              actions={
                <SegmentedTabs
                  value={responseFilter}
                  onChange={setResponseFilter}
                  tabs={[
                    { id: 'all', label: 'All' },
                    { id: 'new', label: 'New' },
                    { id: 'archived', label: 'Archived' },
                  ]}
                />
              }
              padded={false}
            >
              {responseFilter === 'archived' ? (
                <EmptyState
                  title="No archived responses"
                  description="Archive a submission from the response detail view."
                />
              ) : (
                <div className="divide-y divide-border">
                  {RESPONSES.map((row) => (
                    <ListRow key={row.id} title={row.title} meta={row.meta} />
                  ))}
                </div>
              )}
            </SectionCard>
          </>
        ) : null}

        {section === 'ai' ? (
          <SectionCard
            title="AI form generator"
            description="Describe the form you need and generate fields"
            actions={<Sparkles className="h-4 w-4 text-primary" />}
          >
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="ai-form">Prompt</Label>
                <Input
                  id="ai-form"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Customer onboarding form with company size and use case…"
                />
              </div>
              <Button
                type="button"
                variant="accent"
                onClick={() => {
                  setFields([
                    { id: 'ai1', label: 'Company name', type: 'text', required: true },
                    { id: 'ai2', label: 'Work email', type: 'email', required: true },
                    { id: 'ai3', label: 'Company size', type: 'select', required: true },
                    { id: 'ai4', label: 'Use case', type: 'text', required: false },
                  ])
                  setSection('builder')
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Generate form
              </Button>
            </div>
          </SectionCard>
        ) : null}
      </SettingsShell>
    </div>
  )
}
