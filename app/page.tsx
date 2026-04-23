"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, CheckCircle2, Mail, ArrowRight, Sparkles, ShieldCheck, Truck, Star, ArrowDownAZ, ArrowUpZA } from 'lucide-react';
import { getAllProducts } from '../lib/api';
import AddToCartButton from '../components/AddToCartButton';

// 1. Didefinisikan Interface Product agar TypeScript paham struktur datanya
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  colors?: string[];
  sizes?: string[];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // STATE UNTUK FILTER & SORTING
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [sortOrder, setSortOrder] = useState<'default' | 'murah' | 'mahal'>('default');

  // Mengambil data produk dari Supabase saat halaman dimuat
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const data = await getAllProducts();
      setProducts(data || []);
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  // Menghitung jumlah produk per kategori secara dinamis
  const categories = [
    { name: 'Semua', count: products.length },
    { name: 'T-Shirts', count: products.filter(p => p.category === 'T-Shirts').length },
    { name: 'Hoodies', count: products.filter(p => p.category === 'Hoodies').length },
    { name: 'Pants', count: products.filter(p => p.category === 'Pants').length },
    { name: 'Accessories', count: products.filter(p => p.category === 'Accessories').length },
  ];

  // LOGIKA CERDAS: Filter Kategori KEMUDIAN Sorting Harga
  const getProcessedProducts = () => {
    // 1. Filter Kategori
    const result = activeCategory === 'Semua' 
      ? [...products] 
      : products.filter(p => p.category === activeCategory);

    // 2. Sorting Harga
    if (sortOrder === 'murah') {
      result.sort((a, b) => a.price - b.price); // Termurah ke Termahal
    } else if (sortOrder === 'mahal') {
      result.sort((a, b) => b.price - a.price); // Termahal ke Termurah
    }

    return result;
  };

  const processedProducts = getProcessedProducts();

  return (
    <main className="pt-4 md:pt-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 min-h-screen bg-background">
      
      {/* --- HERO SECTION --- */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-16">
        <div className="md:col-span-2 relative bg-slate-200 dark:bg-slate-800 rounded-4xl overflow-hidden min-h-100 md:min-h-125 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="https://plus.unsplash.com/premium_photo-1687294575653-288f6105c4a2?q=80&w=1200&auto=format&fit=crop" 
            alt="Fashion Lifestyle" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
            <span className="inline-block bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-white/20">
              Koleksi Musim Panas
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
              Esensi Kasual <br />Untuk Modernitas.
            </h1>
            <Link href="#katalog" className="bg-white text-slate-900 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-slate-100 transition-all shadow-lg inline-flex items-center gap-2 group/btn animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Eksplorasi Koleksi
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:gap-6">
          <div className="bg-slate-900 rounded-4xl p-8 flex-1 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
            <Sparkles className="w-8 h-8 text-blue-400 mb-4" />
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Diskon 20%</h2>
            <p className="text-slate-400 text-sm font-medium mb-6">Untuk pembelian pertama apparel berbahan linen premium.</p>
            <Link href="#katalog" className="text-white font-bold text-sm flex items-center gap-1 hover:text-blue-400 transition-colors">
              Belanja Sekarang <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="bg-slate-100 dark:bg-slate-800 rounded-4xl relative overflow-hidden flex-1 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop" 
              alt="Knitwear" 
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-transparent transition-all duration-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-2xl font-black text-white tracking-widest uppercase shadow-sm">Knitwear</h3>
            </div>
          </div>
        </div>
      </section>

      {/* --- TRUST BADGES --- */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-20">
        <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex items-center gap-4 shadow-sm transition-colors">
          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm">Gratis Pengiriman</h4>
            <p className="text-xs text-foreground/60 mt-1">Ke seluruh Indonesia</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex items-center gap-4 shadow-sm transition-colors">
          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm">Kualitas Terjamin</h4>
            <p className="text-xs text-foreground/60 mt-1">100% material organik</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex items-center gap-4 shadow-sm transition-colors">
          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm">Desain Eksklusif</h4>
            <p className="text-xs text-foreground/60 mt-1">Gaya kasual modern</p>
          </div>
        </div>
      </section>

      {/* --- CATALOG SECTION --- */}
      <section id="katalog" className="scroll-mt-32">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <span className="text-blue-600 font-bold text-xs tracking-widest uppercase mb-2 block">Katalog Utama</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Kurasi Pilihan</h2>
          </div>
          
          {/* TOMBOL PENGURUTAN HARGA DI SEBELAH KANAN ATAS */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-full sm:w-auto">
            <button 
              onClick={() => setSortOrder('default')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex-1 sm:flex-none ${sortOrder === 'default' ? 'bg-slate-100 dark:bg-slate-700 text-foreground' : 'text-foreground/50 hover:text-foreground'}`}
            >
              Terbaru
            </button>
            <button 
              onClick={() => setSortOrder('murah')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 flex-1 sm:flex-none ${sortOrder === 'murah' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-foreground/50 hover:text-foreground'}`}
            >
              <ArrowDownAZ className="w-3.5 h-3.5" /> Termurah
            </button>
            <button 
              onClick={() => setSortOrder('mahal')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 flex-1 sm:flex-none ${sortOrder === 'mahal' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-foreground/50 hover:text-foreground'}`}
            >
              <ArrowUpZA className="w-3.5 h-3.5" /> Termahal
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR FILTER KATEGORI */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl sticky top-28 shadow-sm transition-colors">
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-6">Filter Kategori</h3>
              <div className="space-y-4">
                {categories.map((cat) => (
                  <button 
                    key={cat.name} 
                    onClick={() => setActiveCategory(cat.name)}
                    className="flex items-center justify-between w-full group cursor-pointer text-left focus:outline-none"
                  >
                    <span className={`text-sm font-medium transition-colors ${activeCategory === cat.name ? 'text-foreground font-bold' : 'text-foreground/60 group-hover:text-foreground'}`}>
                      {cat.name}
                    </span>
                    {activeCategory === cat.name ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    ) : (
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-foreground/50 font-bold">{cat.count}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* GRID PRODUK (PERBAIKAN: Menjadi 2 Kolom di Mobile) */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
            
            {isLoading ? (
              // SKELETON LOADING (Disesuaikan proporsinya untuk mobile 2 kolom)
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="flex flex-col gap-2 sm:gap-4 animate-pulse">
                  <div className="w-full aspect-4/5 bg-slate-200 dark:bg-slate-800 rounded-2xl sm:rounded-3xl"></div>
                  <div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                  <div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                </div>
              ))
            ) : processedProducts.length === 0 ? (
              // JIKA KOSONG
              <div className="col-span-full py-12 text-center text-foreground/60 bg-white/50 dark:bg-slate-800/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
                <p>Belum ada produk di database untuk kategori ini.</p>
              </div>
            ) : (
              // LOOPING DATA PRODUK
              processedProducts.map((product: Product) => (
                <div key={product.id} className="bg-white dark:bg-slate-800/50 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 overflow-hidden group flex flex-col">
                  
                  {/* Container Gambar */}
                  <Link href={`/product/${product.id}`} className="block aspect-4/5 bg-slate-100 dark:bg-slate-900 relative overflow-hidden p-1.5 sm:p-2">
                    <div className="w-full h-full rounded-xl sm:rounded-2xl overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={product.name} src={product.image} />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors"></div>
                    </div>
                  </Link>

                  {/* Info Produk */}
                  <div className="p-3 sm:p-6 flex flex-col flex-1">
                    <p className="text-[9px] sm:text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1 sm:mb-2 truncate">{product.category}</p>
                    
                    <Link href={`/product/${product.id}`}>
                      {/* Teks nama produk di-clamp 2 baris agar tetap proporsional di HP */}
                      <h3 className="text-xs sm:text-lg font-bold text-foreground mb-1 leading-tight hover:text-blue-600 transition-colors line-clamp-2">{product.name}</h3>
                    </Link>
                    
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-yellow-500 mb-2">
                      <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" /> 4.9
                    </div>

                    {/* Deskripsi disembunyikan di HP untuk menghemat ruang vertikal */}
                    <p className="hidden sm:block text-sm text-foreground/60 mb-6 line-clamp-2">{product.description}</p>
                    
                    <div className="mt-auto pt-3 sm:pt-5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center gap-1">
                      <span className="font-black text-foreground text-xs sm:text-lg line-clamp-1">{formatRupiah(product.price)}</span>
                      
                      {/* TOMBOL ADD TO CART (Di-scale sedikit untuk layar kecil agar tidak menabrak harga) */}
                      <div className="scale-90 sm:scale-100 origin-right shrink-0">
                        <AddToCartButton product={product} />
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* --- NEWSLETTER --- */}
      <section className="mt-24">
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-4xl p-8 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center gap-12 border border-transparent dark:border-slate-800">
          <div className="absolute top-0 right-0 w-1/2 h-full hidden md:block opacity-5 dark:opacity-10">
            <Mail className="w-full h-full -translate-y-20 translate-x-20 text-slate-900 dark:text-white" />
          </div>
          
          <div className="relative z-10 flex-1 space-y-6">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
              Bergabunglah <br/>Bersama Kami.
            </h2>
            <p className="text-foreground/70 font-medium text-lg max-w-md">
              Dapatkan akses awal untuk rilisan terbatas, pembaruan misi organik kami, dan diskon 10% untuk pesanan pertama Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <input 
                type="email" 
                placeholder="Masukkan alamat email..." 
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-6 py-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all text-foreground"
              />
              <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-full font-bold hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white hover:shadow-lg transition-all active:scale-95 whitespace-nowrap">
                Berlangganan
              </button>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}