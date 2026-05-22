"use client";

import { useMemo, useState, useEffect } from "react";

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

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Kasir";
}

interface PrintReportProps {
  transactions: Transaction[];
  startDate: string;
  endDate: string;
  filterPeriod: string;
  filterStatus: string;
  currentUser: CurrentUser | null;
}

export default function PrintReport({
  transactions,
  startDate,
  endDate,
  filterPeriod,
  filterStatus,
  currentUser,
}: PrintReportProps) {
  const [printTime, setPrintTime] = useState("");

  // Setup current print time on mount to avoid hydration mismatch
  useEffect(() => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const now = new Date();
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const formatted = `${dayName}, ${date} ${monthName} ${year} pukul ${hours}.${minutes} WIB`;
    
    const timer = setTimeout(() => {
      setPrintTime(formatted);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Utility Date Formatter
  const parseDateString = (str: string) => {
    if (!str) return new Date();
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const formatDisplayDate = (str: string) => {
    if (!str) return "-";
    const date = parseDateString(str);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // 1. Filter Transactions matching ReportsView logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Filter status
      if (filterStatus !== "Semua Status") {
        if (filterStatus === "Lunas" && t.status !== "Lunas / Success") return false;
        if (filterStatus === "Pending" && t.status !== "Pending") return false;
      }
      
      // Filter date range if set
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

  // 2. Calculate Summary Metrics
  const summary = useMemo(() => {
    const totalRev = filteredTransactions.reduce((acc, t) => acc + t.total, 0);
    const count = filteredTransactions.length;
    const totalItems = filteredTransactions.reduce((acc, t) => acc + t.itemsCount, 0);
    const avgValue = count > 0 ? totalRev / count : 0;
    
    return {
      revenue: totalRev,
      count,
      itemsCount: totalItems,
      avgValue,
    };
  }, [filteredTransactions]);

  // 3. Aggregate Sales Breakdown by Product
  const productSales = useMemo(() => {
    const map: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
    
    filteredTransactions.forEach((t) => {
      if (t.items) {
        t.items.forEach((item) => {
          if (!map[item.product_name]) {
            map[item.product_name] = {
              name: item.product_name,
              quantity: 0,
              revenue: 0,
            };
          }
          map[item.product_name].quantity += item.quantity;
          map[item.product_name].revenue += item.quantity * item.price;
        });
      }
    });

    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filteredTransactions]);

  return (
    <div className="print-page bg-white text-slate-900 font-sans p-6 md:p-8 w-full max-w-[210mm] mx-auto min-h-screen">
      
      {/* Brand Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
        <div>
          <h1 className="font-lexend font-black text-2xl text-slate-900 tracking-tight">
            WARUNG KASIR DIGITAL
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Warung Ghans, Jl. Cendana Purbalingga | Telp: (021) 555-0199
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Sistem Kasir & Laporan Keuangan Digital
          </p>
        </div>
        <div className="text-right text-xs text-slate-600 font-semibold">
          <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px] bg-slate-100 px-2.5 py-1 rounded">
            Dokumen Rekapitulasi Audit
          </div>
          <div className="mt-2 text-slate-500 text-[10px]">
            Waktu Cetak: <span className="text-slate-800 font-bold">{printTime || "-"}</span>
          </div>
        </div>
      </div>

      {/* Title & Metadata Block */}
      <div className="text-center my-6">
        <h2 className="font-lexend font-extrabold text-lg text-slate-900 tracking-wide uppercase">
          Laporan Ringkasan Penjualan & Keuangan
        </h2>
        <div className="mt-3 flex justify-center gap-4 text-xs font-semibold text-slate-600">
          <div className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
            Periode: <strong className="text-slate-800">{filterPeriod} ({formatDisplayDate(startDate)} s/d {formatDisplayDate(endDate)})</strong>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
            Status Pembayaran: <strong className="text-slate-800">{filterStatus}</strong>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50 flex flex-col justify-between">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Total Pendapatan</span>
          <span className="font-lexend font-black text-sm text-slate-900 mt-1">{formatPrice(summary.revenue)}</span>
        </div>
        <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50 flex flex-col justify-between">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Volume Transaksi</span>
          <span className="font-lexend font-black text-sm text-slate-900 mt-1">{summary.count} Nota</span>
        </div>
        <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50 flex flex-col justify-between">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Kuantitas Terjual</span>
          <span className="font-lexend font-black text-sm text-slate-900 mt-1">{summary.itemsCount} Pcs</span>
        </div>
        <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50 flex flex-col justify-between">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Rerata per Transaksi</span>
          <span className="font-lexend font-black text-sm text-slate-900 mt-1">{formatPrice(summary.avgValue)}</span>
        </div>
      </div>

      {/* Section: Product Sales Summary */}
      <div className="mb-8 print-avoid-break">
        <div className="bg-slate-800 text-white px-4 py-1.5 rounded-t-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2">
          <span>Tabel A: Ringkasan Kinerja Produk Terlaris</span>
        </div>
        <table className="w-full text-xs text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase text-[9px] font-black tracking-wider">
              <th className="px-4 py-2 border-r border-slate-200 text-center w-[40px]">No.</th>
              <th className="px-4 py-2 border-r border-slate-200">Nama Produk</th>
              <th className="px-4 py-2 border-r border-slate-200 text-center w-[120px]">Qty Terjual</th>
              <th className="px-4 py-2 border-r border-slate-200 text-right w-[150px]">Total Pendapatan</th>
              <th className="px-4 py-2 text-center w-[120px]">Kontribusi (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {productSales.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-bold italic">
                  Tidak ada data penjualan produk pada rentang filter ini.
                </td>
              </tr>
            ) : (
              productSales.map((prod, idx) => {
                const contribution = summary.revenue > 0 ? (prod.revenue / summary.revenue) * 100 : 0;
                return (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2 border-r border-slate-200 text-center text-slate-500 font-semibold">{idx + 1}</td>
                    <td className="px-4 py-2 border-r border-slate-200 font-bold text-slate-800">{prod.name}</td>
                    <td className="px-4 py-2 border-r border-slate-200 text-center font-extrabold text-slate-700">{prod.quantity} Pcs</td>
                    <td className="px-4 py-2 border-r border-slate-200 text-right font-bold text-slate-950">{formatPrice(prod.revenue)}</td>
                    <td className="px-4 py-2 text-center font-bold text-slate-600">{contribution.toFixed(1)}%</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Section: Detailed Transaction Logs */}
      <div className="mb-8 print-avoid-break">
        <div className="bg-slate-800 text-white px-4 py-1.5 rounded-t-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2">
          <span>Tabel B: Rincian Log Transaksi Penjualan</span>
        </div>
        <table className="w-full text-[10px] text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase text-[9px] font-black tracking-wider">
              <th className="px-4 py-2 border-r border-slate-200 text-center w-[40px]">No.</th>
              <th className="px-4 py-2 border-r border-slate-200 w-[120px]">Waktu / Tanggal</th>
              <th className="px-4 py-2 border-r border-slate-200 w-[150px]">ID Transaksi</th>
              <th className="px-4 py-2 border-r border-slate-200">Daftar Item Rincian</th>
              <th className="px-4 py-2 border-r border-slate-200 text-center w-[60px]">Qty</th>
              <th className="px-4 py-2 text-right w-[120px]">Total Tagihan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-bold italic">
                  Tidak ada transaksi yang tercatat pada rentang filter ini.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((trx, idx) => {
                const itemsStr = trx.items
                  ? trx.items.map((item) => `${item.product_name} (${item.quantity}x)`).join(", ")
                  : "-";
                
                return (
                  <tr key={trx.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 border-r border-slate-200 text-center text-slate-500 font-semibold">{idx + 1}</td>
                    <td className="px-4 py-2.5 border-r border-slate-200 text-slate-600 font-medium">{trx.timestamp}</td>
                    <td className="px-4 py-2.5 border-r border-slate-200 font-mono font-bold text-slate-900">{trx.id}</td>
                    <td className="px-4 py-2.5 border-r border-slate-200 text-slate-700 truncate max-w-[200px]" title={itemsStr}>
                      {itemsStr}
                    </td>
                    <td className="px-4 py-2.5 border-r border-slate-200 text-center font-bold text-slate-700">{trx.itemsCount} Pcs</td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-950">{formatPrice(trx.total)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Signature Section */}
      <div className="mt-12 grid grid-cols-2 gap-8 text-xs font-semibold text-center select-none print-avoid-break">
        <div className="flex flex-col items-center">
          <span className="text-slate-500">Kasir / Petugas Operasional,</span>
          <div className="h-16" /> {/* Signature Spacer */}
          <span className="font-bold text-slate-900 border-b border-slate-900 pb-0.5 px-6">
            {currentUser ? currentUser.name : "...................................."}
          </span>
          <span className="text-[10px] text-slate-500 mt-1">
            Role: {currentUser ? currentUser.role : "Kasir"}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-slate-500">Pimpinan / Pemilik Warung,</span>
          <div className="h-16" /> {/* Signature Spacer */}
          <span className="font-bold text-slate-900 border-b border-slate-900 pb-0.5 px-6">
            ................................................
          </span>
          <span className="text-[10px] text-slate-500 mt-1">
            Warung Kasir Digital Owner
          </span>
        </div>
      </div>

      {/* Print Footer Hint */}
      <div className="mt-12 pt-4 border-t border-slate-200 text-[8px] text-slate-400 font-medium text-center italic select-none">
        Laporan ini diunduh secara legal dari sistem audit elektronik POS Warung Kasir Digital. Segala bentuk kecurangan atau manipulasi laporan akan dikenakan sanksi sesuai dengan regulasi perusahaan.
      </div>
      
    </div>
  );
}
