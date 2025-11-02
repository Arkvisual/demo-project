// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://gtvhgbmykwssxfxelrpx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0dmhnYm15a3dzc3hmeGVscnB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MjA3NjMsImV4cCI6MjA3NDE5Njc2M30.q2x63Hu7Xh4OfT3rL6zkSEBKwO-rqtBlYynMwBYWSeE";

export const supabase = createClient(supabaseUrl, supabaseKey);
