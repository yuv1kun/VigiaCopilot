
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  debugAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshSession: async () => {},
  debugAuthState: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      console.log('Refreshing session...');
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }
      
      console.log('Session refreshed:', data.session ? 'Session exists' : 'No session');
      setSession(data.session);
      setUser(data.session?.user ?? null);
    } catch (error) {
      console.error('Exception refreshing session:', error);
    }
  };
  
  const debugAuthState = async () => {
    try {
      // Check session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session data:', sessionData);
      if (sessionError) console.error('Session error:', sessionError);
      
      // Check user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log('Current user data:', userData);
      if (userError) console.error('User error:', userError);
      
      // Check auth settings if possible
      try {
        const { data, error } = await supabase.rpc('check_auth_config');
        if (data) console.log('Auth config:', data);
        if (error) console.log('Cannot query auth config RPC:', error);
      } catch (e) {
        console.log('Auth config check failed, expected for regular users');
      }
      
      // Try signing up with test email
      try {
        const testEmail = "test+" + Math.random().toString(36).substring(2, 10) + "@example.com";
        const testPassword = "password123";
        
        console.log("Testing signup with:", testEmail);
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
          options: {
            data: {
              name: "Test User",
              role: "operator",
              is_test: true
            }
          }
        });
        
        console.log("Test signup result:", signupError ? "Error: " + signupError.message : "Success", signupData);
      } catch (e) {
        console.error("Test signup failed:", e);
      }
      
      toast.info('Auth debug info logged to console');
    } catch (e) {
      console.error('Debug auth state error:', e);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Fetching initial session...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching initial session:', error);
          setLoading(false);
          return;
        }
        
        console.log('Initial session:', data.session ? 'Session exists' : 'No session');
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Exception fetching initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session ? 'User authenticated' : 'No user');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    refreshSession,
    debugAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
