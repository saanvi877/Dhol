import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://zbvlbuckekddszpjfcwu.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidmxidWNrZWtkZHN6cGpmY3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwODE0MjcsImV4cCI6MjA1MzY1NzQyN30.cHusDJkUMlb3_KAskax8fCa2WKxKBSkx4cdHXvchMdQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
