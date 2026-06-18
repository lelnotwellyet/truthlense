import React, { Suspense } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Spinner from './components/ui/Spinner';
import Layout from './components/layout/Layout';

/* ---------- lazy-loaded pages ---------- */
const Landing = React.lazy(() => import('./pages/Landing'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const VerifyContent = React.lazy(() => import('./pages/VerifyContent'));
const ArticleDetail = React.lazy(() => import('./pages/ArticleDetail'));
const VerificationReport = React.lazy(() => import('./pages/VerificationReport'));
const Bookmarks = React.lazy(() => import('./pages/Bookmarks'));
const Search = React.lazy(() => import('./pages/Search'));
const Profile = React.lazy(() => import('./pages/Profile'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Community = React.lazy(() => import('./pages/Community'));
const Trending = React.lazy(() => import('./pages/Trending'));
const Notifications = React.lazy(() => import('./pages/Notifications'));

/* ---------- route guards ---------- */
function ProtectedRoute({ requireAdmin = false }) {
  const { user, profile, preferences, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && profile?.role?.toLowerCase() !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const hasCompletedOnboarding = preferences?.topics && preferences.topics.length >= 3;
  if (!hasCompletedOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (hasCompletedOnboarding && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

/* ---------- app ---------- */
export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* public routes (no layout) */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* protected routes (with layout) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/verify" element={<VerifyContent />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/report/:id" element={<VerificationReport />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/search" element={<Search />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/community" element={<Community />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
        </Route>

        {/* admin routes */}
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route element={<Layout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
        </Route>

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
