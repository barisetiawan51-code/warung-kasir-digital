"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

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

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product> & { image_base64?: string }) => Promise<boolean>;
  editingProduct: Product | null;
  prefilledBarcode?: string;
}

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  editingProduct,
  prefilledBarcode,
}: ProductModalProps) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Makanan");
  const [unit, setUnit] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync with editing product when opening
  useEffect(() => {
    if (editingProduct) {
      setId(editingProduct.id);
      setName(editingProduct.name);
      setCategory(editingProduct.category);
      setUnit(editingProduct.unit);
      setImageUrl(editingProduct.image_url || "");
      setImageBase64("");
      setSelectedFileName(editingProduct.image_url ? "Gunakan foto saat ini" : "");
      setPurchasePrice((editingProduct.purchase_price ?? 0).toString());
      setPrice(editingProduct.price.toString());
      setStock(editingProduct.stock.toString());
    } else {
      setId(prefilledBarcode || "");
      setName("");
      setCategory("Makanan");
      setUnit("");
      setImageUrl("");
      setImageBase64("");
      setSelectedFileName("");
      setPurchasePrice("");
      setPrice("");
      setStock("");
    }
    setValidationError(null);
  }, [editingProduct, isOpen, prefilledBarcode]);

  if (!isOpen || !mounted) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageBase64(base64String);
        setImageUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setImageUrl("");
    setImageBase64("");
    setSelectedFileName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const priceNum = parseFloat(price);
    const purchasePriceNum = parseFloat(purchasePrice) || 0;
    const stockNum = parseInt(stock, 10);

    if (!name.trim()) {
      setValidationError("Nama produk tidak boleh kosong.");
      return;
    }
    if (!unit.trim()) {
      setValidationError("Satuan produk tidak boleh kosong (misal: 1KG, PCS).");
      return;
    }
    if (isNaN(purchasePriceNum) || purchasePriceNum < 0) {
      setValidationError("Harga pokok beli harus bernilai 0 atau lebih.");
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      setValidationError("Harga jual produk harus bernilai 0 atau lebih.");
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      setValidationError("Stok produk harus bernilai 0 atau lebih.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Product> & { image_base64?: string } = {
        id: id.trim() || undefined,
        name: name.trim(),
        category,
        image_url: imageUrl.trim() || undefined,
        image_base64: imageBase64 || undefined,
        purchase_price: purchasePriceNum,
        unit: unit.trim().toUpperCase(),
        price: priceNum,
        stock: stockNum,
      };

      if (editingProduct) {
        payload.id = editingProduct.id;
      }

      const success = await onSave(payload);
      if (success) {
        onClose();
      } else {
        setValidationError("Gagal menyimpan data ke database. Silakan coba lagi.");
      }
    } catch (err: any) {
      setValidationError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Dark frosted glass backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#130922]/95 to-[#090214]/98 border border-[#E614BE]/20 rounded-2xl shadow-2xl shadow-[#E614BE]/5 p-6 md:p-8 z-10 animate-fade-in text-white overflow-hidden">
        {/* Soft glowing background element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#E614BE]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
          <h3 className="font-lexend font-extrabold text-lg text-[#E614BE] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {editingProduct ? "Edit Detail Produk" : "Tambah Produk Baru"}
          </h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Validation Errors Alert */}
        {validationError && (
          <div className="mb-5 p-3 rounded-lg bg-red-950/40 border border-red-500/25 text-red-200 text-xs font-semibold animate-pulse">
            {validationError}
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Barcode / ID Produk {editingProduct ? "" : "(Opsional)"}
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder={editingProduct ? "" : "Biarkan kosong untuk ID otomatis..."}
              className={`w-full bg-[#1A102A]/85 border border-[#E614BE]/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#E614BE] focus:ring-1 focus:ring-[#E614BE]/20 transition-all font-semibold ${editingProduct ? 'opacity-50 cursor-not-allowed' : ''}`}
              readOnly={!!editingProduct}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Nama Produk
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kopi Bubuk Asli"
              className="w-full bg-[#1A102A]/85 border border-[#E614BE]/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#E614BE] focus:ring-1 focus:ring-[#E614BE]/20 transition-all font-semibold"
              required
            />
          </div>

          {/* Upload Foto Produk & Live Preview */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Upload Foto Produk
              </label>
              <div className="relative flex items-center justify-between bg-[#1A102A]/85 border border-[#E614BE]/20 rounded-xl px-4 py-2.5 text-xs text-white min-h-[38px]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <span className="text-slate-400 truncate max-w-[220px] font-semibold">
                  {selectedFileName || "Pilih file foto..."}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#E614BE]/10 text-[#E614BE] border border-[#E614BE]/30 font-bold hover:bg-[#E614BE]/20 transition select-none text-[10px] whitespace-nowrap">
                  Cari File
                </span>
              </div>
            </div>
            
            {/* Live Preview Box */}
            <div className="h-10.5 w-10.5 min-w-[42px] rounded-xl bg-[#1A102A]/85 border border-[#E614BE]/20 flex items-center justify-center overflow-hidden relative group">
              {imageUrl.trim() ? (
                <>
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&q=80"; // fallback
                    }}
                  />
                  {/* Remove Photo Overlay */}
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute inset-0 bg-red-950/80 flex items-center justify-center text-red-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[8px] font-black uppercase tracking-wider"
                  >
                    Hapus
                  </button>
                </>
              ) : (
                <span className="text-[9px] text-slate-500 font-bold select-none uppercase tracking-wider">No Pic</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#1A102A]/85 border border-[#E614BE]/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#E614BE] focus:ring-1 focus:ring-[#E614BE]/20 transition-all font-semibold"
              >
                <option value="Makanan">Makanan</option>
                <option value="Minuman">Minuman</option>
                <option value="Sembako">Sembako</option>
                <option value="Sayuran">Sayuran</option>
                <option value="Minyak">Minyak</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Satuan
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Contoh: PCS, 1KG, 500ML"
                className="w-full bg-[#1A102A]/85 border border-[#E614BE]/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#E614BE] focus:ring-1 focus:ring-[#E614BE]/20 transition-all font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Harga Beli Pokok (Rp)
              </label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="Contoh: 10000"
                className="w-full bg-[#1A102A]/85 border border-[#E614BE]/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#E614BE] focus:ring-1 focus:ring-[#E614BE]/20 transition-all font-semibold"
                min="0"
                step="any"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Harga Jual (Rp)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Contoh: 15000"
                className="w-full bg-[#1A102A]/85 border border-[#E614BE]/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#E614BE] focus:ring-1 focus:ring-[#E614BE]/20 transition-all font-semibold"
                min="0"
                step="any"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Stok Awal
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Contoh: 25"
              className="w-full bg-[#1A102A]/85 border border-[#E614BE]/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#E614BE] focus:ring-1 focus:ring-[#E614BE]/20 transition-all font-semibold"
              min="0"
              required
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 font-bold text-xs hover:bg-white/5 active:scale-95 transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#E614BE] text-slate-950 font-bold text-xs shadow-md shadow-[#E614BE]/15 hover:brightness-105 active:scale-95 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3 w-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Produk</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
