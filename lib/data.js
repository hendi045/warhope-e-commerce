// Mock Database untuk Warhope E-Commerce
// Tema: Modern Casual Apparel / Streetwear

export const products = [
  {
    id: "p-001",
    name: "Wabi-Sabi Oversized Heavyweight Tee",
    category: "T-Shirts",
    price: 249000,
    description: "Kaos oversized berbahan katun heavyweight 230gsm. Potongan asimetris di bagian bawah yang merepresentasikan ketidaksempurnaan wabi-sabi.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
    colors: ["Dark Charcoal", "Slate White", "Earth Brown"],
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "p-002",
    name: "Urban Kaze Zip-Up Hoodie",
    category: "Hoodies",
    price: 459000,
    description: "Hoodie berdesain minimalis dengan resleting YKK premium. Sangat cocok untuk layering gaya streetwear Tokyo.",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",
    sizes: ["M", "L", "XL", "XXL"]
  },
  {
    id: "p-003",
    name: "Kyoto Tapered Cargo Pants",
    category: "Pants",
    price: 389000,
    description: "Celana kargo dengan potongan meruncing (tapered) di bagian bawah. Dilengkapi kantong utilitas tersembunyi yang elegan.",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800",
    sizes: ["28", "30", "32", "34", "36"]
  },
  {
    id: "p-004",
    name: "Aki Essential Beanie",
    category: "Accessories",
    price: 129000,
    description: "Beanie rajut tebal untuk melengkapi outfit kasual harian Anda. Lembut dan tidak gatal di kepala.",
    image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&q=80&w=800",
    sizes: ["All Size"]
  }
];

// Helper function untuk mengambil produk berdasarkan ID (untuk halaman PDP)
export const getProductById = (id) => {
  return products.find(product => product.id === id);
};