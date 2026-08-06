import {
  Bell,
  Bot,
  Code2,
  CreditCard,
  FileSpreadsheet,
  FormInput,
  Home,
  LayoutTemplate,
  LineChart,
  Mail,
  Puzzle,
  Settings,
  Sparkles,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react'

export type AppNavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export function getWorkspaceNav(workspaceId: string): {
  primary: AppNavItem[]
  secondary: AppNavItem[]
} {
  const base = `/w/${workspaceId}`
  return {
    primary: [
      { label: 'Dashboard', href: base, icon: Home },
      { label: 'Sheets', href: `${base}/sheets`, icon: FileSpreadsheet },
      { label: 'AI Builder', href: `${base}/ai-builder`, icon: Sparkles },
      { label: 'AI Chat', href: `${base}/ai`, icon: Bot },
      { label: 'Automations', href: `${base}/automations`, icon: Workflow },
      { label: 'Email', href: `${base}/email`, icon: Mail },
      { label: 'Reports', href: `${base}/reports`, icon: LineChart },
      { label: 'Templates', href: `${base}/templates`, icon: LayoutTemplate },
      { label: 'Forms', href: `${base}/forms`, icon: FormInput },
      { label: 'Team', href: `${base}/team`, icon: Users },
    ],
    secondary: [
      { label: 'Integrations', href: `${base}/integrations`, icon: Puzzle },
      { label: 'Developers', href: `${base}/developers`, icon: Code2 },
      { label: 'Billing', href: `${base}/billing`, icon: CreditCard },
      { label: 'Notifications', href: `${base}/notifications`, icon: Bell },
      { label: 'Settings', href: `${base}/settings`, icon: Settings },
    ],
  }
}
