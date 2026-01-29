const SUPABASE_URL = "https://hnmrjkiyltyzjkfynant.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhubXJqa2l5bHR5emprZnluYW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwOTc0NjUsImV4cCI6MjA4NDY3MzQ2NX0.PKbjlgZBVf254uUbmANdY3te2DkiIK3M3YVblMjkbP4";;

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

module.exports = supabase;