"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.error) {
        alert("❌ " + data.error);
      } else {
        localStorage.setItem("user_email", data.user_email);
        localStorage.setItem("user_nama", data.user_nama);
        alert("✅ " + data.message);
        router.push("/"); 
      }
    } catch (err) {
      alert("Server Error!");
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-950 text-white font-mono">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800">
        <h1 className="text-3xl font-extrabold text-center mb-2 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Login Page
        </h1>
        <p className="text-center text-gray-400 mb-8 text-sm">College Budgeting System</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block mb-2 text-gray-400">Email</label>
            <input
              type="email"
              required
              className="w-full p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 transition-colors"
              placeholder="Email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <label className="block mb-2 text-gray-400">Password</label>
            <input
              type={showPassword ? "text" : "password"} 
              required
              className="w-full p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 transition-colors pr-12"
              placeholder="Password Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {/* FITUR TAHAN MATA */}
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
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-lg transition-transform active:scale-95"
          >
            {loading ? "Mengecek..." : "Masuk"}
          </button>
        </form>

        <div className="my-6 flex items-center justify-center space-x-2">
          <div className="h-px bg-gray-700 w-1/3"></div>
          <span className="text-gray-500 text-xs"> LOGIN VIA</span>
          <div className="h-px bg-gray-700 w-1/3"></div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            type="button"
            onClick={() => signIn("google")} 
            className="p-3 bg-red-900/30 text-red-500 border border-red-900/50 rounded-lg hover:bg-red-900/50 transition-colors text-sm font-bold"
          >
            G Google
          </button>
          <button className="p-3 bg-blue-900/30 text-blue-500 border border-blue-900/50 rounded-lg hover:bg-blue-900/50 transition-colors text-sm font-bold">
            f Facebook
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm">
          Belum punya akun?{" "}
          <Link href="/register" className="text-blue-400 hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </main>
  );
}