export type AiPhase =
  | 'idle'
  | 'understanding'
  | 'planning'
  | 'generating'
  | 'preview'
  | 'publishing'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  time: string
}

export type PreviewSheet = {
  id: string
  name: string
  description: string
  fields: number
  views: string[]
  related: string[]
}

export type PreviewField = {
  id: string
  sheet: string
  name: string
  type: string
  required: boolean
  unique: boolean
  defaultValue: string
  validation: string
  why: string
}

export type PreviewRelation = {
  id: string
  from: string
  to: string
  type: 'One-to-One' | 'One-to-Many' | 'Many-to-Many'
}

export type PreviewAutomation = {
  id: string
  name: string
  steps: string[]
}

export const AI_SUGGESTED_CATEGORIES = [
  'CRM',
  'Inventory',
  'Project Management',
  'HR',
  'Recruitment',
  'Finance',
  'School',
  'Hospital',
  'Real Estate',
  'Customer Support',
  'Marketing',
  'Email Outreach',
  'Tender Management',
  'Asset Tracking',
]

export const AI_EXAMPLE_PROMPTS = [
  'Build a CRM for software agencies with accounts, contacts, deals, and follow-up automations.',
  'Create an inventory management system with warehouses, SKUs, reorder alerts, and purchase orders.',
  'Build a hospital management platform with patients, appointments, billing, and staff schedules.',
  'Make a recruitment system with jobs, applicants, interviews, and offer workflows.',
  'Create a university portal with students, courses, enrollments, and grades.',
]

export const AI_GENERATION_STEPS = [
  'Understanding Prompt',
  'Planning Database',
  'Generating Sheets',
  'Creating Fields',
  'Creating Relations',
  'Building Automations',
  'Creating Dashboards',
  'Generating Reports',
  'Final Review',
  'Completed',
]

export const AI_PLAN_SUMMARY = {
  sheets: 8,
  fields: 64,
  relationships: 12,
  automations: 6,
  reports: 4,
  dashboards: 2,
  forms: 3,
  emailTemplates: 5,
  roles: 5,
}

export const AI_PREVIEW_SHEETS: PreviewSheet[] = [
  {
    id: 's1',
    name: 'Accounts',
    description: 'Company records for agencies and clients.',
    fields: 14,
    views: ['Table', 'Kanban by Tier'],
    related: ['Contacts', 'Deals'],
  },
  {
    id: 's2',
    name: 'Contacts',
    description: 'People linked to accounts.',
    fields: 12,
    views: ['Table', 'Gallery'],
    related: ['Accounts', 'Deals'],
  },
  {
    id: 's3',
    name: 'Deals',
    description: 'Pipeline opportunities and amounts.',
    fields: 16,
    views: ['Table', 'Kanban', 'Calendar'],
    related: ['Accounts', 'Contacts', 'Activities'],
  },
  {
    id: 's4',
    name: 'Activities',
    description: 'Calls, emails, and tasks on deals.',
    fields: 10,
    views: ['Table', 'Timeline'],
    related: ['Deals', 'Contacts'],
  },
  {
    id: 's5',
    name: 'Invoices',
    description: 'Billing linked to won deals.',
    fields: 11,
    views: ['Table', 'List'],
    related: ['Accounts', 'Deals'],
  },
]

export const AI_PREVIEW_FIELDS: PreviewField[] = [
  {
    id: 'f1',
    sheet: 'Accounts',
    name: 'Account Name',
    type: 'Text',
    required: true,
    unique: true,
    defaultValue: '—',
    validation: 'Required',
    why: 'Primary identifier for every company.',
  },
  {
    id: 'f2',
    sheet: 'Accounts',
    name: 'Website',
    type: 'URL',
    required: false,
    unique: true,
    defaultValue: '—',
    validation: 'Valid URL',
    why: 'Useful for enrichment and duplicate detection.',
  },
  {
    id: 'f3',
    sheet: 'Deals',
    name: 'Stage',
    type: 'Single Select',
    required: true,
    unique: false,
    defaultValue: 'Lead',
    validation: 'One of pipeline stages',
    why: 'Powers Kanban and stage-change automations.',
  },
  {
    id: 'f4',
    sheet: 'Deals',
    name: 'Amount',
    type: 'Currency',
    required: true,
    unique: false,
    defaultValue: '0',
    validation: '>= 0',
    why: 'Needed for revenue reports and forecasting.',
  },
  {
    id: 'f5',
    sheet: 'Contacts',
    name: 'Email',
    type: 'Email',
    required: true,
    unique: true,
    defaultValue: '—',
    validation: 'Unique email',
    why: 'Primary channel for sequences and notifications.',
  },
]

export const AI_PREVIEW_RELATIONS: PreviewRelation[] = [
  { id: 'r1', from: 'Accounts', to: 'Contacts', type: 'One-to-Many' },
  { id: 'r2', from: 'Accounts', to: 'Deals', type: 'One-to-Many' },
  { id: 'r3', from: 'Contacts', to: 'Deals', type: 'Many-to-Many' },
  { id: 'r4', from: 'Deals', to: 'Activities', type: 'One-to-Many' },
  { id: 'r5', from: 'Deals', to: 'Invoices', type: 'One-to-One' },
]

export const AI_PREVIEW_AUTOMATIONS: PreviewAutomation[] = [
  {
    id: 'a1',
    name: 'Lead follow-up',
    steps: ['Lead Created', 'Wait 2 Days', 'Send Email', 'If No Reply', 'Notify Sales'],
  },
  {
    id: 'a2',
    name: 'Deal won → invoice',
    steps: ['Stage = Won', 'Create Invoice', 'Notify Finance'],
  },
  {
    id: 'a3',
    name: 'Stale deal alert',
    steps: ['Daily Schedule', 'No activity 14 days', 'Notify Owner'],
  },
]

export const AI_PREVIEW_DASHBOARD = [
  'KPI: Pipeline value',
  'KPI: Open deals',
  'Chart: Deals by stage',
  'Recent activity',
  'Pending tasks',
  'Calendar: Close dates',
  'Emails sent this week',
]

export const AI_PREVIEW_REPORTS = [
  'Sales Report',
  'Monthly Revenue',
  'Lead Conversion',
  'Email Performance',
]

export const AI_PREVIEW_FORMS = [
  'Lead Form',
  'Contact Registration',
  'Support Ticket',
]

export const AI_PREVIEW_ROLES = [
  { role: 'Owner', access: 'Full control' },
  { role: 'Admin', access: 'Manage sheets & members' },
  { role: 'Manager', access: 'Edit all CRM sheets' },
  { role: 'Sales', access: 'Edit own deals & contacts' },
  { role: 'Viewer', access: 'Read-only dashboards' },
]

export const AI_IMPROVEMENTS = [
  'Add Follow-up Automation',
  'Add AI Lead Scoring',
  'Add Customer Portal',
  'Add Invoice Sheet',
  'Add Approval Workflow',
]

export const AI_DRAFTS = [
  { id: 'd1', title: 'Agency CRM v2', meta: 'Draft · Saved 2h ago' },
  { id: 'd2', title: 'Inventory starter', meta: 'Draft · Yesterday' },
]

export const AI_VERSIONS = [
  { id: 'v3', title: 'Version 3', meta: 'Current · Just now' },
  { id: 'v2', title: 'Version 2', meta: 'Edited plan · 20m ago' },
  { id: 'v1', title: 'Version 1', meta: 'First generation · 1h ago' },
]

export const AI_INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'c1',
    role: 'assistant',
    time: 'Just now',
    text: 'Describe the business system you need. I will propose sheets, fields, relationships, automations, forms, and dashboards before creating anything.',
  },
]
