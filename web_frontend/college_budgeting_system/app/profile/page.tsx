"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    pekerjaan: "",
    umur: "",
    tanggal_lahir: "",
  });
  const [terakhirGantiNama, setTerakhirGantiNama] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "error" | "success" } | null>(null);
  
  const router = useRouter();

  const showToast = (msg: string, type: "error" | "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const email = localStorage.getItem("user_email");
    if (!email) {
      router.push("/login");
      return;
    }

    fetch(`https://isfalana-cbs-backend-api.hf.space/profile?user_email=${email}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setFormData({
            nama: data.nama || "",
            email: data.email || "",
            pekerjaan: data.pekerjaan || "Mahasiswa",
            umur: data.umur || "",
            tanggal_lahir: data.tanggal_lahir || "",
          });
          setTerakhirGantiNama(data.terakhir_ganti_nama);
        }
      })
      .catch(() => showToast("Gagal mengambil data profil", "error"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch("https://isfalana-cbs-backend-api.hf.space/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: formData.email,
          nama: formData.nama,
          pekerjaan: formData.pekerjaan,
          umur: formData.umur ? parseInt(formData.umur as string) : null,
          tanggal_lahir: formData.tanggal_lahir,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        showToast(data.message, "success");
        setTerakhirGantiNama(new Date().toISOString()); 
      } else {
        showToast(data.error, "error");
      }
    } catch (err) {
      showToast("Server error!", "error");
    } finally {
      setSaving(false);
    }
  };

  const hitungCooldown = () => {
    if (!terakhirGantiNama) return 0;
    const terakhir = new Date(terakhirGantiNama);
    const sekarang = new Date();
    const selisihHari = Math.floor((sekarang.getTime() - terakhir.getTime()) / (1000 * 3600 * 24));
    return selisihHari < 30 ? 30 - selisihHari : 0;
  };

  const cooldown = hitungCooldown();

  return (
    <main className="flex min-h-screen flex-col items-center py-10 px-4 bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      
      {toast && (
        <div className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-2xl border flex items-center gap-3 animate-bounce ${
          toast.type === "error" ? "bg-red-950/90 border-red-500/50 text-red-200" : "bg-green-950/90 border-green-500/50 text-green-200"
        }`}>
          <span>{toast.type === "error" ? "⚠️" : "✅"}</span>
          <span className="font-bold text-sm">{toast.msg}</span>
        </div>
      )}

      <div className="z-10 max-w-2xl w-full">
        {/* === NAVBAR TERBARU === */}
        <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-full mb-10 shadow-lg mx-auto w-fit">
          <Link href="/" className="px-5 py-2 hover:bg-slate-800 rounded-full font-bold text-slate-400 transition-all text-sm md:text-base">
            🏠 Home
          </Link>
          <Link href="/riwayat" className="px-5 py-2 hover:bg-slate-800 rounded-full font-bold text-slate-400 transition-all text-sm md:text-base">
            📂 Riwayat
          </Link>
          <Link href="/profile" className="px-5 py-2 bg-blue-900 rounded-full font-bold text-white shadow-lg shadow-blue-500/30 transition-all text-sm md:text-base">
            👤 Profil
          </Link>
          <Link href="/tabungan" className="px-5 py-2 hover:bg-slate-800 rounded-full font-bold text-slate-400 transition-all text-sm md:text-base">
            🎯 Tabungan
          </Link>
        </div>

        <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 shadow-xl">
          <h1 className="text-3xl font-extrabold mb-6 text-center">
            Pengaturan <span className="text-blue-400">Profil</span>
          </h1>

          {loading ? (
             <div className="animate-pulse space-y-4">
               {[1,2,3,4].map(i => <div key={i} className="h-12 bg-slate-800/50 rounded-xl"></div>)}
             </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-5">
              
              {/* EMAIL (Read Only) */}
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-1">Email</label>
                <input type="email" value={formData.email} disabled className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed" />
              </div>

              {/* NAMA LENGKAP DENGAN COOLDOWN */}
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1 flex justify-between">
                  Nama Panggilan
                  {cooldown > 0 && <span className="text-red-400 text-xs flex items-center">🔒 Terkunci ({cooldown} hari lagi)</span>}
                </label>
                <input 
                  type="text" name="nama" value={formData.nama} onChange={handleChange} 
                  disabled={cooldown > 0}
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white focus:ring-2 outline-none transition-all ${cooldown > 0 ? 'border-red-900/50 cursor-not-allowed text-slate-500' : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'}`} 
                />
              </div>

              {/* PEKERJAAN & UMUR */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-1">Pekerjaan</label>
                  <input type="text" name="pekerjaan" value={formData.pekerjaan} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-1">Umur</label>
                  <input type="number" name="umur" value={formData.umur} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
                </div>
              </div>

              {/* TANGGAL LAHIR */}
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-1">Tanggal Lahir</label>
                <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none [color-scheme:dark]" />
              </div>

              <button type="submit" disabled={saving} className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50">
                {saving ? "⏳ Menyimpan..." : "💾 Simpan Perubahan"}
              </button>

            </form>
          )}
        </div>
      </div>
    </main>
  );
}