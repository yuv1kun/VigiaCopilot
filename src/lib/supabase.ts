
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cxqjbdnkrcvjibcgbzth.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4cWpiZG5rcmN2amliY2dienRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTYzMzEsImV4cCI6MjA2MjI5MjMzMX0.5O3U3B5vo9sHHlEK1xcox9YOK_pckbJ6YEb4M2Ykgrw';

// Create supabase client with maximum permissiveness for testing
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    debug: true,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Try PKCE flow instead of implicit
    // Disable any client-side validation
    storageKey: 'vigia-auth', // Use a custom storage key
  },
  global: {
    headers: {
      'X-Client-Info': 'vigia-safety-platform',
    },
  },
  // Increase timeouts for slower connections
  realtime: {
    timeout: 60000,
  },
  db: {
    schema: 'public',
  },
});

// Log successful initialization
console.log('Supabase client initialized with URL and custom auth config:', supabaseUrl);

// Helper function to get the current user
export const getCurrentUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error getting session:", error);
      return null;
    }
    console.log("Current session data:", session);
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

// Helper to check auth configuration
export const checkAuthConfig = async () => {
  try {
    console.log("Checking auth configuration...");
    const { data, error } = await supabase.auth.getSession();
    console.log("Auth session check result:", data, error);
    
    // Test if auth settings are working by attempting a simple operation
    const { error: signUpError } = await supabase.auth.signUp({
      email: "test@example.com",
      password: "password123",
      options: { 
        emailRedirectTo: window.location.origin,
        data: {
          test_mode: true
        }
      }
    });
    
    console.log("Auth test signup result:", signUpError ? "Error: " + signUpError.message : "Success");
    
    return {
      sessionExists: !!data.session,
      signUpWorking: !signUpError,
      error: error || signUpError
    };
  } catch (e) {
    console.error("Auth config check failed:", e);
    return {
      sessionExists: false,
      signUpWorking: false,
      error: e
    };
  }
};

// Export configured client
export { supabase };
