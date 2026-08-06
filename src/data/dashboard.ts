export type DashboardStat = {
  id: string
  label: string
  value: string
  change: string
  tone: 'neutral' | 'up' | 'down'
}

export type ActivityItem = {
  id: string
  type: 'record' | 'member' | 'email' | 'automation' | 'ai' | 'import'
  title: string
  detail: string
  user: string
  time: string
}

export type QuickResource = {
  id: string
  name: string
  kind: 'Sheet' | 'View' | 'Report' | 'Automation' | 'Template' | 'AI'
  meta: string
  pinned?: boolean
}

export type AssignedTask = {
  id: string
  title: string
  type: string
  due: string
  priority: 'high' | 'medium' | 'low'
}

export type NotificationItem = {
  id: string
  title: string
  detail: string
  time: string
  read: boolean
}

export type RecentSheet = {
  id: string
  name: string
  icon: string
  lastModified: string
  records: number
  owner: string
}

export const DASHBOARD_STATS: DashboardStat[] = [
  { id: 'sheets', label: 'Total Sheets', value: '42', change: '+3 this week', tone: 'up' },
  { id: 'records', label: 'Total Records', value: '18.4k', change: '+612 today', tone: 'up' },
  { id: 'members', label: 'Active Members', value: '24', change: '3 online', tone: 'neutral' },
  { id: 'tasks', label: 'Open Tasks', value: '9', change: '2 overdue', tone: 'down' },
  { id: 'emails', label: 'Emails Sent', value: '1,284', change: 'Last 30 days', tone: 'neutral' },
  { id: 'followups', label: 'Pending Follow-ups', value: '17', change: '5 due today', tone: 'down' },
  { id: 'automations', label: 'Active Automations', value: '12', change: '98% success', tone: 'up' },
  { id: 'api', label: 'API Usage', value: '64%', change: 'of monthly quota', tone: 'neutral' },
]

export const ACTIVITY_FEED: ActivityItem[] = [
  {
    id: 'a1',
    type: 'record',
    title: '12 new customer records created',
    detail: 'Customers sheet',
    user: 'Jordan Avery',
    time: '12m ago',
  },
  {
    id: 'a2',
    type: 'email',
    title: 'Follow-up sequence sent',
    detail: '248 recipients · Welcome Series',
    user: 'Automation',
    time: '34m ago',
  },
  {
    id: 'a3',
    type: 'member',
    title: 'Sam Patel invited as Editor',
    detail: 'Pending acceptance',
    user: 'Alex Rivera',
    time: '1h ago',
  },
  {
    id: 'a4',
    type: 'ai',
    title: 'AI generated Deals pipeline sheet',
    detail: 'From prompt: “Track enterprise deals”',
    user: 'You',
    time: '2h ago',
  },
  {
    id: 'a5',
    type: 'automation',
    title: 'Nightly sync completed',
    detail: 'CRM Import · 1,042 rows',
    user: 'System',
    time: '5h ago',
  },
  {
    id: 'a6',
    type: 'import',
    title: 'CSV import finished',
    detail: 'Inventory · 3,811 records',
    user: 'Morgan Lee',
    time: 'Yesterday',
  },
]

export const QUICK_ACCESS: QuickResource[] = [
  { id: 'q1', name: 'Customers', kind: 'Sheet', meta: 'Opened 20m ago', pinned: true },
  { id: 'q2', name: 'Pipeline board', kind: 'View', meta: 'Opened 1h ago' },
  { id: 'q3', name: 'Weekly revenue', kind: 'Report', meta: 'Opened yesterday', pinned: true },
  { id: 'q4', name: 'Lead nurture', kind: 'Automation', meta: 'Ran 34m ago' },
  { id: 'q5', name: 'SaaS CRM starter', kind: 'Template', meta: 'Used 3 times' },
  { id: 'q6', name: 'Find duplicate leads', kind: 'AI', meta: 'Last chat 2h ago' },
]

export const ASSIGNED_TASKS: AssignedTask[] = [
  {
    id: 't1',
    title: 'Approve invite for Sam Patel',
    type: 'Invitation',
    due: 'Due today',
    priority: 'high',
  },
  {
    id: 't2',
    title: 'Follow up with Contoso deal',
    type: 'Follow-up',
    due: 'Due in 2h',
    priority: 'high',
  },
  {
    id: 't3',
    title: 'Review failed nightly sync',
    type: 'Automation',
    due: 'Needs attention',
    priority: 'medium',
  },
  {
    id: 't4',
    title: 'Update ownership on 4 records',
    type: 'Assigned records',
    due: 'This week',
    priority: 'low',
  },
]

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Automation error',
    detail: 'Lead nurture failed on 3 records',
    time: '18m ago',
    read: false,
  },
  {
    id: 'n2',
    title: 'Import completed',
    detail: 'Inventory CSV is ready to review',
    time: '1h ago',
    read: false,
  },
  {
    id: 'n3',
    title: 'Billing reminder',
    detail: 'Workspace plan renews in 5 days',
    time: 'Yesterday',
    read: true,
  },
  {
    id: 'n4',
    title: 'Team mention',
    detail: '@you in Customers comments',
    time: 'Yesterday',
    read: true,
  },
]

export const RECENT_SHEETS: RecentSheet[] = [
  {
    id: 's1',
    name: 'Customers',
    icon: 'C',
    lastModified: '20m ago',
    records: 4821,
    owner: 'You',
  },
  {
    id: 's2',
    name: 'Deals',
    icon: 'D',
    lastModified: '1h ago',
    records: 906,
    owner: 'Alex Rivera',
  },
  {
    id: 's3',
    name: 'Inventory',
    icon: 'I',
    lastModified: 'Yesterday',
    records: 3811,
    owner: 'Morgan Lee',
  },
  {
    id: 's4',
    name: 'Support tickets',
    icon: 'S',
    lastModified: '2 days ago',
    records: 1204,
    owner: 'You',
  },
]

export const FAVORITE_RESOURCES: QuickResource[] = [
  { id: 'f1', name: 'Customers', kind: 'Sheet', meta: 'Pinned', pinned: true },
  { id: 'f2', name: 'Executive overview', kind: 'Report', meta: 'Pinned', pinned: true },
  { id: 'f3', name: 'Deal alerts', kind: 'Automation', meta: 'Pinned', pinned: true },
  { id: 'f4', name: 'Formula builder', kind: 'AI', meta: 'Pinned', pinned: true },
]

export const AI_SUGGESTIONS = [
  'Summarize deals closing this week',
  'Generate a follow-up sheet from Customers',
  'Find duplicate emails in Customers',
  'Build an automation for overdue tasks',
]
