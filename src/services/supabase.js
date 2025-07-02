import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Replace these with your actual Supabase URL and anon key when ready for deployment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback values for development - REPLACE THESE with actual values in .env file
const fallbackUrl = 'https://htirjwlupqtfjlpsbamu.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0aXJqd2x1cHF0ZmpscHNiYW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzEyNDcsImV4cCI6MjA2NzA0NzI0N30.yj0qYDKBXZmjkyB5h2Kq5eADQSwNkqKTOIako99fKUc';

const supabase = createClient(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey
);

export default supabase; 