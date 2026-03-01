"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [deskripsi, setDeskripsi] = useState("");
  const [saldo, setSaldo] = useState("");
  const [pengeluaran, setPengeluaran] = useState("");
  const [hasil, setHasil] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [kategoriAsli, setKategoriAsli] = useState("Makan");
  
  // State untuk Custom Alert (Toast)
  const [toast, setToast] = useState<{ msg: string; type: "error" | "success" } | null>(null);
  
  const [userNama, setUserNama] = useState("");
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("user_email");
    const nama = localStorage.getItem("user_nama");
    
    if (!email) {
      router.push("/login"); 
    } else {
      setUserNama(nama || "Anak Kos");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_nama");
    router.push("/login");
  };

  // Fungsi buat nampilin notifikasi melayang selama 3 detik
  const showToast = (msg: string, type: "error" | "success") => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const hitungDanSimpan = async () => {
    const email = localStorage.getItem("user_email");
    
    if (!deskripsi || !saldo || !pengeluaran) {
      showToast("Isi semua data dulu!", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://isfalana-cbs-backend-api.hf.space/cek-survival-otomatis?user_email=${email}&saldo=${saldo}&pengeluaran=${pengeluaran}&deskripsi=${deskripsi}&kategori_asli=${kategoriAsli}`,
        { method: "POST" }
      );
      const data = await res.json();
      setHasil(data);
      showToast("Data berhasil dianalisa!", "success");
    } catch (error) {
      showToast("Server Error!", "error");
    }
    setLoading(false);
  };

  const getWarnaZona = (zona: string) => {
    if (zona === "black") return "bg-red-950/40 border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse";
    if (zona === "red") return "bg-orange-950/40 border-orange-500/50 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.1)]";
    return "bg-green-950/40 border-green-500/50 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.1)]";
  };

  return (
    <main className="flex min-h-screen flex-col items-center py-10 px-4 bg-slate-950 text-slate-200 font-sans selection:bg-purple-500/30 relative">
      
      {/* === CUSTOM TOAST NOTIFICATION === */}
      {toast && (
        <div className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl border flex items-center gap-3 animate-bounce shadow-black/50 ${
          toast.type === "error" 
            ? "bg-red-950/90 border-red-500/50 text-red-200" 
            : "bg-green-950/90 border-green-500/50 text-green-200"
        }`}>
          <span className="text-xl">{toast.type === "error" ? "⚠️" : "✅"}</span>
          <span className="font-bold text-sm tracking-wide">{toast.msg}</span>
        </div>
      )}

      {/* === TOP BAR === */}
      <div className="z-20 w-full max-w-2xl flex justify-between items-center mb-10 bg-slate-900/80 border border-slate-800 px-6 py-4 rounded-full shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-inner">
            {userNama.charAt(0).toUpperCase()}
          </div>
          <div className="text-sm text-slate-300">
            Halo, <span className="font-bold text-white">{userNama}</span>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          className="text-xs font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/30 px-4 py-2 rounded-full transition-all duration-300"
        >
          Keluar
        </button>
      </div>

      <div className="z-10 max-w-xl w-full flex flex-col items-center">
        
        {/* === NAVBAR === */}
        <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-full mb-10 shadow-lg mx-auto w-fit">
          <Link href="/" className="px-5 py-2 bg-blue-600 rounded-full font-bold text-white shadow-lg shadow-blue-500/30 transition-all text-sm md:text-base">
            🏠 Home
          </Link>
          <Link href="/riwayat" className="px-5 py-2 hover:bg-slate-800 rounded-full font-bold text-slate-400 transition-all text-sm md:text-base">
            📂 Riwayat
          </Link>
          <Link href="/profile" className="px-5 py-2 hover:bg-slate-800 rounded-full font-bold text-slate-400 transition-all text-sm md:text-base">
            👤 Profil
          </Link>
          <Link href="/tabungan" className="px-5 py-2 hover:bg-slate-800 rounded-full font-bold text-slate-400 transition-all text-sm md:text-base">
            🎯 Tabungan
          </Link>
        </div>

        {/* === TITLE === */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-8 tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            College'$
          </span>
          <br />
          <span className="text-2xl md:text-3xl text-slate-400 font-bold mt-2 block">Budgeting System</span>
        </h1>
        
        {/* === BAGIAN INPUT === */}
        <div className="w-full bg-slate-900/60 p-6 md:p-8 rounded-3xl shadow-2xl border border-slate-800 relative">
          <div className="space-y-5 relative z-10">
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-400">Deskripsi Pengeluaran</label>
              <input
                type="text"
                className="w-full p-4 rounded-xl bg-slate-950 text-white border border-slate-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all text-base placeholder-slate-600"
                placeholder="Misal: Beli Kopi, Fotokopi..."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
              />
            </div>

            <select 
              value={kategoriAsli} 
              onChange={(e) => setKategoriAsli(e.target.value)}
              className="p-2 border border-slate-700 rounded bg-slate-950 text-white"
            >
              <option 
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
                value="Makan">Makan</option>
              <option 
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
                value="Transportasi">Transportasi</option>
              <option 
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
                value="Kebutuhan Pokok">Kebutuhan Pokok</option>
              <option 
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
                value="Hiburan">Hiburan</option>
              <option 
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
                value="Lainnya">Lainnya</option>
            </select>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-400">Uang Anda (Rp)</label>
                <input
                  type="number"
                  className="w-full p-4 rounded-xl bg-slate-950 text-white border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-base placeholder-slate-600"
                  placeholder="0"
                  value={saldo}
                  onChange={(e) => setSaldo(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-400">Pengeluaran (Rp)</label>
                <input
                  type="number"
                  className="w-full p-4 rounded-xl bg-slate-950 text-white border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-base placeholder-slate-600"
                  placeholder="0"
                  value={pengeluaran}
                  onChange={(e) => setPengeluaran(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={hitungDanSimpan}
              disabled={loading}
              className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Sedang Menganalisa...
                </span>
              ) : "Cek Cashflow Anda"}
            </button>
          </div>

          {/* === BAGIAN HASIL (AUTO-SAVE) === */}
          {hasil && (
            <div className={`mt-8 p-6 rounded-2xl border transition-all duration-500 ease-out ${getWarnaZona(hasil.zona)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="inline-block bg-slate-950/50 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-300">
                  Kategori: <span className="text-white">{hasil.kategori_ai}</span>
                </div>
              </div>
              
              <div className="text-4xl font-black tracking-tighter text-white">
                {hasil.sisa_hari} <span className="text-xl font-medium opacity-80 tracking-normal text-slate-300">Hari</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800/50 text-sm md:text-base font-medium leading-relaxed opacity-90 text-slate-200">
                "{hasil.pesan}"
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}