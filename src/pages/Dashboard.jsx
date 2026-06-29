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
      const resList = await axios.get(`${API_BASE_URL}/students`);
      if (resList.data.success) {
        setLeaderboard(resList.data.students);
      }
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

  const labModules = [
    {
      emoji: "🖥️",
      title: "Simulator Topologi Jaringan",
      desc: "Rancang topologi LAN, pasang kabel ethernet virtual, konfigurasi IP dan uji ping interaktif.",
      link: "/simulation",
      btnText: "Buka Simulator",
      gradient: "from-blue-500 to-indigo-600",
      bgGlow: "bg-blue-500/10",
    },
    {
      emoji: "⚡",
      title: "RJ-45 Crimping Game",
      desc: "Susun kabel UTP sesuai standar warna T568A/T568B, press dengan tang krimp, dan uji LAN Tester!",
      link: "/game-crimping",
      btnText: "Mulai Praktik",
      gradient: "from-amber-500 to-orange-600",
      bgGlow: "bg-amber-500/10",
    },
    {
      emoji: "🧠",
      title: "Kuis Evaluasi Teori",
      desc: "Uji pemahaman model OSI, subnetting IP, kelas IP address, dan perangkat keras jaringan.",
      link: "/quiz",
      btnText: "Mulai Kuis",
      gradient: "from-emerald-500 to-teal-600",
      bgGlow: "bg-emerald-500/10",
    },
    {
      emoji: "💬",
      title: "Forum Tanya Jawab",
      desc: "Diskusikan kendala konfigurasi VLAN, gateway, atau minta bantuan dari Guru pengampu kelas.",
      link: "/forum",
      btnText: "Gabung Forum",
      gradient: "from-violet-500 to-purple-600",
      bgGlow: "bg-violet-500/10",
    },
  ];

  return (
    <div className="flex bg-[#f8fafc] min-h-screen text-slate-800">
      <Sidebar />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto">
        {/* Welcome Section */}
        <header className="mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Selamat Datang Kembali 👋</p>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Hai, {currentUser.name}!
              </h1>
              <p className="text-slate-400 text-sm mt-1 font-medium">
                Siap mengasah keterampilan TKJ hari ini?
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-2xl px-5 py-2.5 text-xs font-bold shadow-lg shadow-indigo-500/20">
              <span>🏆</span>
              <span>{currentUser.xp} XP</span>
              <span className="w-px h-4 bg-white/30" />
              <span>Level {currentUser.level}</span>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Main Lab Modules */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Laboratorium Praktik Virtual</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {labModules.map((mod, idx) => (
                <div
                  key={idx}
                  className="group bg-white border border-slate-200/60 rounded-[24px] p-5 card-hover flex flex-col justify-between min-h-[210px] relative overflow-hidden"
                >
                  {/* Subtle glow in corner */}
                  <div className={`absolute -top-8 -right-8 w-24 h-24 ${mod.bgGlow} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative">
                    <span className="text-3xl mb-3 block">{mod.emoji}</span>
                    <h4 className="font-extrabold text-slate-900 text-[15px] mb-1.5">{mod.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {mod.desc}
                    </p>
                  </div>
                  <Link
                    to={mod.link}
                    onClick={() => playSound("click")}
                    className={`relative bg-gradient-to-r ${mod.gradient} text-white font-bold text-xs px-4 py-3 rounded-xl transition-all text-center shadow-md mt-5 active:scale-[0.97] hover:shadow-lg`}
                  >
                    {mod.btnText} →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Leaderboard Kelas</h3>
              <div className="bg-white border border-slate-200/60 rounded-[24px] p-5 card-hover">
                {loading ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">Memuat peringkat...</p>
                ) : (
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                    {leaderboard.map((student, idx) => {
                      const isSelf = student.email === currentUser.email;
                      const medals = ["🥇", "🥈", "🥉"];
                      return (
                        <div
                          key={student.email}
                          className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                            isSelf 
                              ? "bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200/60" 
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className="text-sm w-6 text-center">
                              {idx < 3 ? medals[idx] : <span className="text-[11px] text-slate-400 font-bold">#{idx + 1}</span>}
                            </span>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white ${
                              isSelf ? "bg-gradient-to-br from-indigo-500 to-violet-600" : "bg-slate-300"
                            }`}>
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-bold text-slate-700 text-xs truncate max-w-[100px]">{student.name}</p>
                              <span className="text-[9px] text-slate-400 font-semibold">Lvl {student.level}</span>
                            </div>
                          </div>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                            isSelf ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-600"
                          }`}>
                            {student.xp.toLocaleString()} XP
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activities */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Aktivitas Terakhir</h3>
              <div className="bg-white border border-slate-200/60 rounded-[24px] p-5 card-hover space-y-3">
                {recentActivities.map((act) => (
                  <div key={act.id} className="border-b border-slate-100/80 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">{act.type}</span>
                      <span className="text-[9px] text-slate-350 font-mono">{act.timestamp}</span>
                    </div>
                    <p className="text-slate-700 font-semibold text-xs">{act.activity_name}</p>
                    <span className="text-[10px] text-emerald-500 font-bold mt-0.5 block">+{act.xp_gained} XP</span>
                  </div>
                ))}
                {recentActivities.length === 0 && (
                  <div className="text-center py-6">
                    <span className="text-2xl block mb-2">📋</span>
                    <p className="text-xs text-slate-400 font-medium">Belum ada riwayat aktivitas.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
