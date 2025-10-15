
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dedjxngllokyyktaklmz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZGp4bmdsbG9reXlrdGFrbG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDM2OTUsImV4cCI6MjA2NTExOTY5NX0.qNPIqjYETGqoKDmXa6J7ujIy7I9nqjaSSq_5MZa6Fb0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);