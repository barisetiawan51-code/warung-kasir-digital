"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Navbar from "../components/Navbar";
import POSView from "../components/POSView";
import CartPanel from "../components/CartPanel";
import DashboardView from "../components/DashboardView";
import ReportsView from "../components/ReportsView";
import CheckoutModal from "../components/CheckoutModal";
import PrintReport from "../components/PrintReport";
import ReportPreviewModal from "../components/ReportPreviewModal";
import CsvPreviewModal from "../components/CsvPreviewModal";
import ManagementView from "../components/ManagementView";
import BarcodeScanner from "../components/BarcodeScanner";
import LoginScreen from "../components/LoginScreen";
import Footer from "../components/Footer";

interface Product {
  id: string;
  name: string;
  initials: string;
  category: string;
  image_url?: string;
  image_base64?: string;
  purchase_price?: number;
  price: number;
  stock: number;
  unit: string;
}

interface CartItem {
  product: Product;
  quantity: number;
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
  items?: any[];
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Kasir";
}

export default function Home() {
  // --- Active Tab Screen ---
  const [activeScreen, setActiveScreen] = useState<"pos" | "dashboard" | "reports" | "management">("pos");

  // --- Auth & Session States ---
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [managementScanEvent, setManagementScanEvent] = useState<{barcode: string, ts: number} | null>(null);

  // --- Core Products & Transactions MySQL States ---
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dbError, setDbError] = useState<string | null>(null); // State dbError dikembalikan agar tidak un-defined
  const [isLoading, setIsLoading] = useState(false);

  // --- POS State Management ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mobileTab, setMobileTab] = useState<"products" | "cart">("products");
  const [cashPaid, setCashPaid] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [scanAlert, setScanAlert] = useState<{ open: boolean; name: string } | null>(null);
  const [transactionId, setTransactionId] = useState("");

  // --- Dashboard Filters State ---
  const [filterPeriod, setFilterPeriod] = useState("Hari Ini");
  const [startDate, setStartDate] = useState("2026-05-20");
  const [endDate, setEndDate] = useState("2026-05-20");
  const [filterStatus, setFilterStatus] = useState("Semua Status");

  // --- Dynamic Live Clock ---
  const [currentTime, setCurrentTime] = useState("");

  // Clock tick hook
  useEffect(() => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const updateClock = () => {
      const now = new Date();
      const dayName = days[now.getDay()];
      const date = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();

      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");

      setCurrentTime(`${dayName}, ${date} ${monthName} ${year} pukul ${hours}.${minutes}.${seconds} WIB`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check Auth on Mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setCurrentUser(data.user);
            setActiveScreen(data.user.role === "Admin" ? "dashboard" : "pos");
            // Fetch initial products and transactions
            setIsLoading(true);
            if (data.user.role === "Admin") {
              await Promise.all([
                fetchProducts(),
                fetchTransactions()
              ]);
            } else {
              await fetchProducts();
            }
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const fetchProducts = async () => {
    try {
      setDbError(null);
      const res = await fetch("/api/products");
      if (!res.ok) {
        let errMsg = `Response status code: ${res.status}`;
        try {
          const errData = await res.json();
          if (errData && (errData.details || errData.error)) {
            errMsg = errData.details || errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setDbError(err.message || "Gagal memuat API data produk");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/transactions");
      if (!res.ok) {
        let errMsg = `Response status code: ${res.status}`;
        try {
          const errData = await res.json();
          if (errData && (errData.details || errData.error)) {
            errMsg = errData.details || errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      setTransactions(data);
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
    }
  };

  // --- Auth Handlers ---
  const handleLoginSuccess = async (user: CurrentUser) => {
    setCurrentUser(user);
    setIsLoading(true);
    setActiveScreen(user.role === "Admin" ? "dashboard" : "pos");
    if (user.role === "Admin") {
      await Promise.all([
        fetchProducts(),
        fetchTransactions()
      ]);
    } else {
      await fetchProducts();
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setCurrentUser(null);
      setCart([]);
      setProducts([]);
      setTransactions([]);
    }
  };

  // Wrap screen transitions for RBAC checks
  const handleSetActiveScreen = (screen: "pos" | "dashboard" | "reports" | "management") => {
    if (currentUser?.role === "Kasir" && screen !== "pos") {
      setShowAccessDenied(true);
      return;
    }
    if (currentUser?.role === "Admin" && screen === "pos") {
      setShowAccessDenied(true);
      return;
    }
    setActiveScreen(screen);
  };

  // --- Cart Handlers ---
  const addToCart = (product: Product) => {
    if (product.stock === 0) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prevCart;
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === productId);
      if (existing && existing.quantity > 1) {
        return prevCart.map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prevCart.filter((item) => item.product.id !== productId);
    });
  };

  const deleteFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCashPaid("");
  };

  // --- Barcode Scanner Trigger ---
  const triggerMockScan = () => {
    setIsScannerOpen(true);
  };

  const handleScanSuccess = (barcode: string) => {
    if (activeScreen === "management") {
      setManagementScanEvent({ barcode, ts: Date.now() });
    } else if (activeScreen === "pos") {
      // Attempt to match barcode with Product ID or Initials (case-insensitive)
      const product = products.find(p => p.id === barcode || p.initials.toLowerCase() === barcode.toLowerCase());
      if (product) {
        if (product.stock > 0) {
          addToCart(product);
          setScanAlert({ open: true, name: product.name });
          setTimeout(() => setScanAlert(null), 2500);
        } else {
          alert(`Stok produk ${product.name} kosong!`);
        }
      } else {
        alert(`Produk dengan kode/barcode "${barcode}" tidak ditemukan.`);
      }
    } else {
      alert(`Fitur scan barcode hanya tersedia di menu POS dan Manajemen.`);
    }
  };

  // --- Cart Calculations ---
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const grandTotal = subtotal;

  const cashChange = useMemo(() => {
    const paid = parseFloat(cashPaid);
    if (isNaN(paid) || paid < grandTotal) return 0;
    return paid - grandTotal;
  }, [cashPaid, grandTotal]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // --- Checkout Execution ---
  const executeCheckout = async () => {
    if (cart.length === 0) return;
    const trxId = `TRX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const transactionData: Transaction = {
      id: trxId,
      timestamp: currentTime,
      itemsCount: totalItemsCount,
      subtotal,
      total: grandTotal,
      cashPaid: parseFloat(cashPaid) || grandTotal,
      change: cashChange,
      status: "Lunas / Success",
      items: cart
    };

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan transaksi ke database.");
      }

      setTransactionId(trxId);
      setIsCheckoutOpen(true);
      
      // Refresh data produk dan transaksi lokal
      fetchProducts();
      if (currentUser?.role === "Admin") {
        fetchTransactions();
      }
    } catch (err: any) {
      alert(`Checkout Gagal: ${err.message}`);
    }
  };

  // --- Fungsi Penutup Modal Checkout Sukses ---
  const handleCloseCheckoutModal = () => {
    setIsCheckoutOpen(false);
    clearCart();
  };

  // 1. Spinner otentikasi awal
  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#090214] gap-4 font-sans text-white">
        <div className="h-10 w-10 border-4 border-[#E614BE] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Sesi Keamanan...</span>
      </div>
    );
  }

  // 2. Jika sesi kosong, arahkan ke halaman Login
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <>
    <main className="min-h-screen bg-[#090214] text-white relative font-sans overflow-x-hidden flex flex-col no-print">
      
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[350px] h-[350px] rounded-full bg-[#E614BE]/10 blur-[90px] animate-mesh-shift-1" />
        <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#8B5CF6]/8 blur-[100px] animate-mesh-shift-2" />
        <div className="absolute bottom-[10%] left-[20%] w-[380px] h-[380px] rounded-full bg-[#E614BE]/5 blur-[90px] animate-mesh-shift-3" />
      </div>

      <Navbar
        activeScreen={activeScreen}
        setActiveScreen={handleSetActiveScreen}
        currentTime={currentTime}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col w-full">

        {dbError && (
          <div className="max-w-[1600px] mx-auto w-[calc(100%-2rem)] mt-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex flex-col gap-2 z-10 animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Koneksi Database MySQL Gagal
            </div>
            <p>
              Gagal menghubungkan sistem ke MySQL. Pastikan MySQL Server Anda (seperti XAMPP, WAMP, atau Docker) telah aktif, database <strong>warung_kasir</strong> telah dibuat, dan parameter koneksi di file <strong>.env.local</strong> sudah benar.
            </p>
            <p className="font-mono text-[10px] bg-black/40 p-2 rounded border border-white/5 select-all">
              Detail Kesalahan: {dbError}
            </p>
          </div>
        )}

        {scanAlert && (
          <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 border border-emerald-400/30 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 animate-slide-up">
            <div className="h-2 w-2 rounded-full bg-white animate-ping" />
            <span>Berhasil Scan Barcode: {scanAlert.name} ditambahkan!</span>
          </div>
        )}

        <div className="relative z-10 flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-40 gap-4">
              <div className="h-10 w-10 border-4 border-[#E614BE] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold text-slate-400">Menghubungkan ke database MySQL...</span>
            </div>
          ) : activeScreen === "pos" ? (
            <div className="max-w-[1600px] mx-auto w-full p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
              
              <POSView
                products={products}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                addToCart={addToCart}
                triggerMockScan={triggerMockScan}
                mobileTab={mobileTab}
              />

              <CartPanel
                cart={cart}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
                deleteFromCart={deleteFromCart}
                clearCart={clearCart}
                grandTotal={grandTotal}
                cashPaid={cashPaid}
                setCashPaid={setCashPaid}
                cashChange={cashChange}
                totalItemsCount={totalItemsCount}
                executeCheckout={executeCheckout}
                mobileTab={mobileTab}
              />

              <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#090214] border-t border-[#8B5CF6]/20 px-4 py-2.5 z-40 flex gap-3">
                <button
                  onClick={() => setMobileTab("products")}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl transition ${
                    mobileTab === "products"
                      ? "bg-[#E614BE] text-white"
                      : "bg-white/5 text-slate-400 border border-white/5"
                  }`}
                >
                  Pilih Produk
                </button>
                <button
                  onClick={() => setMobileTab("cart")}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl transition relative ${
                    mobileTab === "cart"
                      ? "bg-[#E614BE] text-white"
                      : "bg-white/5 text-slate-400 border border-white/5"
                  }`}
                >
                  Keranjang
                  {totalItemsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 border border-[#090214] rounded-full text-[9px] flex items-center justify-center font-black text-white">
                      {totalItemsCount}
                    </span>
                  )}
                </button>
              </div>

            </div>
          ) : activeScreen === "dashboard" ? (
            <DashboardView transactions={transactions} />
          ) : activeScreen === "reports" ? (
            <ReportsView
              transactions={transactions}
              filterPeriod={filterPeriod}
              setFilterPeriod={setFilterPeriod}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onPreviewReport={() => setShowReportPreview(true)}
              onPreviewCsv={() => setShowCsvPreview(true)}
            />
          ) : (
            <ManagementView 
              products={products} 
              onRefresh={fetchProducts} 
              scanEvent={managementScanEvent}
              triggerMockScan={triggerMockScan}
            />
          )}
        </div>

      </div>

      <Footer />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckoutModal}
        transactionId={transactionId}
        cart={cart}
        grandTotal={grandTotal}
        cashPaid={cashPaid}
        cashChange={cashChange}
      />

      {showAccessDenied && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#090214]/85 backdrop-blur-md transition-opacity"
            onClick={() => setShowAccessDenied(false)}
          />

          <div className="relative w-full max-w-sm bg-[#130922]/95 border-2 border-[#E614BE] rounded-3xl shadow-2xl shadow-[#E614BE]/25 p-6 md:p-8 z-10 animate-fade-in text-white text-center overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#E614BE]" />

            <div className="mx-auto h-12 w-12 rounded-full bg-[#E614BE]/10 border border-[#E614BE]/30 flex items-center justify-center text-[#E614BE] mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="font-lexend font-black text-lg text-white uppercase tracking-wider mb-2">
              Akses Ditolak / Unauthorized
            </h3>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-6">
              {currentUser?.role === "Kasir" ? (
                <>
                  Hanya administrator yang memiliki hak akses ke panel admin/keuangan. Menu tersebut diblokir dari peran Anda sebagai <strong className="text-[#E614BE]">Kasir</strong>.
                </>
              ) : (
                <>
                  Hanya petugas Kasir yang memiliki akses ke modul transaksi POS. Menu tersebut diblokir dari peran Anda sebagai <strong className="text-[#E614BE]">Admin</strong>.
                </>
              )}
            </p>

            <button
              onClick={() => setShowAccessDenied(false)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#E614BE] to-[#8B5CF6] text-white font-extrabold text-xs shadow-lg shadow-[#E614BE]/15 active:scale-95 transition-all focus:outline-none"
            >
              OK, MENGERTI
            </button>
          </div>
        </div>
      )}

    </main>
    <ReportPreviewModal
      isOpen={showReportPreview}
      onClose={() => setShowReportPreview(false)}
      transactions={transactions}
      startDate={startDate}
      endDate={endDate}
      filterStatus={filterStatus}
      filterPeriod={filterPeriod}
      currentUser={currentUser}
    />
    <CsvPreviewModal
      isOpen={showCsvPreview}
      onClose={() => setShowCsvPreview(false)}
      transactions={transactions}
      startDate={startDate}
      endDate={endDate}
      filterStatus={filterStatus}
    />
    <BarcodeScanner
      isOpen={isScannerOpen}
      onClose={() => setIsScannerOpen(false)}
      onScanSuccess={handleScanSuccess}
    />
    </>
  );
}
