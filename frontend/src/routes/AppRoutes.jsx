import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';

const LandingPage = lazy(() => import('../pages/landing/LandingPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const SignUpPage = lazy(() => import('../pages/auth/SignUpPage'));
const DashboardPage = lazy(() => import('../pages/app/DashboardPage'));
const DashboardLayout = lazy(() => import('../pages/app/dashboard/DashboardLayout'));
const MembersPage = lazy(() => import('../pages/app/dashboard/members/MembersPage'));
const PaymentsPage = lazy(() => import('../pages/app/dashboard/payments/PaymentsPage'));
const PaymentsHistoryPage = lazy(() => import('../pages/app/dashboard/payments/PaymentsHistoryPage'));
const AchievementsPage = lazy(() => import('../pages/app/dashboard/members/AchievementsPage'));
const SettingsPage = lazy(() => import('../pages/app/dashboard/settings/SettingsPage'));
const ExamsPage = lazy(() => import('../pages/app/dashboard/exams/ExamsPage'));
const PlanningPage = lazy(() => import('../pages/app/dashboard/attendance/planning/PlanningPage'));
const PointagePage = lazy(() => import('../pages/app/dashboard/attendance/pointage/PointagePage'));
const AttendanceHistoryPage = lazy(() => import('../pages/app/dashboard/attendance/history/AttendanceHistoryPage'));
const PaymentSuccessPage = lazy(() => import('../pages/app/dashboard/payments/PaymentSuccessPage'));
const CreateClubPage = lazy(() => import('../pages/app/CreateClubPage'));
const MonitoringLayout = lazy(() => import('../pages/app/admin/MonitoringLayout'));
const MonitoringPage = lazy(() => import('../pages/app/admin/MonitoringPage'));
const ClubsManagerPage = lazy(() => import('../pages/app/admin/ClubsManagerPage'));
const ClubSubscriptionsPage = lazy(() => import('../pages/app/admin/ClubSubscriptionsPage'));
const SubscriptionManagementPage = lazy(() => import('../pages/app/admin/SubscriptionManagementPage'));
const AllPaymentsPage = lazy(() => import('../pages/app/admin/AllPaymentsPage'));
const SystemLogsPage = lazy(() => import('../pages/app/admin/SystemLogsPage'));
const RequireSuperAdmin = lazy(() => import('../pages/app/admin/RequireSuperAdmin'));
import RequireAuth from '../components/RequireAuth';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-8 text-center">Chargement...</div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          <Route path="/monitoring" element={<RequireSuperAdmin><MonitoringLayout /></RequireSuperAdmin>}>
            <Route index element={<MonitoringPage />} />
            <Route path="clubs" element={<ClubsManagerPage />} />
            <Route path="subscriptions" element={<ClubSubscriptionsPage />} />
            <Route path="management" element={<SubscriptionManagementPage />} />
            <Route path="logs" element={<SystemLogsPage />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="members/achievements" element={<AchievementsPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="payments/history" element={<PaymentsHistoryPage />} />
              <Route path="exams" element={<ExamsPage />} />
              <Route path="attendance/planning" element={<PlanningPage />} />
              <Route path="attendance/pointage" element={<PointagePage />} />
              <Route path="attendance/history" element={<AttendanceHistoryPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="payment-success" element={<PaymentSuccessPage />} />
            </Route>
            <Route path="/create-club" element={<CreateClubPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
