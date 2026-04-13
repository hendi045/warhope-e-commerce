import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Menggunakan Inter sesuai konsep PDF
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Warhope | E-Commerce",
  description: "Modern Casual Apparel & Streetwear",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning> 
      <body 
        suppressHydrationWarning 
        // Hapus bg-[#f5f6f7] hardcode di sini agar globals.css bisa bekerja
        // Tambahkan antialiased agar font lebih tajam
        className={`${inter.className} antialiased selection:bg-blue-600 selection:text-white`}
      >
        <Navbar /> 
        
        {/* Main wrapper agar konten tidak tertutup navbar (padding top 20 / 5rem) */}
        <main className="pt-20 min-h-screen">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}