"use client";

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function AddToCartButton({ product }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = () => {
    // Karena di homepage user tidak milih ukuran/warna, 
    // kita set default agar tidak error di keranjang.
    // Atau bisa juga arahkan user ke halaman detail produk.
    
    // Asumsi Supabase menyimpan array sebagai JSON
    const defaultColor = Array.isArray(product.colors) ? product.colors[0] : "Default";
    const defaultSize = Array.isArray(product.sizes) ? product.sizes[0] : "All Size";

    addItem({
      ...product,
      selectedColor: defaultColor,
      selectedSize: defaultSize,
      quantity: 1
    });
    
    alert(`Berhasil masuk keranjang!`);
  };

  return (
    <button 
      onClick={handleAdd}
      className="w-10 h-10 flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white hover:scale-105 transition-all shadow-md active:scale-95 z-10"
      title="Tambah ke Keranjang"
    >
      <ShoppingCart className="w-4 h-4" />
    </button>
  );
}