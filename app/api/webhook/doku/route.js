import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase (Harus menggunakan Service Role Key jika melewati RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Gunakan ANON KEY untuk saat ini karena RLS Anda dimatikan (sesuai testing sebelumnya)
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
  try {
    // 1. Ambil body JSON dari request DOKU
    const body = await req.json();
    const rawBody = JSON.stringify(body);

    // 2. Ambil Header penting dari DOKU untuk verifikasi keamanan
    const signature = req.headers.get('signature');
    const clientId = req.headers.get('client-id');
    const requestId = req.headers.get('request-id');
    const requestTimestamp = req.headers.get('request-timestamp');

    const secretKey = process.env.DOKU_SECRET_KEY;
    const path = '/api/webhook/doku'; // Sesuai dengan rute file ini

    // 3. Validasi: Pastikan Header Signature ada
    if (!signature || !clientId || !requestId || !requestTimestamp) {
      console.error("Webhook Error: Header tidak lengkap.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 4. VERIFIKASI KEAMANAN (Mencegah Hacker memalsukan pembayaran)
    // Membuat ulang signature dari data yang diterima
    const digestHash = crypto.createHash('sha256').update(rawBody).digest('base64');
    const componentSignature = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${path}\nDigest:${digestHash}`;
    const hmacSignature = crypto.createHmac('sha256', secretKey).update(componentSignature).digest('base64');
    const expectedSignature = `HMACSHA256=${hmacSignature}`;

    // Cocokkan signature dari DOKU dengan buatan kita
    if (signature !== expectedSignature) {
      console.error("Webhook Error: Signature tidak cocok (Kemungkinan percobaan peretasan).");
      return NextResponse.json({ error: "Invalid Signature" }, { status: 401 });
    }

    // 5. PROSES UPDATE DATABASE SUPABASE
    // DOKU akan mengirim data order di dalam objek: body.order
    if (body.order && body.order.invoice_number) {
      const invoiceNumber = body.order.invoice_number;
      
      // Ambil status dari DOKU (Biasanya 'SUCCESS' jika lunas)
      const dokuStatus = body.transaction?.status || body.order.status; 

      console.log(`\n🛎️ WEBHOOK DITERIMA! Invoice: ${invoiceNumber} | Status: ${dokuStatus}`);

      // Jika DOKU menyatakan SUCCESS (Lunas)
      if (dokuStatus === 'SUCCESS') {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'PAID' }) // Kita standarkan status di Supabase kita jadi 'PAID'
          .eq('invoice_number', invoiceNumber);

        if (error) {
          console.error("Supabase Error Update:", error);
          return NextResponse.json({ error: "Gagal update database" }, { status: 500 });
        }
        
        console.log(`✅ BERHASIL UPDATE INVOICE ${invoiceNumber} MENJADI PAID`);
      } else {
         // Jika Gagal atau Expired
         const { error } = await supabase
          .from('orders')
          .update({ status: 'FAILED' }) 
          .eq('invoice_number', invoiceNumber);

          if (!error) console.log(`❌ INVOICE ${invoiceNumber} DIBATALKAN / GAGAL`);
      }

      // 6. WAJIB BALAS STATUS 200 KE DOKU AGAR MEREKA TIDAK RETRY (Mengirim terus-menerus)
      return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });
      
    } else {
      return NextResponse.json({ error: "Format data tidak sesuai ekspektasi" }, { status: 400 });
    }

  } catch (error) {
    console.error("Webhook Catch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}