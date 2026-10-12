import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';


const ALLOWED_ADMIN_EMAILS = ['workpavanindia@gmail.com', 'swaroopraj@terranestinteriors.com', 'sarvainfra2024@gmail.com'];

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

const AccessDenied = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md px-6">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="font-heading text-2xl text-charcoal mb-3">Access Restricted</h1>
      <p className="text-gray-500 font-body text-sm mb-6">
        This area is restricted to authorized administrators only. Please log in with an authorized account.
      </p>
      <a href="/" className="inline-flex items-center px-6 py-2.5 bg-charcoal text-white text-sm font-body font-medium hover:bg-gold transition-colors rounded-sm">
        Back to Home
      </a>
    </div>
  </div>
);

export default function AdminRoute({ fallback = <DefaultFallback /> }) {
  const { isAuthenticated, isLoadingAuth, authChecked, authError, checkUserAuth, user } = useAuth();

  useEffect(() => {
    if (!authChecked && !isLoadingAuth) {
      checkUserAuth();
    }
  }, [authChecked, isLoadingAuth, checkUserAuth]);

  if (isLoadingAuth || !authChecked) {
    return fallback;
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    return <Navigate to="/admin-login" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  if (!ALLOWED_ADMIN_EMAILS.includes(user?.email)) {
    return <AccessDenied />;
  }

  return <Outlet />;
}