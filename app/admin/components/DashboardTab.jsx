import React, { useMemo } from 'react';
import { TrendingUp, CheckCircle, Users, BarChart3, Award, RefreshCw } from 'lucide-react';
import { formatRupiah } from '../utils';

export default function DashboardTab({ orders, onRefresh }) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const dashboardStats = useMemo(() => {
    const paidOrders = orders.filter(o => ['PAID', 'SUCCESS', 'DIKIRIM'].includes(o.status?.toUpperCase()));
    
    const totalRevenue = paidOrders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
    const uniqueCustomers = new Set(paidOrders.map(o => o.customer_email)).size;

    const monthlyRevenue = Array(12).fill(0);
    paidOrders.forEach(o => {
      const month = new Date(o.created_at).getMonth(); 
      monthlyRevenue[month] += o.total_amount || 0;
    });
    const maxMonthlyRevenue = Math.max(...monthlyRevenue, 1); 

    const productSales = {};
    paidOrders.forEach(o => {
      let items = [];
      try { items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items; } catch {}
      
      items.forEach(item => {
        if (!productSales[item.id]) {
          productSales[item.id] = { id: item.id, name: item.name, image: item.image, category: item.category, soldQty: 0, revenue: 0 };
        }
        productSales[item.id].soldQty += (item.quantity || 1);
        productSales[item.id].revenue += (item.price * (item.quantity || 1));
      });
    });

    const topProducts = Object.values(productSales).sort((a, b) => b.soldQty - a.soldQty).slice(0, 5);

    return { totalRevenue, uniqueCustomers, paidOrdersCount: paidOrders.length, monthlyRevenue, maxMonthlyRevenue, topProducts };
  }, [orders]);

  return (
    <div className="animate-in fade-in duration-300">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Ringkasan Bisnis</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Pantau performa penjualan dan statistik utama toko Anda.</p>
        </div>
        <button onClick={onRefresh} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
          <RefreshCw className="w-4 h-4" /> Perbarui Data
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-lg shadow-blue-900/20 text-white flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0"><TrendingUp className="w-6 h-6" /></div>
          <div><p className="text-sm font-semibold text-blue-100">Total Pendapatan</p><h3 className="text-2xl font-black">{formatRupiah(dashboardStats.totalRevenue)}</h3></div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0"><CheckCircle className="w-6 h-6" /></div>
          <div><p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Pesanan Sukses</p><h3 className="text-2xl font-black text-foreground">{dashboardStats.paidOrdersCount} Transaksi</h3></div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl flex items-center justify-center shrink-0"><Users className="w-6 h-6" /></div>
          <div><p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Pelanggan</p><h3 className="text-2xl font-black text-foreground">{dashboardStats.uniqueCustomers} Orang</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6 md:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-600" /> Pendapatan Bulanan ({new Date().getFullYear()})</h3>
          </div>
          <div className="flex-1 flex items-end gap-2 sm:gap-4 h-64 mt-auto border-b border-slate-100 dark:border-slate-800 pb-2">
            {dashboardStats.monthlyRevenue.map((val, idx) => {
              const heightPercentage = dashboardStats.maxMonthlyRevenue > 0 ? (val / dashboardStats.maxMonthlyRevenue) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-slate-800 text-white text-xs font-bold py-1 px-2 rounded-md pointer-events-none transition-opacity whitespace-nowrap z-10">
                    {formatRupiah(val)}
                  </div>
                  <div className="w-full bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 rounded-t-sm transition-all duration-500 min-h-1" style={{ height: `${heightPercentage}%` }}></div>
                  <span className="text-[10px] font-bold text-slate-400 mt-3 absolute -bottom-6">{monthNames[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6 md:p-8">
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2"><Award className="w-5 h-5 text-amber-500" /> Produk Terlaris</h3>
          {dashboardStats.topProducts.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">Belum ada data penjualan.</div>
          ) : (
            <div className="space-y-6">
              {dashboardStats.topProducts.map((prod, idx) => (
                <div key={prod.id} className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="absolute -top-2 -left-2 w-6 h-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center text-xs font-black border-2 border-white dark:border-slate-900">{idx + 1}</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold text-sm text-foreground truncate">{prod.name}</h4>
                    <p className="text-xs text-slate-500">{prod.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-blue-600 dark:text-blue-400 text-sm">{prod.soldQty} Terjual</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{formatRupiah(prod.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}