import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  CreditCard,
  Download,
  Receipt,
  Tag,
  Users,
  XCircle,
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
  { id: 'subscription', label: 'Subscription' },
  { id: 'plans', label: 'Plans' },
  { id: 'usage', label: 'Usage' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'payment', label: 'Payment Methods' },
  { id: 'coupons', label: 'Coupons' },
  { id: 'taxes', label: 'Taxes' },
  { id: 'history', label: 'Billing History' },
  { id: 'upgrade', label: 'Upgrade' },
  { id: 'cancel', label: 'Cancel' },
  { id: 'licenses', label: 'Team Licenses' },
] as const

type SectionId = (typeof NAV)[number]['id']

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    seats: '5 seats',
    features: ['Sheets & forms', '2 GB storage', 'Email support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$79',
    seats: '20 seats',
    features: ['Automations', '50 GB storage', 'AI credits', 'Priority support'],
    current: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: '$199',
    seats: 'Unlimited seats',
    features: ['SSO', 'Audit logs', 'Custom domains', 'Dedicated success'],
  },
]

const INVOICES = [
  { id: 'inv-1042', title: 'INV-1042', meta: 'Mar 1, 2026 · Paid · $79.00' },
  { id: 'inv-1031', title: 'INV-1031', meta: 'Feb 1, 2026 · Paid · $79.00' },
  { id: 'inv-1020', title: 'INV-1020', meta: 'Jan 1, 2026 · Paid · $79.00' },
]

export function BillingPage() {
  const { workspaceId = 'ws-acme' } = useParams()
  const [section, setSection] = useState<SectionId>('subscription')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [coupon, setCoupon] = useState('')
  const [taxId, setTaxId] = useState('')
  const [cancelReason, setCancelReason] = useState('')

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Billing & plans"
        description="Manage subscription, invoices, and team licenses for this workspace."
        actions={
          <Link
            to={`/w/${workspaceId}/settings`}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-border px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/60"
          >
            Workspace settings
          </Link>
        }
      />

      <SettingsShell
        nav={<SettingsNav items={[...NAV]} value={section} onChange={(id) => setSection(id as SectionId)} />}
      >
        {section === 'subscription' ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile label="Plan" value="Pro" meta="Renews Apr 1" />
              <StatTile label="Seats" value="12 / 20" meta="8 available" />
              <StatTile label="Next invoice" value="$79" meta="Monthly" />
            </div>
            <SectionCard title="Current subscription" description="Active Pro plan">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[15px] font-semibold text-foreground">Pro · Monthly</p>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    Billed to Visa ···· 4242 · jordan@acme.co
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setSection('upgrade')}>
                    Upgrade
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setSection('cancel')}>
                    Cancel
                  </Button>
                </div>
              </div>
            </SectionCard>
          </>
        ) : null}

        {section === 'plans' ? (
          <SectionCard
            title="Plans"
            description="Compare tiers for this workspace"
            actions={
              <SegmentedTabs
                value={billingCycle}
                onChange={setBillingCycle}
                tabs={[
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'yearly', label: 'Yearly' },
                ]}
              />
            }
          >
            <div className="grid gap-4 lg:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    'rounded-2xl border p-5',
                    plan.current ? 'border-primary bg-primary/5' : 'border-border bg-background',
                  )}
                >
                  <p className="text-[13px] font-medium text-muted-foreground">{plan.name}</p>
                  <p className="mt-2 text-[28px] font-semibold tracking-tight text-foreground">
                    {billingCycle === 'yearly'
                      ? `$${Number(plan.price.replace('$', '')) * 10}`
                      : plan.price}
                    <span className="text-[13px] font-medium text-muted-foreground">
                      /{billingCycle === 'yearly' ? 'yr' : 'mo'}
                    </span>
                  </p>
                  <p className="mt-1 text-[12.5px] text-muted-foreground">{plan.seats}</p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="text-[13px] text-foreground">
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="button"
                    className="mt-5 w-full"
                    variant={plan.current ? 'outline' : 'accent'}
                    size="sm"
                    disabled={plan.current}
                  >
                    {plan.current ? 'Current plan' : 'Select'}
                  </Button>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'usage' ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile label="Records" value="48.2k" meta="of 100k" />
              <StatTile label="Automations" value="126" meta="runs this month" />
              <StatTile label="AI credits" value="1,240" meta="remaining" />
              <StatTile label="Storage" value="12.4 GB" meta="of 50 GB" />
            </div>
            <SectionCard title="Usage detail" description="Resets with billing cycle">
              <div className="space-y-4">
                {[
                  { label: 'Records', pct: 48 },
                  { label: 'Storage', pct: 25 },
                  { label: 'AI credits', pct: 38 },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="mb-1.5 flex justify-between text-[12.5px]">
                      <span className="text-foreground">{row.label}</span>
                      <span className="text-muted-foreground">{row.pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full border border-border bg-muted/40">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${row.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </>
        ) : null}

        {section === 'invoices' ? (
          <SectionCard
            title="Invoices"
            description="Downloadable billing statements"
            padded={false}
            actions={<Receipt className="h-4 w-4 text-muted-foreground" />}
          >
            <div className="divide-y divide-border">
              {INVOICES.map((inv) => (
                <ListRow
                  key={inv.id}
                  title={inv.title}
                  meta={inv.meta}
                  trailing={
                    <Button type="button" size="sm" variant="ghost">
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </Button>
                  }
                />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'payment' ? (
          <SectionCard
            title="Payment methods"
            description="Cards and bank accounts on file"
            actions={
              <Button type="button" size="sm" variant="outline">
                <CreditCard className="h-3.5 w-3.5" />
                Add card
              </Button>
            }
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
                <div>
                  <p className="text-[13.5px] font-medium text-foreground">Visa ···· 4242</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">Expires 08/28 · Default</p>
                </div>
                <Button type="button" size="sm" variant="ghost">
                  Remove
                </Button>
              </div>
              <EmptyState
                title="No other methods"
                description="Add a backup card to avoid failed renewals."
              />
            </div>
          </SectionCard>
        ) : null}

        {section === 'coupons' ? (
          <SectionCard title="Coupons" description="Apply a promotional code">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 space-y-2">
                <Label htmlFor="coupon">Coupon code</Label>
                <Input
                  id="coupon"
                  placeholder="SAVE20"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
              </div>
              <Button type="button" variant="accent" className="sm:mt-7">
                <Tag className="h-3.5 w-3.5" />
                Apply
              </Button>
            </div>
          </SectionCard>
        ) : null}

        {section === 'taxes' ? (
          <SectionCard title="Taxes" description="Tax ID and billing location">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tax-id">VAT / Tax ID</Label>
                <Input id="tax-id" value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="EU123456789" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Billing country</Label>
                <Input id="country" defaultValue="United States" />
              </div>
            </div>
          </SectionCard>
        ) : null}

        {section === 'history' ? (
          <SectionCard title="Billing history" description="Charges, credits, and adjustments" padded={false}>
            <div className="divide-y divide-border">
              {[
                { title: 'Pro plan renewal', meta: 'Mar 1 · -$79.00' },
                { title: 'Seat add-on (2)', meta: 'Feb 18 · -$16.00' },
                { title: 'Coupon credit SAVE10', meta: 'Feb 1 · +$7.90' },
              ].map((row) => (
                <ListRow key={row.title} title={row.title} meta={row.meta} />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {section === 'upgrade' ? (
          <SectionCard title="Upgrade" description="Move to Business for SSO and audit controls">
            <div className="space-y-4">
              <p className="text-[14px] text-muted-foreground">
                Upgrade includes unlimited seats, custom domains, SSO, and a dedicated success manager.
              </p>
              <div className="rounded-xl border border-border bg-background px-4 py-3">
                <p className="text-[13.5px] font-medium text-foreground">Business · $199/mo</p>
                <p className="mt-1 text-[12.5px] text-muted-foreground">Prorated from today · Cancel anytime</p>
              </div>
              <Button type="button" variant="accent">
                Confirm upgrade
              </Button>
            </div>
          </SectionCard>
        ) : null}

        {section === 'cancel' ? (
          <SectionCard
            title="Cancel subscription"
            description="Your workspace stays active until the end of the billing period"
            actions={<XCircle className="h-4 w-4 text-red-500" />}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cancel-reason">Reason (optional)</Label>
                <Input
                  id="cancel-reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Tell us what we could improve"
                />
              </div>
              <Button type="button" variant="outline" className="border-red-500/40 text-red-500">
                Cancel at period end
              </Button>
            </div>
          </SectionCard>
        ) : null}

        {section === 'licenses' ? (
          <SectionCard
            title="Team licenses"
            description="Assign paid seats to members"
            actions={
              <Button type="button" size="sm" variant="outline">
                <Users className="h-3.5 w-3.5" />
                Assign seat
              </Button>
            }
            padded={false}
          >
            <div className="divide-y divide-border">
              {[
                { name: 'Jordan Lee', meta: 'Owner · Licensed' },
                { name: 'Sam Rivera', meta: 'Admin · Licensed' },
                { name: 'Alex Chen', meta: 'Editor · Licensed' },
                { name: 'Unassigned seats', meta: '8 remaining on Pro' },
              ].map((row) => (
                <ListRow key={row.name} title={row.name} meta={row.meta} />
              ))}
            </div>
          </SectionCard>
        ) : null}
      </SettingsShell>
    </div>
  )
}
