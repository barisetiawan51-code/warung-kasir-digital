"use client";

import { useMemo } from "react";

interface Product {
  id: string;
  name: string;
  initials: string;
  category: string;
  image_url?: string;
  price: number;
  stock: number;
  unit: string;
}

interface POSViewProps {
  products: Product[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  addToCart: (prod: Product) => void;
  triggerMockScan: () => void;
  mobileTab: "products" | "cart";
}

export default function POSView({
  products,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  addToCart,
  triggerMockScan,
  mobileTab,
}: POSViewProps) {
  const categories = ["Semua", "Makanan", "Minuman", "Sembako", "Sayuran", "Minyak"];

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesCategory = activeCategory === "Semua" || prod.category === activeCategory;
      const matchesSearch =
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <section className={`lg:col-span-8 flex flex-col gap-6 ${mobileTab === "cart" ? "hidden lg:flex" : "flex"}`}>
      
      {/* 1. Top Search & Barcode Bar */}
      <div className="glass-card-obsidian p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search Input Box */}
        <div className="relative flex-1 w-full">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cari produk kasir atau scan barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input-dark w-full pl-11 pr-12 py-3.5 text-xs focus:outline-none focus:border-[#E614BE]"
          />
        </div>

        {/* QR Scanner & Simulation button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button 
            onClick={triggerMockScan}
            title="Scan QR"
            className="h-11 w-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#E614BE] hover:bg-white/10 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </button>
        </div>

      </div>

      {/* 2. Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                isActive
                  ? "bg-[#E614BE]/10 border-[#E614BE]/40 text-[#E614BE] shadow-sm shadow-[#E614BE]/5"
                  : "bg-[#1E112F]/40 border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 3. Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="glass-card-obsidian py-20 px-4 text-center border-fuchsia-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="font-lexend font-extrabold text-xl text-white">Barang Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500 mt-2">Tidak ada barang yang cocok dengan pencarian atau filter Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((prod) => {
            const isOutOfStock = prod.stock === 0;
            return (
              <article
                key={prod.id}
                onClick={() => !isOutOfStock && addToCart(prod)}
                className={`glass-card-obsidian overflow-hidden flex flex-col border shadow-md relative cursor-pointer group ${
                  isOutOfStock ? "opacity-60 cursor-not-allowed select-none" : "hover:border-[#E614BE]/40"
                }`}
              >
                
                {/* Product Cover Photo or Initials */}
                <div className="h-32 w-full bg-slate-950/40 relative overflow-hidden flex items-center justify-center border-b border-[#8B5CF6]/10">
                  {prod.image_url ? (
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="h-full w-full object-cover transform transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&q=80";
                      }}
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-pink-500/20 to-[#8B5CF6]/20 flex items-center justify-center">
                      <span className="font-lexend font-black text-3xl text-white/40 tracking-widest uppercase select-none">
                        {prod.initials}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Card Details */}
                <div className="p-4 flex flex-col flex-1 gap-1.5 mt-0 bg-gradient-to-b from-transparent to-slate-950/40">
                  <div className="flex flex-col gap-0.5">
                    {/* Category - Unit label in lavender */}
                    <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase">
                      {prod.category} - {prod.unit}
                    </span>
                    {/* Main Title in bold crisp white & Stock badge next to it */}
                    <div className="flex items-center justify-between gap-2 h-5">
                      <h3 className="font-lexend font-extrabold text-sm text-white leading-tight line-clamp-1 group-hover:text-[#E614BE] transition-colors">
                        {prod.name}
                      </h3>
                      <span className="shrink-0 px-1.5 py-0.5 rounded bg-purple-950/40 text-purple-400 border border-purple-500/20 text-[8px] font-bold uppercase tracking-wider leading-none">
                        Stok: {prod.stock}
                      </span>
                    </div>
                  </div>

                  {/* Pricing and Add button */}
                  <div className="flex items-center justify-between border-t border-[#8B5CF6]/15 pt-3 mt-auto">
                    <span className="font-lexend font-black text-sm text-[#E614BE] tracking-tight">
                      {formatPrice(prod.price)}
                    </span>

                    <button
                      disabled={isOutOfStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(prod);
                      }}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md ${
                        isOutOfStock 
                          ? "bg-white/5 text-slate-600 cursor-not-allowed border border-white/5" 
                          : "bg-gradient-to-r from-[#E614BE] to-[#8B5CF6] text-white hover:opacity-90 font-bold"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

              </article>
            );
          })}
        </div>
      )}

    </section>
  );
}
