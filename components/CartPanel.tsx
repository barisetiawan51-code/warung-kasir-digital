"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface Product {
  id: string;
  name: string;
  initials: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartPanelProps {
  cart: CartItem[];
  addToCart: (prod: Product) => void;
  removeFromCart: (productId: string) => void;
  deleteFromCart: (productId: string) => void;
  clearCart: () => void;
  grandTotal: number;
  cashPaid: string;
  setCashPaid: (val: string) => void;
  cashChange: number;
  totalItemsCount: number;
  executeCheckout: () => void;
  mobileTab: "products" | "cart";
}

export default function CartPanel({
  cart,
  addToCart,
  removeFromCart,
  deleteFromCart,
  clearCart,
  grandTotal,
  cashPaid,
  setCashPaid,
  cashChange,
  totalItemsCount,
  executeCheckout,
  mobileTab,
}: CartPanelProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Tombol terkunci jika keranjang kosong, input belum diisi, atau nominal uang kurang dari total tagihan
  const isCheckoutDisabled =
    cart.length === 0 ||
    !cashPaid ||
    parseFloat(cashPaid) < grandTotal;

  // Mencegah pengetikan simbol minus, plus, dan karakter eksponen 'e' sejak tombol ditekan
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E" || e.key === "." || e.key === ",") {
      e.preventDefault();
    }
  };

  return (
    <>
      <section className={`lg:col-span-4 flex flex-col gap-6 ${mobileTab === "products" ? "hidden lg:flex" : "flex"}`}>
      
      {/* CSS Global Lokal untuk menyembunyikan panah gulir atas-bawah input number */}
      <style jsx global>{`
        /* Chrome, Safari, Edge, Opera */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        /* Firefox */
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

      <div className="glass-card-obsidian p-5 border border-[#8B5CF6]/15 shadow-2xl flex flex-col gap-6 sticky top-28 bg-gradient-to-b from-[#130922]/90 to-[#090214]/95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#8B5CF6]/15 pb-4">
          <div>
            <h2 className="font-lexend font-extrabold text-lg text-white">
              Receipt Checkout
            </h2>
            <span className="text-[10px] font-black text-[#E614BE] tracking-wider uppercase">
              {totalItemsCount} BARANG DIPILIH
            </span>
          </div>
          <button
            onClick={clearCart}
            disabled={cart.length === 0}
            className="text-xs font-bold text-slate-400 hover:text-white disabled:opacity-50 transition"
          >
            Hapus Semua
          </button>
        </div>

        {/* Selected products list / empty placeholder */}
        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
          {cart.length === 0 ? (
            <div className="py-16 text-center flex flex-col gap-3.5 items-center justify-center">
              <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-[#E614BE] border border-[#8B5CF6]/15 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-xs font-bold text-[#94A3B8]">Keranjang belanja kosong</p>
            </div>
          ) : ( 
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-[#8B5CF6]/15 flex-wrap gap-2 hover:border-[#E614BE]/20 transition-all duration-200"
              >
                <div className="flex-1 min-w-[120px]">
                  <span className="font-lexend font-bold text-xs text-white block line-clamp-1">
                    {item.product.name}
                  </span>
                  <span className="text-[10px] text-[#94A3B8] block mt-0.5">
                    {formatPrice(item.product.price)} / {item.product.unit}
                  </span>
                </div>

                {/* Quantity adjustments */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="h-6 w-6 rounded bg-white/10 hover:bg-white/15 text-white flex items-center justify-center font-bold text-xs active:scale-95 transition"
                  >
                    -
                  </button>
                  <span className="font-lexend font-bold text-xs text-white w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => addToCart(item.product)}
                    className="h-6 w-6 rounded bg-white/10 hover:bg-white/15 text-white flex items-center justify-center font-bold text-xs active:scale-95 transition"
                  >
                    +
                  </button>
                  <button
                    onClick={() => deleteFromCart(item.product.id)}
                    className="ml-1 text-[#94A3B8] hover:text-[#E614BE] transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pricing calculations breakdown */}
        <div className="flex flex-col gap-2 border-t border-[#8B5CF6]/15 pt-4">
          
          <div className="flex justify-between items-end pb-3">
            <span className="text-xs font-black uppercase text-slate-500">Total Tagihan</span>
            <span className="font-lexend font-extrabold text-xl text-[#E614BE] tracking-tight">
              {cart.length === 0 ? "Rp 0" : formatPrice(grandTotal)}
            </span>
          </div>

          {/* Cash input received */}
          <div className="flex flex-col gap-1.5 mt-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">Uang Tunai Diterima</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-500">Rp</span>
              <input
                type="number"
                min="0"
                placeholder="Input uang bayar..."
                value={cashPaid}
                onKeyDown={handleKeyDown}
                onChange={(e) => setCashPaid(e.target.value)}
                className="glass-input-dark w-full pl-9 pr-4 py-2.5 text-sm font-lexend font-bold outline-none appearance-none"
              />
            </div>
            {cashPaid && parseFloat(cashPaid) < grandTotal && (
              <span className="text-[10px] font-bold text-red-400">Nominal kurang dari total tagihan!</span>
            )}
            {cashPaid && parseFloat(cashPaid) >= grandTotal && (
              <div className="flex justify-between items-center bg-[#E614BE]/10 border border-[#E614BE]/20 px-3 py-2 rounded-xl text-xs font-bold text-[#E614BE] mt-1">
                <span>Uang Kembalian:</span>
                <span className="font-lexend font-extrabold text-base text-white">{formatPrice(cashChange)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Check out button */}
        <button
          onClick={() => setIsConfirmOpen(true)}
          disabled={isCheckoutDisabled}
          className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#E614BE]/30 text-white font-lexend font-extrabold uppercase tracking-wider text-xs shadow-lg shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 active:scale-[0.98]"
        >
          Proses Transaksi Belanja
        </button>

      </div>
    </section>

    {/* Custom Confirmation Modal */}
    {mounted && isConfirmOpen && createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#090214]/80 backdrop-blur-sm animate-fade-in">
        <div 
          className="glass-card-obsidian w-full max-w-sm p-6 border border-[#E614BE]/30 flex flex-col gap-6 shadow-2xl relative bg-gradient-to-b from-[#130922]/95 to-[#090214]/98 animate-scale-up rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Warning Icon */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-14 w-14 rounded-full bg-[#E614BE]/10 border border-[#E614BE]/30 flex items-center justify-center text-[#E614BE] shadow-md shadow-[#E614BE]/10 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="font-lexend font-black text-lg text-white tracking-tight">
              Konfirmasi Pembayaran
            </h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Apakah data yang dimasukkan sudah benar? Lanjutkan proses transaksi belanja ini?
            </p>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setIsConfirmOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 font-bold text-xs text-slate-300 hover:bg-white/10 hover:text-white transition active:scale-95"
            >
              Cek Kembali
            </button>
            <button
              onClick={() => {
                setIsConfirmOpen(false);
                executeCheckout();
              }}
              className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#E614BE]/30 text-[#E614BE] font-lexend font-black text-xs uppercase tracking-wider shadow-md shadow-[#E614BE]/5 transition active:scale-95"
            >
              Proses Sekarang
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
