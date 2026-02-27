"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, email, password })
      });
      const data = await res.json();
      
      if (data.error) {
        alert("❌ " + data.error);
      } else {
        alert("✅ " + data.message);
        router.push("/login"); // Lempar ke halaman login
      }
    } catch (err) {
      alert("Server Error!");
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-950 text-white font-mono">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800">
        <h1 className="text-3xl font-extrabold text-center mb-2 text-purple-400">
          Buat Akun Baru
        </h1>
        <p className="text-center text-gray-400 mb-8 text-sm">Track Your Budget To Stay Financially Healthy!</p>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block mb-2 text-gray-400">Nama Panggilan</label>
            <input
              type="text"
              required
              className="w-full p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-purple-500"
              placeholder="Nama yang akan muncul di dashboard"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-400">Email</label>
            <input
              type="email"
              required
              className="w-full p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-purple-500"
              placeholder="Email anda (untuk login)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <label className="block mb-2 text-gray-400">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-purple-500 pr-12"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
              onMouseLeave={() => setShowPassword(false)}
              className="absolute right-4 top-11 text-xl opacity-60 hover:opacity-100 cursor-pointer"
            >
              {showPassword ? "😲" : "😑"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-lg transition-transform active:scale-95"
          >
            {loading ? "Memproses..." : "Daftar Sekarang"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-400 text-sm">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-purple-400 hover:underline">
            Login di sini
          </Link>
        </p>
      </div>
    </main>
  );
}