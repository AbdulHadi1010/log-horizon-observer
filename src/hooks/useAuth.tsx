
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface Profile {
  id: string;
  role: UserRole;
  email: string | null;      
  full_name: string | null;    
  avatar_url: string | null; 
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  isAdmin: boolean;
  isEngineer: boolean;
  isViewer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            // Fetch profile after setting user
            setTimeout(() => {
              if (mounted) {
                fetchProfile(initialSession.user.id);
              }
            }, 100);
          } else {
            setLoading(false);
          }
          
          setInitialized(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer profile fetching to avoid deadlocks
          setTimeout(() => {
            if (mounted) {
              fetchProfile(session.user.id);
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setLoading(false);
        } else if (!session) {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // Fetch profile and role separately (role is now in user_roles table)
      const [profileResult, roleResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, email, full_name, avatar_url')
          .eq('id', userId)
          .maybeSingle(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .order('role', { ascending: false }) // Get highest role (admin > engineer > support)
          .limit(1)
          .maybeSingle()
      ]);

      if (profileResult.error) {
        console.error('Error fetching profile:', profileResult.error);
        setLoading(false);
        return;
      }

      if (profileResult.data) {
        const role = roleResult.data?.role || 'support'; // Default to support if no role found
        console.log('Profile fetched:', { ...profileResult.data, role });
        setProfile({ ...profileResult.data, role });
      } else {
        console.log('No profile found for user:', userId);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting sign in for:', email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        setLoading(false);
        throw error;
      }
      
      console.log('Sign in successful');
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      console.log('Attempting sign up for:', email);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        setLoading(false);
        throw error;
      }
      
      console.log('Sign up successful');
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('Signing out...');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      // Clear state
      setUser(null);
      setProfile(null);
      setSession(null);
      
      console.log('Sign out successful');
      
      // Force redirect to home
      window.location.href = '/';
    } catch (error) {
      setLoading(false);
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return profile?.role === role;
  };

  const isAdmin = profile?.role === 'admin';
  const isEngineer = profile?.role === 'engineer';
  const isViewer = profile?.role === 'support';

  // Don't render until initialized
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    isAdmin,
    isEngineer,
    isViewer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
