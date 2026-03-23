import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cxgnppogmhtagctqcgdp.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4Z25wcG9nbWh0YWdjdHFjZ2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0ODcwMTQsImV4cCI6MjA4MDA2MzAxNH0.h6PhOZoVVTpvY4kRy7_Ihvr-dQ-bwpHzic4poynF1uE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// import { createClient } from "@supabase/supabase-js";

// const SUPABASE_URL = "https://cxgnppogmhtagctqcgdp.supabase.co";
// const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4Z25wcG9nbWh0YWdjdHFjZ2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0ODcwMTQsImV4cCI6MjA4MDA2MzAxNH0.h6PhOZoVVTpvY4kRy7_Ihvr-dQ-bwpHzic4poynF1uE";

// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
//   auth: {
//     persistSession: true,
//     autoRefreshToken: true,
//     detectSessionInUrl: true, 
//   },
// });