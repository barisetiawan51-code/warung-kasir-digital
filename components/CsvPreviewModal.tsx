"use client";

import { useMemo, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface TransactionItem {
  product_id?: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Transaction {
  id: string;
  timestamp: string;
  itemsCount: number;
  subtotal: number;
  total: number;
  cashPaid: number;
  change: number;
  status: "Lunas / Success" | "Pending" | "Batal";
  items?: TransactionItem[];
}

interface CsvPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  startDate: string;
  endDate: string;
  filterStatus: string;
}

export default function CsvPreviewModal({
  isOpen,
  onClose,
  transactions,
  startDate,
  endDate,
  filterStatus,
}: CsvPreviewModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Filter logic to exactly match what the CSV will export
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Filter status
      if (filterStatus !== "Semua Status") {
        if (filterStatus === "Lunas" && t.status !== "Lunas / Success") return false;
        if (filterStatus === "Pending" && t.status !== "Pending") return false;
      }
      
      // Filter date range
      if (startDate) {
        const trxDate = new Date(t.timestamp.replace(" WIB", "").replace(/\./g, ":"));
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (trxDate < start) return false;
      }
      if (endDate) {
        const trxDate = new Date(t.timestamp.replace(" WIB", "").replace(/\./g, ":"));
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (trxDate > end) return false;
      }
      return true;
    });
  }, [transactions, filterStatus, startDate, endDate]);

  if (!isOpen || !mounted) return null;

  const handleDownloadCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("Tidak ada data untuk diekspor!");
      return;
    }

    const headers = ["ID Transaksi", "Waktu", "Total Item", "Total Tagihan", "Status", "Rincian Item"];
    
    const rows = filteredTransactions.map(trx => {
      const itemsStr = trx.items
        ? trx.items.map(item => `${item.product_name} (${item.quantity}x)`).join("; ")
        : "-";
        
      return [
        trx.id,
        trx.timestamp,
        trx.itemsCount,
        trx.total,
        trx.status,
        `"${itemsStr}"` // Encapsulate string in quotes to handle commas
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Transaksi_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onClose(); // Automatically close modal after download
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#090214]/70 backdrop-blur-md p-4 sm:p-6 overflow-hidden animate-fade-in">
      {/* Header / Actions Bar */}
      <div className="w-full max-w-5xl mx-auto flex justify-between items-center mb-6 bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-xl shrink-0">
        <h2 className="text-white font-bold font-lexend flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Preview Data CSV
        </h2>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition"
          >
            Batal & Tutup
          </button>
          <button
            onClick={handleDownloadCSV}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold text-xs shadow-lg shadow-violet-500/20 active:scale-95 transition flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Unduh CSV
          </button>
        </div>
      </div>

      {/* Preview Container (Scrollable Table) */}
      <div className="flex-1 overflow-auto w-full custom-scrollbar flex justify-center pb-12">
        <div className="w-full max-w-5xl bg-[#130922]/90 border border-violet-500/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          <div className="overflow-auto custom-scrollbar flex-1">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-800/80 sticky top-0 z-10 backdrop-blur-md">
                <tr className="text-slate-400 uppercase tracking-wider font-black text-[10px]">
                  <th className="px-4 py-3 border-b border-white/5">ID Transaksi</th>
                  <th className="px-4 py-3 border-b border-white/5">Waktu</th>
                  <th className="px-4 py-3 border-b border-white/5 text-center">Total Item</th>
                  <th className="px-4 py-3 border-b border-white/5 text-right">Total Tagihan</th>
                  <th className="px-4 py-3 border-b border-white/5 text-center">Status</th>
                  <th className="px-4 py-3 border-b border-white/5 w-full">Rincian Item</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 font-medium">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 italic">
                      Tidak ada data yang tersedia untuk rentang ini.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((trx) => {
                    const itemsStr = trx.items
                      ? trx.items.map(item => `${item.product_name} (${item.quantity}x)`).join("; ")
                      : "-";
                    return (
                      <tr key={trx.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-mono text-white">{trx.id}</td>
                        <td className="px-4 py-3">{trx.timestamp}</td>
                        <td className="px-4 py-3 text-center">{trx.itemsCount}</td>
                        <td className="px-4 py-3 text-right text-violet-400 font-bold">{trx.total.toLocaleString("id-ID")}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                            trx.status === 'Lunas / Success' ? 'bg-emerald-500/20 text-emerald-400' :
                            trx.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {trx.status.split('/')[0].trim()}
                          </span>
                        </td>
                        <td className="px-4 py-3 truncate max-w-[300px]" title={itemsStr}>{itemsStr}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-900 p-3 text-center text-[10px] text-slate-500 font-semibold border-t border-white/5">
            Menampilkan {filteredTransactions.length} baris data yang akan diekspor.
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
