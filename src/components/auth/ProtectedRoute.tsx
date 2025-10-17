
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !user) {
    console.log('User not authenticated, redirecting to login...');
    return <Navigate to="/login" replace />;
  }

  // Check role requirements
  if (requiredRole && profile?.role !== requiredRole) {
    // Check role hierarchy: admin > engineer > viewer
    const roleHierarchy: Record<UserRole, number> = {
      support: 1,
      engineer: 2,
      admin: 3
    };

    const userRoleLevel = profile?.role ? roleHierarchy[profile.role] : 0;
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      console.log('Insufficient role, redirecting to unauthorized...');
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
