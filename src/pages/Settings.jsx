import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { playSound } from "../utils/audio";
import { API_BASE_URL } from "../config";

export default function Settings() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatar, setAvatar] = useState("🎒");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const availableAvatars = ["🎒", "👨‍💻", "👩‍💻", "🤖", "🚀", "⚡", "⚙️", "🔧", "👨‍🏫", "👩‍🏫"];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/");
    } else {
      setCurrentUser(user);
      setName(user.name);
      setEmail(user.email);
      setAvatar(user.avatar || (user.role === "teacher" ? "👨‍🏫" : "🎒"));
    }
  }, [navigate]);

  if (!currentUser) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    playSound("click");

    try {
      const payload = {
        email,
        name,
        avatar,
      };
      if (newPassword) {
        payload.password = newPassword;
      }

      const res = await axios.post(`${API_BASE_URL}/update-profile`, payload);
      
      if (res.data.success) {
        playSound("success");
        setSuccessMsg(res.data.message);
        
        const updatedUser = { ...currentUser, name, avatar };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        setNewPassword("");
      }
    } catch (err) {
      playSound("error");
      setErrorMsg(err.response?.data?.message || "Gagal memperbarui profil. Periksa koneksi backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-[#f8fafc] min-h-screen text-slate-800 transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-4xl mx-auto">
        <header className="mb-8 animate-fade-in">
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Pengaturan Akun</p>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Pengaturan Profil
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Perbarui nama profil Anda atau ubah kata sandi login di sini.
          </p>
        </header>

        <div className="bg-white border border-slate-200/60 rounded-[28px] p-6 md:p-8 shadow-xl shadow-slate-200/40 animate-slide-up">
          <form onSubmit={handleUpdate} className="space-y-6 max-w-lg">
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-extrabold text-white text-3xl shadow-lg shadow-indigo-500/20">
                {avatar}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-base">{name}</h4>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{currentUser.role === "teacher" ? "👨‍🏫 Guru" : "🎒 Siswa"}</p>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Pilih Foto Profil (Avatar)</label>
              <div className="flex flex-wrap gap-2.5 p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl">
                {availableAvatars.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => { playSound("click"); setAvatar(av); }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                      avatar === av 
                        ? "bg-indigo-650 text-white scale-110 shadow-md ring-2 ring-indigo-500/30" 
                        : "bg-white hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Alamat Email (Tidak dapat diubah)</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-slate-100 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm text-slate-450 font-medium cursor-not-allowed"
              />
            </div>

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

            <div className="pt-2 border-t border-slate-100/80">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Ganti Kata Sandi (Opsional)</h4>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Kata Sandi Baru</label>
                <input
                  type="password"
                  placeholder="Isi jika ingin mengganti sandi lama"
                  className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white text-slate-800 font-medium transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
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

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold px-6 py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 text-sm active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
