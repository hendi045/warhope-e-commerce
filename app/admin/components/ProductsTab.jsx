import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, X, Save, AlertTriangle, AlertCircle, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { formatRupiah } from '../utils';
import { useToastStore } from '../../../store/toastStore';
import { supabase } from '../../../lib/supabase';
import { addProduct, updateProduct, deleteProduct } from '../../../lib/api';

// Template default ukuran dan stok
const defaultSizes = {
  S: { active: false, stock: 0 },
  M: { active: false, stock: 0 },
  L: { active: false, stock: 0 },
  XL: { active: false, stock: 0 },
  XXL: { active: false, stock: 0 },
};

const initialForm = { 
  id: '', 
  name: '', 
  category: '', 
  price: '', 
  description: '', 
  image: '', 
  sizes: JSON.parse(JSON.stringify(defaultSizes)) 
};

export default function ProductsTab({ products, isLoadingProducts, fetchProducts }) {
  const addToast = useToastStore((state) => state.addToast);
  
  const [searchProductTerm, setSearchProductTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  
  const [formData, setFormData] = useState(initialForm);
  const [originalData, setOriginalData] = useState(initialForm);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);

  // State khusus Upload Gambar
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Mendapatkan daftar kategori unik dari produk yang ada
  const existingCategories = useMemo(() => {
    const cats = products.map(p => p.category).filter(Boolean);
    return [...new Set(cats)];
  }, [products]);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchProductTerm.toLowerCase()) || 
    product.id.toLowerCase().includes(searchProductTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchProductTerm.toLowerCase())
  );

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(originalData) || imageFile !== null;
  }, [formData, originalData, imageFile]);

  // LOGIKA CERDAS 1: AUTO GENERATE PRODUCT ID
  useEffect(() => {
    if (modalMode === 'add' && formData.category && formData.category.length >= 3) {
      // Jika ID masih kosong, generate otomatis berdasarkan 3 huruf pertama kategori + 4 angka acak
      if (!formData.id || formData.id === originalData.id) {
        const prefix = formData.category.substring(0, 3).toUpperCase();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        setFormData(prev => ({ ...prev, id: `${prefix}-${randomNum}` }));
      }
    }
  }, [formData.category, modalMode, originalData.id, formData.id]);

  const handleOpenModal = (mode, product = null) => {
    setModalMode(mode);
    setImageFile(null);
    setImagePreview(null);

    let targetData = JSON.parse(JSON.stringify(initialForm));
    
    if (mode === 'edit' && product) {
      // LOGIKA MIGRASI: Mengatasi jika data produk lama ukuran masih format array ['S', 'M']
      let parsedSizes = JSON.parse(JSON.stringify(defaultSizes));
      if (Array.isArray(product.sizes)) {
        product.sizes.forEach(s => { if(parsedSizes[s]) parsedSizes[s] = { active: true, stock: 10 } });
      } else if (typeof product.sizes === 'object' && product.sizes !== null) {
        parsedSizes = { ...parsedSizes, ...product.sizes };
      }

      targetData = { ...product, sizes: parsedSizes };
      setImagePreview(product.image);
    }
    
    setFormData(targetData);
    setOriginalData(targetData);
    setIsModalOpen(true);
  };

  const forceCloseModal = () => {
    setDiscardModalOpen(false);
    setIsModalOpen(false);
    setFormData(JSON.parse(JSON.stringify(initialForm)));
    setOriginalData(JSON.parse(JSON.stringify(initialForm)));
    setImageFile(null);
    setImagePreview(null);
  };

  const handleRequestClose = () => {
    if (isDirty) setDiscardModalOpen(true);
    else forceCloseModal();
  };

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // LOGIKA CERDAS 2: HANDLING UPLOAD FILE LOKAL
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi Ukuran (Max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      addToast('Ukuran file terlalu besar! Maksimal 2MB.', 'error');
      return;
    }

    // Validasi Format
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      addToast('Format file tidak didukung! Gunakan JPG, PNG, atau WEBP.', 'error');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file)); // Buat preview lokal langsung
  };

  // LOGIKA CERDAS 3: HANDLING UKURAN & STOK
  const toggleSize = (sizeKey) => {
    setFormData(prev => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [sizeKey]: { ...prev.sizes[sizeKey], active: !prev.sizes[sizeKey].active, stock: prev.sizes[sizeKey].active ? 0 : 10 } // Default stok 10 jika diaktifkan
      }
    }));
  };

  const updateStock = (sizeKey, newStock) => {
    const stockVal = Math.max(0, parseInt(newStock) || 0);
    setFormData(prev => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [sizeKey]: { ...prev.sizes[sizeKey], stock: stockVal }
      }
    }));
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Validasi: Minimal 1 ukuran aktif
      const hasActiveSize = Object.values(formData.sizes).some(s => s.active);
      if (!hasActiveSize) {
        addToast('Minimal aktifkan 1 ukuran produk.', 'error');
        setIsProcessing(false);
        return;
      }

      let finalImageUrl = formData.image;

      // PROSES UPLOAD GAMBAR KE SUPABASE STORAGE
      if (imageFile) {
        addToast('Mengunggah gambar...', 'info');
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${formData.id}-${Date.now()}.${fileExt}`;
        
        // Upload ke bucket bernama 'products'
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, imageFile, { cacheControl: '3600', upsert: false });

        if (uploadError) throw new Error(`Gagal upload gambar: ${uploadError.message}`);

        // Dapatkan URL Publik
        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrl;
      }

      const payload = {
        id: formData.id,
        name: formData.name,
        category: formData.category,
        price: parseInt(formData.price),
        description: formData.description,
        image: finalImageUrl, 
        sizes: formData.sizes, // Disimpan dalam bentuk Object Matrix Stok
      };

      if (modalMode === 'add') {
        await addProduct(payload);
        addToast(`Produk ditambahkan!`, 'success');
      } else {
        await updateProduct(payload.id, payload);
        addToast(`Produk diperbarui!`, 'success');
      }
      
      forceCloseModal(); 
      fetchProducts();
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Gagal menyimpan produk.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDelete = async () => {
    setIsProcessing(true);
    try {
      await deleteProduct(deleteModal.id);
      addToast(`Produk dihapus!`, 'success');
      setDeleteModal({ isOpen: false, id: null, name: '' });
      fetchProducts();
    } catch (err) {
      console.error(err);
      addToast('Gagal menghapus produk.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div><h2 className="text-3xl font-bold tracking-tight text-foreground">Katalog Produk</h2><p className="text-slate-500 dark:text-slate-400 mt-1">Atur harga, kategori, gambar lokal, dan stok pakaian Anda.</p></div>
        <button onClick={() => handleOpenModal('add')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"><Plus className="w-5 h-5" /> Tambah Produk</button>
      </header>
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-bold text-foreground">Daftar Produk ({products.length})</h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Cari nama / ID / Kategori..." value={searchProductTerm} onChange={(e) => setSearchProductTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 text-sm">
              <tr><th className="px-6 py-4">Produk</th><th className="px-6 py-4">Kategori</th><th className="px-6 py-4">Harga</th><th className="px-6 py-4 text-right">Aksi</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {isLoadingProducts ? <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500">Memuat data produk...</td></tr> : filteredProducts.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500">Tidak ada produk ditemukan.</td></tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{product.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">ID: {product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="inline-flex px-3 py-1 bg-slate-100 dark:bg-slate-800 text-foreground/70 rounded-md text-xs font-bold">{product.category}</span></td>
                    <td className="px-6 py-4 font-bold text-foreground">{formatRupiah(product.price)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal('edit', product)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteModal({ isOpen: true, id: product.id, name: product.name })} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================
          MODAL TAMBAH/EDIT PRODUK CANGGIH
      ========================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shrink-0">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                {modalMode === 'add' ? 'Tambah Produk Baru' : 'Edit Produk'}
                {isDirty && <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-1 rounded-md uppercase tracking-widest ml-2">Belum Tersimpan</span>}
              </h3>
              <button onClick={handleRequestClose} className="text-foreground/40 hover:text-foreground p-1"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleSubmitProduct} className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* KOLOM KIRI: Upload Gambar */}
                <div className="md:col-span-4 space-y-4">
                  <label className="text-xs font-bold text-foreground/60 uppercase tracking-widest block mb-2">Foto Produk</label>
                  
                  <div className="relative group w-full aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 overflow-hidden flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all">
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="p-4 flex flex-col items-center">
                        <ImageIcon className="w-10 h-10 text-slate-400 mb-3 group-hover:text-blue-500 transition-colors" />
                        <p className="text-sm font-bold text-foreground">Klik untuk Upload</p>
                        <p className="text-[10px] text-slate-500 mt-1">JPG, PNG, WEBP (Max 2MB)</p>
                      </div>
                    )}
                    
                    {/* Input File Tersembunyi di Atas Area Drag */}
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png, image/webp" 
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required={modalMode === 'add' && !formData.image} 
                    />
                    
                    {/* Tombol Ganti Foto (Muncul Saat Hover jika gambar sudah ada) */}
                    {imagePreview && (
                      <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <UploadCloud className="w-8 h-8 text-white mb-2" />
                        <span className="text-xs font-bold text-white uppercase tracking-widest">Ganti Foto</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* KOLOM KANAN: Detail Informasi */}
                <div className="md:col-span-8 space-y-6">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Kategori Custom (Datalist) */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground/60 uppercase tracking-widest flex items-center justify-between">
                        Kategori
                        <span className="text-[9px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full lowercase">Bisa ketik baru</span>
                      </label>
                      <input 
                        required 
                        list="categories-list"
                        name="category" 
                        value={formData.category} 
                        onChange={handleInputChange} 
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none text-foreground" 
                        placeholder="Contoh: Kemeja Polo" 
                      />
                      <datalist id="categories-list">
                        {existingCategories.map(cat => <option key={cat} value={cat} />)}
                      </datalist>
                    </div>

                    {/* ID Otomatis */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-foreground/60 uppercase tracking-widest flex items-center justify-between">
                        ID Produk
                        <span className="text-[9px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full lowercase">Otomatis</span>
                      </label>
                      <input 
                        required 
                        name="id" 
                        value={formData.id} 
                        onChange={handleInputChange} 
                        readOnly
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-foreground/60 cursor-not-allowed font-mono" 
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2"><label className="text-xs font-bold text-foreground/60 uppercase tracking-widest">Nama Produk</label><input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none text-foreground" placeholder="Nama barang" /></div>
                    <div className="space-y-2 sm:col-span-2"><label className="text-xs font-bold text-foreground/60 uppercase tracking-widest">Harga (Rp)</label><input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none text-foreground" placeholder="249000" /></div>
                    <div className="space-y-2 sm:col-span-2"><label className="text-xs font-bold text-foreground/60 uppercase tracking-widest">Deskripsi</label><textarea required name="description" rows={3} value={formData.description} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none text-foreground resize-none" placeholder="Penjelasan singkat produk..."></textarea></div>
                  </div>

                  <hr className="border-slate-200 dark:border-slate-800" />

                  {/* MANAJEMEN UKURAN DAN STOK MATRIX */}
                  <div>
                    <label className="text-xs font-bold text-foreground/60 uppercase tracking-widest block mb-4">Manajemen Varian & Stok Fisik</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.keys(formData.sizes).map(size => {
                        const isActive = formData.sizes[size].active;
                        return (
                          <div key={size} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isActive ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'}`}>
                            
                            {/* Tombol Toggle Ukuran */}
                            <button 
                              type="button" 
                              onClick={() => toggleSize(size)}
                              className={`w-12 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-foreground'}`}
                            >
                              {size}
                            </button>

                            {/* Input Stok (Hanya muncul jika ukuran aktif) */}
                            {isActive ? (
                              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                                <span className="text-[10px] uppercase font-bold text-slate-500">Stok:</span>
                                <input 
                                  type="number" 
                                  min="0"
                                  value={formData.sizes[size].stock} 
                                  onChange={(e) => updateStock(size, e.target.value)}
                                  className="w-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-sm text-center font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                                />
                              </div>
                            ) : (
                              <span className="text-[10px] uppercase font-bold text-slate-400 mr-4">Nonaktif</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

              {/* FOOTER MODAL */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-800 pb-2">
                <button type="button" onClick={handleRequestClose} className="px-6 py-3 rounded-full font-bold text-foreground hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Batal</button>
                <button type="submit" disabled={isProcessing || !isDirty} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2">
                  {isProcessing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Memproses...</> : <><Save className="w-4 h-4" /> Simpan Produk</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PERINGATAN UNSAVED CHANGES */}
      {discardModalOpen && (
        <div className="fixed inset-0 z-130 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8" /></div>
            <h3 className="text-xl font-bold text-foreground mb-2">Batalkan Perubahan?</h3>
            <p className="text-foreground/60 text-sm mb-8">Anda memiliki data yang belum disimpan. Perubahan ini akan hilang jika Anda keluar.</p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setDiscardModalOpen(false)} className="flex-1 py-3 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-foreground hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Kembali Edit</button>
              <button onClick={forceCloseModal} className="flex-1 py-3 rounded-full font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors">Ya, Buang</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRM DELETE */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-130 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-8 h-8" /></div>
            <h3 className="text-xl font-bold text-foreground mb-2">Hapus Produk?</h3>
            <p className="text-foreground/60 text-sm mb-8">Anda yakin ingin menghapus <strong>{deleteModal.name}</strong> secara permanen?</p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setDeleteModal({ isOpen: false, id: null, name: '' })} className="flex-1 py-3 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-foreground hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Batal</button>
              <button onClick={confirmDelete} disabled={isProcessing} className="flex-1 py-3 rounded-full font-bold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-70">{isProcessing ? 'Menghapus...' : 'Ya, Hapus'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}