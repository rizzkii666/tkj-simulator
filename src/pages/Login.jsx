import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { playSound } from "../utils/audio";
import { API_BASE_URL } from "../config";

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
      const res = await axios.post(`${API_BASE_URL}/login`, { email, password });
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 auth-bg">
      {/* Animated background orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[400px] h-[400px] bg-indigo-300/30 rounded-full blur-[120px] pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[400px] h-[400px] bg-violet-300/30 rounded-full blur-[120px] pointer-events-none" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-200/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.35] pointer-events-none auth-grid-pattern" />

      <div className="relative w-full max-w-[420px] animate-slide-up">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[28px] p-7 md:p-9 shadow-2xl shadow-indigo-500/[0.07]">
          {/* Header Logo */}
          <div className="flex flex-col items-center mb-7">
            <div className="relative mb-4">
              <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-4 rounded-[20px] shadow-xl shadow-indigo-500/30">
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-[3px] border-white shadow-sm" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-gradient">SIMULASI TKJ</h1>
            <p className="text-xs text-slate-400 font-semibold mt-1 tracking-wider">Platform Belajar & Ujian SMK</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="nama@sekolah.sch.id"
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white text-slate-800 font-medium transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white text-slate-800 font-medium transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200/80 text-red-600 text-xs p-3.5 rounded-2xl font-semibold flex items-center space-x-2">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 text-sm active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  <span>Menghubungkan...</span>
                </span>
              ) : "Masuk ke Kelas →"}
            </button>
          </form>

          {/* Demo Credentials Box */}
          <div className="mt-6 p-4 bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-slate-200/60 rounded-2xl text-[11px] space-y-2.5">
            <p className="font-bold text-slate-700 flex items-center space-x-1.5">
              <span>🚀</span>
              <span>Akun Demo Cepat:</span>
            </p>
            <div className="flex justify-between items-center font-mono bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-sm">
              <span className="font-semibold text-indigo-600">demo@tkj.sch.id</span>
              <span className="text-slate-400 text-[10px]">siswa123</span>
            </div>
            <div className="flex justify-between items-center font-mono bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-sm">
              <span className="font-semibold text-purple-600">guru@tkj.sch.id</span>
              <span className="text-slate-400 text-[10px]">guru123</span>
            </div>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => { playSound("click"); setEmail("demo@tkj.sch.id"); setPassword("siswa123"); }}
                className="flex-1 bg-white hover:bg-indigo-50 border border-slate-200/80 py-2 rounded-xl text-[10px] font-bold text-slate-600 transition-all active:scale-95"
              >
                👤 Autofill Siswa
              </button>
              <button
                onClick={() => { playSound("click"); setEmail("guru@tkj.sch.id"); setPassword("guru123"); }}
                className="flex-1 bg-white hover:bg-purple-50 border border-slate-200/80 py-2 rounded-xl text-[10px] font-bold text-slate-600 transition-all active:scale-95"
              >
                🎓 Autofill Guru
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Belum punya akun?
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold ml-1.5">
              Daftar Sekarang →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}