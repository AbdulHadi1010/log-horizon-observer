
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email: string | null;      
  full_name: string | null;    
  avatar_url: string | null; 
  role: 'admin' | 'engineer' | 'support';
  created_at?: string|null;
  updated_at?: string|null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Fetch profile and role separately (role is now in user_roles table)
        const [profileResult, roleResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, email, full_name, avatar_url, created_at, updated_at')
            .eq('id', user.id)
            .single(),
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .order('role', { ascending: false }) // Get highest role
            .limit(1)
            .maybeSingle()
        ]);

        if (profileResult.error) throw profileResult.error;
        
        const role = roleResult.data?.role || 'support';
        setProfile({ ...profileResult.data, role });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      // Remove role from updates if present (role can't be updated via profiles table)
      const { role, ...profileUpdates } = updates;
      
      if (Object.keys(profileUpdates).length > 0) {
        const { data, error } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', user.id)
          .select('id, email, full_name, avatar_url, created_at, updated_at')
          .single();

        if (error) throw error;
        
        // Merge with existing role
        setProfile({ ...data, role: profile?.role || 'support' });
        return { ...data, role: profile?.role || 'support' };
      }
      
      return profile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    isAdmin: profile?.role === 'admin',
    isEngineer: profile?.role === 'engineer',
    isViewer: profile?.role === 'support',
  };
}
