
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cxqjbdnkrcvjibcgbzth.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4cWpiZG5rcmN2amliY2dienRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTYzMzEsImV4cCI6MjA2MjI5MjMzMX0.5O3U3B5vo9sHHlEK1xcox9YOK_pckbJ6YEb4M2Ykgrw';

// Create a simplified Supabase client just for data operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper for database timestamps
export const now = () => new Date().toISOString();

// Export configured client
export { supabase };
