"use client";

import { useMemo } from "react";

interface Transaction {
  id: string;
  timestamp: string;
  itemsCount: number;
  subtotal: number;
  total: number;
  cashPaid: number;
  change: number;
  status: "Lunas / Success" | "Pending" | "Batal";
}

interface DashboardViewProps {
  transactions: Transaction[];
}

export default function DashboardView({ transactions }: DashboardViewProps) {
  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Live Metrics Calculations
  const stats = useMemo(() => {
    const totalRevenue = transactions.reduce((acc, t) => acc + t.total, 0);
    const totalTrx = transactions.length;
    const avgTicket = totalTrx > 0 ? totalRevenue / totalTrx : 0;
    return {
      revenue: totalRevenue,
      transactionsCount: totalTrx,
      averageTicket: avgTicket,
      topCategory: "Sembako",
    };
  }, [transactions]);

  return (
    <div className="max-w-[1600px] mx-auto w-full p-4 md:p-6 lg:p-8 flex flex-col gap-6 flex-1 bg-transparent">
      
      {/* Header */}
      <div>
        <h1 className="font-lexend font-black text-2xl text-white tracking-tight flex items-center gap-2">
          <span className="h-6 w-1.5 rounded-full bg-[#E614BE]" />
          Dashboard Monitoring Real-Time
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-semibold">
          Visualisasi performa penjualan warung, distribusi kategori produk, dan statistik utama kasir secara real-time.
        </p>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Revenue */}
        <div className="bg-[#130922]/50 border border-[#E614BE]/15 bg-gradient-to-b from-[#130922]/80 to-[#090214]/40 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden shadow-lg shadow-[#E614BE]/2">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#E614BE]/5 rounded-full blur-xl" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pendapatan</span>
          <span className="font-lexend font-black text-2xl text-[#E614BE] tracking-tight">{formatPrice(stats.revenue)}</span>
          <span className="text-[10px] text-[#E614BE] font-bold flex items-center gap-1 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            +12.4% vs Kemarin
          </span>
        </div>

        {/* Transactions volume */}
        <div className="bg-[#130922]/50 border border-[#E614BE]/15 bg-gradient-to-b from-[#130922]/80 to-[#090214]/40 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden shadow-lg shadow-[#E614BE]/2">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#E614BE]/5 rounded-full blur-xl" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Transaksi</span>
          <span className="font-lexend font-black text-2xl text-white tracking-tight">{stats.transactionsCount} Transaksi</span>
          <span className="text-[10px] text-[#E614BE] font-bold flex items-center gap-1 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            +8.2% vs Kemarin
          </span>
        </div>

        {/* Average basket size */}
        <div className="bg-[#130922]/50 border border-[#E614BE]/15 bg-gradient-to-b from-[#130922]/80 to-[#090214]/40 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden shadow-lg shadow-[#E614BE]/2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rata-Rata Keranjang</span>
          <span className="font-lexend font-black text-2xl text-white tracking-tight">{formatPrice(stats.averageTicket)}</span>
          <span className="text-[10px] text-[#E614BE] font-bold flex items-center gap-1 mt-1">
            Stabilitas volume tinggi
          </span>
        </div>

        {/* Best selling category */}
        <div className="bg-[#130922]/50 border border-[#E614BE]/15 bg-gradient-to-b from-[#130922]/80 to-[#090214]/40 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden shadow-lg shadow-[#E614BE]/2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori Terlaris</span>
          <span className="font-lexend font-black text-2xl text-[#E614BE] tracking-tight">{stats.topCategory}</span>
          <span className="text-[10px] text-[#E614BE] font-bold flex items-center gap-1 mt-1">
            Kebutuhan dapur mendominasi
          </span>
        </div>

      </div>

      {/* Analytics SVG Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Line Chart for sales trends */}
        <div className="bg-[#130922]/50 border border-[#E614BE]/15 p-5 rounded-2xl flex flex-col gap-4 shadow-xl backdrop-blur-md">
          <div>
            <h3 className="font-lexend font-extrabold text-sm text-white">Trend Pendapatan Penjualan</h3>
            <span className="text-[10px] text-slate-500 uppercase font-black">PULSE REVENUE LINE CHART - 24 JAM TERAKHIR</span>
          </div>

          <div className="w-full h-64 bg-slate-950/40 rounded-xl relative border border-white/5 overflow-hidden p-4 flex items-end">
            <svg className="absolute inset-0 w-full h-full p-6" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="blue-chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E614BE" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                </linearGradient>
                <filter id="blue-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#E614BE" floodOpacity="0.5" />
                </filter>
              </defs>
              
              <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(230, 20, 190, 0.1)" strokeWidth="1" strokeDasharray="3" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(230, 20, 190, 0.1)" strokeWidth="1" strokeDasharray="3" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="rgba(230, 20, 190, 0.1)" strokeWidth="1" strokeDasharray="3" />
              <line x1="0" y1="190" x2="500" y2="190" stroke="rgba(230, 20, 190, 0.2)" strokeWidth="1" />

              <path d="M 0 190 Q 75 140, 150 90 T 300 130 T 450 40 L 500 40 L 500 190 Z" fill="url(#blue-chart-grad)" />

              <path 
                d="M 0 190 Q 75 140, 150 90 T 300 130 T 450 40 L 500 40" 
                fill="none" 
                stroke="#E614BE" 
                strokeWidth="3.5"
                filter="url(#blue-glow)"
              />

              <circle cx="150" cy="90" r="5" fill="#FFFFFF" stroke="#E614BE" strokeWidth="2.5" />
              <circle cx="300" cy="130" r="5" fill="#FFFFFF" stroke="#E614BE" strokeWidth="2.5" />
              <circle cx="450" cy="40" r="5" fill="#FFFFFF" stroke="#E614BE" strokeWidth="2.5" className="animate-ping" />
            </svg>

            <div className="absolute bottom-2 left-6 right-6 flex justify-between text-[8px] font-black uppercase text-slate-500">
              <span>08:00</span>
              <span>10:00</span>
              <span>12:00</span>
              <span>14:00</span>
              <span>16:00</span>
              <span>18:00</span>
            </div>
          </div>
        </div>

        {/* Pie/Donut Chart for Category Distributions */}
        <div className="bg-[#130922]/50 border border-[#E614BE]/15 p-5 rounded-2xl flex flex-col gap-4 shadow-xl backdrop-blur-md">
          <div>
            <h3 className="font-lexend font-extrabold text-sm text-white">Distribusi Penjualan Per Kategori</h3>
            <span className="text-[10px] text-slate-500 uppercase font-black">CATEGORY SALES DONUT CHART - MINGGU INI</span>
          </div>

          <div className="w-full h-64 bg-slate-950/40 rounded-xl relative border border-white/5 p-4 flex items-center justify-center">
            <svg className="w-48 h-48" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="rgba(255, 255, 255, 0.03)"
                strokeWidth="3"
              />
              
              {/* Sembako - 40% (Cyan) */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#22D3EE"
                strokeWidth="4"
                strokeDasharray="40 60"
                strokeDashoffset="25"
                filter="drop-shadow(0 0 4px rgba(34, 211, 238, 0.4))"
              />

              {/* Sayuran - 25% (Electric Blue) */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#E614BE"
                strokeWidth="4"
                strokeDasharray="25 75"
                strokeDashoffset="85"
                filter="drop-shadow(0 0 4px rgba(56, 189, 248, 0.4))"
              />

              {/* Minyak - 15% (Indigo Purple) */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="4"
                strokeDasharray="15 85"
                strokeDashoffset="60"
              />

              {/* Lain-lain - 20% (Darker Blue) */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#1E40AF"
                strokeWidth="4"
                strokeDasharray="20 80"
                strokeDashoffset="45"
              />
            </svg>

            {/* Donut Legend */}
            <div className="absolute right-6 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#22D3EE] block" />
                <span className="text-[10px] font-bold text-slate-300">Sembako (40%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#E614BE] block" />
                <span className="text-[10px] font-bold text-slate-300">Sayuran (25%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6] block" />
                <span className="text-[10px] font-bold text-slate-300">Minyak (15%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#1E40AF] block" />
                <span className="text-[10px] font-bold text-slate-300">Makanan/Min (20%)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
