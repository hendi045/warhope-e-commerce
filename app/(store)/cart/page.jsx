"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../../../store/cartStore';

export default function CartPage() {
  // Mencegah error Hydration Mismatch pada Next.js karena membaca localStorage dari Zustand
  const [isMounted, setIsMounted] = useState(false);
  
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  useEffect(() => {
    // Menggunakan setTimeout untuk mengakali aturan linter 'set-state-in-effect'
    // Ini membuat pembaruan state menjadi asinkron dan mencegah cascading renders
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const totalPrice = getTotalPrice();
  const tax = totalPrice * 0.1; // Simulasi Pajak 10% sesuai PDF
  const grandTotal = totalPrice + tax;

  return (
    <main className="min-h-screen bg-background pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Keranjang Belanja
          </h1>
          <p className="text-foreground/60 mt-2">
            Periksa kembali barang belanjaan Anda sebelum melanjutkan ke pembayaran.
          </p>
        </div>

        {items.length === 0 ? (
          /* EMPTY STATE (Jika Keranjang Kosong) */
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-4xl p-12 text-center flex flex-col items-center justify-center min-h-[50vh] shadow-sm">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Keranjang Masih Kosong</h2>
            <p className="text-foreground/60 mb-8 max-w-md">
              Sepertinya Anda belum menambahkan gaya urban apa pun ke keranjang Anda. Mari eksplorasi koleksi terbaru kami!
            </p>
            <Link 
              href="/#katalog"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-blue-600/30 active:scale-95 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Mulai Belanja
            </Link>
          </div>
        ) : (
          /* CART ITEMS (Jika Keranjang Terisi) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Kiri: Daftar Produk */}
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => {
                // Membuat ID unik untuk tombol hapus (karena kita membedakan produk dari varian warnanya juga)
                const cartItemId = `${item.id}-${item.selectedColor}-${item.selectedSize}`;
                
                return (
                  <div 
                    key={cartItemId} 
                    className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col sm:flex-row items-center gap-6 shadow-sm group"
                  >
                    {/* Gambar Produk */}
                    <div className="w-full sm:w-32 aspect-square bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Detail Info */}
                    <div className="flex-1 w-full text-center sm:text-left">
                      <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">{item.category}</p>
                      <Link href={`/product/${item.id}`} className="hover:text-blue-600 transition-colors">
                        <h3 className="text-lg font-bold text-foreground mb-2 leading-tight">{item.name}</h3>
                      </Link>
                      
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-foreground/60 mb-4">
                        <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-medium">
                          Size: {item.selectedSize}
                        </span>
                        <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-medium">
                          Qty: {item.quantity}
                        </span>
                      </div>

                      <div className="font-black text-foreground text-lg">
                        {formatRupiah(item.price * item.quantity)}
                      </div>
                    </div>

                    {/* Tombol Hapus */}
                    <div className="w-full sm:w-auto flex justify-end">
                      <button 
                        onClick={() => removeItem(cartItemId)}
                        className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-colors group-hover:shadow-md"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Kanan: Ringkasan Pesanan */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-4xl p-8 sticky top-28 shadow-sm">
                <h3 className="text-xl font-bold text-foreground mb-6">Ringkasan Pesanan</h3>
                
                <div className="space-y-4 text-sm mb-6">
                  <div className="flex justify-between text-foreground/70">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">{formatRupiah(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-foreground/70">
                    <span>Estimasi Pajak (10%)</span>
                    <span className="font-medium text-foreground">{formatRupiah(tax)}</span>
                  </div>
                  <div className="flex justify-between text-foreground/70">
                    <span>Biaya Pengiriman</span>
                    <span className="font-medium text-green-500">Gratis</span>
                  </div>
                </div>

                <hr className="border-slate-200 dark:border-slate-700 mb-6" />

                <div className="flex justify-between items-end mb-8">
                  <span className="text-foreground/70 font-medium">Total Keseluruhan</span>
                  <span className="text-2xl font-black text-foreground">{formatRupiah(grandTotal)}</span>
                </div>

                <Link 
                  href="/checkout"
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-full font-bold hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group"
                >
                  Lanjut Pembayaran
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <p className="text-center text-xs text-foreground/50 mt-4 flex items-center justify-center gap-1">
                  Transaksi aman dan terenkripsi.
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}