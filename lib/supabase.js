// Melakukan inisialisasi koneksi antara Next.js dan Database Supabase
import { createClient } from '@supabase/supabase-js';

// Mengambil URL dan Key dari file .env.local (agar aman dan tidak bocor ke publik)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Membuat instance Supabase yang bisa dipanggil di file lain
export const supabase = createClient(supabaseUrl, supabaseKey);