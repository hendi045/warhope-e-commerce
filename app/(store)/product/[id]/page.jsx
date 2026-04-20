"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus, ShoppingBag, ShieldCheck, Star } from 'lucide-react';

import { useCartStore } from '../../../../store/cartStore';
import { useToastStore } from '../../../../store/toastStore';
import { getProductById } from '../../../../lib/api'; // MENARIK DATA DARI SUPABASE

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State Variasi & Tabs
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('deskripsi');

  const addItem = useCartStore((state) => state.addItem);
  const addToast = useToastStore((state) => state.addToast);

  // Tarik data asli produk dari Supabase berdasarkan ID
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      const data = await getProductById(id);
      
      if (data) {
        setProduct(data);
        // Set ukuran dan warna default ke varian pertama (jika ada array-nya)
        if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
        if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);
      } else {
        addToast('Produk tidak ditemukan.', 'error');
        router.push('/#katalog');
      }
      setIsLoading(false);
    };

    if (id) fetchProduct();
  }, [id, router, addToast]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-start bg-background">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-foreground/60 text-sm font-medium">Memuat detail produk...</p>
      </div>
    );
  }

  if (!product) return null;

  const activeSize = selectedSize || (product.sizes && product.sizes[0]) || 'All Size';
  const activeColor = selectedColor || (product.colors && product.colors[0]) || 'Default';

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const handleAddToCart = () => {
    addItem({
      ...product,
      selectedColor: activeColor,
      selectedSize: activeSize,
      quantity
    });
    
    addToast(`${quantity}x ${product.name} (Size: ${activeSize}) ditambahkan!`, 'success');
  };

  return (
    <main className="min-h-screen bg-background pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Tombol Kembali */}
        <Link href="/#katalog" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors font-medium mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Katalog
        </Link>
        
        {/* Layout Grid Detail Produk */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* KOLOM KIRI: Gambar Produk & Tabs Deskripsi */}
          <div className="flex flex-col gap-8">
            
            {/* Bento Gambar */}
            <div className="relative aspect-4/5 md:aspect-square bg-slate-100 dark:bg-slate-800 rounded-4xl overflow-hidden p-4 group">
              <div className="w-full h-full rounded-3xl overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-500"></div>
              </div>
              <span className="absolute top-8 left-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-foreground shadow-sm">
                {product.category}
              </span>
            </div>

            {/* Area Tabs */}
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-4xl p-6 md:p-8">
              {/* Tab Headers */}
              <div className="flex flex-nowrap overflow-x-auto hide-scrollbar gap-6 border-b border-slate-200 dark:border-slate-700 mb-6 pb-2">
                <button 
                  onClick={() => setActiveTab('deskripsi')}
                  className={`pb-2 whitespace-nowrap text-sm font-bold transition-colors relative ${
                    activeTab === 'deskripsi' ? 'text-blue-600' : 'text-foreground/50 hover:text-foreground'
                  }`}
                >
                  Deskripsi Lengkap
                  {activeTab === 'deskripsi' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full -mb-2.5"></span>
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('spesifikasi')}
                  className={`pb-2 whitespace-nowrap text-sm font-bold transition-colors relative ${
                    activeTab === 'spesifikasi' ? 'text-blue-600' : 'text-foreground/50 hover:text-foreground'
                  }`}
                >
                  Spesifikasi & Custom
                  {activeTab === 'spesifikasi' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full -mb-2.5"></span>
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('pengiriman')}
                  className={`pb-2 whitespace-nowrap text-sm font-bold transition-colors relative ${
                    activeTab === 'pengiriman' ? 'text-blue-600' : 'text-foreground/50 hover:text-foreground'
                  }`}
                >
                  Info Pengiriman
                  {activeTab === 'pengiriman' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full -mb-2.5"></span>
                  )}
                </button>
              </div>

              {/* Tab Contents */}
              <div className="text-foreground/70 text-sm leading-relaxed">
                {activeTab === 'deskripsi' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <p>{product.description}</p>
                    <p className="mt-4">
                      Dibuat dengan filosofi modern, produk ini menonjolkan keindahan dan kesederhanaan. Cocok dipadukan dengan berbagai gaya kasual maupun streetwear harian Anda.
                    </p>
                  </div>
                )}
                {activeTab === 'spesifikasi' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-3">
                    <p><strong>Material:</strong> 100% Premium Material</p>
                    <p><strong>Cutting:</strong> Modern Fit yang menyesuaikan dengan tren masa kini.</p>
                    <p><strong>Detail Custom:</strong> Dirancang dengan tingkat presisi tinggi. Toleransi perbedaan ukuran 1-2 cm karena proses produksi organik.</p>
                  </div>
                )}
                {activeTab === 'pengiriman' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-3">
                    <p>📦 <strong>Gratis Ongkir:</strong> Berlaku untuk seluruh wilayah Indonesia.</p>
                    <p>⏱️ <strong>Estimasi:</strong> 2 - 4 hari kerja (Reguler) / 1 - 2 hari kerja (Ekspres).</p>
                    <p>🔄 <strong>Pengembalian:</strong> Mendukung retur/tukar ukuran secara gratis dalam waktu 7 hari sejak barang diterima, selama tag produk belum dilepas.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
          
          {/* KOLOM KANAN: Informasi Pembelian */}
          <div className="flex flex-col justify-start lg:pt-4">
            
            {/* Header Info */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground mb-4 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex text-yellow-400">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <span className="text-sm font-medium text-foreground/60">(42 Ulasan)</span>
              </div>
              <p className="text-3xl md:text-4xl font-black text-foreground">
                {formatRupiah(product.price)}
              </p>
            </div>
            
            <hr className="border-slate-200 dark:border-slate-800 mb-8" />
            
            {/* Pilihan Warna */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/60 mb-4">Pilih Warna</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${
                        activeColor === color
                          ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground hover:border-blue-600/50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pilihan Ukuran */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/60">Pilih Ukuran</h3>
                <button className="text-xs font-bold text-blue-600 hover:underline">Panduan Ukuran</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes && product.sizes.map((size) => (
                  <button 
                    key={size} 
                    onClick={() => setSelectedSize(size)} 
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-bold transition-all border ${
                      activeSize === size 
                        ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground hover:border-slate-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Kuantitas & Tombol Tambah */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-2 w-full sm:w-40 border border-slate-200 dark:border-slate-700">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-colors text-foreground"><Minus className="w-4 h-4 mx-auto" /></button>
                <span className="font-bold text-foreground w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-colors text-foreground"><Plus className="w-4 h-4 mx-auto" /></button>
              </div>
              <button onClick={handleAddToCart} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Tambah ke Keranjang
              </button>
            </div>

            {/* Info Tambahan / Keamanan */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 flex items-start gap-4 border border-slate-100 dark:border-slate-800 mt-4">
              <ShieldCheck className="w-6 h-6 text-green-500 shrink-0" />
              <div>
                <h4 className="font-bold text-foreground text-sm mb-1">Garansi Keaslian 100%</h4>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  Semua produk Warhope melewati proses Quality Control yang ketat. Mendukung retur barang gratis dalam 7 hari.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}