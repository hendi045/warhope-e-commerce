import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// KONFIGURASI KEDALUWARSA SESI (Dalam Milidetik)
const ADMIN_TIMEOUT = 2 * 24 * 60 * 60 * 1000; // 2 Hari
const USER_TIMEOUT = 3 * 24 * 60 * 60 * 1000; // 3 Hari

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      lastActive: null,
      isInitialized: false,

      // Fungsi Login
      login: (userData) => {
        set({ 
          user: userData, 
          lastActive: Date.now(), 
          isInitialized: true 
        });
      },

      // Fungsi Logout (SANGAT KRUSIAL UNTUK KEAMANAN & PEMBERSIHAN DATA)
      logout: () => {
        // 1. Bersihkan Data User dari State
        set({ 
          user: null, 
          lastActive: null, 
          isInitialized: true 
        });

        // 2. Cegah Kebocoran Data (Data Bleeding) antar akun.
        // Hapus paksa memori Keranjang dan Wishlist di Local Storage browser.
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('warhope_cart');
          window.localStorage.removeItem('warhope_wishlist');
        }
      },

      // Fungsi Cek Sesi (Akan memperpanjang sesi jika masih aktif)
      checkAuth: () => {
        const { user, lastActive } = get();
        
        if (!user) {
          set({ isInitialized: true });
          return false;
        }

        const now = Date.now();
        const timeoutLimit = user.role === 'admin' ? ADMIN_TIMEOUT : USER_TIMEOUT;

        // Jika waktu saat ini dikurangi waktu aktif terakhir MELEBIHI batas timeout
        if (now - lastActive > timeoutLimit) {
          // SESI HABIS: Logout otomatis
          get().logout(); // Panggil fungsi logout di atas agar memori juga bersih
          console.log("🔒 Sesi telah berakhir karena tidak ada aktivitas.");
          return false; 
        }

        // SESI AKTIF: Perbarui waktu lastActive ke waktu sekarang (SLIDING EXPIRATION)
        set({ lastActive: now, isInitialized: true });
        return true;
      }
    }),
    {
      name: 'warhope_user', // Kunci penyimpanan di LocalStorage browser
    }
  )
);