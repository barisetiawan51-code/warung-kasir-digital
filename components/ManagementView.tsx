"use client";

import { useState, useMemo, useEffect } from "react";
import ProductModal from "./ProductModal";

interface Product {
  id: string;
  name: string;
  initials: string;
  category: string;
  image_url?: string;
  image_base64?: string;
  purchase_price?: number;
  price: number;
  stock: number;
  unit: string;
}

interface ManagementViewProps {
  products: Product[];
  onRefresh: () => void;
  scanEvent?: { barcode: string, ts: number } | null;
  triggerMockScan: () => void;
}

export default function ManagementView({ products, onRefresh, scanEvent, triggerMockScan }: ManagementViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prefilledBarcode, setPrefilledBarcode] = useState("");

  // Handle Scan Events
  useEffect(() => {
    if (scanEvent) {
      const existingProduct = products.find(p => p.id === scanEvent.barcode);
      if (existingProduct) {
        setEditingProduct(existingProduct);
        setIsModalOpen(true);
      } else {
        setEditingProduct(null);
        setPrefilledBarcode(scanEvent.barcode);
        setIsModalOpen(true);
      }
    }
  }, [scanEvent, products]);

  // Toast Notifications State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const categories = ["Semua", "Makanan", "Minuman", "Sembako", "Sayuran", "Minyak"];

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Semua" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Handle Save (Create or Update)
  const handleSaveProduct = async (productData: Partial<Product>): Promise<boolean> => {
    const isEditing = !!productData.id;
    const url = "/api/products";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menyimpan perubahan ke database.");
      }

      onRefresh();
      showToast(
        isEditing
          ? `Produk "${productData.name}" berhasil diperbarui!`
          : `Produk "${productData.name}" berhasil ditambahkan ke inventori!`
      );
      return true;
    } catch (err: any) {
      showToast(err.message || "Gagal menyimpan produk.", "error");
      return false;
    }
  };

  // Handle Delete
  const handleDeleteProduct = async (product: Product) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus produk "${product.name}" (${product.unit}) dari database?\n\nPERINGATAN: Tindakan ini bersifat permanen!`
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/products?id=${product.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghapus produk.");
      }

      onRefresh();
      showToast(`Produk "${product.name}" berhasil dihapus dari database.`);
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus produk.", "error");
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setPrefilledBarcode("");
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full p-4 md:p-6 lg:p-8 flex flex-col gap-6 animate-fade-in relative">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E614BE]/10 pb-6">
        <div>
          <h2 className="font-lexend font-black text-2xl text-white tracking-tight flex items-center gap-2">
            <span className="h-6 w-1.5 rounded-full bg-[#E614BE]" />
            Manajemen Data Inventori
          </h2>
          <p className="text-slate-400 text-xs font-semibold mt-1.5">
            Kelola database produk, sesuaikan persediaan stok, dan edit detail harga secara real-time.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 self-start md:self-auto">
          <button
            onClick={triggerMockScan}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#E614BE]/30 font-bold text-xs text-white transition active:scale-95 flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#E614BE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Scan Barcode
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#E614BE]/30 font-bold text-xs text-white transition active:scale-95 flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-violet-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Tambah Produk
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left Side: Custom Search Bar */}
        <div className="md:col-span-4 relative">
          <input
            type="text"
            placeholder="Cari produk berdasarkan nama atau ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#130922]/70 border border-[#E614BE]/15 text-xs text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#E614BE] focus:ring-1 focus:ring-[#E614BE]/20 transition-all font-semibold"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Right Side: Category Pills */}
        <div className="md:col-span-8 flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                selectedCategory === cat
                  ? "bg-[#E614BE]/10 border-[#E614BE]/40 text-[#E614BE] shadow-sm shadow-[#E614BE]/5"
                  : "bg-[#1E112F]/40 border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Database Inventory Table / Grid */}
      <div className="bg-[#130922]/50 border border-[#E614BE]/15 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        
        {/* Table View for Desktop/Tablet */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E614BE]/10 bg-black/30">
                <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-6">ID Produk</th>
                <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Foto</th>
                <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Nama Produk</th>
                <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Kategori</th>
                <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right text-[#E614BE]">Harga Pokok</th>
                <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Harga Jual</th>
                <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Stok</th>
                <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">Satuan</th>
                <th className="p-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center pr-6">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-16 text-center text-slate-500 font-bold text-xs">
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* ID */}
                    <td className="p-4 text-xs font-mono font-bold text-slate-400 pl-6 select-all">{product.id}</td>
                    
                    {/* Product Photo or Initials Badge */}
                    <td className="p-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#E614BE]/10 to-[#8B5CF6]/10 border border-[#E614BE]/20 flex items-center justify-center overflow-hidden text-[#E614BE] font-lexend font-extrabold text-xs">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&q=80";
                            }}
                          />
                        ) : (
                          <span>{product.initials}</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Name */}
                    <td className="p-4 text-xs font-black text-white group-hover:text-[#E614BE] transition-colors">
                      {product.name}
                    </td>
                    
                    {/* Category */}
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase bg-white/5 border border-white/5 text-slate-300">
                        {product.category}
                      </span>
                    </td>
                    
                    {/* Purchase Price */}
                    <td className="p-4 text-xs font-bold text-slate-400 text-right">
                      Rp {(product.purchase_price ?? 0).toLocaleString("id-ID")}
                    </td>

                    {/* Selling Price */}
                    <td className="p-4 text-xs font-bold text-[#E614BE] text-right">
                      Rp {product.price.toLocaleString("id-ID")}
                    </td>
                    
                    {/* Stock */}
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-black tracking-wide ${
                        product.stock === 0
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : product.stock <= 10
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    
                    {/* Unit */}
                    <td className="p-4 text-center text-xs font-semibold text-slate-400">{product.unit}</td>
                    
                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit Button (Blue) */}
                        <button
                          onClick={() => openEditModal(product)}
                          className="h-8 px-3 rounded-lg bg-[#E614BE]/10 hover:bg-[#E614BE] text-[#E614BE] hover:text-slate-950 border border-[#E614BE]/20 text-[10px] font-bold transition flex items-center gap-1 active:scale-95"
                          title="Ubah Produk"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Edit
                        </button>
                        
                        {/* Delete Button (Hot Pink) */}
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="h-8 px-3 rounded-lg bg-pink-500/10 hover:bg-pink-500 text-pink-500 hover:text-white border border-pink-500/20 text-[10px] font-bold transition flex items-center gap-1 active:scale-95"
                          title="Hapus Produk"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Stack Grid Layout for Mobile (Hidden on desktop) */}
        <div className="block md:hidden p-4 space-y-4 divide-y divide-white/5">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-bold text-xs">
              Tidak ada produk ditemukan.
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="pt-4 first:pt-0 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#E614BE]/10 to-[#8B5CF6]/10 border border-[#E614BE]/20 flex items-center justify-center overflow-hidden text-[#E614BE] font-lexend font-black text-xs">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&q=80";
                          }}
                        />
                      ) : (
                        <span>{product.initials}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">{product.name}</h4>
                      <span className="text-[9px] font-mono text-slate-500 font-bold">{product.id}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-white/5 border border-white/5 text-slate-300">
                    {product.category}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 bg-black/25 p-3 rounded-xl border border-white/5 text-center">
                  <div>
                    <span className="block text-[8px] text-slate-500 uppercase font-black leading-none">H. Pokok</span>
                    <span className="text-[10px] font-bold text-slate-400 mt-1 block">Rp {(product.purchase_price ?? 0).toLocaleString("id-ID")}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-500 uppercase font-black leading-none">H. Jual</span>
                    <span className="text-[10px] font-bold text-[#E614BE] mt-1 block">Rp {product.price.toLocaleString("id-ID")}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-500 uppercase font-black leading-none">Stok</span>
                    <span className={`text-[10px] font-black mt-1 block ${product.stock === 0 ? "text-red-400" : "text-white"}`}>{product.stock}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-500 uppercase font-black leading-none">Satuan</span>
                    <span className="text-[10px] font-semibold text-slate-400 mt-1 block">{product.unit}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className="flex-1 py-2.5 rounded-xl bg-[#E614BE]/10 hover:bg-[#E614BE] text-[#E614BE] hover:text-slate-950 border border-[#E614BE]/20 text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product)}
                    className="flex-1 py-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500 text-pink-500 hover:text-white border border-pink-500/20 text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Floating Glassmorphic Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#130922]/95 to-[#090214]/98 border border-[#E614BE]/20 text-white text-xs font-bold shadow-2xl shadow-[#E614BE]/10 animate-slide-up">
          {toast.type === "success" ? (
            <div className="h-5 w-5 rounded-full bg-[#E614BE]/20 border border-[#E614BE]/40 flex items-center justify-center text-[#E614BE]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          ) : (
            <div className="h-5 w-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
        prefilledBarcode={prefilledBarcode}
      />

    </div>
  );
}
