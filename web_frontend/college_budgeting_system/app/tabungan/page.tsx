"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TargetItem {
  id: number;
  tujuan: string;
  nominal_target: number;
  nominal_terkumpul: number;
  status: string;
}

export default function Tabungan() {
  const [targets, setTargets] = useState<TargetItem[]>([]);
  const [formData, setFormData] = useState({ tujuan: "", nominal_target: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "error" | "success" } | null>(null);
  
  const router = useRouter();

  const showToast = (msg: string, type: "error" | "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTargets = async () => {
    const email = localStorage.getItem("user_email");
    if (!email) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`https://isfalana-cbs-backend-api.hf.space/target-tabungan?user_email=${email}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTargets(data);
      }
    } catch (err) {
      showToast("Gagal mengambil data tabungan", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tujuan || !formData.nominal_target) {
      showToast("Isi tujuan dan nominalnya dahulu!", "error");
      return;
    }

    setSaving(true);
    const email = localStorage.getItem("user_email");
    
    try {
      const res = await fetch("https://isfalana-cbs-backend-api.hf.space/target-tabungan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: email,
          tujuan: formData.tujuan,
          nominal_target: parseFloat(formData.nominal_target),
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        showToast(data.message, "success");
        setFormData({ tujuan: "", nominal_target: "" }); 
        fetchTargets(); 
      } else {
        showToast("Gagal membuat target", "error");
      }
    } catch (err) {
      showToast("Server error!", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleIsiTabungan = async (id: number) => {
    const nominalStr = window.prompt("Berapa nominal yang mau ditabung hari ini? (Misal: 50000)");
    if (!nominalStr) return; 
    const nominal = parseFloat(nominalStr);
    if (isNaN(nominal) || nominal <= 0) {
      showToast("Nominal tidak valid!", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`https://isfalana-cbs-backend-api.hf.space/target-tabungan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nominal_tambah: nominal }),
      });
      
      const data = await res.json();
      if (data.status === "success") {
        showToast(data.message, "success");
        fetchTargets(); 
      } else {
        showToast(data.error || "Gagal menabung", "error");
      }
    } catch (err) {
      showToast("Server error!", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center py-10 px-4 bg-slate-950 text-slate-200 font-sans selection:bg-green-500/30">
      
      {toast && (
        <div className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl border flex items-center gap-3 animate-bounce ${
          toast.type === "error" ? "bg-red-950/90 border-red-500/50 text-red-200" : "bg-green-950/90 border-green-500/50 text-green-200"
        }`}>
          <span>{toast.type === "error" ? "⚠️" : "✅"}</span>
          <span className="font-bold text-sm">{toast.msg}</span>
        </div>
      )}

      <div className="z-10 max-w-3xl w-full">
        {/* NAVBAR */}
        <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-full mb-10 shadow-lg mx-auto w-fit">
          <Link href="/" className="px-5 py-2 hover:bg-slate-800 rounded-full font-bold text-slate-400 transition-all text-sm md:text-base">🏠 Home</Link>
          <Link href="/riwayat" className="px-5 py-2 hover:bg-slate-800 rounded-full font-bold text-slate-400 transition-all text-sm md:text-base">📂 Riwayat</Link>
          <Link href="/profile" className="px-5 py-2 hover:bg-slate-800 rounded-full font-bold text-slate-400 transition-all text-sm md:text-base">👤 Profil</Link>
          <Link href="/tabungan" className="px-5 py-2 bg-green-600 rounded-full font-bold text-white shadow-lg shadow-green-500/30 transition-all text-sm md:text-base">🎯 Tabungan</Link>
        </div>

        <h1 className="text-3xl font-extrabold mb-8 tracking-tight text-white text-center">
          Target <span className="text-green-400">Anda</span>
        </h1>

        {/* FORM BIKIN TARGET BARU */}
        <div className="bg-slate-900/60 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl mb-10">
          <h2 className="text-lg font-bold mb-4 text-slate-300">✨ Buat Target Baru</h2>
          <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-bold text-slate-400 mb-1">Tujuan (Misal: Beli Laptop)</label>
              <input 
                type="text" name="tujuan" value={formData.tujuan} onChange={handleChange} 
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none" 
                placeholder="Nabung buat apa nih?"
              />
            </div>
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-bold text-slate-400 mb-1">Nominal (Rp)</label>
              <input 
                type="number" name="nominal_target" value={formData.nominal_target} onChange={handleChange} 
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none" 
                placeholder="Contoh: 500000"
              />
            </div>
            <button type="submit" disabled={saving} className="w-full md:w-auto bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all disabled:opacity-50">
              {saving ? "⏳" : "Buat Target"}
            </button>
          </form>
        </div>

        {/* DAFTAR TARGET TABUNGAN */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold mb-4 text-slate-300 flex items-center gap-2">
            🎯 <span className="bg-gradient-to-r from-green-400 to-emerald-400 text-transparent bg-clip-text">Target Berjalan</span>
          </h2>
          
          {loading ? (
             <div className="animate-pulse space-y-4">
               {[1,2].map(i => <div key={i} className="h-32 bg-slate-800/50 rounded-2xl"></div>)}
             </div>
          ) : targets.length === 0 ? (
            <div className="text-center py-10 bg-slate-950/30 rounded-2xl border border-slate-800 border-dashed">
              <p className="text-slate-500 font-medium">Belum ada target tabungan nih.</p>
              <p className="text-slate-600 text-sm mt-1">Yuk, mulai rajin nabung dari sekarang!</p>
            </div>
          ) : (
            targets.map((item) => {
              const persentase = item.nominal_target > 0 ? Math.min((item.nominal_terkumpul / item.nominal_target) * 100, 100).toFixed(1) : 0;
              const isLunas = item.nominal_terkumpul >= item.nominal_target;

              return (
                <div key={item.id} className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-md relative overflow-hidden">
                  {isLunas && <div className="absolute inset-0 bg-green-500/5 z-0 pointer-events-none"></div>}
                  
                  <div className="relative z-10 flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {item.tujuan} {isLunas && "🏆"}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">
                        Terkumpul: <span className="text-green-400 font-bold">Rp {item.nominal_terkumpul.toLocaleString("id-ID")}</span> / Rp {item.nominal_target.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${isLunas ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                      {isLunas ? 'Tercapai!' : 'Berjalan'}
                    </div>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="w-full bg-slate-800 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${isLunas ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`} 
                      style={{ width: `${persentase}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs font-bold text-slate-500">{persentase}%</div>

                  {!isLunas && (
                    <button 
                      onClick={() => handleIsiTabungan(item.id)}
                      className="mt-4 w-full md:w-auto bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      + Isi Tabungan
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}