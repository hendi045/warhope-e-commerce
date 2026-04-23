import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ToastProvider from "../components/ToastProvider"; // IMPORT TOAST PROVIDER

// Menggunakan Inter sesuai konsep PDF
const inter = Inter({ subsets: ["latin"] });

// ============================================================================
// KONFIGURASI SEO & METADATA (OPEN GRAPH) TINGKAT LANJUT
// ============================================================================
export const metadata: Metadata = {
  metadataBase: new URL('https://warhope-ecom.vercel.app'), // Ganti dengan domain asli Anda jika sudah ada
  title: {
    default: "Warhope Apparel | Premium Heavyweight Streetwear",
    template: "%s | Warhope Apparel", // Otomatis menambahkan nama toko di belakang judul halaman lain
  },
  description:
    "Eksplorasi gaya urban sejati dengan Warhope Apparel. Temukan koleksi heavyweight streetwear premium: Boxy T-Shirt, Hoodie, dan Celana dengan kualitas material terbaik di Indonesia.",
  keywords: [
    "Warhope", "Warhope Apparel", "Streetwear Indonesia", "Heavyweight T-Shirt", 
    "Boxy Fit", "Hoodie Premium", "Fashion Pria", "Baju Oversize"
  ],
  authors: [{ name: "Warhope Team" }],
  creator: "Warhope Apparel",
  publisher: "Warhope Apparel",
  
  // Konfigurasi Open Graph (Untuk WhatsApp, Facebook, Instagram, LinkedIn)
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://warhope-ecom.vercel.app", // Ganti dengan domain asli Anda
    siteName: "Warhope Apparel",
    title: "Warhope Apparel | Premium Heavyweight Streetwear",
    description: "Koleksi streetwear premium dengan kualitas material terbaik. Tampil beda dengan gaya urban sejati bersama Warhope.",
    images: [
      {
        // PERBAIKAN: Menggunakan URL Absolut yang BENAR agar WhatsApp tidak kebingungan
        url: "https://warhope-ecom.vercel.app/assets/warhope-og-banner.png", 
        width: 1200,
        height: 630,
        alt: "Warhope Apparel Official Banner",
      },
    ],
  },
  
  // Konfigurasi Twitter / X
  twitter: {
    card: "summary_large_image",
    title: "Warhope Apparel | Premium Streetwear",
    description: "Koleksi streetwear premium dengan kualitas material terbaik. Wujudkan gaya urban Anda!",
    // PERBAIKAN: Menggunakan URL Absolut yang BENAR
    images: ["https://warhope-ecom.vercel.app/assets/warhope-og-banner.png"], 
  },
  
  // Konfigurasi Robot Crawler Google
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // PERBAIKAN: Menambahkan data-scroll-behavior="smooth" untuk meredakan warning Next.js
    <html lang="id" suppressHydrationWarning className="scroll-smooth" data-scroll-behavior="smooth"> 
      <body 
        suppressHydrationWarning 
        // Ditambahkan bg-background dan text-foreground agar tema (Light/Dark) dari globals.css merata ke seluruh aplikasi
        className={`${inter.className} bg-background text-foreground antialiased selection:bg-blue-600 selection:text-white`}
      >
        <Navbar /> 
        
        {/* Main wrapper agar konten tidak tertutup navbar (padding top 20 / 5rem) */}
        <main className="pt-20 min-h-screen">
          {children}
        </main>

        <Footer />

        {/* Letakkan ToastProvider di paling bawah body agar bisa menimpa (z-index) elemen lain */}
        <ToastProvider />
      </body>
    </html>
  );
}