import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthLayout } from '@/layouts/AuthLayout'
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
