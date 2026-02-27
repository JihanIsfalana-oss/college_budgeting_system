"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: "error" | "success" } | null>(null);
  
  const router = useRouter();

  const showToast = (msg: string, type: "error" | "success") => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("https://isfalana-cbs-backend-api.hf.space/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.error) {
        showToast(data.error, "error");
      } else {
        localStorage.setItem("user_email", data.user_email);
        localStorage.setItem("user_nama", data.user_nama);
        showToast(data.message, "success");
        setTimeout(() => {
          router.push("/");
        }, 1000); 
      }
    } catch (err) {
      showToast("Server Error!", "error");
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-950 text-slate-200 font-sans relative selection:bg-purple-500/30">
      
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

      <div className="w-full max-w-md bg-slate-900/60 p-8 rounded-3xl shadow-2xl border border-slate-800">
        <h1 className="text-4xl font-extrabold text-center mb-2 tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            Login CBS
          </span>
        </h1>
        <p className="text-center text-slate-400 mb-8 font-medium">Track Your Money to Survive College Life</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-400">Email</label>
            <input
              type="email"
              required
              className="w-full p-4 rounded-xl bg-slate-950 text-white border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-base placeholder-slate-600"
              placeholder="Masukkan email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <label className="block mb-2 text-sm font-semibold text-slate-400">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full p-4 rounded-xl bg-slate-950 text-white border border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-base placeholder-slate-600 pr-12"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
              onMouseLeave={() => setShowPassword(false)}
              className="absolute right-4 top-10 text-xl opacity-50 hover:opacity-100 cursor-pointer transition-opacity"
            >
              {showPassword ? "😲" : "😑"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Mengecek Akses..." : "Masuk 🚀"}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-400 text-sm font-medium">
          Belum punya akun?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
            Daftar di sini
          </Link>
        </p>
      </div>
    </main>
  );
}