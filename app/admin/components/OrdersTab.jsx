import React, { useState } from 'react';
import { Search, Eye, X, Truck, Clock, CheckCircle, MapPin, Mail, Phone } from 'lucide-react';
import { formatRupiah, formatDate, getStatusBadge } from '../utils';

// PERBAIKAN PATH (MUNDUR 3 TINGKAT)
import { useToastStore } from '../../../store/toastStore';
import { supabase } from '../../../lib/supabase';

export default function OrdersTab({ orders, isLoadingOrders, fetchOrders }) {
  const addToast = useToastStore((state) => state.addToast);
  const [searchOrderTerm, setSearchOrderTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const filteredOrders = orders.filter(order => order.invoice_number?.toLowerCase().includes(searchOrderTerm.toLowerCase()) || order.customer_name?.toLowerCase().includes(searchOrderTerm.toLowerCase()));

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      addToast(`Status pesanan diubah menjadi ${newStatus}`, 'success');
      fetchOrders(); 
      setIsOrderModalOpen(false);
    } catch (err) {
      console.error(err);
      addToast('Gagal memperbarui status.', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getOrderItems = () => {
    if (!selectedOrder?.items) return [];
    try { return typeof selectedOrder.items === 'string' ? JSON.parse(selectedOrder.items) : selectedOrder.items; } 
    catch { return []; }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div><h2 className="text-3xl font-bold tracking-tight text-foreground">Manajemen Pesanan</h2><p className="text-slate-500 dark:text-slate-400 mt-1">Daftar semua transaksi yang masuk ke sistem.</p></div>
      </header>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-bold text-foreground">Daftar Transaksi ({filteredOrders.length})</h2>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Cari Invoice atau Nama..." value={searchOrderTerm} onChange={(e) => setSearchOrderTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Invoice & Waktu</th>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Total Belanja</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoadingOrders ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">Memuat data pesanan...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">Tidak ada data pesanan.</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4"><p className="font-bold text-foreground">{order.invoice_number}</p><p className="text-xs text-slate-500">{formatDate(order.created_at)}</p></td>
                    <td className="px-6 py-4"><p className="font-semibold text-foreground">{order.customer_name}</p><p className="text-xs text-slate-500 max-w-50 truncate" title={order.shipping_address}>{order.shipping_address}</p></td>
                    <td className="px-6 py-4 font-bold text-foreground">{formatRupiah(order.total_amount)}</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => { setSelectedOrder(order); setIsOrderModalOpen(true); }} className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors" title="Lihat Detail"><Eye className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL PESANAN */}
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-120 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div>
                <h3 className="text-2xl font-black text-foreground flex items-center gap-3">
                  {selectedOrder.invoice_number} {getStatusBadge(selectedOrder.status)}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button onClick={() => setIsOrderModalOpen(false)} className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 p-2 rounded-full transition-colors"><X className="w-5 h-5 text-foreground" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-slate-900">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Informasi Pelanggan</h4>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl space-y-4">
                      <div className="flex items-start gap-3"><div className="bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm shrink-0"><CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div><div><p className="text-xs text-slate-500">Nama Lengkap</p><p className="font-bold text-foreground">{selectedOrder.customer_name}</p></div></div>
                      <div className="flex items-start gap-3"><div className="bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm shrink-0"><Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div><div><p className="text-xs text-slate-500">Email</p><p className="font-bold text-foreground">{selectedOrder.customer_email}</p></div></div>
                      <div className="flex items-start gap-3"><div className="bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm shrink-0"><Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div><div><p className="text-xs text-slate-500">Nomor WhatsApp</p><p className="font-bold text-foreground">{selectedOrder.customer_phone}</p></div></div>
                      <div className="flex items-start gap-3"><div className="bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm shrink-0"><MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div><div><p className="text-xs text-slate-500">Alamat Pengiriman</p><p className="font-bold text-foreground text-sm leading-relaxed">{selectedOrder.shipping_address}</p></div></div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Rincian Belanja</h4>
                  <div className="space-y-4 max-h-75 overflow-y-auto pr-2 custom-scrollbar">
                    {getOrderItems().map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h5 className="font-bold text-foreground text-sm leading-tight">{item.name}</h5>
                          <div className="flex gap-2 mt-1"><span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300">Size: {item.selectedSize}</span><span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300">Color: {item.selectedColor || '-'}</span></div>
                          <div className="flex justify-between items-end mt-2"><span className="text-xs font-bold text-foreground">Qty: {item.quantity}</span><span className="font-black text-blue-600 dark:text-blue-400 text-sm">{formatRupiah(item.price)}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 bg-slate-900 dark:bg-black rounded-2xl p-5 text-white">
                    <div className="flex justify-between items-center mb-2 text-slate-400 text-sm"><span>Total Tagihan Dibayar</span></div>
                    <div className="flex justify-between items-end"><span className="text-3xl font-black text-blue-400">{formatRupiah(selectedOrder.total_amount)}</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center gap-4">
              {selectedOrder.status === 'PENDING' ? (
                <p className="text-sm text-amber-600 font-bold flex items-center gap-2"><Clock className="w-4 h-4"/> Menunggu pelanggan membayar.</p>
              ) : selectedOrder.status === 'PAID' || selectedOrder.status === 'SUCCESS' ? (
                <div className="flex items-center gap-3 w-full justify-end">
                  <p className="text-sm text-slate-500 mr-auto hidden sm:block">Pesanan sudah lunas. Segera proses pengiriman.</p>
                  <button onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'DIKIRIM')} disabled={isUpdatingStatus} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2">
                    {isUpdatingStatus ? 'Memproses...' : <><Truck className="w-4 h-4" /> Tandai Sudah Dikirim</>}
                  </button>
                </div>
              ) : selectedOrder.status === 'DIKIRIM' ? (
                <div className="flex items-center gap-3 w-full justify-end"><p className="text-sm text-green-600 font-bold flex items-center gap-2 mr-auto"><CheckCircle className="w-4 h-4"/> Paket sedang dalam perjalanan.</p></div>
              ) : (
                <p className="text-sm text-red-500 font-bold">Transaksi Gagal / Kadaluarsa</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}