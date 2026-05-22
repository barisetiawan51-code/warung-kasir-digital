"use client";

import React, { useState, useEffect } from "react";

export default function Footer() {
  const [timeStr, setTimeStr] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  // Synchronize clock locally
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full bg-[#130922]/85 backdrop-blur-md border-t border-[#E614BE]/25 shadow-[0_-4px_20px_rgba(230,20,190,0.05)] text-slate-400 py-5 px-6 mt-auto select-none z-40 transition-all">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Section: Brand & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center md:text-left">
          <span className="font-lexend font-black text-sm text-transparent bg-clip-text bg-white drop-shadow-[0_0_10px_rgba(230,20,190,0.3)] tracking-tight">
            Warung Kasir Digital
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="text-[11px] text-slate-400 font-semibold leading-relaxed">
            &copy; 2026 Warung Kasir Digital. Mengelola Cuan Jadi Lebih Seru!
          </span>
        </div>

        {/* Center/Right Section: Interactive Action & Status Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
          
          {/* Quick Help Link */}
          <button
            onClick={() => setShowHelp(true)}
            className="text-[11px] text-slate-400 hover:text-[#E614BE] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer font-extrabold flex items-center gap-1 hover:drop-shadow-[0_0_8px_rgba(230,20,190,0.5)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Butuh Bantuan?
          </button>

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* App Version Badge */}
          <div className="px-2.5 py-1.5 rounded-xl bg-[#E614BE]/10 border border-[#E614BE]/20 text-[9px] text-[#E614BE] uppercase tracking-wider">
            v2.0 WK
          </div>

        </div>
      </div>

      {/* Help Modal Popup Overlay */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowHelp(false)} />
          <div className="relative w-full max-w-sm bg-gradient-to-b from-[#130922]/95 to-[#090214]/98 border border-[#E614BE]/30 rounded-2xl p-6 shadow-2xl text-white animate-fade-in">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#E614BE]/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <h4 className="font-lexend font-black text-sm text-[#E614BE] flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pusat Bantuan
              </h4>
              <button
                onClick={() => setShowHelp(false)}
                className="h-6 w-6 rounded bg-white/5 flex items-center justify-center hover:bg-white/10 transition text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <p>Untuk pertanyaan teknis, kendala pencatatan cuan, atau masalah koneksi printer kasir:</p>
              <div className="p-3 bg-black/35 rounded-xl border border-white/5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#E614BE] font-bold">Email:</span>
                  <span className="font-mono">support@warungghans.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#E614BE] font-bold">Telegram:</span>
                  <span className="font-mono">@warung_digital_bot</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 italic mt-2">
                *Layanan bantuan aktif 24 jam untuk melayani usaha Anda.
              </p>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E614BE] to-[#8B5CF6] hover:brightness-115 text-white font-bold text-xs shadow-md shadow-[#E614BE]/10 transition duration-200"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
