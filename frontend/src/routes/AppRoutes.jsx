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
import CreateClubPage from '../pages/app/CreateClubPage';
import RequireAuth from '../components/RequireAuth';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
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
          </Route>
          <Route path="/create-club" element={<CreateClubPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
