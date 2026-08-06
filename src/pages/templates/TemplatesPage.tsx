import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  LayoutTemplate,
  Search,
  Sparkles,
  Star,
  Upload,
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

type TemplateSection =
  | 'featured'
  | 'categories'
  | 'search'
  | 'preview'
  | 'install'
  | 'ratings'
  | 'reviews'
  | 'mine'
  | 'publish'
  | 'ai'

const SECTIONS: { id: TemplateSection; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'categories', label: 'Categories' },
  { id: 'search', label: 'Search' },
  { id: 'preview', label: 'Preview' },
  { id: 'install', label: 'Install' },
  { id: 'ratings', label: 'Ratings' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'mine', label: 'My Templates' },
  { id: 'publish', label: 'Publish' },
  { id: 'ai', label: 'AI Generated' },
]

const TEMPLATES = [
  {
    id: 't1',
    name: 'CRM Pipeline',
    category: 'Sales',
    rating: 4.8,
    installs: '12.4k',
    featured: true,
  },
  {
    id: 't2',
    name: 'Support Inbox',
    category: 'Service',
    rating: 4.6,
    installs: '8.1k',
    featured: true,
  },
  {
    id: 't3',
    name: 'Content Calendar',
    category: 'Marketing',
    rating: 4.5,
    installs: '6.9k',
    featured: false,
  },
  {
    id: 't4',
    name: 'Hiring Tracker',
    category: 'HR',
    rating: 4.7,
    installs: '5.2k',
    featured: true,
  },
]

const CATEGORIES = ['Sales', 'Marketing', 'Service', 'Finance', 'HR', 'Product', 'Ops']

export function TemplatesPage() {
  const { workspaceId = 'ws-acme' } = useParams()
  const [section, setSection] = useState<TemplateSection>('featured')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedId, setSelectedId] = useState('t1')
  const [publishName, setPublishName] = useState('')
  const [publishDesc, setPublishDesc] = useState('')
  const [publicListing, setPublicListing] = useState(true)
  const [aiPrompt, setAiPrompt] = useState('')
  const [sort, setSort] = useState<'popular' | 'new' | 'rated'>('popular')

  const selected = TEMPLATES.find((t) => t.id === selectedId) ?? TEMPLATES[0]
  const filtered = TEMPLATES.filter((t) => {
    if (category !== 'All' && t.category !== category) return false
    if (query.trim()) {
      const q = query.toLowerCase()
      return t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Templates"
        title="Template Gallery"
        description="Browse, preview, and install ready-made workspace templates."
        actions={
          <>
            <Link
              to={`/w/${workspaceId}/ai-builder`}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/60"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Builder
            </Link>
            <Button type="button" variant="accent" size="sm" onClick={() => setSection('publish')}>
              <Upload className="h-3.5 w-3.5" />
              Publish
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Featured" value="24" meta="Curated picks" />
        <StatTile label="Installed here" value="6" meta="This workspace" />
        <StatTile label="Avg rating" value="4.7" meta="Community" />
      </div>

      <SettingsShell
        nav={<SettingsNav items={SECTIONS} value={section} onChange={(id) => setSection(id as TemplateSection)} />}
      >
        {section === 'featured' || section === 'search' ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search templates…"
                  className="h-10 pl-9"
                />
              </div>
              <SegmentedTabs
                value={sort}
                onChange={setSort}
                tabs={[
                  { id: 'popular', label: 'Popular' },
                  { id: 'new', label: 'New' },
                  { id: 'rated', label: 'Top rated' },
                ]}
              />
            </div>

            <SectionCard
              title={section === 'featured' ? 'Featured templates' : 'Search results'}
              description={`${filtered.length} templates`}
            >
              {filtered.length === 0 ? (
                <EmptyState
                  icon={<LayoutTemplate className="h-5 w-5" />}
                  title="No templates found"
                  description="Try another category or generate one with AI."
                  actionLabel="Generate with AI"
                  onAction={() => setSection('ai')}
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filtered
                    .filter((t) => (section === 'featured' ? t.featured : true))
                    .map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => {
                          setSelectedId(template.id)
                          setSection('preview')
                        }}
                        className={cn(
                          'rounded-xl border border-border bg-background px-4 py-4 text-left transition-colors hover:bg-muted/40',
                          selectedId === template.id && 'border-primary/40 bg-primary/5',
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[14px] font-medium text-foreground">{template.name}</p>
                            <p className="mt-1 text-[12.5px] text-muted-foreground">
                              {template.category} · {template.installs} installs
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[12.5px] text-foreground">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {template.rating}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </SectionCard>
          </div>
        ) : null}

        {section === 'categories' ? (
          <SectionCard title="Categories" description="Browse by use case.">
            <div className="flex flex-wrap gap-2">
              {['All', ...CATEGORIES].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setCategory(item)
                    setSection('search')
                  }}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors',
                    category === item
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'preview' ? (
          <SectionCard
            title="Preview"
            description={selected.name}
            actions={
              <Button type="button" size="sm" variant="accent" onClick={() => setSection('install')}>
                Install
              </Button>
            }
          >
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-background p-5">
                <p className="text-[15px] font-semibold text-foreground">{selected.name}</p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {selected.category} · {selected.rating} rating · {selected.installs} installs
                </p>
                <p className="mt-4 text-[13.5px] leading-relaxed text-foreground">
                  Includes sheets, views, sample records, and starter automations tailored for{' '}
                  {selected.category.toLowerCase()} teams.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {['Sheets', 'Views', 'Automations'].map((item) => (
                  <div key={item} className="rounded-xl border border-border bg-background px-3 py-3 text-center text-[13px] font-medium text-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        ) : null}

        {section === 'install' ? (
          <SectionCard title="Install" description={`Add “${selected.name}” to this workspace.`}>
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[13px] text-foreground">
                <Checkbox defaultChecked />
                Include sample data
              </label>
              <label className="flex items-center gap-2 text-[13px] text-foreground">
                <Checkbox defaultChecked />
                Install starter automations
              </label>
              <Button type="button" variant="accent" size="sm">
                Confirm install
              </Button>
            </div>
          </SectionCard>
        ) : null}

        {section === 'ratings' ? (
          <SectionCard title="Ratings" description="Community scores for installed templates." padded={false}>
            {TEMPLATES.map((t) => (
              <ListRow
                key={t.id}
                title={t.name}
                meta={`${t.rating} average · ${t.installs} installs`}
                trailing={
                  <span className="inline-flex items-center gap-1 text-[12.5px] text-foreground">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {t.rating}
                  </span>
                }
              />
            ))}
          </SectionCard>
        ) : null}

        {section === 'reviews' ? (
          <SectionCard title="Reviews" description="Recent feedback from teams." padded={false}>
            {[
              { title: 'Clean CRM structure', meta: 'Alex · CRM Pipeline · 2d ago' },
              { title: 'Saved us a week of setup', meta: 'Priya · Support Inbox · 5d ago' },
            ].map((item) => (
              <ListRow key={item.title} title={item.title} meta={item.meta} />
            ))}
          </SectionCard>
        ) : null}

        {section === 'mine' ? (
          <SectionCard title="My Templates" description="Templates you own or installed." padded={false}>
            {[
              { name: 'Acme Sales Base', meta: 'Installed · Private' },
              { name: 'Hiring Tracker', meta: 'Installed · From gallery' },
            ].map((item) => (
              <ListRow
                key={item.name}
                title={item.name}
                meta={item.meta}
                trailing={
                  <Button type="button" size="sm" variant="outline">
                    Open
                  </Button>
                }
              />
            ))}
          </SectionCard>
        ) : null}

        {section === 'publish' ? (
          <SectionCard title="Publish" description="Share a template with the gallery.">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tpl-name">Template name</Label>
                <Input
                  id="tpl-name"
                  value={publishName}
                  onChange={(e) => setPublishName(e.target.value)}
                  placeholder="e.g. Agency client onboarding"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tpl-desc">Description</Label>
                <Input
                  id="tpl-desc"
                  value={publishDesc}
                  onChange={(e) => setPublishDesc(e.target.value)}
                  placeholder="What teams get when they install this"
                />
              </div>
              <label className="flex items-center gap-2 text-[13px] text-foreground">
                <Checkbox
                  checked={publicListing}
                  onChange={(e) => setPublicListing(e.target.checked)}
                />
                List publicly in the gallery
              </label>
              <Button type="button" variant="accent" size="sm">
                Submit for review
              </Button>
            </div>
          </SectionCard>
        ) : null}

        {section === 'ai' ? (
          <SectionCard
            title="AI Generated"
            description="Describe a workflow and generate a starter template."
            actions={<Sparkles className="h-4 w-4 text-primary" />}
          >
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="ai-tpl">Prompt</Label>
                <Input
                  id="ai-tpl"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Agency retainer tracker with invoices and tasks…"
                />
              </div>
              <Button type="button" variant="accent" size="sm">
                <Sparkles className="h-3.5 w-3.5" />
                Generate template
              </Button>
              <div className="rounded-xl border border-border bg-background p-4 text-[13.5px] text-muted-foreground">
                AI will propose sheets, fields, and views for review before install.
              </div>
            </div>
          </SectionCard>
        ) : null}
      </SettingsShell>
    </div>
  )
}
