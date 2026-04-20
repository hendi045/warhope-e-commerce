"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { useAuthStore } from '../../../store/authStore';
import { useToastStore } from '../../../store/toastStore';
import { 
  User, Package, MapPin, Clock, CheckCircle, 
  Truck, XCircle, LogOut, ShoppingBag
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ProfilePage() {
  const router = useRouter();
  const { user, isInitialized, checkAuth, logout } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Proteksi Halaman
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 2. Tarik Data Pesanan Khusus User Ini (berdasarkan Email)
  // Dibungkus dengan useCallback agar aman dari warning useEffect "missing dependency"
  const fetchMyOrders = useCallback(async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', user.email) // Hanya ambil pesanan milik user ini
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      addToast('Gagal memuat riwayat pesanan.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, addToast]);

  useEffect(() => {
    if (isInitialized) {
      if (!user) {
        addToast('Silakan login untuk melihat profil Anda.', 'info');
        router.push('/auth/login');
      } else {
        fetchMyOrders();
      }
    }
  }, [isInitialized, user, router, addToast, fetchMyOrders]);

  const handleLogout = () => {
    logout();
    addToast('Anda telah keluar.', 'info');
    router.push('/');
  };

  const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID': case 'SUCCESS':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold w-fit"><CheckCircle className="w-3.5 h-3.5" /> LUNAS & DIPROSES</span>;
      case 'DIKIRIM': case 'SHIPPED':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold w-fit"><Truck className="w-3.5 h-3.5" /> DALAM PENGIRIMAN</span>;
      case 'PENDING':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold w-fit"><Clock className="w-3.5 h-3.5" /> MENUNGGU PEMBAYARAN</span>;
      case 'FAILED': case 'EXPIRED':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold w-fit"><XCircle className="w-3.5 h-3.5" /> DIBATALKAN</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold w-fit">{status}</span>;
    }
  };

  const parseItems = (itemsData) => {
    if (!itemsData) return [];
    try {
      return typeof itemsData === 'string' ? JSON.parse(itemsData) : itemsData;
    } catch {
      // Menghapus variabel 'e' yang tidak dipakai untuk mengatasi warning ESLint
      return [];
    }
  };

  if (!isInitialized || !user) {
    return <div className="min-h-screen bg-background pt-32 pb-20"></div>; // Mencegah kedipan UI
  }

  return (
    <main className="pt-32 pb-20 px-4 md:px-8 max-w-6xl mx-auto min-h-screen bg-background">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">Akun Saya</h1>
        <p className="text-foreground/60">Kelola informasi profil dan pantau status pesanan Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* --- KOLOM KIRI: INFO PROFIL --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm text-center">
            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">{user.name}</h2>
            <p className="text-sm text-foreground/60 mb-6">{user.email}</p>
            
            <div className="flex justify-center mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-widest">
                Member Warhope
              </span>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </div>
          </div>
        </div>

        {/* --- KOLOM KANAN: RIWAYAT PESANAN --- */}
        <div className="lg:col-span-8">
          <div className="flex items-center gap-3 mb-6">
            <Package className="text-blue-600 dark:text-blue-400 w-6 h-6" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Riwayat Pesanan</h2>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-foreground/60 text-sm font-medium">Memuat riwayat pesanan...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Belum Ada Pesanan</h3>
                <p className="text-foreground/60 text-sm mb-6 max-w-md mx-auto">Anda belum pernah melakukan pembelian. Mulai jelajahi koleksi kami dan temukan gaya favorit Anda!</p>
                <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition-all shadow-lg active:scale-95">
                  Mulai Belanja
                </Link>
              </div>
            ) : (
              orders.map((order) => {
                const items = parseItems(order.items);
                const previewItems = items.slice(0, 2);
                const remainingCount = items.length - 2;

                return (
                  <div key={order.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow group">
                    
                    {/* Header Order Card */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-1">Invoice</p>
                        <h3 className="font-black text-foreground text-lg">{order.invoice_number}</h3>
                        <p className="text-xs text-foreground/60 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Preview Items */}
                    <div className="space-y-4 mb-6">
                      {previewItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-foreground text-sm line-clamp-1">{item.name}</h4>
                            <p className="text-xs text-foreground/60 mt-0.5">Size: {item.selectedSize} | Warna: {item.selectedColor || '-'}</p>
                            <p className="text-xs font-bold text-foreground mt-1">{item.quantity} x {formatRupiah(item.price)}</p>
                          </div>
                        </div>
                      ))}
                      
                      {remainingCount > 0 && (
                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl text-center">
                          + {remainingCount} produk lainnya dalam pesanan ini
                        </div>
                      )}
                    </div>

                    {/* Footer Order Card */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-xs text-foreground/60 mb-1">Total Belanja</p>
                        <p className="text-xl font-black text-blue-600 dark:text-blue-400">{formatRupiah(order.total_amount)}</p>
                      </div>
                      
                      {/* Tombol aksi bayar jika PENDING */}
                      {order.status === 'PENDING' && (
                        <button 
                          onClick={() => {
                            addToast('Sistem pembayaran akan dihubungkan kembali...', 'info');
                          }}
                          className="w-full sm:w-auto bg-foreground text-background px-6 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-transform"
                        >
                          Lanjutkan Pembayaran
                        </button>
                      )}
                      
                      {/* Info Resi jika DIKIRIM */}
                      {order.status === 'DIKIRIM' && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                          <MapPin className="w-4 h-4" /> 
                          <span className="font-semibold">Resi: JNT-WH-{order.invoice_number.slice(-6)}</span>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </main>
  );
}