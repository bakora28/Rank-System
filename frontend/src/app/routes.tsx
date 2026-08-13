import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { roleHome } from '@/lib/roleHome';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

import Login from '@/features/auth/Login';
import Signup from '@/features/auth/Signup';
import AuthCallback from '@/features/auth/AuthCallback';

import TeacherDashboard from '@/features/dashboard/TeacherDashboard';
import TeacherCategories from '@/features/categories/TeacherCategories';
import TeacherCategoryDetail from '@/features/categories/TeacherCategoryDetail';
import TeacherGifts from '@/features/gifts/TeacherGifts';
import ProfilePage from '@/features/profile/ProfilePage';

import AdminDashboard from '@/features/dashboard/AdminDashboard';
import AdminRanks from '@/features/ranks/AdminRanks';
import AdminRequests from '@/features/requests/AdminRequests';
import AdminCategories from '@/features/categories/AdminCategories';
import AdminCategoryDetail from '@/features/categories/AdminCategoryDetail';
import AdminTeachers from '@/features/teachers/AdminTeachers';
import AdminAssistants from '@/features/assistants/AdminAssistants';
import AdminAdmins from '@/features/admins/AdminAdmins';
import AdminGifts from '@/features/gifts/AdminGifts';

function GuestOnly({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (user) return <Navigate to={roleHome(user.role)} replace />;
  return <>{children}</>;
}

function RequireRole({ role, children }: { role: 'teacher' | 'staff'; children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  const isStaff = user.role === 'admin' || user.role === 'assistant';
  if (role === 'teacher' && user.role !== 'teacher') return <Navigate to={roleHome(user.role)} replace />;
  if (role === 'staff' && !isStaff) return <Navigate to={roleHome(user.role)} replace />;
  return <>{children}</>;
}

export function AppRoutes() {
  const user = useAuthStore((s) => s.user);

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestOnly>
              <Signup />
            </GuestOnly>
          }
        />
      </Route>

      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route
        path="/teacher"
        element={
          <RequireRole role="teacher">
            <DashboardLayout />
          </RequireRole>
        }
      >
        <Route index element={<TeacherDashboard />} />
        <Route path="categories" element={<TeacherCategories />} />
        <Route path="categories/:id" element={<TeacherCategoryDetail />} />
        <Route path="gifts" element={<TeacherGifts />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <RequireRole role="staff">
            <DashboardLayout />
          </RequireRole>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="ranks" element={<AdminRanks />} />
        <Route path="requests" element={<AdminRequests />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="categories/:id" element={<AdminCategoryDetail />} />
        <Route path="teachers" element={<AdminTeachers />} />
        <Route path="assistants" element={<AdminAssistants />} />
        <Route path="admins" element={<AdminAdmins />} />
        <Route path="gifts" element={<AdminGifts />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="/" element={<Navigate to={user ? roleHome(user.role) : '/login'} replace />} />
      <Route path="*" element={<Navigate to={user ? roleHome(user.role) : '/login'} replace />} />
    </Routes>
  );
}
