import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  BarChart3,
  CalendarClock,
  Download,
  LineChart,
  Plus,
  Sparkles,
  Table2,
} from 'lucide-react'

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

type ReportSection =
  | 'builder'
  | 'charts'
  | 'tables'
  | 'kpi'
  | 'heatmaps'
  | 'funnel'
  | 'revenue'
  | 'lead'
  | 'custom'
  | 'ai'
  | 'export'
  | 'scheduled'

const SECTIONS: { id: ReportSection; label: string }[] = [
  { id: 'builder', label: 'Dashboard Builder' },
  { id: 'charts', label: 'Charts' },
  { id: 'tables', label: 'Tables' },
  { id: 'kpi', label: 'KPI Cards' },
  { id: 'heatmaps', label: 'Heatmaps' },
  { id: 'funnel', label: 'Funnel' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'lead', label: 'Lead' },
  { id: 'custom', label: 'Custom Reports' },
  { id: 'ai', label: 'AI Insights' },
  { id: 'export', label: 'Export' },
  { id: 'scheduled', label: 'Scheduled Reports' },
]

const WIDGETS = [
  { id: 'w1', name: 'Revenue trend', type: 'Line chart' },
  { id: 'w2', name: 'Open deals', type: 'KPI' },
  { id: 'w3', name: 'Lead sources', type: 'Bar chart' },
  { id: 'w4', name: 'Conversion funnel', type: 'Funnel' },
]

export function ReportsPage() {
  const { workspaceId = 'ws-acme' } = useParams()
  const [section, setSection] = useState<ReportSection>('builder')
  const [range, setRange] = useState<'7d' | '30d' | '90d' | 'ytd'>('30d')
  const [reportName, setReportName] = useState('Pipeline health')
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeTables, setIncludeTables] = useState(true)
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>(['w1', 'w2'])
  const [aiQuestion, setAiQuestion] = useState('')

  function toggleWidget(id: string) {
    setSelectedWidgets((current) =>
      current.includes(id) ? current.filter((w) => w !== id) : [...current, id],
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="Reports"
        description="Build dashboards, track KPIs, and schedule exports for your team."
        actions={
          <>
            <Link
              to={`/w/${workspaceId}/sheets`}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/60"
            >
              <Table2 className="h-3.5 w-3.5" />
              Source sheets
            </Link>
            <Button type="button" variant="accent" size="sm">
              <Plus className="h-3.5 w-3.5" />
              New report
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedTabs
          value={range}
          onChange={setRange}
          tabs={[
            { id: '7d', label: '7 days' },
            { id: '30d', label: '30 days' },
            { id: '90d', label: '90 days' },
            { id: 'ytd', label: 'YTD' },
          ]}
        />
        <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-xl">
          <StatTile label="Revenue" value="$128k" meta={range.toUpperCase()} />
          <StatTile label="Leads" value="1,842" meta="+8.2%" />
          <StatTile label="Win rate" value="27%" meta="Closed-won" />
        </div>
      </div>

      <SettingsShell
        nav={<SettingsNav items={SECTIONS} value={section} onChange={(id) => setSection(id as ReportSection)} />}
      >
        {section === 'builder' ? (
          <SectionCard
            title="Dashboard Builder"
            description="Compose widgets into a shareable board."
            actions={
              <Button type="button" size="sm" variant="outline">
                Preview
              </Button>
            }
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-name">Report name</Label>
                <Input
                  id="report-name"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {WIDGETS.map((widget) => {
                  const on = selectedWidgets.includes(widget.id)
                  return (
                    <button
                      key={widget.id}
                      type="button"
                      onClick={() => toggleWidget(widget.id)}
                      className={cn(
                        'rounded-xl border px-4 py-3 text-left transition-colors',
                        on
                          ? 'border-primary/40 bg-primary/10'
                          : 'border-border bg-background hover:bg-muted/40',
                      )}
                    >
                      <p className="text-[13.5px] font-medium text-foreground">{widget.name}</p>
                      <p className="mt-1 text-[12px] text-muted-foreground">{widget.type}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </SectionCard>
        ) : null}

        {section === 'charts' ? (
          <SectionCard title="Charts" description="Line, bar, and area visualizations.">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="mb-3 flex items-center gap-2 text-[13px] font-medium text-foreground">
                  <LineChart className="h-4 w-4 text-primary" />
                  Revenue trend
                </div>
                <div className="flex h-36 items-end gap-2">
                  {[36, 48, 42, 60, 55, 72, 68].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-md bg-primary/30" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="mb-3 flex items-center gap-2 text-[13px] font-medium text-foreground">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Leads by channel
                </div>
                <div className="flex h-36 items-end gap-2">
                  {[50, 70, 40, 85, 55].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-md bg-primary/20" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        ) : null}

        {section === 'tables' ? (
          <SectionCard title="Tables" description="Tabular breakdowns from sheet sources." padded={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-[13px]">
                <thead className="border-b border-border text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Owner</th>
                    <th className="px-5 py-3 font-medium">Deals</th>
                    <th className="px-5 py-3 font-medium">Revenue</th>
                    <th className="px-5 py-3 font-medium">Win rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ['Jordan Lee', '42', '$48,200', '31%'],
                    ['Sam Ortiz', '36', '$39,100', '24%'],
                    ['Casey Kim', '28', '$22,400', '19%'],
                  ].map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell) => (
                        <td key={cell} className="px-5 py-3 text-foreground">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        ) : null}

        {section === 'kpi' ? (
          <SectionCard title="KPI Cards" description="Spotlight metrics for leadership views.">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile label="ARR" value="$1.2M" meta="+6.4% MoM" />
              <StatTile label="Active seats" value="248" meta="94% utilized" />
              <StatTile label="NPS" value="54" meta="Last survey" />
              <StatTile label="Churn" value="1.8%" meta="Trailing 30d" />
            </div>
          </SectionCard>
        ) : null}

        {section === 'heatmaps' ? (
          <SectionCard title="Heatmaps" description="Activity intensity by weekday and hour.">
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-md border border-border"
                  style={{ backgroundColor: `color-mix(in oklab, var(--primary) ${((i * 17) % 70) + 10}%, transparent)` }}
                />
              ))}
            </div>
            <p className="mt-3 text-[12px] text-muted-foreground">Mock engagement heatmap · {range}</p>
          </SectionCard>
        ) : null}

        {section === 'funnel' ? (
          <SectionCard title="Funnel" description="Stage conversion across the pipeline.">
            <div className="space-y-2">
              {[
                { label: 'Leads', value: 100, width: '100%' },
                { label: 'Qualified', value: 62, width: '72%' },
                { label: 'Proposal', value: 34, width: '48%' },
                { label: 'Won', value: 18, width: '28%' },
              ].map((step) => (
                <div key={step.label}>
                  <div className="mb-1 flex justify-between text-[12.5px]">
                    <span className="text-foreground">{step.label}</span>
                    <span className="text-muted-foreground">{step.value}%</span>
                  </div>
                  <div className="h-8 rounded-lg border border-border bg-background">
                    <div className="h-full rounded-lg bg-primary/25" style={{ width: step.width }} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'revenue' ? (
          <SectionCard title="Revenue" description="Recognized and pipeline revenue." padded={false}>
            {[
              { title: 'New MRR', meta: '$18,400 · This month' },
              { title: 'Expansion', meta: '$4,200 · Upsells' },
              { title: 'Churned MRR', meta: '-$1,100 · Cancellations' },
            ].map((item) => (
              <ListRow key={item.title} title={item.title} meta={item.meta} />
            ))}
          </SectionCard>
        ) : null}

        {section === 'lead' ? (
          <SectionCard title="Lead" description="Acquisition and quality signals.">
            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile label="New leads" value="312" meta={range} />
              <StatTile label="MQL" value="94" meta="30% of leads" />
              <StatTile label="SQL" value="41" meta="44% of MQL" />
            </div>
          </SectionCard>
        ) : null}

        {section === 'custom' ? (
          <SectionCard title="Custom Reports" description="Saved report definitions." padded={false}>
            {[
              { name: 'Weekly exec summary', meta: 'Jordan · Shared' },
              { name: 'SDR activity pack', meta: 'Sam · Private' },
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

        {section === 'ai' ? (
          <SectionCard
            title="AI Insights"
            description="Ask natural-language questions about your metrics."
            actions={<Sparkles className="h-4 w-4 text-primary" />}
          >
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="Why did win rate drop last week?"
                />
                <Button type="button" variant="accent">
                  Ask
                </Button>
              </div>
              <div className="rounded-xl border border-border bg-background p-4 text-[13.5px] text-muted-foreground">
                Insights will appear here with supporting charts and drivers.
              </div>
            </div>
          </SectionCard>
        ) : null}

        {section === 'export' ? (
          <SectionCard title="Export" description="Download the current report view.">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[13px] text-foreground">
                <Checkbox checked={includeCharts} onChange={(e) => setIncludeCharts(e.target.checked)} />
                Include charts
              </label>
              <label className="flex items-center gap-2 text-[13px] text-foreground">
                <Checkbox checked={includeTables} onChange={(e) => setIncludeTables(e.target.checked)} />
                Include tables
              </label>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline">
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </Button>
                <Button type="button" size="sm" variant="outline">
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </Button>
                <Button type="button" size="sm" variant="outline">
                  <Download className="h-3.5 w-3.5" />
                  XLSX
                </Button>
              </div>
            </div>
          </SectionCard>
        ) : null}

        {section === 'scheduled' ? (
          <SectionCard
            title="Scheduled Reports"
            description="Automatic delivery to stakeholders."
            actions={<CalendarClock className="h-4 w-4 text-muted-foreground" />}
            padded={false}
          >
            {[
              { title: 'Monday exec pack', meta: 'Weekly · Email · 8 recipients' },
              { title: 'Finance close snapshot', meta: 'Monthly · Slack · Finance' },
            ].map((item) => (
              <ListRow
                key={item.title}
                title={item.title}
                meta={item.meta}
                trailing={
                  <Button type="button" size="sm" variant="outline">
                    Edit
                  </Button>
                }
              />
            ))}
          </SectionCard>
        ) : null}
      </SettingsShell>
    </div>
  )
}
