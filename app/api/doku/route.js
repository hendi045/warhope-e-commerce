import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Menangkap data yang dikirim dari halaman Checkout
    const body = await request.json();
    const { formData, items, total } = body;

    // Di sinilah nantinya Anda menaruh skrip asli (cURL / Fetch) dari Doku API
    // yang menggunakan Client-Id dan Secret-Key Doku Anda.
    // Dokumentasi asli Doku: https://jokul.doku.com/docs/

    // --- MOCKUP / SIMULASI RESPONS DOKU ---
    // Karena kita belum memasukkan kunci asli, kita simulasikan respons sukses
    const orderId = `WRHP-${Date.now()}`;
    const mockDokuResponse = {
      status: "success",
      message: "Payment URL generated successfully",
      // Ini adalah contoh URL halaman pembayaran (QRIS/VA) yang akan dikembalikan Doku
      payment_url: "https://jokul.doku.com/checkout/link/123456789", 
      order_id: orderId
    };

    // Simulasi delay jaringan 1.5 detik
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return NextResponse.json(mockDokuResponse, { status: 200 });

  } catch (error) {
    console.error("Error processing Doku payment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}