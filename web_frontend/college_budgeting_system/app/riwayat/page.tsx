"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RiwayatItem {
  id: number;
  saldo: number;
  pengeluaran_harian: number;
  kategori_ai: string;
  sisa_hari: string;
  zona: string;
  waktu_input: string;
}

interface StatItem {
  kategori: string;
  total: number;
}

export default function Riwayat() {
  const [riwayat, setRiwayat] = useState<RiwayatItem[]>([]);
  const [statistik, setStatistik] = useState<StatItem[]>([]);
  const router = useRouter();

  const fetchData = async () => {
    const email = localStorage.getItem("user_email");

    if (!email) {
      router.push("/login");
      return;
    }

    try {
      const resTable = await fetch(`http://127.0.0.1:8000/riwayat?user_email=${email}`);
      const dataTable = await resTable.json();

      if (Array.isArray(dataTable)) {
        setRiwayat(dataTable);
      }

      const resStat = await fetch(`http://127.0.0.1:8000/statistik?user_email=${email}`);
      const dataStat = await resStat.json();
      if (Array.isArray(dataStat)) {
        setStatistik(dataStat);
      }
    } catch (err) {
      console.error("Gagal ambil data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hapusRiwayat = async (id: number) => {
    const email = localStorage.getItem("user_email");
    if(!confirm("Yakin mau hapus data ini selamanya?")) return;
    try {
      await fetch(`http://127.0.0.1:8000/hapus-riwayat/${id}?user_email=${email}`, { method: "DELETE" });
      fetchData(); 
    } catch (err) {
      alert("Gagal hapus.");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-950 text-white font-mono">
      <div className="z-10 max-w-3xl w-full">
        
        {/* NAVBAR */}
        <div className="flex justify-center space-x-4 mb-10">
          <Link href="/" className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-full font-bold text-gray-400 transition-colors">
            🏠 Home
          </Link>
          <Link href="/riwayat" className="px-6 py-2 bg-blue-600 rounded-full font-bold shadow-lg shadow-blue-500/30">
            📂 Riwayat & Statistik
          </Link>
        </div>

        {/* BAGIAN STATISTIK */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2 text-purple-400">📊 Total Pengeluaran</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {statistik.map((stat, idx) => (
              <div key={idx} className="bg-gray-800 p-4 rounded-lg border border-purple-900/50">
                <div className="text-xs text-gray-400 uppercase">{stat.kategori || "Lainnya"}</div>
                <div className="text-lg font-bold">Rp {stat.total.toLocaleString()}</div>
              </div>
            ))}
            {statistik.length === 0 && <p className="text-sm text-gray-500">Belum ada statistik.</p>}
          </div>
        </div>

        {/* BAGIAN TABEL RIWAYAT */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2 text-blue-400">📂 Data Cashflow Anda</h2>
          {riwayat.length === 0 ? (
            <p className="text-gray-500 text-center py-4 text-sm">Belum ada data tersimpan.</p>
          ) : (
            <div className="space-y-3">
              {riwayat.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs bg-purple-900 text-purple-200 px-2 py-0.5 rounded uppercase">{item.kategori_ai}</span>
                      <span className="text-xs text-gray-500">{new Date(item.waktu_input).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="text-sm text-gray-300">
                      Saldo: Rp{item.saldo.toLocaleString()} | Keluar: Rp{item.pengeluaran_harian?.toLocaleString()}
                    </div>
                    <div className={`font-bold text-sm ${item.zona === 'black' ? 'text-red-500' : item.zona === 'red' ? 'text-orange-400' : 'text-green-400'}`}>
                      {item.sisa_hari} Hari - {item.zona.toUpperCase()}
                    </div>
                  </div>
                  <button 
                    onClick={() => hapusRiwayat(item.id)}
                    className="ml-4 text-red-500 hover:text-red-400 text-xs border border-red-900 bg-red-900/20 px-4 py-2 rounded transition-colors"
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