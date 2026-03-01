"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface RiwayatItem {
  id: number;
  saldo: number;
  pengeluaran_harian: number;
  deskripsi?: string; 
  kategori_ai: string;
  sisa_hari: string;
  zona: string;
  waktu_input: string;
  pesan: string;
}

interface ChartData {
  name: string;
  value: number;
}

export default function Riwayat() {
  const [riwayat, setRiwayat] = useState<RiwayatItem[]>([]);
  const [totalPengeluaran, setTotalPengeluaran] = useState<number>(0);
  const [dataGrafik, setDataGrafik] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Toast Notification
  const [toast, setToast] = useState<{ msg: string; type: "error" | "success" } | null>(null);
  
  const router = useRouter();

  // Warna aesthetic buat Donut Chart (Dark Mode Friendly)
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  const showToast = (msg: string, type: "error" | "success") => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const fetchData = async () => {
    const email = localStorage.getItem("user_email");
    
    if (!email) {
      router.push("/login");
      return;
    }

    try {
      // Nembak ke API baru yang udah ngefilter bulan ini
      const res = await fetch(`https://isfalana-cbs-backend-api.hf.space/riwayat-bulanan?user_email=${email}`);
      const data = await res.json();
      
      if (data.status === "success") {
        setRiwayat(data.data_riwayat);
        setTotalPengeluaran(data.total_pengeluaran_bulan_ini);

        // Olah data buat Grafik: Kelompokin pengeluaran berdasarkan Kategori
        const rekapKategori: Record<string, number> = {};
        data.data_riwayat.forEach((item: RiwayatItem) => {
          const kategori = item.kategori_ai || "Lainnya";
          rekapKategori[kategori] = (rekapKategori[kategori] || 0) + item.pengeluaran_harian;
        });

        // Format data buat Recharts
        const formatGrafik = Object.keys(rekapKategori).map((key) => ({
          name: key,
          value: rekapKategori[key],
        }));
        setDataGrafik(formatGrafik);
      }
    } catch (err) {
      showToast("Gagal mengambil data dari server!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hapusRiwayat = async (id: number) => {
    const email = localStorage.getItem("user_email");
    if(!confirm("Yakin mau hapus histori pengeluaran ini?")) return;
    
    try {
      const res = await fetch(`https://isfalana-cbs-backend-api.hf.space/hapus-riwayat/${id}?user_email=${email}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Histori berhasil dihapus!", "success");
        fetchData(); 
      } else {
        showToast("Gagal menghapus data.", "error");
      }
    } catch (err) {
      showToast("Server error saat menghapus!", "error");
    }
  }

  const getBadgeZona = (zona: string) => {
    if (zona === "black") return "bg-red-500/10 text-red-400 border-red-500/30";
    if (zona === "red") return "bg-orange-500/10 text-orange-400 border-orange-500/30";
    return "bg-green-500/10 text-green-400 border-green-500/30";
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

      <div className="z-10 max-w-3xl w-full">
        
        {/* === NAVBAR SIMPLE === */}
        <div className="flex justify-center p-1.5 bg-slate-900/80 border border-slate-800 rounded-full mb-10 shadow-lg mx-auto w-fit">
          <Link href="/" className="px-8 py-2.5 hover:bg-slate-800 rounded-full font-bold text-slate-400 hover:text-slate-200 transition-all">
            🏠 Home
          </Link>
          <Link href="/riwayat" className="px-8 py-2.5 bg-blue-600 rounded-full font-bold text-white shadow-lg shadow-blue-500/30 transition-all">
            📂 Riwayat
          </Link>
        </div>

        <h1 className="text-3xl font-extrabold mb-8 tracking-tight text-white">
          Dashboard <span className="text-blue-400">Keuangan</span>
        </h1>

        {/* BAGIAN VISUALISASI CASHFLOW BULAN INI */}
        <div className="bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-800 mb-8 shadow-xl">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-300">
            📊 <span className="bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">Cashflow Bulan Ini</span>
          </h2>
          
          {loading ? (
            <div className="animate-pulse h-64 bg-slate-800 rounded-xl"></div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Box Total Pengeluaran */}
              <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800/80 w-full md:w-1/2 text-center shadow-inner">
                <p className="text-sm text-slate-500 uppercase font-semibold tracking-wider mb-2">Total</p>
                <div className="text-3xl md:text-4xl font-black text-red-400 drop-shadow-md">
                  <span className="text-slate-500 text-lg mr-1">Rp</span>
                  {totalPengeluaran.toLocaleString("id-ID")}
                </div>
              </div>

              {/* Grafik Donat Recharts */}
              {dataGrafik.length > 0 ? (
                <div className="w-full md:w-1/2 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataGrafik}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {dataGrafik.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => `Rp ${Number(value).toLocaleString("id-ID")}`}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                        itemStyle={{ color: '#cbd5e1' }}
                      />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="w-full md:w-1/2 flex items-center justify-center h-64">
                  <p className="text-slate-500 italic text-sm">Belum ada data.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BAGIAN TABEL RIWAYAT */}
        <div className="bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-300">
            📂 <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">Riwayat Transaksi</span>
          </h2>
          
          {loading ? (
             <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-800/50 rounded-2xl animate-pulse"></div>)}
             </div>
          ) : riwayat.length === 0 ? (
            <div className="text-center py-10 bg-slate-950/30 rounded-2xl border border-slate-800 border-dashed">
              <p className="text-slate-500 font-medium">Belum ada data transaksi bulan ini.</p>
              <p className="text-slate-600 text-sm mt-1">Mulai catat pengeluaran anda!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {riwayat.map((item) => (
                <div key={item.id} className="group relative flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-950/50 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-sm hover:shadow-md">
                  
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] md:text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-md uppercase font-bold tracking-wider">
                          {item.kategori_ai}
                        </span>
                        <span className={`text-[10px] md:text-xs border px-2.5 py-1 rounded-md uppercase font-bold tracking-wider ${getBadgeZona(item.zona)}`}>
                          {item.zona} Zone
                        </span>
                      </div>
                      <span className="text-xs font-medium text-slate-500">
                        {new Date(item.waktu_input).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    
                    {/* Munculin deskripsi biar jelas buat apa pengeluarannya */}
                    {item.deskripsi && (
                      <p className="text-white font-bold mb-2 capitalize">{item.deskripsi}</p>
                    )}

                    <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3 mb-1">
                      <div className="text-sm text-slate-400 font-medium">
                        Pengeluaran: <span className="text-red-400 font-bold tracking-tight">Rp {item.pengeluaran_harian?.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="hidden md:block text-slate-700">•</div>
                      <div className="text-sm text-slate-500">
                        Uang Saya: <span className="text-slate-300">Rp {item.saldo.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-500 mt-2 italic border-l-2 border-slate-800 pl-2">
                      Sisa bertahan: {item.sisa_hari} hari
                    </div>
                  </div>

                  <button 
                    onClick={() => hapusRiwayat(item.id)}
                    className="mt-4 md:mt-0 md:ml-6 w-full md:w-auto text-red-400 hover:text-white text-xs font-bold border border-red-500/30 bg-red-500/10 hover:bg-red-500 px-4 py-2.5 rounded-xl transition-all duration-300 flex justify-center items-center"
                    title="Hapus Transaksi"
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