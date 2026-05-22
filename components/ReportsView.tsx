"use client";

import { useMemo, useState, Fragment, useEffect, useRef } from "react";

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

interface ReportsViewProps {
  transactions: Transaction[];
  filterPeriod: string;
  setFilterPeriod: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  onPreviewReport: () => void;
  onPreviewCsv: () => void;
}

export default function ReportsView({
  transactions,
  filterPeriod,
  setFilterPeriod,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  filterStatus,
  setFilterStatus,
  onPreviewReport,
  onPreviewCsv,
}: ReportsViewProps) {
  const [expandedTrxId, setExpandedTrxId] = useState<string | null>(null);
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Custom Calendar picker state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(new Date());
  const [activeDateTab, setActiveDateTab] = useState<'start' | 'end'>('start');

  const calendarRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setIsPeriodOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const parseDateString = (str: string) => {
    if (!str) return new Date();
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatDisplayDate = (str: string) => {
    if (!str) return "-";
    const date = parseDateString(str);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Filtering Logic - Disamakan persis dengan PrintReport
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

  // Calculations for the filtered range
  const reportSummary = useMemo(() => {
    const totalRev = filteredTransactions.reduce((acc, t) => acc + t.total, 0);
    const count = filteredTransactions.length;
    const totalItems = filteredTransactions.reduce((acc, t) => acc + t.itemsCount, 0);
    return {
      revenue: totalRev,
      count,
      itemsCount: totalItems,
    };
  }, [filteredTransactions]);

  const handleExportPDF = () => {
    onPreviewReport();
  };

  const handleExportCSV = () => {
    onPreviewCsv();
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full p-4 md:p-6 lg:p-8 flex flex-col gap-6 flex-1 bg-transparent">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-lexend font-black text-2xl text-white tracking-tight flex items-center gap-2">
            <span className="h-6 w-1.5 rounded-full bg-[#E614BE]" />
            Laporan Keuangan & Penjualan
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-semibold">
            Kelola filter rentang tanggal, filter status pembayaran, ekspor berkas audit, dan rekapitulasi penjualan.
          </p>
        </div>

        {/* Export options */}
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#E614BE]/30 font-bold text-xs text-white transition active:scale-95 flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/xl" className="h-4 w-4 text-[#E614BE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF Rekap
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#E614BE]/30 font-bold text-xs text-white transition active:scale-95 flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/xl" className="h-4 w-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            CSV Data
          </button>
        </div>
      </div>

      {/* Date & Period Filters Control Card */}
      <div className="relative z-30 bg-[#130922]/85 border border-[#E614BE]/20 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5 backdrop-blur-md shadow-[0_4px_30px_rgba(230,20,190,0.03)]">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          
          {/* Period selector */}
          <div ref={periodRef} className="flex flex-col gap-1.5 min-w-[140px] relative">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1">Periode</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsPeriodOpen(!isPeriodOpen);
                  setIsStatusOpen(false);
                }}
                className="w-full bg-[#1A102A]/90 border border-[#E614BE]/20 hover:border-[#E614BE]/50 text-white text-xs font-bold rounded-xl pl-4 pr-10 py-2.5 outline-none transition cursor-pointer flex items-center justify-between shadow-inner focus:ring-1 focus:ring-[#E614BE]/20 min-w-[140px] text-left"
              >
                <span>{filterPeriod}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/xl" 
                  className={`h-4 w-4 text-[#E614BE]/70 transition-transform duration-200 ${isPeriodOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Custom Dropdown Items List */}
              {isPeriodOpen && (
                <div className="absolute left-0 right-0 mt-2 z-50 bg-[#130922]/98 border border-[#E614BE]/30 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md animate-fade-in divide-y divide-white/5">
                  {["Hari Ini", "7 Hari Terakhir", "Bulan Ini"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setFilterPeriod(option);
                        setIsPeriodOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs font-semibold transition-colors duration-150 flex items-center justify-between ${
                        filterPeriod === option 
                          ? "bg-[#E614BE]/20 text-[#E614BE]" 
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span>{option}</span>
                      {filterPeriod === option && (
                        <svg xmlns="http://www.w3.org/2000/xl" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date range picker */}
          <div ref={calendarRef} className="flex flex-col gap-1.5 min-w-[240px] relative">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1">Rentang Tanggal</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsCalendarOpen(!isCalendarOpen);
                  setIsPeriodOpen(false);
                  setIsStatusOpen(false);
                  if (startDate) {
                    setCalendarViewDate(parseDateString(startDate));
                  }
                  setActiveDateTab('start');
                }}
                className="w-full bg-[#1A102A]/90 border border-[#E614BE]/20 hover:border-[#E614BE]/50 text-white text-xs font-bold rounded-xl px-4 py-2.5 outline-none transition cursor-pointer flex items-center justify-between shadow-inner focus:ring-1 focus:ring-[#E614BE]/20 gap-3"
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/xl" className="h-4 w-4 text-[#E614BE]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDisplayDate(startDate)}</span>
                  <span className="text-slate-500 font-bold text-[10px] lowercase">s/d</span>
                  <span>{formatDisplayDate(endDate)}</span>
                </div>
                <svg 
                  xmlns="http://www.w3.org/2000/xl" 
                  className={`h-4 w-4 text-[#E614BE]/70 transition-transform duration-200 ${isCalendarOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Custom Date Picker Popover */}
              {isCalendarOpen && (() => {
                const year = calendarViewDate.getFullYear();
                const month = calendarViewDate.getMonth();
                
                const firstDayIndex = new Date(year, month, 1).getDay();
                const totalDays = new Date(year, month + 1, 0).getDate();
                const prevTotalDays = new Date(year, month, 0).getDate();

                const days: { date: Date; isCurrentMonth: boolean }[] = [];

                for (let i = firstDayIndex - 1; i >= 0; i--) {
                  days.push({
                    date: new Date(year, month - 1, prevTotalDays - i),
                    isCurrentMonth: false
                  });
                }

                for (let i = 1; i <= totalDays; i++) {
                  days.push({
                    date: new Date(year, month, i),
                    isCurrentMonth: true
                  });
                }

                const remaining = 42 - days.length;
                for (let i = 1; i <= remaining; i++) {
                  days.push({
                    date: new Date(year, month + 1, i),
                    isCurrentMonth: false
                  });
                }

                const isSelectedStart = (d: Date) => startDate && formatDateString(d) === startDate;
                const isSelectedEnd = (d: Date) => endDate && formatDateString(d) === endDate;
                const isInRange = (d: Date) => {
                  if (!startDate || !endDate) return false;
                  const dateStr = formatDateString(d);
                  return dateStr > startDate && dateStr < endDate;
                };

                const changeMonth = (offset: number) => {
                  setCalendarViewDate(new Date(year, month + offset, 1));
                };

                const handleDayClick = (d: Date) => {
                  const dateStr = formatDateString(d);
                  if (activeDateTab === 'start') {
                    setStartDate(dateStr);
                    setActiveDateTab('end');
                    if (endDate && dateStr > endDate) {
                      setEndDate(dateStr);
                    }
                  } else {
                    if (startDate && dateStr < startDate) {
                      setStartDate(dateStr);
                      setActiveDateTab('end');
                    } else {
                      setEndDate(dateStr);
                      setIsCalendarOpen(false);
                    }
                  }
                };

                const monthNames = [
                  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                ];

                return (
                  <div className="absolute left-0 mt-2 z-50 bg-[#130922]/98 border border-[#E614BE]/30 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-fade-in w-[300px]">
                    <div className="grid grid-cols-2 gap-2 mb-3 bg-black/40 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setActiveDateTab('start')}
                        className={`py-1.5 text-center text-[10px] font-black uppercase rounded-lg transition-colors duration-150 ${
                          activeDateTab === 'start' ? 'bg-[#E614BE] text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Tgl Mulai
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveDateTab('end')}
                        className={`py-1.5 text-center text-[10px] font-black uppercase rounded-lg transition-colors duration-150 ${
                          activeDateTab === 'end' ? 'bg-[#E614BE] text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Tgl Akhir
                      </button>
                    </div>

                    <div className="flex items-center justify-between mb-3 px-1">
                      <button
                        type="button"
                        onClick={() => changeMonth(-1)}
                        className="p-1 rounded-lg hover:bg-white/5 text-[#E614BE] transition active:scale-90"
                      >
                        <svg xmlns="http://www.w3.org/2000/xl" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7 7-7-7" />
                        </svg>
                      </button>
                      <span className="text-[11px] font-extrabold text-white uppercase tracking-wider">
                        {monthNames[month]} {year}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeMonth(1)}
                        className="p-1 rounded-lg hover:bg-white/5 text-[#E614BE] transition active:scale-90"
                      >
                        <svg xmlns="http://www.w3.org/2000/xl" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[9px] font-black text-slate-500 uppercase">
                      {["Mg", "Sn", "Sl", "Rb", "Km", "Jm", "Sb"].map((dayName) => (
                        <div key={dayName} className="py-1">{dayName}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {days.map((day, idx) => {
                        const start = isSelectedStart(day.date);
                        const end = isSelectedEnd(day.date);
                        const range = isInRange(day.date);
                        
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleDayClick(day.date)}
                            className={`py-1.5 text-[10px] font-bold rounded-lg transition-all duration-100 flex items-center justify-center ${
                              day.isCurrentMonth ? "text-slate-200" : "text-slate-600"
                            } ${
                              start || end
                                ? "bg-[#E614BE] text-white shadow-[0_0_10px_rgba(230,20,190,0.5)] font-black"
                                : range
                                ? "bg-[#E614BE]/15 text-[#E614BE] rounded-none"
                                : "hover:bg-white/5"
                            }`}
                          >
                            {day.date.getDate()}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5 text-[9px] text-slate-400 font-medium italic text-center select-none">
                      {activeDateTab === 'start' ? "Pilih tanggal mulai rekap" : "Pilih tanggal akhir rekap"}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Status selector */}
          <div ref={statusRef} className="flex flex-col gap-1.5 min-w-[140px] relative">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1">Status</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsStatusOpen(!isStatusOpen);
                  setIsPeriodOpen(false);
                }}
                className="w-full bg-[#1A102A]/90 border border-[#E614BE]/20 hover:border-[#E614BE]/50 text-white text-xs font-bold rounded-xl pl-4 pr-10 py-2.5 outline-none transition cursor-pointer flex items-center justify-between shadow-inner focus:ring-1 focus:ring-[#E614BE]/20 min-w-[140px] text-left"
              >
                <span>{filterStatus}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/xl" 
                  className={`h-4 w-4 text-[#E614BE]/70 transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Custom Dropdown Items List */}
              {isStatusOpen && (
                <div className="absolute left-0 right-0 mt-2 z-50 bg-[#130922]/98 border border-[#E614BE]/30 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md animate-fade-in divide-y divide-white/5">
                  {["Semua Status", "Lunas", "Pending"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setFilterStatus(option);
                        setIsStatusOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-xs font-semibold transition-colors duration-150 flex items-center justify-between ${
                        filterStatus === option 
                          ? "bg-[#E614BE]/20 text-[#E614BE]" 
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span>{option}</span>
                      {filterStatus === option && (
                        <svg xmlns="http://www.w3.org/2000/xl" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Filtered Period Statistics Summary */}
        <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 justify-around md:justify-start">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Terjaring</span>
            <span className="font-lexend font-extrabold text-lg text-[#E614BE]">{formatPrice(reportSummary.revenue)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Kuantitas</span>
            <span className="font-lexend font-extrabold text-lg text-white">{reportSummary.count} Nota</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Barang</span>
            <span className="font-lexend font-extrabold text-lg text-slate-300">{reportSummary.itemsCount} Pcs</span>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-[#130922]/50 border border-[#E614BE]/15 overflow-hidden flex flex-col shadow-2xl rounded-2xl backdrop-blur-md">
        
        {/* Table Header block */}
        <div className="px-6 py-4.5 border-b border-[#E614BE]/10 flex items-center justify-between flex-wrap gap-3 bg-black/20">
          <div>
            <h3 className="font-lexend font-extrabold text-sm text-white">Log Transaksi Penjualan</h3>
            <span className="text-[10px] text-slate-500 uppercase font-black">Laporan log rincian pesanan berdasarkan rentang filter</span>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E614BE]/10 text-slate-400 uppercase text-[9px] tracking-wider bg-black/10 select-none">
                <th className="px-6 py-4 font-bold">Waktu & Tanggal</th>
                <th className="px-6 py-4 font-bold">ID Transaksi</th>
                <th className="px-6 py-4 font-bold text-center">Jumlah Barang</th>
                <th className="px-6 py-4 font-bold text-right">Total Tagihan</th>
                <th className="px-6 py-4 font-bold text-center">Status Pembayaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-bold">
                    Tidak ada transaksi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => (
                  <Fragment key={trx.id}>
                    <tr 
                      onClick={() => setExpandedTrxId(expandedTrxId === trx.id ? null : trx.id)}
                      className="hover:bg-white/[0.04] active:bg-white/[0.02] cursor-pointer transition-colors duration-150 odd:bg-white/[0.01] even:bg-transparent select-none"
                    >
                      {/* Timestamp */}
                      <td className="px-6 py-4 text-slate-300 font-medium">
                        <div className="flex items-center gap-2">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${expandedTrxId === trx.id ? 'rotate-90 text-[#E614BE]' : ''}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                          <span>{trx.timestamp}</span>
                        </div>
                      </td>
                      {/* ID */}
                      <td className="px-6 py-4 font-mono text-white font-bold select-all">
                        {trx.id}
                      </td>
                      {/* ItemsCount */}
                      <td className="px-6 py-4 text-center text-slate-300 font-extrabold">
                        {trx.itemsCount} Pcs
                      </td>
                      {/* Total */}
                      <td className="px-6 py-4 text-right font-lexend font-black text-[#E614BE]">
                        {formatPrice(trx.total)}
                      </td>
                      {/* Status tag */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 shadow-md shadow-fuchsia-500/5 select-none">
                          Lunas
                        </span>
                      </td>
                    </tr>
                    
                    {/* Expandable item details row */}
                    {expandedTrxId === trx.id && (
                      <tr className="bg-[#1A102A]/25">
                        <td colSpan={5} className="px-6 py-4 border-t border-b border-[#E614BE]/15">
                          <div className="space-y-3.5 pl-4 border-l-2 border-[#E614BE]">
                            <div className="text-[10px] uppercase font-black tracking-wider text-[#E614BE] flex items-center gap-1.5 select-none">
                              <svg xmlns="http://www.w3.org/2000/xl" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                              </svg>
                              Rincian Item Pembelian
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {trx.items && trx.items.map((item, idx) => (
                                <div key={idx} className="bg-black/35 rounded-xl border border-white/5 p-3 flex justify-between items-center gap-4 hover:border-white/10 transition-colors">
                                  <div>
                                    <div className="font-bold text-white text-xs">{item.product_name}</div>
                                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{item.quantity} {item.quantity > 1 ? 'pcs' : 'pc'} &times; {formatPrice(item.price)}</div>
                                  </div>
                                  <div className="font-lexend font-black text-xs text-slate-200">
                                    {formatPrice(item.quantity * item.price)}
                                  </div>
                                </div>
                              ))}
                              {(!trx.items || trx.items.length === 0) && (
                                <div className="text-[10px] text-slate-500 font-bold italic py-1 col-span-full select-none">
                                  Detail rincian produk tidak tersedia.
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info counts */}
        <div className="px-6 py-3.5 border-t border-[#E614BE]/10 bg-black/10 flex items-center justify-between text-[10px] text-slate-500 font-bold">
          <span>Menampilkan {filteredTransactions.length} transaksi terfilter</span>
          <span>Halaman 1 dari 1</span>
        </div>

      </div>

    </div>
  );
}
