
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cxqjbdnkrcvjibcgbzth.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4cWpiZG5rcmN2amliY2dienRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTYzMzEsImV4cCI6MjA2MjI5MjMzMX0.5O3U3B5vo9sHHlEK1xcox9YOK_pckbJ6YEb4M2Ykgrw';

// Create supabase client with maximum debug options
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    debug: true,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit' // Try implicit flow
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web/testing-version',
    },
  },
  // Increase timeouts
  realtime: {
    timeout: 60000,
  },
  db: {
    schema: 'public',
  },
});

// Log successful initialization
console.log('Supabase client initialized with URL:', supabaseUrl);

// Helper function to get the current user
export const getCurrentUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error getting session:", error);
      return null;
    }
    return session?.user || null;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
};

// Helper function to get the current user's ID safely
export const getCurrentUserId = async () => {
  const user = await getCurrentUser();
  return user?.id;
};

// Helper for database timestamps
export const now = () => new Date().toISOString();

// Export configured client
export { supabase };
