import { supabase } from './supabase';

// Mengambil semua produk (Untuk Homepage & Admin)
export const getAllProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

// Mengambil satu produk berdasarkan ID (Untuk Detail Produk)
export const getProductById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching single product:", error);
    return null;
  }
};

// --- FUNGSI ULASAN (REVIEW) ---

// Mengambil ulasan berdasarkan ID Produk
export const getProductReviews = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false }); // Urutkan dari yang terbaru
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
};

// Menambah Ulasan Baru
export const addProductReview = async (reviewData) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([reviewData])
      .select();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
};

// --- FUNGSI BARU UNTUK ADMIN ---

export const addProduct = async (productData) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};