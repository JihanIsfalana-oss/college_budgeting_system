"use client";
import { useState, useEffect } from "react";

interface RiwayatItem {
  id: number;
  saldo: number;
  pengeluaran_harian: number;
  sisa_hari: string;
  pesan: string;
  zona: string;
}

export default function Home() {
  const [saldo, setSaldo] = useState("");
  const [pengeluaran, setPengeluaran] = useState("");
  const [hasil, setHasil] = useState<any>(null);

  const [riwayat, setRiwayat] = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 1. Ambil Data Riwayat pas Halaman Dibuka (Auto-Load)
  const fetchRiwayat = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/riwayat");
      const data = await res.json();
      setRiwayat(data);
    } catch (err) {
      console.error("Server Error!", err);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, []);

  // 2. Fungsi Hitung (Ke C++)
  const hitungSurvival = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/cek-survival?saldo=${saldo}&pengeluaran=${pengeluaran}`
      );
      const data = await res.json();
      setHasil(data);
    } catch (error) {
      alert("Server Sedang Maintenance!.");
    }
    setLoading(false);
  };

  // 3. Fungsi Simpan (Ke SQLite)
  const simpanKeDatabase = async () => {
    if (!hasil) return;
    setSaving(true);
    try {
      // Kirim data ke endpoint POST
      await fetch(
        `http://127.0.0.1:8000/simpan-riwayat?saldo=${hasil.saldo}&pengeluaran=${hasil.pengeluaran_harian}&sisa_hari=${hasil.sisa_hari_bertahan}&pesan=${hasil.pesan}&zona=${hasil.zona}`,
        { method: "POST" }
      );
      // Refresh list riwayat setelah simpan
      await fetchRiwayat(); 
      alert("Data berhasil diamankan ke Database!");
    } catch (error) {
      alert("Gagal Menyimpan data.");
    }
    setSaving(false);
  };

  // 4. Fungsi Hapus
  const hapusRiwayat = async (id: number) => {
    if(!confirm("Yakin mau hapus?")) return;
    try {
      await fetch(`http://127.0.0.1:8000/hapus-riwayat/${id}`, { method: "DELETE" });
      fetchRiwayat();
    } catch (err) {
      alert("Gagal hapus.");
    }
  }

  const getWarnaZona = (zona: string) => {
    if (zona === "black") return "bg-black border-red-600 text-red-500 animate-pulse";
    if (zona === "red") return "bg-red-900/50 border-red-500 text-white";
    return "bg-green-900/50 border-green-500 text-white";
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-950 text-white font-mono">
      <div className="z-10 max-w-xl w-full">
        <h1 className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          💸 Survival Calculator
        </h1>
        
        {/* === BAGIAN INPUT === */}
        <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-gray-400">Saldo (Rp)</label>
              <input
                type="number"
                className="w-full p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 text-lg transition-all"
                placeholder="Saldomu..."
                value={saldo}
                onChange={(e) => setSaldo(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block mb-2 text-gray-400">Pengeluaran (Rp)</label>
              <input
                type="number"
                className="w-full p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 text-lg transition-all"
                placeholder="Pengeluaran..."
                value={pengeluaran}
                onChange={(e) => setPengeluaran(e.target.value)}
              />
            </div>

            <button
              onClick={hitungSurvival}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-4 rounded-lg transition-all transform active:scale-95"
            >
              {loading ? "Menghitung..." : "🔮 Cek Cashflow Saya"}
            </button>
          </div>

          {/* === BAGIAN HASIL & SAVE === */}
          {hasil && (
            <div className={`mt-8 p-6 rounded-xl border-2 ${getWarnaZona(hasil.zona)} shadow-lg transition-all duration-500`}>
              <h2 className="text-sm uppercase tracking-widest opacity-70 mb-1">Hasil Analisa:</h2>
              
              <div className="text-3xl font-bold">
                {hasil.sisa_hari_bertahan} <span className="text-lg font-normal">Hari</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10 italic text-lg font-semibold">
                "{hasil.pesan}"
              </div>

              {/* Tombol Simpan Baru */}
              <button 
                onClick={simpanKeDatabase}
                disabled={saving}
                className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-sm transition-colors font-bold"
              >
                {saving ? "Menyimpan..." : "💾 Simpan ke Database"}
              </button>
            </div>
          )}
        </div>

        {/* === BAGIAN RIWAYAT (DATABASE LIST) === */}
        <div className="w-full">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2">📂 Riwayat Keuangan Anda</h2>
          
          {riwayat.length === 0 ? (
            <p className="text-gray-500 text-center py-4 text-sm">Belum ada data tersimpan.</p>
          ) : (
            <div className="space-y-3">
              {riwayat.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-gray-900 p-4 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">
                      Saldo: Rp{item.saldo.toLocaleString()} | Keluar: Rp{item.pengeluaran_harian?.toLocaleString()}
                    </div>
                    <div className={`font-bold text-sm ${item.zona === 'black' ? 'text-red-500' : item.zona === 'red' ? 'text-orange-400' : 'text-green-400'}`}>
                      {item.sisa_hari} Hari - {item.zona.toUpperCase()}
                    </div>
                  </div>
                  <button 
                    onClick={() => hapusRiwayat(item.id)}
                    className="text-red-500 hover:text-red-400 text-xs border border-red-900 bg-red-900/20 px-3 py-1 rounded transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}