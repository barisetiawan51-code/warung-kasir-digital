"use client";

import { useEffect, useState } from "react";
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

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  cart: CartItem[];
  grandTotal: number;
  cashPaid: string;
  cashChange: number;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  transactionId,
  cart,
  grandTotal,
  cashPaid,
  cashChange,
}: CheckoutModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const printReceipt = () => {
    window.print();
  };

  const downloadReceipt = () => {
    let receiptText = "========================================\n";
    receiptText += "          WARUNG KASIR DIGITAL          \n";
    receiptText += "CENDANA - KUTASARI - PURBALINGGA - JAWA TENGAH\n";
    receiptText += "========================================\n";
    receiptText += `TRX ID : ${transactionId}\n`;
    receiptText += "========================================\n\n";

    cart.forEach(item => {
      receiptText += `${item.product.name}\n`;
      receiptText += `${item.quantity} x ${formatPrice(item.product.price)} = ${formatPrice(item.product.price * item.quantity)}\n`;
    });

    receiptText += "\n========================================\n";
    receiptText += `TOTAL TAGIHAN  : ${formatPrice(grandTotal)}\n`;
    receiptText += `Tunai Diterima : ${formatPrice(parseFloat(cashPaid || "0"))}\n`;
    receiptText += `Kembalian      : ${formatPrice(cashChange)}\n`;
    receiptText += "========================================\n";
    receiptText += "     Terima kasih telah berbelanja!     \n";
    receiptText += "   Simpan bukti transaksi digital ini.  \n";

    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Struk_${transactionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#090214]/80 backdrop-blur-md animate-fade-in">
      <div 
        className="glass-card-obsidian w-full max-w-md p-6 border border-[#E614BE]/30 flex flex-col gap-6 shadow-2xl relative bg-gradient-to-b from-[#130922]/95 to-[#090214]/98 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Pulsing check icon */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="h-14 w-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 shadow-md shadow-green-500/10 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-lexend font-black text-xl text-white tracking-tight">
            Pembayaran Berhasil!
          </h2>
          <p className="text-[10px] text-[#94A3B8] font-bold font-mono tracking-widest uppercase">
            TRX ID: {transactionId}
          </p>
        </div>

        {/* High Fidelity Thermal Printable Receipt */}
        <div className="bg-[#1E112F]/45 border border-[#8B5CF6]/15 rounded-xl p-4 flex flex-col gap-3 text-xs font-mono text-slate-300">
          
          {/* Header Store info */}
          <div className="text-center border-b border-dashed border-[#8B5CF6]/30 pb-3">
            <span className="font-lexend font-extrabold text-sm text-white tracking-tight">WARUNG KASIR DIGITAL</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">CENDANA - KUTASARI - PURBALINGGA - JAWA TENGAH</span>
          </div>

          {/* Items breakdown list */}
          <div className="flex flex-col gap-2 py-1 max-h-[160px] overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.product.id} className="flex justify-between items-start">
                <div className="max-w-[70%]">
                  <span className="text-white block font-bold text-[11px]">{item.product.name}</span>
                  <span className="text-[10px] text-slate-400 block">{item.quantity} x {formatPrice(item.product.price)}</span>
                </div>
                <span className="text-white font-bold">{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Final price Calculations */}
          <div className="border-t border-dashed border-[#8B5CF6]/30 pt-3 flex flex-col gap-1.5 text-[11px]">
            <div className="flex justify-between text-white font-extrabold text-xs pt-1.5 border-t border-slate-700">
              <span>TOTAL TAGIHAN</span>
              <span className="text-[#E614BE]">{formatPrice(grandTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400 mt-1">
              <span>Tunai Diterima</span>
              <span>{formatPrice(parseFloat(cashPaid || "0"))}</span>
            </div>
            <div className="flex justify-between text-white font-bold">
              <span>Kembalian</span>
              <span>{formatPrice(cashChange)}</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-[9px] text-slate-500 border-t border-dashed border-[#8B5CF6]/30 pt-3 mt-1">
            <span>Terima kasih telah berbelanja!</span>
            <span className="block mt-0.5">Simpan bukti transaksi digital ini.</span>
          </div>

        </div>

        {/* Modal controls actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={printReceipt}
            className="py-3 rounded-xl border border-[#8B5CF6]/30 bg-transparent font-bold text-xs text-white hover:bg-[#8B5CF6]/15 transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak Struk
          </button>
          
          <button
            onClick={downloadReceipt}
            className="py-3 rounded-xl border border-[#8B5CF6]/30 bg-transparent font-bold text-xs text-white hover:bg-[#8B5CF6]/15 transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Unduh Struk
          </button>

          <button
            onClick={onClose}
            className="col-span-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#E614BE]/30 text-[#E614BE] font-lexend font-black text-xs uppercase tracking-wider shadow-md shadow-white/5 transition active:scale-95"
          >
            Tutup Dialog
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
