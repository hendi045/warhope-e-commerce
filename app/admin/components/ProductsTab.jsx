import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, X, Save, AlertTriangle, AlertCircle } from 'lucide-react';
import { formatRupiah } from '../utils';
import { useToastStore } from '../../../store/toastStore';
import { addProduct, updateProduct, deleteProduct } from '../../../lib/api';

const initialForm = { id: '', name: '', category: 'T-Shirts', price: '', description: '', image: '', colors: '', sizes: '' };

export default function ProductsTab({ products, isLoadingProducts, fetchProducts }) {
  const addToast = useToastStore((state) => state.addToast);
  
  const [searchProductTerm, setSearchProductTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  
  // State untuk Data Form dan Data Orisinal (Untuk mendeteksi perubahan)
  const [formData, setFormData] = useState(initialForm);
  const [originalData, setOriginalData] = useState(initialForm);
  
  // State untuk peringatan keluar
  const [discardModalOpen, setDiscardModalOpen] = useState(false);

  const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchProductTerm.toLowerCase()) || product.id.toLowerCase().includes(searchProductTerm.toLowerCase()));

  // Mengecek apakah ada data yang diketik tapi belum di-save
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  }, [formData, originalData]);

  // Mencegah browser di-refresh atau ditutup jika isDirty = true
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isModalOpen && isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isModalOpen, isDirty]);

  const handleOpenModal = (mode, product = null) => {
    setModalMode(mode);
    let targetData = initialForm;
    if (mode === 'edit' && product) {
      targetData = { ...product, colors: product.colors?.join(', ') || '', sizes: product.sizes?.join(', ') || '' };
    }
    setFormData(targetData);
    setOriginalData(targetData); // Simpan acuan data asli
    setIsModalOpen(true);
  };

  // Tombol batal/silang ditekan
  const handleRequestClose = () => {
    if (isDirty) {
      setDiscardModalOpen(true); // Tampilkan konfirmasi
    } else {
      forceCloseModal(); // Jika tidak ada perubahan, langsung tutup
    }
  };

  const forceCloseModal = () => {
    setDiscardModalOpen(false);
    setIsModalOpen(false);
    setFormData(initialForm);
    setOriginalData(initialForm);
  };

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      let finalImageUrl = formData.image.trim();
      if (finalImageUrl.includes('unsplash.com') && !finalImageUrl.includes('?')) {
        finalImageUrl += '?auto=format&fit=crop&q=80&w=800';
      }

      const payload = {
        ...formData,
        price: parseInt(formData.price),
        image: finalImageUrl, 
        colors: formData.colors.split(',').map(c => c.trim()).filter(Boolean),
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
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
      addToast('Gagal menyimpan produk.', 'error');
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
        <div><h2 className="text-3xl font-bold tracking-tight text-foreground">Katalog Produk</h2><p className="text-slate-500 dark:text-slate-400 mt-1">Atur harga, gambar, dan deskripsi pakaian Anda.</p></div>
        <button onClick={() => handleOpenModal('add')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"><Plus className="w-5 h-5" /> Tambah Produk</button>
      </header>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-bold text-foreground">Daftar Produk ({products.length})</h3>
          <div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Cari nama / ID..." value={searchProductTerm} onChange={(e) => setSearchProductTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 text-sm"><tr><th className="px-6 py-4">Produk</th><th className="px-6 py-4">Kategori</th><th className="px-6 py-4">Harga</th><th className="px-6 py-4 text-right">Aksi</th></tr></thead>
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

      {/* MODAL ADD/EDIT PRODUCT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                {modalMode === 'add' ? 'Tambah Produk Baru' : 'Edit Produk'}
                {isDirty && <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-1 rounded-md uppercase tracking-widest ml-2">Belum Tersimpan</span>}
              </h3>
              <button onClick={handleRequestClose} className="text-foreground/40 hover:text-foreground p-1"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmitProduct} className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-xs font-bold text-foreground/60 uppercase tracking-widest">ID Produk</label><input required name="id" value={formData.id} onChange={handleInputChange} disabled={modalMode === 'edit'} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none text-foreground disabled:opacity-50" placeholder="Contoh: p-003" /></div>
                <div className="space-y-2"><label className="text-xs font-bold text-foreground/60 uppercase tracking-widest">Nama Produk</label><input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none text-foreground" placeholder="Nama barang" /></div>
                <div className="space-y-2"><label className="text-xs font-bold text-foreground/60 uppercase tracking-widest">Kategori</label><select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none text-foreground"><option value="T-Shirts">T-Shirts</option><option value="Hoodies">Hoodies</option><option value="Pants">Pants</option><option value="Accessories">Accessories</option></select></div>
                <div className="space-y-2"><label className="text-xs font-bold text-foreground/60 uppercase tracking-widest">Harga (Rp)</label><input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none text-foreground" placeholder="249000" /></div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-foreground/60 uppercase tracking-widest">URL Gambar</label>
                  <input required name="image" value={formData.image} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none text-foreground" placeholder="Contoh: https://images.unsplash.com/photo-1581655353564-df123a1eb820" />
                </div>
                <div className="space-y-2 md:col-span-2"><label className="text-xs font-bold text-foreground/60 uppercase tracking-widest">Deskripsi</label><textarea required name="description" rows={3} value={formData.description} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none text-foreground resize-none" placeholder="Penjelasan singkat produk..."></textarea></div>
                <div className="space-y-2"><label className="text-xs font-bold text-foreground/60 uppercase tracking-widest">Warna (Pisahkan dg koma)</label><input required name="colors" value={formData.colors} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none text-foreground" placeholder="Hitam, Putih, Navy" /></div>
                <div className="space-y-2"><label className="text-xs font-bold text-foreground/60 uppercase tracking-widest">Ukuran (Pisahkan dg koma)</label><input required name="sizes" value={formData.sizes} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none text-foreground" placeholder="S, M, L, XL" /></div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                <button type="button" onClick={handleRequestClose} className="px-6 py-3 rounded-full font-bold text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Batal</button>
                <button type="submit" disabled={isProcessing || !isDirty} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2">{isProcessing ? 'Menyimpan...' : <><Save className="w-4 h-4" /> Simpan Produk</>}</button>
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