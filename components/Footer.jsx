import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors mt-20">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          
          {/* Brand Info */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/assets/warhope-clear.PNG" 
                alt="Warhope Logo" 
                className="h-8 w-auto object-contain dark:invert transition-all" // Tambahan invert untuk dark mode jika logo warna hitam
              />
            </Link>
            <p className="text-foreground/60 max-w-sm mb-8 leading-relaxed">
              Menggabungkan ketidaksempurnaan estetika Wabi-Sabi dengan gaya hidup streetwear urban modern. Esensi kasual untuk keseharian Anda.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-foreground hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-foreground hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-foreground hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Nav Links - Shop */}
          <div>
            <h3 className="font-bold text-foreground mb-6 uppercase tracking-widest text-sm">Belanja</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-foreground/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 group">
                  Semua Produk
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="#" className="text-foreground/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 group">
                  Koleksi T-Shirt
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="#" className="text-foreground/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 group">
                  Hoodies & Outer
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="#" className="text-foreground/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 group">
                  Aksesoris
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Links - Support */}
          <div>
            <h3 className="font-bold text-foreground mb-6 uppercase tracking-widest text-sm">Bantuan</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                  Kebijakan Pengiriman
                </Link>
              </li>
              <li>
                <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                  Pengembalian Barang
                </Link>
              </li>
              <li>
                <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-foreground/50">
            &copy; {currentYear} Warhope E-Commerce. Hak cipta dilindungi.
          </p>
          <div className="flex gap-6 text-sm text-foreground/50">
            <Link href="#" className="hover:text-foreground transition-colors">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}