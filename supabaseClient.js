import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zdobimhfcbpzepmygpdl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkb2JpbWhmY2JwemVwbXlncGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NTUyMTcsImV4cCI6MjA2NzQzMTIxN30.Xbd0CWqmE73lxwOJ9tDom0YEb1rXPbC30abVn3bcrPY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 