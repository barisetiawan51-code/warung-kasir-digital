"use client";

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import PrintReport from "./PrintReport";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

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

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  startDate: string;
  endDate: string;
  filterPeriod: string;
  filterStatus: string;
  currentUser: CurrentUser | null;
}

export default function ReportPreviewModal({
  isOpen,
  onClose,
  ...printProps
}: ReportPreviewModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      setIsGenerating(true);
      
      // Generate high resolution PNG using html-to-image
      const element = reportRef.current;
      
      const imgData = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Laporan_Penjualan_${Date.now()}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#090214]/70 backdrop-blur-md p-4 sm:p-6 overflow-hidden animate-fade-in print:static print:bg-white print:p-0 print:block print:overflow-visible">
      {/* Header / Actions Bar */}
      <div className="max-w-[210mm] w-full mx-auto flex justify-between items-center mb-6 bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-xl shrink-0 print:hidden">
        <h2 className="text-white font-bold font-lexend flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#E614BE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Preview PDF Rekapitulasi
        </h2>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition"
          >
            Batal & Tutup
          </button>
          
          <button
            onClick={handlePrint}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-slate-600 hover:bg-slate-500 text-white font-bold text-xs transition flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak (Print)
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E614BE] to-[#8B5CF6] text-white font-bold text-xs shadow-lg shadow-[#E614BE]/20 active:scale-95 transition flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses PDF...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Unduh PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Container (Scrollable) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full custom-scrollbar pb-12 print:overflow-visible print:pb-0 print:block">
        <div className="w-full max-w-[210mm] mx-auto print:max-w-full print:mx-0">
          <div ref={reportRef} className="drop-shadow-2xl bg-white overflow-hidden print:drop-shadow-none print:shadow-none print:overflow-visible">
            <PrintReport {...printProps} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
