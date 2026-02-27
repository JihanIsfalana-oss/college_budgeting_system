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

  const hitungDanSimpan = async () => {
    const email = localStorage.getItem("user_email");
    
    if (!deskripsi || !saldo || !pengeluaran) {
      alert("Isi semua data dulu bos!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/cek-survival-otomatis?user_email=${email}&saldo=${saldo}&pengeluaran=${pengeluaran}&deskripsi=${deskripsi}`,
        { method: "POST" }
      );
      const data = await res.json();
      setHasil(data);
    } catch (error) {
      alert("Server Backend Mati/Error!");
    }
    setLoading(false);
  };

  const getWarnaZona = (zona: string) => {
    if (zona === "black") return "bg-black border-red-600 text-red-500 animate-pulse";
    if (zona === "red") return "bg-red-900/50 border-red-500 text-white";
    return "bg-green-900/50 border-green-500 text-white";
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-950 text-white font-mono">
      <div className="z-10 max-w-xl w-full">
        
        {/* === TOP BAR === */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-sm text-gray-400">
            👋 Halo, <span className="font-bold text-white">{userNama}</span>
          </div>
          <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 border border-red-900/50 px-3 py-1 rounded">
            Keluar
          </button>
        </div>

        {/* === NAVBAR SIMPLE === */}
        <div className="flex justify-center space-x-4 mb-10">
          <Link href="/" className="px-6 py-2 bg-blue-600 rounded-full font-bold shadow-lg shadow-blue-500/30">
            🏠 Home
          </Link>
          <Link href="/riwayat" className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-full font-bold text-gray-400 transition-colors">
            📂 Riwayat & Statistik
          </Link>
        </div>

        <h1 className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          💸 College'$ Budgeting System
        </h1>
        
        {/* === BAGIAN INPUT === */}
        <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-gray-400">Deskripsi</label>
              <input
                type="text"
                className="w-full p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-purple-500 text-lg"
                placeholder="Misal: Print Kartu..."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-gray-400">Uang Anda (Rp)</label>
                <input
                  type="number"
                  className="w-full p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 text-lg"
                  value={saldo}
                  onChange={(e) => setSaldo(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-2 text-gray-400">Pengeluaran (Rp)</label>
                <input
                  type="number"
                  className="w-full p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 text-lg"
                  value={pengeluaran}
                  onChange={(e) => setPengeluaran(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={hitungDanSimpan}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-4 rounded-lg transition-all transform active:scale-95"
            >
              {loading ? "Sedang memproses..." : "Cek Cashflow Anda"}
            </button>
          </div>

          {/* === BAGIAN HASIL (AUTO-SAVE) === */}
          {hasil && (
            <div className={`mt-8 p-6 rounded-xl border-2 ${getWarnaZona(hasil.zona)} shadow-lg transition-all`}>
              <div className="mb-4 inline-block bg-purple-900/60 border border-purple-400 text-purple-200 px-3 py-1 rounded-full text-xs font-bold uppercase">
                Kategori: {hasil.kategori_ai}
              </div>
              
              <div className="text-3xl font-bold">
                {hasil.sisa_hari} <span className="text-lg font-normal"> Hari</span>
              </div>
              <div className="mt-2 text-sm italic">{hasil.pesan}</div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}