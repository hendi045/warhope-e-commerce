import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase'; // Sesuaikan path jika folder lib Anda ada di luar folder app

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Asumsi payload DOKU Jokul standar. Invoice Number biasanya dikirim oleh DOKU.
    const invoiceNumber = body?.order?.invoice_number;

    if (!invoiceNumber) {
      return NextResponse.json({ error: "Payload tidak valid atau Invoice Number tidak ditemukan." }, { status: 400 });
    }

    // 1. UPDATE STATUS PESANAN JADI 'PAID'
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .update({ status: 'PAID' })
      .eq('invoice_number', invoiceNumber)
      .select('*')
      .single();

    if (orderError || !orderData) {
      console.error("Pesanan tidak ditemukan:", orderError);
      return NextResponse.json({ error: "Gagal memperbarui status pesanan." }, { status: 500 });
    }

    // 2. LOGIKA CERDAS: PEMOTONGAN STOK FISIK OTOMATIS
    // Parsing daftar barang yang dibeli dari pesanan ini
    let items = [];
    try {
      items = typeof orderData.items === 'string' ? JSON.parse(orderData.items) : orderData.items;
    } catch (e) {
      console.error("Gagal parsing items pesanan:", e);
    }

    // Loop setiap barang untuk memotong stoknya di tabel Products
    for (const item of items) {
      // Ambil data produk terbaru dari database
      const { data: product } = await supabase
        .from('products')
        .select('sizes')
        .eq('id', item.id)
        .single();

      if (product && product.sizes) {
        let sizesMatrix = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;

        // Cek apakah ukuran yang dibeli (selectedSize) ada di database
        if (sizesMatrix[item.selectedSize]) {
          // Kurangi stok saat ini dengan jumlah yang dibeli (quantity)
          // Math.max(0, ...) memastikan stok tidak akan jadi minus (negatif)
          const currentStock = sizesMatrix[item.selectedSize].stock || 0;
          sizesMatrix[item.selectedSize].stock = Math.max(0, currentStock - item.quantity);

          // Simpan kembali matriks stok yang baru ke tabel Products
          await supabase
            .from('products')
            .update({ sizes: sizesMatrix })
            .eq('id', item.id);
        }
      }
    }

    return NextResponse.json({ message: "Webhook berhasil diproses & Stok telah diperbarui." }, { status: 200 });

  } catch (error) {
    console.error("Error Webhook:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}