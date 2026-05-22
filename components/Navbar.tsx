"use client";

import { useState } from "react";

interface NavbarProps {
  activeScreen: "pos" | "dashboard" | "reports" | "management";
  setActiveScreen: (screen: "pos" | "dashboard" | "reports" | "management") => void;
  currentTime: string;
  currentUser: { name: string; role: "Admin" | "Kasir" } | null;
  onLogout: () => void;
}

export default function Navbar({
  activeScreen,
  setActiveScreen,
  currentTime,
  currentUser,
  onLogout,
}: NavbarProps) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", screen: "dashboard" as const, role: "Admin", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )},
    { id: "pos", label: "Kasir (POS)", screen: "pos" as const, role: "Kasir", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )},
    { id: "manajemen", label: "Manajemen", screen: "management" as const, role: "Admin", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
    { id: "laporan", label: "Laporan", screen: "reports" as const, role: "Admin", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
  ];

  // Filters visible nav links based on role
  const allowedNavItems = navItems.filter(
    (item) => item.role === currentUser?.role
  );

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* 1. DESKTOP & TABLET TOP NAVBAR */}
      <header className="hidden lg:flex sticky top-0 z-40 bg-[#090214]/90 backdrop-blur-md border-b border-[#8B5CF6]/15 px-6 py-4 items-center justify-between w-full shadow-lg shadow-black/40">
        {/* Brand/Logo Section */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#E614BE] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#E614BE]/20">
            <span className="font-lexend font-black text-sm text-white select-none">WK</span>
          </div>
          <div className="flex flex-col">
            <span className="font-lexend font-black text-sm tracking-tight text-white leading-none">
              WARUNG KASIR
            </span>
            <span className="text-[8px] font-black text-[#E614BE] tracking-widest uppercase mt-1">
              DIGITAL v2.0
            </span>
          </div>
        </div>

        {/* Navigation Middle Links */}
        <nav className="flex items-center gap-1.5 bg-[#130922]/55 border border-[#8B5CF6]/10 p-1.5 rounded-2xl">
          {allowedNavItems.map((item) => {
            const isActive = item.screen === activeScreen;
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.screen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 group relative text-xs tracking-wide ${
                  isActive
                    ? "bg-[#E614BE]/15 text-[#E614BE] shadow-[0_0_15px_rgba(230,20,190,0.08)] font-extrabold"
                    : "text-slate-400 hover:text-white hover:bg-white/5 font-semibold"
                }`}
              >
                <div className="transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Side Widgets (Scan, Time, User Profile) */}
        <div className="flex items-center gap-4">
          
          {/* Clock Widget */}
          <div className="hidden xl:flex flex-col items-end pr-2">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Status Waktu</span>
            <span className="text-xs font-semibold text-slate-300 mt-1">{currentTime}</span>
          </div>

          {/* User profile dropdown info */}
          <div className="flex items-center gap-3 border-l border-white/10 pl-4">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#E614BE]/20 to-[#8B5CF6]/20 border border-[#E614BE]/30 flex items-center justify-center text-[#E614BE] font-lexend font-bold shadow-inner">
              {currentUser ? getInitials(currentUser.name) : "U"}
            </div>
            <div className="hidden xl:flex flex-col">
              <span className="text-xs font-bold text-white leading-none">
                {currentUser?.name || "User"}
              </span>
              <span className="text-[8px] font-bold text-[#E614BE] mt-0.5 uppercase tracking-wider">
                {currentUser?.role || "KASIR"}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="h-8.5 w-8.5 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 flex items-center justify-center text-slate-400 hover:text-red-400 transition focus:outline-none"
              title="Keluar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MOBILE & TABLET NAVBAR (Hidden on desktop) */}
      <nav className="lg:hidden sticky top-0 z-40 bg-[#090214]/90 backdrop-blur-md border-b border-[#8B5CF6]/15 px-4 py-3.5 flex items-center justify-between">
        {/* Menu Hamburger Trigger */}
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#E614BE] hover:bg-white/10 active:scale-95 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Brand Center */}
        <div className="flex items-center gap-2.5">
          <div className="h-8.5 w-8.5 rounded-lg bg-gradient-to-br from-[#E614BE] to-[#8B5CF6] flex items-center justify-center shadow-md shadow-[#E614BE]/20">
            <span className="font-lexend font-black text-xs text-white select-none">WK</span>
          </div>
          <div className="flex flex-col">
            <span className="font-lexend font-extrabold text-sm tracking-tight text-white">
              Warung Kasir
            </span>
            <span className="text-[9px] text-slate-400 leading-none">
              {currentTime.split("pukul")[1] || currentTime}
            </span>
          </div>
        </div>
      </nav>

      {/* 3. MOBILE SLIDE-OUT DRAWER OVERLAY */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="relative w-72 max-w-[80vw] h-full bg-gradient-to-b from-[#130922] to-[#090214] border-r border-[#8B5CF6]/20 flex flex-col z-10 shadow-2xl p-5 animate-slide-in">
            {/* Drawer Close Button & Brand */}
            <div className="flex items-center justify-between pb-5 border-b border-[#8B5CF6]/10 mb-6">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#E614BE] to-[#8B5CF6] flex items-center justify-center text-white font-black text-xs select-none">
                  WK
                </div>
                <span className="font-lexend font-black text-sm text-white">WARUNG KASIR</span>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer Items List */}
            <nav className="flex-1 flex flex-col gap-2">
              {allowedNavItems.map((item) => {
                const isActive = item.screen === activeScreen;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      setActiveScreen(item.screen);
                    }}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition w-full ${
                      isActive
                        ? "bg-[#E614BE]/10 text-[#E614BE] border-l-4 border-[#E614BE] font-bold"
                        : "text-slate-400 hover:text-white hover:bg-white/5 font-medium"
                    }`}
                  >
                    {item.icon}
                    <span className="text-xs">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Drawer User Details */}
            <div className="pt-4 border-t border-[#8B5CF6]/10 mt-auto flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#E614BE]/20 to-[#8B5CF6]/20 border border-[#E614BE]/30 flex items-center justify-center text-[#E614BE] font-bold text-xs">
                {currentUser ? getInitials(currentUser.name) : "U"}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs font-bold text-white truncate">{currentUser?.name || "User"}</span>
                <span className="text-[8px] font-black text-[#E614BE] tracking-wider uppercase">{currentUser?.role || "KASIR"}</span>
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onLogout();
                  }}
                  className="text-left text-[9px] font-extrabold text-red-400 hover:text-red-300 tracking-wider uppercase mt-1"
                >
                  Keluar
                </button>
              </div>
            </div>

          </aside>
        </div>
      )}
    </>
  );
}
