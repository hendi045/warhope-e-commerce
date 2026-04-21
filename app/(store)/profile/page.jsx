"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Package, Settings, LogOut, 
  Clock, CheckCircle, Truck, XCircle, 
  MapPin, Mail, Phone, ShoppingBag, AlertTriangle, CreditCard 
} from 'lucide-react';

import { useAuthStore } from '../../../store/authStore';
import { useToastStore } from '../../../store/toastStore';
import { supabase } from '../../../lib/supabase';

// WAKTU KEDALUWARSA PEMBAYARAN (24 Jam dalam milidetik)
const PAYMENT_TIMEOUT_MS = 24 * 60 * 60 * 1000; 

export default function ProfilePage() {
  const router = useRouter();
  const { user, isInitialized, checkAuth, logout } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);

  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Mencegah Hydration Mismatch & Cek Auth
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClient(true);
      checkAuth();
    }, 0);
    return () => clearTimeout(timer);
  }, [checkAuth]);

  // PROTEKSI HALAMAN
  useEffect(() => {
    if (isClient && isInitialized && !user) {
      addToast('Silakan masuk (login) untuk mengakses profil Anda.', 'error');
      router.push('/auth/login');
    }
  }, [isClient, isInitialized, user, router, addToast]);

  // MENGAMBIL DATA PESANAN & AUTO-EXPIRE LOGIC
  useEffect(() => {
    const fetchMyOrders = async () => {
      if (!user?.email) return;
      setIsLoadingOrders(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_email', user.email)
          .order('created_at', { ascending: false });

        if (error) throw error;

        let fetchedOrders = data || [];
        let hasExpiredUpdates = false;

        // LOGIKA CERDAS: Cek pesanan PENDING yang sudah lewat 24 jam
        const now = new Date().getTime();
        fetchedOrders = await Promise.all(fetchedOrders.map(async (order) => {
          if (order.status === 'PENDING') {
            const orderTime = new Date(order.created_at).getTime();
            if (now - orderTime > PAYMENT_TIMEOUT_MS) {
              // Jika sudah lewat 24 Jam, update database menjadi EXPIRED
              await supabase.from('orders').update({ status: 'EXPIRED' }).eq('id', order.id);
              hasExpiredUpdates = true;
              return { ...order, status: 'EXPIRED' };
            }
          }
          return order;
        }));

        if (hasExpiredUpdates) {
          addToast('Beberapa pesanan telah dibatalkan otomatis oleh sistem karena melewati batas waktu pembayaran.', 'info');
        }

        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Gagal mengambil pesanan:', error);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    if (isClient && user) {
      fetchMyOrders();
    }
  }, [isClient, user, addToast]);

  const handleLogout = () => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin keluar?");
    if (isConfirmed) {
      logout();
      addToast('Anda berhasil keluar.', 'info');
      router.push('/');
    }
  };

  // FUNGSI BATALKAN PESANAN MANUAL OLEH USER
  const handleCancelOrder = async (orderId, invoiceNumber) => {
    const isConfirmed = window.confirm(`Yakin ingin membatalkan pesanan ${invoiceNumber}?\nTindakan ini tidak dapat dikembalikan.`);
    if (!isConfirmed) return;

    setIsProcessingAction(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'CANCELED' })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'CANCELED' } : o));
      addToast(`Pesanan ${invoiceNumber} berhasil dibatalkan.`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Gagal membatalkan pesanan. Coba lagi nanti.', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Format Waktu Jatuh Tempo (Kapan harus dibayar)
  const getDueDate = (createdAt) => {
    const date = new Date(new Date(createdAt).getTime() + PAYMENT_TIMEOUT_MS);
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID': case 'SUCCESS':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold w-fit"><CheckCircle className="w-3.5 h-3.5" /> LUNAS</span>;
      case 'DIKIRIM': case 'SHIPPED':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold w-fit"><Truck className="w-3.5 h-3.5" /> DIKIRIM</span>;
      case 'PENDING':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold w-fit"><Clock className="w-3.5 h-3.5" /> MENUNGGU PEMBAYARAN</span>;
      case 'CANCELED':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold w-fit"><XCircle className="w-3.5 h-3.5" /> DIBATALKAN ANDA</span>;
      case 'EXPIRED': case 'FAILED':
        return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold w-fit"><AlertTriangle className="w-3.5 h-3.5" /> DIBATALKAN SISTEM</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold w-fit">{status}</span>;
    }
  };

  if (!isClient || !isInitialized || !user) return <div className="min-h-screen bg-background pt-32 pb-24"></div>;
  if (user.role === 'admin') { router.push('/admin'); return null; }

  return (
    <main className="min-h-screen bg-background pt-32 pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-10">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Akun Saya</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* KOLOM KIRI: Navigasi Profil */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center font-black text-2xl mb-4 uppercase tracking-widest">
              {user.name ? user.name.charAt(0) : 'W'}
            </div>
            <h2 className="font-bold text-foreground text-lg">{user.name || 'Pengguna Warhope'}</h2>
            <p className="text-sm text-foreground/60 mb-6">{user.email}</p>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Member
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col gap-2">
            <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all w-full text-left ${activeTab === 'orders' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-foreground/70 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-foreground'}`}>
              <Package className="w-5 h-5" /> Pesanan Saya
            </button>
            <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all w-full text-left ${activeTab === 'settings' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-foreground/70 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-foreground'}`}>
              <Settings className="w-5 h-5" /> Pengaturan
            </button>
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all w-full text-left">
              <LogOut className="w-5 h-5" /> Keluar
            </button>
          </div>
        </div>

        {/* KOLOM KANAN: Konten Tab */}
        <div className="lg:col-span-9">
          
          {/* TAB PESANAN SAYA */}
          {activeTab === 'orders' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-xl font-bold tracking-tight text-foreground mb-6">Riwayat Pesanan</h2>
              
              {isLoadingOrders ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-foreground/60 text-sm">Memuat pesanan Anda...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center shadow-sm">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Belum ada pesanan</h3>
                  <p className="text-foreground/60 mb-8 max-w-sm">Anda belum melakukan transaksi apa pun. Yuk, wujudkan gaya urban Anda sekarang!</p>
                  <Link href="/#katalog" className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all active:scale-95">
                    Mulai Belanja
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    let items = [];
                    try { 
                      items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items; 
                    } catch (err) {
                      console.error("Gagal mem-parsing data item pesanan:", err);
                    }

                    const isPending = order.status === 'PENDING';
                    
                    return (
                      <div key={order.id} className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm transition-all ${isPending ? 'border-amber-200 dark:border-amber-900/50 shadow-amber-900/5' : 'border-slate-200 dark:border-slate-800'}`}>
                        
                        {/* Header Pesanan */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 gap-4">
                          <div>
                            <p className="text-xs text-foreground/50 uppercase tracking-widest mb-1">
                              Tanggal Pesanan: <span className="font-bold text-foreground/80">{formatDate(order.created_at)}</span>
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="font-black text-foreground">{order.invoice_number}</h3>
                              {getStatusBadge(order.status)}
                            </div>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-xs text-foreground/50 uppercase tracking-widest mb-1">Total Belanja</p>
                            <p className="font-black text-blue-600 dark:text-blue-400 text-lg">{formatRupiah(order.total_amount)}</p>
                          </div>
                        </div>

                        {/* List Barang */}
                        <div className="space-y-4">
                          {items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/20 p-3 rounded-2xl">
                              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-foreground text-sm line-clamp-1">{item.name}</h4>
                                {/* PENGHAPUSAN TEKS WARNA DI SINI */}
                                <p className="text-[11px] text-foreground/60 mt-1 uppercase tracking-widest font-bold">Size: {item.selectedSize}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-sm font-bold text-foreground">{item.quantity}x</p>
                                <p className="text-xs font-bold text-foreground/60 mt-1">{formatRupiah(item.price)}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Aksi & Info Kedaluwarsa untuk PENDING */}
                        {isPending && (
                          <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                            <div>
                              <p className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-widest flex items-center gap-1 mb-1">
                                <Clock className="w-3 h-3" /> Batas Waktu Pembayaran
                              </p>
                              <p className="text-sm font-black text-amber-900 dark:text-amber-400">
                                {getDueDate(order.created_at)} WIB
                              </p>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                              <button 
                                onClick={() => handleCancelOrder(order.id, order.invoice_number)}
                                disabled={isProcessingAction}
                                className="flex-1 sm:flex-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all disabled:opacity-50"
                              >
                                Batalkan
                              </button>
                              <button 
                                onClick={() => {
                                  if(order.payment_url) window.location.href = order.payment_url;
                                  else addToast('Link pembayaran tidak ditemukan. Silakan hubungi CS Warhope.', 'error');
                                }}
                                disabled={isProcessingAction}
                                className="flex-1 sm:flex-none bg-blue-600 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                <CreditCard className="w-4 h-4" /> Bayar
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Aksi untuk DIKIRIM */}
                        {order.status === 'DIKIRIM' && (
                          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button className="bg-green-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-green-700 transition-all shadow-md flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" /> Pesanan Diterima
                            </button>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB PENGATURAN AKUN */}
          {activeTab === 'settings' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-xl font-bold tracking-tight text-foreground mb-6">Pengaturan Akun</h2>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                
                <div>
                  <label className="text-xs font-bold text-foreground/60 uppercase tracking-widest block mb-2">Nama Lengkap</label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
                    <User className="w-5 h-5 text-slate-400 mr-3" />
                    <input type="text" defaultValue={user.name || ''} className="bg-transparent w-full outline-none text-foreground text-sm font-medium" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground/60 uppercase tracking-widest block mb-2">Alamat Email</label>
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 opacity-70 cursor-not-allowed">
                    <Mail className="w-5 h-5 text-slate-400 mr-3" />
                    <input type="email" value={user.email || ''} readOnly className="bg-transparent w-full outline-none text-foreground text-sm font-medium cursor-not-allowed" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">*Email terikat dengan identitas masuk dan tidak dapat diubah.</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground/60 uppercase tracking-widest block mb-2">Nomor Telepon / WhatsApp</label>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
                    <Phone className="w-5 h-5 text-slate-400 mr-3" />
                    <input type="tel" placeholder="081234567890" className="bg-transparent w-full outline-none text-foreground text-sm font-medium" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground/60 uppercase tracking-widest block mb-2">Alamat Pengiriman Utama</label>
                  <div className="flex items-start bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
                    <MapPin className="w-5 h-5 text-slate-400 mr-3 mt-0.5" />
                    <textarea rows={3} placeholder="Masukkan alamat lengkap Anda..." className="bg-transparent w-full outline-none text-foreground text-sm font-medium resize-none"></textarea>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-md active:scale-95">
                    Simpan Perubahan
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}