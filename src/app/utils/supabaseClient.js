import { createClient } from "@supabase/supabase-js";


const SUPABASE_URL = 'https://czdzccphvurinsvasssm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6ZHpjY3BodnVyaW5zdmFzc3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1NzkzNjEsImV4cCI6MjA1NDE1NTM2MX0.9CCMXWkIbtnIhpaFVNQ48FS58v9b-tEbMuRgv5r8JiE'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
