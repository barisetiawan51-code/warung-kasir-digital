"use client";

import React, { useState } from "react";

interface LoginScreenProps {
  onLoginSuccess: (user: { id: string; name: string; email: string; role: "Admin" | "Kasir" }) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  // --- View Toggle ---
  const [isRegistering, setIsRegistering] = useState(false);

  // --- Login Form State ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // --- Registration Form State ---
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regRole, setRegRole] = useState<"Admin" | "Kasir">("Kasir");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // --- Shared Async States ---
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // --- Login Submission ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal masuk. Silakan periksa kembali email dan password.");
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Registration Submission ---
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // 1. Password confirmation check
    if (regPassword !== regConfirmPassword) {
      setErrorMsg("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          role: regRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal melakukan registrasi.");
      }

      // Success setup
      setSuccessMsg(data.message || "Registrasi berhasil! Silakan login.");
      
      // Reset forms
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirmPassword("");
      setRegRole("Kasir");
      
      // Auto toggle back to login screen after 2.5s
      setTimeout(() => {
        setIsRegistering(false);
        setSuccessMsg(null);
      }, 2500);

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleView = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsRegistering(!isRegistering);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#090214] relative overflow-hidden font-sans p-4 select-none">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] bg-fuchsia-600/10 rounded-full blur-[120px] animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-violet-800/10 rounded-full blur-[140px] animate-pulse duration-[12000ms]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-indigo-900/5 rounded-full blur-[110px]" />
      </div>

      {/* Cyberpunk Grid Background Overlay */}
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />

      {/* Floating Glassmorphic Login / Register Card */}
      <div className="relative z-10 w-full max-w-md bg-[#130922]/85 backdrop-blur-xl border border-[#E614BE]/30 shadow-[0_0_35px_rgba(230,20,190,0.12)] rounded-3xl p-8 md:p-10 select-text overflow-hidden transition-all duration-300">
        
        {/* Ambient top light */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E614BE] to-transparent opacity-80" />

        {/* Brand Icon Header */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#E614BE] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#E614BE]/20 mb-4 animate-bounce duration-[4000ms]">
            <span className="font-lexend font-black text-xl text-white select-none">WK</span>
          </div>
          <h2 className="font-lexend font-black text-2xl text-white tracking-tight leading-tight">
            {isRegistering ? "Registrasi Akun Baru" : "Login Area"}
          </h2>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Warung Kasir Digital - {isRegistering ? "Lengkapi data untuk membuat akun" : "Silakan autentikasi akun Anda"}
          </p>
        </div>

        {/* Alert Box for Errors */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/45 border border-red-500/25 text-red-200 text-xs font-semibold flex items-start gap-2.5 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-red-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Alert Box for Success */}
        {successMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/45 border border-emerald-500/25 text-emerald-200 text-xs font-semibold flex items-start gap-2.5 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Conditional Screen Rendering */}
        {!isRegistering ? (
          /* --- LOGIN FORM --- */
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-extrabold text-violet-200 uppercase tracking-widest mb-2 pl-1">
                Email / Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-[13px] text-slate-500 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Contoh: admin@warung.com"
                  required
                  className="w-full bg-[#1A102A]/85 border border-[#8B5CF6]/20 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E614BE] focus:ring-1 focus:ring-[#E614BE]/30 transition-all font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-violet-200 uppercase tracking-widest mb-2 pl-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-[13px] text-slate-500 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showLoginPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Masukkan password Anda"
                  required
                  className="w-full bg-[#1A102A]/85 border border-[#8B5CF6]/20 rounded-2xl pl-11 pr-11 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E614BE] focus:ring-1 focus:ring-[#E614BE]/30 transition-all font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-4 top-[12px] h-5 w-5 text-slate-500 hover:text-white transition flex items-center justify-center"
                >
                  {showLoginPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E614BE] to-[#8B5CF6] text-white font-extrabold text-xs shadow-lg shadow-[#E614BE]/20 hover:shadow-[#E614BE]/35 active:scale-95 transition-all duration-300 hover:brightness-110 flex items-center justify-center gap-2 select-none"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>MEMVERIFIKASI...</span>
                  </>
                ) : (
                  <span>MASUK APLIKASI</span>
                )}
              </button>
            </div>

            {/* Toggle to Registration View */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleToggleView}
                className="text-xs font-bold text-violet-300 hover:text-white hover:underline transition select-none"
              >
                Belum punya akun? Daftar disini
              </button>
            </div>
          </form>
        ) : (
          /* --- REGISTRATION FORM --- */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-extrabold text-violet-200 uppercase tracking-widest mb-1.5 pl-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <span className="absolute left-4 top-[12px] text-slate-500 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Nama Lengkap Anda"
                  required
                  className="w-full bg-[#1A102A]/85 border border-[#8B5CF6]/20 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E614BE] focus:ring-1 focus:ring-[#E614BE]/30 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[10px] font-extrabold text-violet-200 uppercase tracking-widest mb-1.5 pl-1">
                Alamat Email
              </label>
              <div className="relative">
                <span className="absolute left-4 top-[12px] text-slate-500 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Contoh: kasir@warung.com"
                  required
                  className="w-full bg-[#1A102A]/85 border border-[#8B5CF6]/20 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E614BE] focus:ring-1 focus:ring-[#E614BE]/30 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-extrabold text-violet-200 uppercase tracking-widest mb-1.5 pl-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-[12px] text-slate-500 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showRegPassword ? "text" : "password"}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Password (min 6 karakter)"
                  required
                  minLength={6}
                  className="w-full bg-[#1A102A]/85 border border-[#8B5CF6]/20 rounded-2xl pl-11 pr-11 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E614BE] focus:ring-1 focus:ring-[#E614BE]/30 transition-all font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-4 top-[10px] h-5 w-5 text-slate-500 hover:text-white transition flex items-center justify-center"
                >
                  {showRegPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-extrabold text-violet-200 uppercase tracking-widest mb-1.5 pl-1">
                Konfirmasi Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-[12px] text-slate-500 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showRegConfirmPassword ? "text" : "password"}
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Ulangi password Anda"
                  required
                  className="w-full bg-[#1A102A]/85 border border-[#8B5CF6]/20 rounded-2xl pl-11 pr-11 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E614BE] focus:ring-1 focus:ring-[#E614BE]/30 transition-all font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                  className="absolute right-4 top-[10px] h-5 w-5 text-slate-500 hover:text-white transition flex items-center justify-center"
                >
                  {showRegConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Role Switch Selection Pills */}
            <div>
              <label className="block text-[10px] font-extrabold text-violet-200 uppercase tracking-widest mb-2 pl-1">
                Tipe Peran (Role)
              </label>
              <div className="flex gap-3 bg-[#1A102A]/85 p-1 rounded-2xl border border-[#8B5CF6]/20">
                <button
                  type="button"
                  onClick={() => setRegRole("Kasir")}
                  className={`flex-1 py-2 text-[10px] font-extrabold rounded-xl uppercase tracking-wider transition-all duration-200 ${
                    regRole === "Kasir"
                      ? "bg-[#E614BE] text-white shadow-md shadow-[#E614BE]/25"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Kasir
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole("Admin")}
                  className={`flex-1 py-2 text-[10px] font-extrabold rounded-xl uppercase tracking-wider transition-all duration-200 ${
                    regRole === "Admin"
                      ? "bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/25"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#E614BE] to-[#8B5CF6] text-white font-extrabold text-xs shadow-lg shadow-[#E614BE]/20 hover:shadow-[#E614BE]/35 active:scale-95 transition-all duration-300 hover:brightness-110 flex items-center justify-center gap-2 select-none"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>MENDAFTAR...</span>
                  </>
                ) : (
                  <span>DAFTAR AKUN Baru</span>
                )}
              </button>
            </div>

            {/* Toggle back to Login View */}
            <div className="text-center pt-1.5">
              <button
                type="button"
                onClick={handleToggleView}
                className="text-xs font-bold text-violet-300 hover:text-white hover:underline transition select-none"
              >
                Sudah punya akun? Masuk disini
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
