"use client";

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function Navbar() {
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const cartCount = getTotalItems();

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl shadow-sm border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/assets/warhope1.PNG" 
            alt="Warhope Logo" 
            className="h-8 md:h-10 w-auto object-contain group-active:scale-95 transition-transform"
          />
        </Link>
        
        {/* Menu Tengah (Desktop) */}
        <div className="hidden md:flex items-center space-x-8">
          <Link className="text-blue-600 border-b-2 border-blue-600 pb-1 font-semibold" href="/">
            Terbaru
          </Link>
          <a className="text-foreground/70 hover:text-foreground transition-colors font-medium" href="#">
            Pakaian
          </a>
          <a className="text-foreground/70 hover:text-foreground transition-colors font-medium" href="#">
            Aksesoris
          </a>
          <a className="text-foreground/70 hover:text-foreground transition-colors font-medium" href="#">
            Koleksi
          </a>
        </div>
        
        {/* Ikon Kanan */}
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-full transition-all active:scale-95 block">
            <ShoppingCart className="w-5 h-5 text-foreground" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          
          <button className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-full transition-all active:scale-95 block">
            <User className="w-5 h-5 text-foreground" />
          </button>
        </div>

      </div>
    </nav>
  );
}