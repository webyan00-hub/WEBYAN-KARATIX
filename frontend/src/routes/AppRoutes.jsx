import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/landing/LandingPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import LoginPage from '../pages/auth/LoginPage';
import SignUpPage from '../pages/auth/SignUpPage';
import DashboardPage from '../pages/app/DashboardPage';
import DashboardLayout from '../pages/app/dashboard/DashboardLayout';
import MembersPage from '../pages/app/dashboard/members/MembersPage';
import PaymentsPage from '../pages/app/dashboard/payments/PaymentsPage';
import PaymentsHistoryPage from '../pages/app/dashboard/payments/PaymentsHistoryPage';
import AchievementsPage from '../pages/app/dashboard/members/AchievementsPage';
import SettingsPage from '../pages/app/dashboard/settings/SettingsPage';
import ExamsPage from '../pages/app/dashboard/exams/ExamsPage';
import PlanningPage from '../pages/app/dashboard/attendance/planning/PlanningPage';
import PointagePage from '../pages/app/dashboard/attendance/pointage/PointagePage';
import AttendanceHistoryPage from '../pages/app/dashboard/attendance/history/AttendanceHistoryPage';
import PaymentSuccessPage from '../pages/app/dashboard/payments/PaymentSuccessPage';
import PaymentRequiredPage from '../pages/app/dashboard/PaymentRequiredPage';
import CreateClubPage from '../pages/app/CreateClubPage';
import RequireAuth from '../components/RequireAuth';
import RequireSubscription from '../components/RequireSubscription';
import MonitoringLayout from '../pages/app/admin/MonitoringLayout';
import MonitoringPage from '../pages/app/admin/MonitoringPage';
import ClubsManagerPage from '../pages/app/admin/ClubsManagerPage';
import ClubSubscriptionsPage from '../pages/app/admin/ClubSubscriptionsPage';
import SubscriptionManagementPage from '../pages/app/admin/SubscriptionManagementPage';
import AllPaymentsPage from '../pages/app/admin/AllPaymentsPage';
import SystemLogsPage from '../pages/app/admin/SystemLogsPage';
import RequireSuperAdmin from '../pages/app/admin/RequireSuperAdmin';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Monitoring Routes avec Layout */}
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
    </BrowserRouter>
  );
}
