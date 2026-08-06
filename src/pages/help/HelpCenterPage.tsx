import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bug,
  BookOpen,
  CircleHelp,
  Headphones,
  Lightbulb,
  MessageCircle,
  Newspaper,
  PlayCircle,
  Search,
  Send,
} from 'lucide-react'

import { EmptyState } from '@/components/app/EmptyState'
import { ListRow } from '@/components/app/ListRow'
import { PageHeader } from '@/components/app/PageHeader'
import { SectionCard } from '@/components/app/SectionCard'
import { SegmentedTabs } from '@/components/app/SegmentedTabs'
import { SettingsNav, SettingsShell } from '@/components/app/SettingsShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const NAV = [
  { id: 'docs', label: 'Documentation' },
  { id: 'videos', label: 'Video Tutorials' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'contact', label: 'Contact Support' },
  { id: 'bug', label: 'Report Bug' },
  { id: 'features', label: 'Feature Requests' },
  { id: 'community', label: 'Community' },
  { id: 'releases', label: 'Release Notes' },
] as const

type SectionId = (typeof NAV)[number]['id']

const DOCS = [
  { title: 'Getting started', meta: 'Workspaces, sheets, and members' },
  { title: 'Forms & responses', meta: 'Public forms and logic' },
  { title: 'Automations', meta: 'Triggers, actions, and schedules' },
  { title: 'API reference', meta: 'REST endpoints and webhooks' },
]

const VIDEOS = [
  { title: 'Build your first sheet', meta: '6 min · Beginner' },
  { title: 'Invite your team', meta: '4 min · Beginner' },
  { title: 'Automations overview', meta: '9 min · Intermediate' },
  { title: 'AI form generator', meta: '5 min · Intermediate' },
]

const FAQS = [
  {
    q: 'How do I invite someone to a workspace?',
    a: 'Open Members, click Invite, and send an email invitation with a role.',
  },
  {
    q: 'Can I export all sheet data?',
    a: 'Yes — from Workspace Settings → Export, or per-sheet via the sheet menu.',
  },
  {
    q: 'Where do API keys live?',
    a: 'Developers → API Keys inside any workspace you administer.',
  },
]

const RELEASES = [
  { title: 'v2.14 — Forms themes', meta: 'Mar 10, 2026' },
  { title: 'v2.13 — Billing seats', meta: 'Feb 22, 2026' },
  { title: 'v2.12 — Webhook retries', meta: 'Feb 4, 2026' },
]

export function HelpCenterPage() {
  const [section, setSection] = useState<SectionId>('docs')
  const [query, setQuery] = useState('')
  const [faqOpen, setFaqOpen] = useState<string | null>(FAQS[0].q)
  const [contactSubject, setContactSubject] = useState('')
  const [contactBody, setContactBody] = useState('')
  const [bugTitle, setBugTitle] = useState('')
  const [featureTitle, setFeatureTitle] = useState('')
  const [sent, setSent] = useState(false)
  const [videoLevel, setVideoLevel] = useState<'all' | 'beginner' | 'intermediate'>('all')

  const docs = DOCS.filter(
    (d) =>
      !query.trim() ||
      d.title.toLowerCase().includes(query.toLowerCase()) ||
      d.meta.toLowerCase().includes(query.toLowerCase()),
  )

  const videos = VIDEOS.filter((v) => {
    if (videoLevel === 'beginner') return v.meta.includes('Beginner')
    if (videoLevel === 'intermediate') return v.meta.includes('Intermediate')
    return true
  })

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Help"
        title="Help Center"
        description="Documentation, tutorials, support, and product updates — no workspace required."
        actions={
          <Link
            to="/workspaces"
            className="inline-flex h-9 items-center justify-center rounded-xl border border-border px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/60"
          >
            Back to workspaces
          </Link>
        }
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help articles…"
          className="h-10 pl-9"
        />
      </div>

      <SettingsShell
        nav={<SettingsNav items={[...NAV]} value={section} onChange={(id) => setSection(id as SectionId)} />}
      >
        {section === 'docs' ? (
          <SectionCard
            title="Documentation"
            description="Guides for every Base surface"
            actions={<BookOpen className="h-4 w-4 text-muted-foreground" />}
            padded={false}
          >
            {docs.length === 0 ? (
              <EmptyState
                title="No articles found"
                description="Try a different search term."
                actionLabel="Clear search"
                onAction={() => setQuery('')}
              />
            ) : (
              <div className="divide-y divide-border">
                {docs.map((doc) => (
                  <ListRow key={doc.title} title={doc.title} meta={doc.meta} />
                ))}
              </div>
            )}
          </SectionCard>
        ) : null}

        {section === 'videos' ? (
          <SectionCard
            title="Video tutorials"
            description="Short walkthroughs for common workflows"
            actions={
              <SegmentedTabs
                value={videoLevel}
                onChange={setVideoLevel}
                tabs={[
                  { id: 'all', label: 'All' },
                  { id: 'beginner', label: 'Beginner' },
                  { id: 'intermediate', label: 'Intermediate' },
                ]}
              />
            }
            padded={false}
          >
            <div className="divide-y divide-border">
              {videos.map((video) => (
                <ListRow
                  key={video.title}
                  title={video.title}
                  meta={video.meta}
                  trailing={<PlayCircle className="h-4 w-4 text-muted-foreground" />}
                />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'faqs' ? (
          <SectionCard
            title="FAQs"
            description="Answers to common questions"
            actions={<CircleHelp className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="space-y-2">
              {FAQS.map((item) => {
                const open = faqOpen === item.q
                return (
                  <div key={item.q} className="rounded-xl border border-border bg-background">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                      onClick={() => setFaqOpen(open ? null : item.q)}
                    >
                      <span className="text-[13.5px] font-medium text-foreground">{item.q}</span>
                      <span className="text-[12px] text-muted-foreground">{open ? '−' : '+'}</span>
                    </button>
                    {open ? (
                      <p className="border-t border-border px-4 py-3 text-[13px] leading-relaxed text-muted-foreground">
                        {item.a}
                      </p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </SectionCard>
        ) : null}

        {section === 'contact' ? (
          <SectionCard
            title="Contact support"
            description="We typically reply within one business day"
            actions={<Headphones className="h-4 w-4 text-muted-foreground" />}
          >
            {sent ? (
              <EmptyState
                title="Message sent"
                description="Thanks — a support specialist will follow up by email."
                actionLabel="Send another"
                onAction={() => setSent(false)}
              />
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    placeholder="How can we help?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body">Message</Label>
                  <Input
                    id="body"
                    value={contactBody}
                    onChange={(e) => setContactBody(e.target.value)}
                    placeholder="Share steps, workspace ID, and screenshots if useful"
                  />
                </div>
                <Button type="button" variant="accent" onClick={() => setSent(true)}>
                  <Send className="h-3.5 w-3.5" />
                  Send message
                </Button>
              </div>
            )}
          </SectionCard>
        ) : null}

        {section === 'bug' ? (
          <SectionCard
            title="Report a bug"
            description="Help us reproduce and fix issues quickly"
            actions={<Bug className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bug-title">Title</Label>
                <Input
                  id="bug-title"
                  value={bugTitle}
                  onChange={(e) => setBugTitle(e.target.value)}
                  placeholder="Short summary of the issue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bug-steps">Steps to reproduce</Label>
                <Input id="bug-steps" placeholder="1. Open… 2. Click… 3. See…" />
              </div>
              <Button type="button" variant="outline">
                Submit bug report
              </Button>
            </div>
          </SectionCard>
        ) : null}

        {section === 'features' ? (
          <SectionCard
            title="Feature requests"
            description="Tell us what would make Base better"
            actions={<Lightbulb className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feature">Idea</Label>
                <Input
                  id="feature"
                  value={featureTitle}
                  onChange={(e) => setFeatureTitle(e.target.value)}
                  placeholder="Describe the feature and why it matters"
                />
              </div>
              <Button type="button" variant="accent" size="sm">
                Submit request
              </Button>
              <div className="divide-y divide-border rounded-xl border border-border">
                {[
                  { title: 'Bulk edit across sheets', meta: '124 votes' },
                  { title: 'Native Notion import', meta: '89 votes' },
                ].map((row) => (
                  <ListRow key={row.title} title={row.title} meta={row.meta} />
                ))}
              </div>
            </div>
          </SectionCard>
        ) : null}

        {section === 'community' ? (
          <SectionCard
            title="Community"
            description="Connect with other Base builders"
            actions={<MessageCircle className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: 'Forum', meta: 'Ask questions and share tips' },
                { title: 'Discord', meta: 'Realtime chat with the community' },
                { title: 'Office hours', meta: 'Weekly live Q&A' },
                { title: 'Templates gallery', meta: 'Browse shared sheet kits' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-border bg-background px-4 py-3"
                >
                  <p className="text-[13.5px] font-medium text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-[12.5px] text-muted-foreground">{item.meta}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'releases' ? (
          <SectionCard
            title="Release notes"
            description="What shipped recently"
            actions={<Newspaper className="h-4 w-4 text-muted-foreground" />}
            padded={false}
          >
            <div className="divide-y divide-border">
              {RELEASES.map((row) => (
                <ListRow key={row.title} title={row.title} meta={row.meta} />
              ))}
            </div>
          </SectionCard>
        ) : null}
      </SettingsShell>
    </div>
  )
}
