import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types/database';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireApproved?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireApproved = true
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return (
      <div className="loading-container">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (requireApproved && profile.status !== 'approved') {
    return (
      <div className="pending-approval">
        <h2>Account Pending Approval</h2>
        <p>Your account is waiting for admin approval. Please check back later.</p>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
