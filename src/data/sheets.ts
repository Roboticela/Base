export type SheetPermission = 'View' | 'Comment' | 'Edit' | 'Admin'
export type SheetStatus = 'active' | 'draft' | 'template' | 'archived'

export type SheetItem = {
  id: string
  name: string
  description: string
  folderId: string
  folder: string
  records: number
  fields: number
  owner: string
  createdBy: string
  modifiedBy: string
  created: string
  updated: string
  lastOpened: string
  favorite: boolean
  pinned: boolean
  shared: boolean
  archived: boolean
  permission: SheetPermission
  status: SheetStatus
  tags: string[]
  icon: string
  storage: string
}

export type SheetFolder = {
  id: string
  name: string
  parentId: string | null
  favorite: boolean
  collapsed?: boolean
}

export const SHEET_FOLDERS: SheetFolder[] = [
  { id: 'all', name: 'All sheets', parentId: null, favorite: false },
  { id: 'favorites', name: 'Favorites', parentId: null, favorite: true },
  { id: 'recent', name: 'Recently opened', parentId: null, favorite: false },
  { id: 'shared', name: 'Shared with me', parentId: null, favorite: false },
  { id: 'archived', name: 'Archived', parentId: null, favorite: false },
  { id: 'sales', name: 'Sales', parentId: null, favorite: true },
  { id: 'sales-pipeline', name: 'Pipeline', parentId: 'sales', favorite: false },
  { id: 'ops', name: 'Ops', parentId: null, favorite: false },
  { id: 'support', name: 'Support', parentId: null, favorite: false },
  { id: 'personal', name: 'Personal', parentId: null, favorite: false },
]

export const MOCK_SHEETS: SheetItem[] = [
  {
    id: 'sheet-customers',
    name: 'Customers',
    description: 'Account directory with contacts, tiers, and health scores.',
    folderId: 'sales',
    folder: 'Sales',
    records: 4821,
    fields: 28,
    owner: 'You',
    createdBy: 'You',
    modifiedBy: 'Alex Rivera',
    created: 'Jan 12, 2026',
    updated: '20m ago',
    lastOpened: '12m ago',
    favorite: true,
    pinned: true,
    shared: true,
    archived: false,
    permission: 'Admin',
    status: 'active',
    tags: ['crm', 'core'],
    icon: 'C',
    storage: '124 MB',
  },
  {
    id: 'sheet-deals',
    name: 'Deals',
    description: 'Pipeline stages, amounts, and close dates.',
    folderId: 'sales-pipeline',
    folder: 'Sales / Pipeline',
    records: 906,
    fields: 22,
    owner: 'Alex Rivera',
    createdBy: 'Alex Rivera',
    modifiedBy: 'You',
    created: 'Feb 2, 2026',
    updated: '1h ago',
    lastOpened: '1h ago',
    favorite: true,
    pinned: false,
    shared: true,
    archived: false,
    permission: 'Edit',
    status: 'active',
    tags: ['crm', 'revenue'],
    icon: 'D',
    storage: '48 MB',
  },
  {
    id: 'sheet-inventory',
    name: 'Inventory',
    description: 'SKU levels, warehouses, and reorder thresholds.',
    folderId: 'ops',
    folder: 'Ops',
    records: 3811,
    fields: 31,
    owner: 'Morgan Lee',
    createdBy: 'Morgan Lee',
    modifiedBy: 'Morgan Lee',
    created: 'Dec 8, 2025',
    updated: 'Yesterday',
    lastOpened: 'Yesterday',
    favorite: false,
    pinned: true,
    shared: false,
    archived: false,
    permission: 'Edit',
    status: 'active',
    tags: ['ops'],
    icon: 'I',
    storage: '210 MB',
  },
  {
    id: 'sheet-tickets',
    name: 'Support tickets',
    description: 'Inbound tickets, SLA timers, and assignee routing.',
    folderId: 'support',
    folder: 'Support',
    records: 1204,
    fields: 19,
    owner: 'You',
    createdBy: 'Sam Patel',
    modifiedBy: 'You',
    created: 'Mar 1, 2026',
    updated: '2 days ago',
    lastOpened: '3 days ago',
    favorite: false,
    pinned: false,
    shared: true,
    archived: false,
    permission: 'Comment',
    status: 'active',
    tags: ['support', 'sla'],
    icon: 'S',
    storage: '66 MB',
  },
  {
    id: 'sheet-projects',
    name: 'Projects',
    description: 'Delivery tracker with milestones and owners.',
    folderId: 'ops',
    folder: 'Ops',
    records: 148,
    fields: 16,
    owner: 'You',
    createdBy: 'You',
    modifiedBy: 'You',
    created: 'Mar 18, 2026',
    updated: '4h ago',
    lastOpened: 'Today',
    favorite: true,
    pinned: false,
    shared: true,
    archived: false,
    permission: 'Admin',
    status: 'active',
    tags: ['delivery'],
    icon: 'P',
    storage: '18 MB',
  },
  {
    id: 'sheet-hr',
    name: 'Employees',
    description: 'HR roster generated from AI template.',
    folderId: 'personal',
    folder: 'Personal',
    records: 86,
    fields: 24,
    owner: 'You',
    createdBy: 'AI',
    modifiedBy: 'You',
    created: 'Mar 20, 2026',
    updated: '5 days ago',
    lastOpened: '1 week ago',
    favorite: false,
    pinned: false,
    shared: false,
    archived: false,
    permission: 'Admin',
    status: 'draft',
    tags: ['hr', 'ai'],
    icon: 'E',
    storage: '9 MB',
  },
  {
    id: 'sheet-legacy',
    name: 'Old leads dump',
    description: 'Archived import from 2024 CRM migration.',
    folderId: 'personal',
    folder: 'Personal',
    records: 220,
    fields: 12,
    owner: 'You',
    createdBy: 'You',
    modifiedBy: 'You',
    created: 'Nov 3, 2024',
    updated: '3 months ago',
    lastOpened: '2 months ago',
    favorite: false,
    pinned: false,
    shared: false,
    archived: true,
    permission: 'Admin',
    status: 'archived',
    tags: ['legacy'],
    icon: 'L',
    storage: '14 MB',
  },
]

export const SHEET_TEMPLATES = [
  { id: 't1', name: 'CRM Starter', category: 'Sales', fields: 18, records: 0 },
  { id: 't2', name: 'Inventory Basic', category: 'Ops', fields: 14, records: 0 },
  { id: 't3', name: 'School Management', category: 'Education', fields: 22, records: 0 },
  { id: 't4', name: 'HR Directory', category: 'People', fields: 16, records: 0 },
  { id: 't5', name: 'Project Tracker', category: 'Delivery', fields: 12, records: 0 },
  { id: 't6', name: 'Tender Management', category: 'Sales', fields: 20, records: 0 },
]

export const SHEET_ACTIVITY = [
  { id: 'a1', text: 'Alex added 12 records to Customers', time: '20m ago' },
  { id: 'a2', text: 'You created field “Health score”', time: '1h ago' },
  { id: 'a3', text: 'Import completed on Inventory', time: 'Yesterday' },
  { id: 'a4', text: 'Morgan updated Pipeline view filters', time: '2d ago' },
]

export type BuilderField = {
  id: string
  label: string
  type: string
  required?: boolean
  unique?: boolean
  hidden?: boolean
  locked?: boolean
  width?: number
}

export type BuilderRecord = {
  id: string
  values: Record<string, string>
  created: string
  updated: string
  createdBy: string
  updatedBy: string
}

export type BuilderView = {
  id: string
  name: string
  type: 'Table' | 'Kanban' | 'Calendar' | 'Gallery' | 'Timeline' | 'Gantt' | 'List' | 'Cards' | 'Map'
  favorite?: boolean
}

export const BUILDER_FIELDS: BuilderField[] = [
  { id: 'name', label: 'Name', type: 'Text', required: true, unique: true, width: 180 },
  { id: 'email', label: 'Email', type: 'Email', unique: true, width: 200 },
  { id: 'status', label: 'Status', type: 'Single Select', width: 140 },
  { id: 'owner', label: 'Owner', type: 'Relation', width: 120 },
  { id: 'value', label: 'Deal value', type: 'Currency', width: 120 },
  { id: 'rating', label: 'Priority', type: 'Rating', width: 110 },
  { id: 'updated', label: 'Updated', type: 'Date', width: 110 },
  { id: 'website', label: 'Website', type: 'URL', width: 160 },
]

export const BUILDER_RECORDS: BuilderRecord[] = [
  {
    id: 'r1',
    values: {
      name: 'Contoso Ltd',
      email: 'hello@contoso.com',
      status: 'Open',
      owner: 'Jordan',
      value: '48000',
      rating: '4',
      updated: 'Today',
      website: 'contoso.com',
    },
    created: 'Mar 1',
    updated: 'Today',
    createdBy: 'You',
    updatedBy: 'Alex',
  },
  {
    id: 'r2',
    values: {
      name: 'Northwind',
      email: 'sales@northwind.io',
      status: 'Negotiation',
      owner: 'Alex',
      value: '22500',
      rating: '3',
      updated: 'Yesterday',
      website: 'northwind.io',
    },
    created: 'Mar 2',
    updated: 'Yesterday',
    createdBy: 'Alex',
    updatedBy: 'Alex',
  },
  {
    id: 'r3',
    values: {
      name: 'Fabrikam',
      email: 'team@fabrikam.com',
      status: 'Won',
      owner: 'Morgan',
      value: '91200',
      rating: '5',
      updated: '2d ago',
      website: 'fabrikam.com',
    },
    created: 'Feb 20',
    updated: '2d ago',
    createdBy: 'Morgan',
    updatedBy: 'You',
  },
  {
    id: 'r4',
    values: {
      name: 'Adventure Works',
      email: 'ops@adventure.works',
      status: 'Open',
      owner: 'Jordan',
      value: '12800',
      rating: '2',
      updated: '3d ago',
      website: 'adventure.works',
    },
    created: 'Feb 18',
    updated: '3d ago',
    createdBy: 'You',
    updatedBy: 'Jordan',
  },
  {
    id: 'r5',
    values: {
      name: 'Tailspin Toys',
      email: 'buy@tailspin.toys',
      status: 'Lost',
      owner: 'Sam',
      value: '4200',
      rating: '1',
      updated: '1w ago',
      website: 'tailspin.toys',
    },
    created: 'Feb 10',
    updated: '1w ago',
    createdBy: 'Sam',
    updatedBy: 'Sam',
  },
  {
    id: 'r6',
    values: {
      name: 'Contoso Ltd',
      email: 'hello@contoso.com',
      status: 'Open',
      owner: 'Alex',
      value: '15000',
      rating: '3',
      updated: 'Today',
      website: 'contoso.com',
    },
    created: 'Mar 21',
    updated: 'Today',
    createdBy: 'Alex',
    updatedBy: 'Alex',
  },
]

export const BUILDER_VIEWS: BuilderView[] = [
  { id: 'v-table', name: 'All records', type: 'Table', favorite: true },
  { id: 'v-open', name: 'Open deals', type: 'Table' },
  { id: 'v-kanban', name: 'By status', type: 'Kanban', favorite: true },
  { id: 'v-cal', name: 'Close calendar', type: 'Calendar' },
  { id: 'v-gallery', name: 'Account cards', type: 'Gallery' },
]

export const FIELD_TYPES = [
  'Text',
  'Long Text',
  'Email',
  'Phone',
  'URL',
  'Address',
  'Number',
  'Currency',
  'Percentage',
  'Date',
  'DateTime',
  'Duration',
  'Checkbox',
  'Rating',
  'Single Select',
  'Multi Select',
  'Relation',
  'Lookup',
  'Rollup',
  'Formula',
  'Auto Number',
  'File',
  'Image',
  'PDF',
  'Video',
  'JSON',
  'Rich Text',
  'AI Generated',
]

export const SHEET_COLUMNS = BUILDER_FIELDS.map((f) => ({
  id: f.id,
  label: f.label,
  type: f.type,
}))

export const SHEET_ROWS = BUILDER_RECORDS.map((r) => ({
  id: r.id,
  name: r.values.name,
  email: r.values.email,
  status: r.values.status,
  owner: r.values.owner,
  value: `$${Number(r.values.value).toLocaleString()}`,
  updated: r.values.updated,
}))

/** @deprecated use SHEET_FOLDERS */
export const SHEET_FOLDER_NAMES = ['All', 'Sales', 'Ops', 'Support', 'Personal']
