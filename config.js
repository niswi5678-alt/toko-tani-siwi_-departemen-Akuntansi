// ============================================================
// KONFIGURASI SUPABASE
// Ganti dengan URL & ANON KEY milikmu
// ============================================

const SUPABASE_URL = 'https://lyimylanuxyapqpfqwlx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vOgIbt4HsGXuA3sE5L_e6w_2ChseIIL';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

if (SUPABASE_URL.includes('YOUR_PROJECT_REF') || SUPABASE_ANON_KEY.includes('YOUR_PUBLISHABLE_KEY')) {
  console.warn('Silakan isi URL project Supabase dan publishable key di file config.js');
}