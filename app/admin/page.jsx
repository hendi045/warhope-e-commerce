"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// PERBAIKAN PATH (MUNDUR 2 TINGKAT KARENA FILE INI DI app/admin/)
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { getAllProducts } from '../../lib/api';

// IMPORT KOMPONEN (MUNDUR 0 TINGKAT KARENA FOLDER components ADA DI DALAM admin)
import Sidebar from './components/Sidebar';
import DashboardTab from './components/DashboardTab';
import OrdersTab from './components/OrdersTab';
import ProductsTab from './components/ProductsTab';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isInitialized, checkAuth, logout } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => { 
    checkAuth(); 
  }, [checkAuth]);

  useEffect(() => {
    if (isInitialized) {
      if (!user) {
        addToast('Silakan login terlebih dahulu.', 'info');
        router.push('/auth/login');
      } else if (user.role !== 'admin') {
        addToast('Akses ditolak! Anda bukan Admin.', 'error');
        router.push('/');
      } else {
        fetchOrders();
        fetchProducts();
      }
    }
  }, [isInitialized, user, router, addToast]);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const { data, err } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!err) setOrders(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    const data = await getAllProducts();
    setProducts(data || []);
    setIsLoadingProducts(false);
  };

  const handleLogout = () => { 
    logout(); 
    router.push('/auth/login'); 
  };

  const handleRefreshAll = () => {
    fetchOrders();
    fetchProducts();
  };

  if (!isInitialized || user?.role !== 'admin') {
    return <div className="fixed inset-0 z-100 bg-slate-50 dark:bg-slate-900"></div>;
  }

  return (
    <div className="fixed inset-0 z-100 bg-slate-50 dark:bg-[#0A0A0A] flex flex-col md:flex-row font-sans overflow-hidden">
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout} 
      />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 pb-24">
          
          {activeTab === 'dashboard' && (
            <DashboardTab orders={orders} onRefresh={handleRefreshAll} />
          )}
          
          {activeTab === 'orders' && (
            <OrdersTab 
              orders={orders} 
              isLoadingOrders={isLoadingOrders} 
              fetchOrders={fetchOrders} 
            />
          )}
          
          {activeTab === 'products' && (
            <ProductsTab 
              products={products} 
              isLoadingProducts={isLoadingProducts} 
              fetchProducts={fetchProducts} 
            />
          )}
          
        </main>
        
        <footer className="absolute bottom-0 w-full py-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-center shrink-0 z-10">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Warhope Apparel. Internal Management System.
          </p>
        </footer>
      </div>
    </div>
  );
}