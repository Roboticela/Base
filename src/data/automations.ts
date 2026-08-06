export type AutomationStatus = 'Active' | 'Draft' | 'Paused' | 'Disabled'

export type AutomationItem = {
  id: string
  name: string
  description: string
  status: AutomationStatus
  trigger: string
  lastRun: string
  nextRun: string
  successRate: string
  executions: number
  createdBy: string
  modified: string
  folder: string
  tags: string[]
  favorite: boolean
}

export type WorkflowBlock = {
  id: string
  kind: 'trigger' | 'condition' | 'action' | 'delay' | 'loop' | 'branch'
  title: string
  detail: string
  x: number
  y: number
}

export const AUTOMATION_FOLDERS = ['All', 'Sales', 'Support', 'Ops', 'AI', 'Archived']

export const AUTOMATIONS: AutomationItem[] = [
  {
    id: 'auto-followup',
    name: 'Lead follow-up sequence',
    description: 'Wait 2 days after lead create, email if no reply, then notify owner.',
    status: 'Active',
    trigger: 'Record Created',
    lastRun: '12m ago',
    nextRun: '—',
    successRate: '98.4%',
    executions: 842,
    createdBy: 'You',
    modified: '1h ago',
    folder: 'Sales',
    tags: ['email', 'crm'],
    favorite: true,
  },
  {
    id: 'auto-assign',
    name: 'Round-robin lead assignment',
    description: 'Assign new leads to sales reps by load.',
    status: 'Active',
    trigger: 'Record Created',
    lastRun: '34m ago',
    nextRun: '—',
    successRate: '99.1%',
    executions: 1204,
    createdBy: 'Alex Rivera',
    modified: 'Yesterday',
    folder: 'Sales',
    tags: ['assignment'],
    favorite: true,
  },
  {
    id: 'auto-digest',
    name: 'Daily pipeline digest',
    description: 'Email weekly summary of open deals every weekday at 8am.',
    status: 'Paused',
    trigger: 'Daily Schedule',
    lastRun: 'Yesterday',
    nextRun: 'Tomorrow 8:00',
    successRate: '100%',
    executions: 48,
    createdBy: 'You',
    modified: '3d ago',
    folder: 'Ops',
    tags: ['report', 'email'],
    favorite: false,
  },
  {
    id: 'auto-dupes',
    name: 'Duplicate cleanup',
    description: 'When duplicate email detected, flag and notify admin.',
    status: 'Draft',
    trigger: 'Duplicate Detected',
    lastRun: 'Never',
    nextRun: '—',
    successRate: '—',
    executions: 0,
    createdBy: 'You',
    modified: '2h ago',
    folder: 'AI',
    tags: ['data-quality'],
    favorite: false,
  },
  {
    id: 'auto-invoice',
    name: 'Invoice reminder',
    description: 'Send reminder 3 days before due date.',
    status: 'Disabled',
    trigger: 'Custom Schedule',
    lastRun: '1w ago',
    nextRun: '—',
    successRate: '96.2%',
    executions: 210,
    createdBy: 'Morgan Lee',
    modified: '2w ago',
    folder: 'Ops',
    tags: ['billing'],
    favorite: false,
  },
]

export const DEFAULT_WORKFLOW: WorkflowBlock[] = [
  {
    id: 'b1',
    kind: 'trigger',
    title: 'Record Created',
    detail: 'Sheet: Customers',
    x: 80,
    y: 120,
  },
  {
    id: 'b2',
    kind: 'delay',
    title: 'Wait 2 days',
    detail: 'Business hours only',
    x: 320,
    y: 120,
  },
  {
    id: 'b3',
    kind: 'condition',
    title: 'No reply received',
    detail: 'IF Email Replied is false',
    x: 560,
    y: 120,
  },
  {
    id: 'b4',
    kind: 'action',
    title: 'Send follow-up email',
    detail: 'Template: First follow-up',
    x: 800,
    y: 40,
  },
  {
    id: 'b5',
    kind: 'delay',
    title: 'Wait 3 days',
    detail: 'Then continue',
    x: 1040,
    y: 40,
  },
  {
    id: 'b6',
    kind: 'action',
    title: 'Notify sales rep',
    detail: 'In-app + Slack',
    x: 1280,
    y: 40,
  },
  {
    id: 'b7',
    kind: 'action',
    title: 'End path',
    detail: 'ELSE: stop workflow',
    x: 800,
    y: 220,
  },
]

export const TRIGGER_LIBRARY = [
  { group: 'Record Events', items: ['Record Created', 'Record Updated', 'Record Deleted', 'Record Archived', 'Field Changed', 'Duplicate Detected'] },
  { group: 'Time Events', items: ['Every Minute', 'Hourly', 'Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom Schedule', 'Countdown Completed'] },
  { group: 'User Events', items: ['User Registered', 'User Logged In', 'Invitation Accepted', 'Profile Updated'] },
  { group: 'Email Events', items: ['Email Sent', 'Email Opened', 'Email Clicked', 'Email Replied', 'Bounce', 'Unsubscribe'] },
  { group: 'Form Events', items: ['Form Submitted', 'File Uploaded'] },
  { group: 'AI Events', items: ['AI Completed', 'AI Failed', 'AI Suggestion Accepted'] },
  { group: 'API Events', items: ['Webhook Received', 'API Request', 'External Service Response'] },
]

export const ACTION_LIBRARY = [
  { group: 'Record Actions', items: ['Create Record', 'Update Record', 'Delete Record', 'Archive Record', 'Duplicate Record', 'Assign Record', 'Move Record'] },
  { group: 'Sheet Actions', items: ['Create Sheet', 'Update Sheet', 'Import Data', 'Export Data'] },
  { group: 'Email Actions', items: ['Send Email', 'Send Template', 'Schedule Email', 'Cancel Email', 'Reply Automatically'] },
  { group: 'AI Actions', items: ['Generate Content', 'Summarize', 'Categorize', 'Translate', 'Analyze', 'Fill Missing Fields', 'Generate Formula', 'Generate Report'] },
  { group: 'Notifications', items: ['Send Notification', 'Send Slack Message', 'Send Discord Message', 'Push Notification', 'SMS'] },
  { group: 'Integrations', items: ['Webhook', 'HTTP Request', 'Google Sheets', 'Airtable', 'Notion', 'Stripe', 'Zapier', 'Make', 'n8n'] },
]

export const AUTOMATION_TEMPLATES = [
  { id: 't1', name: 'Follow-up Email Sequence', category: 'Sales', blocks: 6 },
  { id: 't2', name: 'Lead Assignment', category: 'Sales', blocks: 3 },
  { id: 't3', name: 'Invoice Reminder', category: 'Finance', blocks: 4 },
  { id: 't4', name: 'Approval Workflow', category: 'Ops', blocks: 5 },
  { id: 't5', name: 'Task Assignment', category: 'Ops', blocks: 3 },
  { id: 't6', name: 'Welcome Email', category: 'Onboarding', blocks: 2 },
  { id: 't7', name: 'Duplicate Cleanup', category: 'Data', blocks: 4 },
  { id: 't8', name: 'Daily Report', category: 'Analytics', blocks: 3 },
]

export const EXECUTION_LOGS = [
  {
    id: 'e1',
    start: 'Today 14:02',
    end: '14:02:08',
    duration: '8s',
    status: 'Success',
    trigger: 'Record Created',
    actions: 4,
    error: '',
  },
  {
    id: 'e2',
    start: 'Today 11:18',
    end: '11:18:12',
    duration: '12s',
    status: 'Success',
    trigger: 'Record Created',
    actions: 4,
    error: '',
  },
  {
    id: 'e3',
    start: 'Yesterday 16:40',
    end: '16:40:05',
    duration: '5s',
    status: 'Failed',
    trigger: 'Record Created',
    actions: 2,
    error: 'SMTP timeout on Send Email',
  },
]
