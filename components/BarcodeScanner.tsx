"use client";

import React, { useEffect, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { createPortal } from "react-dom";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
}

export default function BarcodeScanner({
  isOpen,
  onClose,
  onScanSuccess,
}: BarcodeScannerProps) {
  const [mounted, setMounted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermissionError, setHasPermissionError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch (error) {
      console.error("Audio beep failed", error);
    }
  };

  useEffect(() => {
    // Jangan inisialisasi jika modal ditutup atau belum dipasang
    if (!isOpen || !mounted) return;

    let html5QrCode: Html5Qrcode;
    let isMounted = true;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("reader", {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
          ],
          verbose: false,
        });

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            disableFlip: false,
          },
          (decodedText) => {
            if (isScanning) return;
            setIsScanning(true);

            if (navigator.vibrate) {
              navigator.vibrate(100);
            }

            playBeep();
            onScanSuccess(decodedText);
            onClose();
          },
          (errorMessage) => {
            // Abaikan log error scanning realtime berkala
          }
        );
      } catch (err: any) {
        // Cek status secara aman tanpa merusak siklus hidup komponen video
        if (isMounted) {
          const errorStr = err?.toString() || "";
          if (
            err === "NotAllowedError" ||
            err?.name === "NotAllowedError" ||
            errorStr.includes("NotAllowedError") ||
            errorStr.includes("Permission denied")
          ) {
            setHasPermissionError(true);
          } else {
            console.error("Error starting scanner:", err);
          }
        }
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 150); // Sedikit ditambah jeda agar DOM Portal benar-benar siap stabil

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode
          .stop()
          .then(() => {
            html5QrCode.clear();
          })
          .catch((err) => console.error("Failed to clear scanner", err));
      }
    };
    // HAPUS hasPermissionError dari array ini untuk mencegah re-run effect yang memotong proses play() media
  }, [isOpen, mounted, onScanSuccess, onClose]);

  // Reset semua state saat modal ditutup luar
  useEffect(() => {
    if (!isOpen) {
      setIsScanning(false);
      setHasPermissionError(false);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#090214]/90 backdrop-blur-md animate-fade-in p-4">
      
      {/* ================= TAMPILAN OVERLAY KETIKA AKSES KAMERA DIBLOKIR ================= */}
      {hasPermissionError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#090214]/95 p-4 animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#130922]/90 border border-[#E614BE] shadow-[0_0_30px_rgba(230,20,190,0.4)] backdrop-blur-xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-pink-500/10 border border-[#E614BE] flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(230,20,190,0.2)]">
              <svg className="w-8 h-8 text-[#E614BE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            
            <h2 className="text-white font-lexend font-black text-xl tracking-wider mb-2">
              AKSES KAMERA DIBLOKIR! 🚫
            </h2>
            
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Aplikasi memerlukan akses kamera belakang handphone Anda untuk memindai barcode produk belanjaan.
            </p>

            <div className="w-full text-left bg-black/40 border border-white/5 rounded-2xl p-4 mb-6 space-y-3 text-xs text-slate-400 font-medium">
              <p className="text-white font-semibold border-b border-white/10 pb-1 mb-2">Cara Mengizinkan Kembali:</p>
              <div className="flex gap-2">
                <span className="text-[#E614BE] font-bold">1.</span>
                <p>Klik ikon <span className="text-[#00F0FF] font-semibold">Gembok / Setelan 🔒</span> di sebelah kiri kolom alamat URL browser Anda.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-[#E614BE] font-bold">2.</span>
                <p>Cari menu pilihan <span className="text-[#00F0FF] font-semibold">Kamera (Camera)</span>.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-[#E614BE] font-bold">3.</span>
                <p>Ubah status pengaturannya menjadi <span className="text-green-400 font-semibold">Izinkan (Allow)</span>.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#E614BE] to-[#8B5CF6] text-white font-bold tracking-wider text-xs uppercase shadow-[0_0_15px_rgba(230,20,190,0.3)] hover:brightness-110 active:scale-95 transition-all"
              >
                Buka Izin & Refresh
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-bold tracking-wider text-xs uppercase hover:bg-white/10 active:scale-95 transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STRUKTUR DOM UTAMA SCANNER (SELALU STANDBY DI SINI) ================= */}
      <h2 className="absolute top-16 text-white font-lexend font-black text-xl tracking-wider text-shadow-glow-magenta z-20">
        SCAN BARCODE
      </h2>

      <div className="relative w-full max-w-sm flex flex-col items-center justify-center p-4 z-10">
        <div className="relative w-[250px] h-[250px] rounded-3xl border-2 border-[#E614BE] shadow-[0_0_20px_rgba(230,20,190,0.6)] overflow-hidden bg-black flex items-center justify-center">
          
          {/* Node ini sekarang aman dari unmount mendadak */}
          <div id="reader" className="w-full h-full object-cover flex items-center justify-center overflow-hidden [&>video]:object-cover [&>video]:w-full [&>video]:h-full" />

          <div className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent shadow-[0_0_8px_#E614BE] animate-scan-laser pointer-events-none" />
        </div>
      </div>

      <div className="absolute bottom-12 z-20">
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold tracking-widest text-xs uppercase hover:bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-xl active:scale-95 transition-all"
        >
          Tutup Kamera
        </button>
      </div>
    </div>,
    document.body
  );
}
