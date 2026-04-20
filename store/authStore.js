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

      // Fungsi Logout
      logout: () => {
        set({ 
          user: null, 
          lastActive: null, 
          isInitialized: true 
        });
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
          set({ user: null, lastActive: null, isInitialized: true });
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