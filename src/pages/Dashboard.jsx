import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { playSound } from "../utils/audio";
import { API_BASE_URL } from "../config";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async (email) => {
    try {
      // Fetch leaderboard
      const resList = await axios.get(`${API_BASE_URL}/students`);
      if (resList.data.success) {
        setLeaderboard(resList.data.students);
      }

      // Fetch user activities
      const resStats = await axios.get(`${API_BASE_URL}/student-stats?email=${email}`);
      if (resStats.data.success) {
        setRecentActivities(resStats.data.activities.slice(0, 3));
      }
    } catch (err) {
      console.error("Gagal sinkronisasi data dashboard dengan SQLite:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/");
    } else {
      setCurrentUser(user);
      loadDashboardData(user.email);
    }
  }, [navigate]);

  if (!currentUser) return null;

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800">
      <Sidebar />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto">
        {/* Welcome Section */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Selamat Belajar, {currentUser.name}! 👋
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Siap mengasah keterampilan TKJ hari ini? Pilih salah satu laboratorium virtual di bawah.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-indigo-650 bg-indigo-50 border border-indigo-150 rounded-2xl px-4 py-2 text-xs font-bold shadow-sm">
            <span>🏆 Skor Anda:</span>
            <span className="text-indigo-900 font-extrabold">{currentUser.xp} XP</span>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Main Action Modules */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-base font-black text-slate-900 mb-1 uppercase tracking-wider">Laboratorium Praktik Virtual</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Simulator Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-indigo-400 hover:shadow-md transition flex flex-col justify-between min-h-[220px]">
                <div>
                  <span className="text-3xl mb-3 block">🔌</span>
                  <h4 className="font-extrabold text-slate-900 text-base mb-1.5">Simulator Topologi Jaringan</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Rancang topologi LAN, pasang kabel ethernet virtual, konfigurasi IP address router, dan lakukan uji ping interaktif.
                  </p>
                </div>
                <Link
                  to="/simulation"
                  onClick={() => playSound("click")}
                  className="bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs px-4 py-3 rounded-xl transition text-center shadow-sm shadow-indigo-600/10 mt-6"
                >
                  Buka Simulator Jaringan
                </Link>
              </div>

              {/* Crimping Game Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-indigo-400 hover:shadow-md transition flex flex-col justify-between min-h-[220px]">
                <div>
                  <span className="text-3xl mb-3 block">✂️</span>
                  <h4 className="font-extrabold text-slate-900 text-base mb-1.5">RJ-45 Crimping Game</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Susun kabel UTP sesuai standar kode warna T568A atau T568B, press menggunakan tang krimp, dan uji dengan LAN Tester!
                  </p>
                </div>
                <Link
                  to="/game-crimping"
                  onClick={() => playSound("click")}
                  className="bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs px-4 py-3 rounded-xl transition text-center shadow-sm shadow-indigo-600/10 mt-6"
                >
                  Mulai Praktik Crimping
                </Link>
              </div>

              {/* Quiz Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-indigo-400 hover:shadow-md transition flex flex-col justify-between min-h-[200px]">
                <div>
                  <span className="text-3xl mb-3 block">📝</span>
                  <h4 className="font-extrabold text-slate-900 text-base mb-1.5">Kuis Evaluasi Teori</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Uji pemahaman Anda tentang model OSI, subnetting IP, pembagian kelas IP address, dan perangkat keras jaringan LAN.
                  </p>
                </div>
                <Link
                  to="/quiz"
                  onClick={() => playSound("click")}
                  className="bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs px-4 py-3 rounded-xl transition text-center shadow-sm shadow-indigo-600/10 mt-6"
                >
                  Uji Pemahaman Teori
                </Link>
              </div>

              {/* Forum Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-indigo-400 hover:shadow-md transition flex flex-col justify-between min-h-[200px]">
                <div>
                  <span className="text-3xl mb-3 block">💬</span>
                  <h4 className="font-extrabold text-slate-900 text-base mb-1.5">Forum Tanya Jawab</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Tanyakan kendala konfigurasi VLAN, default gateway, atau mintalah bantuan koreksi tugas langsung kepada Guru pengampu kelas.
                  </p>
                </div>
                <Link
                  to="/forum"
                  onClick={() => playSound("click")}
                  className="bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs px-4 py-3 rounded-xl transition text-center shadow-sm shadow-indigo-600/10 mt-6"
                >
                  Gabung Diskusi Forum
                </Link>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Leaderboard */}
          <div className="space-y-6">
            <h3 className="text-base font-black text-slate-900 mb-1 uppercase tracking-wider">Leaderboard Kelas</h3>
            
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <p className="text-xs text-slate-400 mb-4 font-semibold">
                Ranking berdasarkan akumulasi level kompetensi dan total XP yang tersimpan di SQLite.
              </p>

              {loading ? (
                <p className="text-xs text-slate-450 italic text-center py-4">Memuat peringkat...</p>
              ) : (
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                  {leaderboard.map((student, idx) => {
                    const isSelf = student.email === currentUser.email;
                    return (
                      <div
                        key={student.email}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                          isSelf 
                            ? "bg-indigo-50 border-indigo-200" 
                            : "bg-slate-50 border-slate-150 hover:bg-slate-100/50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-black text-slate-400 w-5 text-center">#{idx + 1}</span>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm text-white ${
                            isSelf ? "bg-indigo-600" : "bg-slate-400"
                          }`}>
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="overflow-hidden w-28">
                            <p className="font-bold text-slate-800 text-xs truncate">{student.name}</p>
                            <span className="text-[9px] text-slate-450 font-bold">Lvl {student.level}</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-700 bg-white border border-slate-150/60 px-2 py-0.5 rounded shadow-sm">
                          {student.xp.toLocaleString()} XP
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent activity timeline */}
            <h3 className="text-base font-black text-slate-900 mb-1 uppercase tracking-wider">Aktivitas Terakhir</h3>
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="text-xs font-semibold border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-indigo-650 font-bold">{act.type}</span>
                    <span className="text-[9px] text-slate-400 font-mono">{act.timestamp}</span>
                  </div>
                  <p className="text-slate-800 font-bold">{act.activity_name}</p>
                  <span className="text-[10px] text-emerald-600 mt-0.5 block">+{act.xp_gained} XP</span>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-4">Belum ada riwayat aktivitas praktik.</p>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
