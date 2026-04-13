import { supabase } from './supabase';

// Mengambil semua produk (Untuk Homepage)
export const getAllProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true }); // Mengurutkan berdasarkan ID
    
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