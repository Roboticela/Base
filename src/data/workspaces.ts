export type WorkspaceRole = 'Owner' | 'Admin' | 'Editor' | 'Viewer'
export type WorkspaceStatus = 'active' | 'archived' | 'pending'

export type Workspace = {
  id: string
  name: string
  slug: string
  description: string
  memberCount: number
  role: WorkspaceRole
  lastAccessed: string
  favorite: boolean
  pinned: boolean
  status: WorkspaceStatus
  color: string
  initials: string
}

export const MOCK_WORKSPACES: Workspace[] = [
  {
    id: 'ws-acme',
    name: 'Acme Studio',
    slug: 'acme-studio',
    description: 'Product ops, CRM sheets, and customer follow-ups.',
    memberCount: 24,
    role: 'Owner',
    lastAccessed: '2 hours ago',
    favorite: true,
    pinned: true,
    status: 'active',
    color: '#6366f1',
    initials: 'AS',
  },
  {
    id: 'ws-north',
    name: 'Northwind Labs',
    slug: 'northwind-labs',
    description: 'Research pipeline and experiment tracking.',
    memberCount: 11,
    role: 'Admin',
    lastAccessed: 'Yesterday',
    favorite: true,
    pinned: false,
    status: 'active',
    color: '#10b981',
    initials: 'NL',
  },
  {
    id: 'ws-orbit',
    name: 'Orbit Retail',
    slug: 'orbit-retail',
    description: 'Inventory sheets, store performance, and campaigns.',
    memberCount: 48,
    role: 'Editor',
    lastAccessed: '3 days ago',
    favorite: false,
    pinned: true,
    status: 'active',
    color: '#f59e0b',
    initials: 'OR',
  },
  {
    id: 'ws-pulse',
    name: 'Pulse Analytics',
    slug: 'pulse-analytics',
    description: 'Reporting workspace for weekly business reviews.',
    memberCount: 8,
    role: 'Viewer',
    lastAccessed: '1 week ago',
    favorite: false,
    pinned: false,
    status: 'active',
    color: '#3b82f6',
    initials: 'PA',
  },
  {
    id: 'ws-archive',
    name: 'Legacy CRM',
    slug: 'legacy-crm',
    description: 'Archived migration workspace from 2024.',
    memberCount: 6,
    role: 'Owner',
    lastAccessed: '2 months ago',
    favorite: false,
    pinned: false,
    status: 'archived',
    color: '#64748b',
    initials: 'LC',
  },
]

export const INDUSTRIES = [
  'Technology',
  'Retail',
  'Healthcare',
  'Finance',
  'Education',
  'Agency',
  'Other',
]

export const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–1000', '1000+']

export const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Karachi',
  'Asia/Dubai',
]

export const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Arabic', 'Urdu']

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'AED', 'INR']
