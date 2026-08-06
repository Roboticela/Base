import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AdminLayout } from '@/layouts/AdminLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { WorkspacesLayout } from '@/layouts/WorkspacesLayout'
import { AcceptInvitationPage } from '@/pages/auth/AcceptInvitationPage'
import { AccountLockedPage } from '@/pages/auth/AccountLockedPage'
import { AuthIndexPage } from '@/pages/auth/AuthIndexPage'
import { EmailVerificationPage } from '@/pages/auth/EmailVerificationPage'
import { EmailVerifiedPage } from '@/pages/auth/EmailVerifiedPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { JoinWorkspacePage } from '@/pages/auth/JoinWorkspacePage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { SessionExpiredPage } from '@/pages/auth/SessionExpiredPage'
import { TwoFactorPage } from '@/pages/auth/TwoFactorPage'
import { AdminPanelPage } from '@/pages/admin/AdminPanelPage'
import { AiBuilderPage } from '@/pages/ai/AiBuilderPage'
import { AiChatPage } from '@/pages/ai/AiChatPage'
import { AutomationsPage } from '@/pages/automations/AutomationsPage'
import { AutomationBuilderPage } from '@/pages/automations/AutomationBuilderPage'
import { BillingPage } from '@/pages/billing/BillingPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { DevelopersPage } from '@/pages/developers/DevelopersPage'
import { EmailCenterPage } from '@/pages/email/EmailCenterPage'
import { FormsPage } from '@/pages/forms/FormsPage'
import { HelpCenterPage } from '@/pages/help/HelpCenterPage'
import { IntegrationsPage } from '@/pages/integrations/IntegrationsPage'
import { NotificationsPage } from '@/pages/notifications/NotificationsPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { ReportsPage } from '@/pages/reports/ReportsPage'
import { WorkspaceSettingsPage } from '@/pages/settings/WorkspaceSettingsPage'
import { RecordDetailsPage } from '@/pages/sheets/RecordDetailsPage'
import { SheetBuilderPage } from '@/pages/sheets/SheetBuilderPage'
import { SheetSettingsPage } from '@/pages/sheets/SheetSettingsPage'
import { SheetsPage } from '@/pages/sheets/SheetsPage'
import { ViewsPage } from '@/pages/sheets/ViewsPage'
import { TeamPage } from '@/pages/team/TeamPage'
import { TemplatesPage } from '@/pages/templates/TemplatesPage'
import { CreateWorkspacePage } from '@/pages/workspaces/CreateWorkspacePage'
import { WorkspaceSelectionPage } from '@/pages/workspaces/WorkspaceSelectionPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthIndexPage />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/email-verification" element={<EmailVerificationPage />} />
          <Route path="/email-verified" element={<EmailVerifiedPage />} />
          <Route path="/two-factor" element={<TwoFactorPage />} />
          <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
          <Route path="/join-workspace" element={<JoinWorkspacePage />} />
          <Route path="/session-expired" element={<SessionExpiredPage />} />
          <Route path="/account-locked" element={<AccountLockedPage />} />
        </Route>

        <Route element={<WorkspacesLayout />}>
          <Route path="/workspaces" element={<WorkspaceSelectionPage />} />
          <Route path="/workspaces/new" element={<CreateWorkspacePage />} />
        </Route>

        <Route path="/help" element={<HelpCenterPage />} />

        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminPanelPage />} />
        </Route>

        <Route path="/w/:workspaceId" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="sheets" element={<SheetsPage />} />
          <Route path="sheets/:sheetId" element={<SheetBuilderPage />} />
          <Route path="sheets/:sheetId/records/:recordId" element={<RecordDetailsPage />} />
          <Route path="sheets/:sheetId/views" element={<ViewsPage />} />
          <Route path="sheets/:sheetId/settings" element={<SheetSettingsPage />} />
          <Route path="ai-builder" element={<AiBuilderPage />} />
          <Route path="ai" element={<AiChatPage />} />
          <Route path="automations" element={<AutomationsPage />} />
          <Route path="automations/:automationId" element={<AutomationBuilderPage />} />
          <Route path="email" element={<EmailCenterPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="forms" element={<FormsPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="developers" element={<DevelopersPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<WorkspaceSettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="members" element={<Navigate to="../team" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
