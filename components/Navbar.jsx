"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, User } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const items = useCartStore((state) => state.items);
  const { user, checkAuth } = useAuthStore();

  // Cek status login setiap Navbar dimuat
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  // Menentukan link tujuan saat profil diklik
  const profileLink = user?.role === 'admin' ? '/admin' : '/profile';

  return (
    <nav className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* Kiri: Menu Mobile */}
        <div className="flex md:hidden items-center gap-4">
          <button className="text-foreground p-2 -ml-2">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Tengah: Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/assets/warhope-clear.PNG" 
            alt="Warhope Logo" 
            className="h-6 md:h-8 w-auto object-contain dark:invert transition-all hover:scale-105" 
          />
        </Link>

        {/* Kanan: Navigasi Desktop & Ikon */}
        <div className="flex items-center gap-6 md:gap-8">
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-foreground/70">
            <Link href="/" className="hover:text-blue-600 transition-colors">Beranda</Link>
            <Link href="/#katalog" className="hover:text-blue-600 transition-colors">Katalog</Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className="text-blue-600 hover:text-blue-700 transition-colors">Admin Panel</Link>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-foreground/80">
            <button className="hidden sm:block hover:text-blue-600 transition-colors" title="Pencarian">
              <Search className="w-5 h-5" />
            </button>
            
            {/* Tampilan Auth (Akun Saya / Login) */}
            {user ? (
              <Link 
                href={profileLink} 
                className="group flex items-center gap-2.5 hover:text-blue-600 transition-colors" 
                title="Akun Saya"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:border-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-all">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden md:block text-xs font-bold truncate max-w-30">
                  {user.name}
                </span>
              </Link>
            ) : (
              <Link href="/auth/login" className="hover:text-blue-600 transition-colors" title="Masuk">
                <User className="w-5 h-5" />
              </Link>
            )}

            {/* Keranjang Belanja */}
            <Link href="/cart" className="relative hover:text-blue-600 transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

      </div>
    </nav>
  );
}