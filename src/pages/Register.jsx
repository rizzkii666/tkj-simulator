import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { playSound } from "../utils/audio";
import { API_BASE_URL } from "../config";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    playSound("click");

    try {
      const res = await axios.post(`${API_BASE_URL}/register`, {
        name,
        email,
        password,
        role
      });

      if (res.data.success) {
        playSound("success");
        setSuccessMsg("Registrasi berhasil! Mengalihkan ke halaman login...");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (err) {
      playSound("error");
      setErrorMsg(err.response?.data?.message || "Registrasi gagal. Coba email lain atau periksa koneksi backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 auth-bg">
      {/* Animated background orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[400px] h-[400px] bg-violet-300/30 rounded-full blur-[120px] pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[400px] h-[400px] bg-indigo-300/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-200/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.35] pointer-events-none auth-grid-pattern" />

      <div className="relative w-full max-w-[420px] animate-slide-up">
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[28px] p-7 md:p-9 shadow-2xl shadow-indigo-500/[0.07]">
          {/* Header */}
          <div className="flex flex-col items-center mb-7">
            <div className="relative mb-4">
              <div className="bg-gradient-to-br from-violet-500 to-indigo-600 p-4 rounded-[20px] shadow-xl shadow-violet-500/30">
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-[3px] border-white shadow-sm" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-gradient">DAFTAR KELAS</h1>
            <p className="text-xs text-slate-400 font-semibold mt-1 tracking-wider">Gabung Sistem Simulator TKJ</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                placeholder="e.g. Ahmad Dani"
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white text-slate-800 font-medium transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200/80 text-emerald-600 text-xs p-3.5 rounded-2xl font-semibold flex items-center space-x-2">
                <span>✅</span>
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 text-sm active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  <span>Mendaftarkan...</span>
                </span>
              ) : "Buat Akun Baru →"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Sudah punya akun?
            <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-bold ml-1.5">
              Masuk →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}