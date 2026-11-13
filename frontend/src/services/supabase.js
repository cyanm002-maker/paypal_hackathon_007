import { createClient } from '@supabase/supabase-js';

// Read Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if valid credentials are provided
export const isSupabaseConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20
);

export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    })
    : null;

// Auth Helpers
export const authService = {
    async signUp(email, password) {
        if (!isSupabaseConfigured) {
            // Local demo auth simulation
            const demoUser = {
                id: 'demo-user-001',
                email,
                user_metadata: { name: email.split('@')[0] }
            };
            localStorage.setItem('subshield_demo_session', JSON.stringify(demoUser));
            return { data: { user: demoUser, session: { user: demoUser } }, error: null };
        }
        return await supabase.auth.signUp({
            email,
            password
        });
    },

    async signIn(email, password) {
        if (!isSupabaseConfigured) {
            const demoUser = {
                id: 'demo-user-001',
                email: email || 'demo@subshield.app',
                user_metadata: { name: (email || 'demo').split('@')[0] }
            };
            localStorage.setItem('subshield_demo_session', JSON.stringify(demoUser));
            return { data: { user: demoUser, session: { user: demoUser } }, error: null };
        }
        return await supabase.auth.signInWithPassword({
            email,
            password
        });
    },

    async signInAsDemo() {
        const demoUser = {
            id: 'demo-user-001',
            email: 'founder@subshield.app',
            user_metadata: { name: 'Demo Founder' }
        };
        localStorage.setItem('subshield_demo_session', JSON.stringify(demoUser));
        return { data: { user: demoUser, session: { user: demoUser } }, error: null };
    },

    async signOut() {
        localStorage.removeItem('subshield_demo_session');
        if (isSupabaseConfigured && supabase) {
            return await supabase.auth.signOut();
        }
        return { error: null };
    },

    async getSession() {
        if (!isSupabaseConfigured) {
            const saved = localStorage.getItem('subshield_demo_session');
            return saved ? { user: JSON.parse(saved) } : null;
        }
        const { data } = await supabase.auth.getSession();
        return data.session;
    },

    async getUser() {
        if (!isSupabaseConfigured) {
            const saved = localStorage.getItem('subshield_demo_session');
            return saved ? JSON.parse(saved) : null;
        }
        const { data } = await supabase.auth.getUser();
        return data.user;
    },

    onAuthStateChange(callback) {
        if (!isSupabaseConfigured) {
            const handler = () => {
                const saved = localStorage.getItem('subshield_demo_session');
                callback(saved ? 'SIGNED_IN' : 'SIGNED_OUT', saved ? { user: JSON.parse(saved) } : null);
            };
            window.addEventListener('storage', handler);
            return { data: { subscription: { unsubscribe: () => window.removeEventListener('storage', handler) } } };
        }
        return supabase.auth.onAuthStateChange(callback);
    }
};

// Direct Supabase Database Helpers (Row Level Security enabled)
export const dbService = {
    async getSubscriptions(userId) {
        if (!isSupabaseConfigured || !supabase) return null;
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async insertSubscription(sub, userId) {
        if (!isSupabaseConfigured || !supabase) return null;
        const { data, error } = await supabase
            .from('subscriptions')
            .insert([{ ...sub, user_id: userId }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateSubscription(id, updates) {
        if (!isSupabaseConfigured || !supabase) return null;
        const { data, error } = await supabase
            .from('subscriptions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteSubscription(id) {
        if (!isSupabaseConfigured || !supabase) return null;
        const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    },

    async getUserBudget(userId) {
        if (!isSupabaseConfigured || !supabase) return null;
        const { data, error } = await supabase
            .from('user_budgets')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async upsertUserBudget(userId, monthlyLimit) {
        if (!isSupabaseConfigured || !supabase) return null;
        const { data, error } = await supabase
            .from('user_budgets')
            .upsert({ id: userId, monthly_budget_limit: monthlyLimit })
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};

