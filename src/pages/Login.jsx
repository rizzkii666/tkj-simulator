import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { playSound } from "../utils/audio";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    playSound("click");

    try {
      const res = await axios.post("http://localhost:5000/login", { email, password });
      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        playSound("success");
        if (res.data.user.role === "teacher") {
          navigate("/teacher-dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      playSound("error");
      setErrorMsg(err.response?.data?.message || "Koneksi ke server gagal. Pastikan backend server menyala.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
      {/* Light Clean Network Pattern Background */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px), linear-gradient(to right, #f1f5f9 1.5px, transparent 1.5px), linear-gradient(to bottom, #f1f5f9 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px, 48px 48px, 48px 48px"
        }}
      />
      {/* Soft background glow circles */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[350px] h-[350px] bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[350px] h-[350px] bg-purple-200/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-[420px] bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200 animate-fade-in">
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-600/25 mb-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">SIMULASI TKJ</h1>
          <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mt-1">Platform Belajar & Ujian SMK</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Email Address</label>
            <input
              type="email"
              placeholder="nama@sekolah.sch.id"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 font-medium transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 font-medium transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-650 text-xs p-3 rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-550 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-md shadow-indigo-600/15 text-sm"
          >
            {loading ? "Menghubungkan..." : "Masuk ke Kelas"}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-650 space-y-2">
          <p className="font-bold text-slate-800 mb-1">🚀 Akun Demo Cepat:</p>
          <div className="flex justify-between font-mono bg-white border border-slate-100 rounded-lg p-1.5 shadow-sm">
            <span className="font-semibold text-indigo-650">Siswa: demo@tkj.sch.id</span>
            <span className="text-slate-400">siswa123</span>
          </div>
          <div className="flex justify-between font-mono bg-white border border-slate-100 rounded-lg p-1.5 shadow-sm">
            <span className="font-semibold text-purple-650">Guru: guru@tkj.sch.id</span>
            <span className="text-slate-400">guru123</span>
          </div>
          <div className="flex justify-between gap-2 mt-2">
            <button
              onClick={() => { playSound("click"); setEmail("demo@tkj.sch.id"); setPassword("siswa123"); }}
              className="flex-1 bg-white hover:bg-slate-100 border border-slate-200 py-1 rounded text-[10px] font-bold text-slate-700 transition"
            >
              Autofill Siswa
            </button>
            <button
              onClick={() => { playSound("click"); setEmail("guru@tkj.sch.id"); setPassword("guru123"); }}
              className="flex-1 bg-white hover:bg-slate-100 border border-slate-200 py-1 rounded text-[10px] font-bold text-slate-700 transition"
            >
              Autofill Guru
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Belum punya akun?
          <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold ml-1.5">
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}