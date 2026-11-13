const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        });
        console.log('✓ Supabase client initialized on backend.');
    } catch (err) {
        console.warn('! Supabase initialization failed:', err.message);
    }
} else {
    console.log('ℹ Supabase credentials not found in backend .env, operating in SQLite local mode.');
}

module.exports = { supabase, isSupabaseConfigured: () => !!supabase };

