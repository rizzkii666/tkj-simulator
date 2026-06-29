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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
      {/* Background patterns */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px), linear-gradient(to right, #f1f5f9 1.5px, transparent 1.5px), linear-gradient(to bottom, #f1f5f9 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px, 48px 48px, 48px 48px"
        }}
      />
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[350px] h-[350px] bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[350px] h-[350px] bg-purple-200/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-[420px] bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-600/25 mb-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">DAFTAR KELAS</h1>
          <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mt-1">Gabung Sistem Simulator TKJ</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Nama Lengkap</label>
            <input
              type="text"
              placeholder="e.g. Ahmad Dani"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 font-medium transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Peran Kelas (Role)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-700 font-bold transition"
            >
              <option value="student">Siswa (Default)</option>
              <option value="teacher">Guru Pengampu</option>
            </select>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-650 text-xs p-3 rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-750 text-xs p-3 rounded-xl font-medium animate-pulse">
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-550 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-md shadow-indigo-600/15 text-sm"
          >
            {loading ? "Mendaftarkan..." : "Buat Akun Baru"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Sudah punya akun?
          <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-bold ml-1.5">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}