import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, PackageSearch, LogOut, ArrowLeft } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, handleLogout }) {
  
  // Fungsi penahan (Guard) sebelum logout asli dijalankan
  const confirmLogout = () => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin keluar dari Panel Admin?");
    if (isConfirmed) {
      handleLogout();
    }
  };

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between md:justify-start">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/warhope-clear.PNG" alt="Warhope Logo" className="h-4 md:h-6 w-auto object-contain dark:invert transition-all hover:scale-105" />
          <span className="text-[10px] font-black px-2 py-1 bg-blue-100 text-blue-600 rounded-md hidden lg:inline-block tracking-widest">ADMIN</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 flex md:flex-col gap-2 overflow-x-auto hide-scrollbar">
        <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          <LayoutDashboard className="w-5 h-5 shrink-0" /> <span className="hidden sm:inline-block">Ringkasan</span>
        </button>
        <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          <ShoppingBag className="w-5 h-5 shrink-0" /> <span className="hidden sm:inline-block">Pesanan</span>
        </button>
        <button onClick={() => setActiveTab('products')} className={`w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          <PackageSearch className="w-5 h-5 shrink-0" /> <span className="hidden sm:inline-block">Katalog Produk</span>
        </button>
      </nav>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2 hidden md:block">
        <button onClick={confirmLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold transition-colors">
          <LogOut className="w-5 h-5 shrink-0" /> Keluar
        </button>
        <Link href="/" className="flex items-center gap-3 px-4 py-3 text-foreground/60 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors">
          <ArrowLeft className="w-5 h-5 shrink-0" /> Toko Utama
        </Link>
      </div>
    </aside>
  );
}