import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlist: [],
      
      // SINKRONISASI DARI DATABASE (Dijalankan saat User Login)
      syncWishlistFromDB: async (userEmail, allProducts) => {
        if (!userEmail || !allProducts || allProducts.length === 0) return;
        
        try {
          const { data, error } = await supabase
            .from('wishlists')
            .select('product_id')
            .eq('user_email', userEmail);
            
          if (!error && data) {
            const savedIds = data.map(d => d.product_id);
            // Cocokkan ID dari database dengan data master produk
            const syncedWishlist = allProducts.filter(p => savedIds.includes(p.id));
            set({ wishlist: syncedWishlist });
          }
        } catch (err) {
          console.error("Gagal sinkronisasi wishlist:", err);
        }
      },

      // MENAMBAH/MENGHAPUS WISHLIST (Optimistic UI Update + Database)
      toggleWishlist: async (product, userEmail) => {
        const wishlist = get().wishlist;
        const exists = wishlist.find(item => item.id === product.id);
        
        if (exists) {
          // 1. Hapus dari UI langsung agar terasa sangat cepat
          set({ wishlist: wishlist.filter(item => item.id !== product.id) });
          
          // 2. Hapus dari Database secara background (diam-diam)
          if (userEmail) {
            await supabase
              .from('wishlists')
              .delete()
              .match({ user_email: userEmail, product_id: product.id });
          }
        } else {
          // 1. Tambah ke UI langsung
          set({ wishlist: [...wishlist, product] });
          
          // 2. Tambah ke Database secara background
          if (userEmail) {
            await supabase
              .from('wishlists')
              .insert([{ user_email: userEmail, product_id: product.id }]);
          }
        }
      },

      // Mengecek apakah produk ada di wishlist
      isInWishlist: (id) => {
        return get().wishlist.some(item => item.id === id);
      },

      // Kosongkan wishlist saat Logout
      clearWishlist: () => set({ wishlist: [] }),
    }),
    {
      name: 'warhope_wishlist', // Tetap disimpan di lokal sebagai backup/cache
    }
  )
);