import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";

export default function Stats() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setCurrentUser(user);
      fetchStats(user.email);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStats = async (email) => {
    try {
      const res = await axios.get(`http://localhost:5000/student-stats?email=${email}`);
      if (res.data.success) {
        setActivities(res.data.activities);
      }
    } catch (err) {
      console.error("Gagal mengambil statistik belajar:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex bg-slate-50 min-h-screen text-slate-800">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <p className="text-slate-500 font-bold">Harap masuk terlebih dahulu.</p>
        </main>
      </div>
    );
  }

  // Calculate stats metrics
  const totalXpGained = activities.reduce((acc, curr) => acc + curr.xp_gained, 0);
  const crimpingCount = activities.filter(a => a.type === "Crimping").length;
  const simulationCount = activities.filter(a => a.type === "Simulation").length;
  const quizCount = activities.filter(a => a.type === "Quiz").length;

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800">
      <Sidebar />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center space-x-2 text-indigo-650 text-sm font-semibold mb-1">
            <span>Evaluasi Mandiri</span>
            <span>•</span>
            <span>Kemajuan Belajar</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">
            Statistik Belajar Siswa
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Pantau portofolio riwayat praktik krimp, simulasi jaringan, dan hasil kuis teori Anda yang tersimpan di database.
          </p>
        </header>

        {loading ? (
          <div className="py-10 text-center text-slate-400 font-semibold">Memuat riwayat belajar...</div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <span className="text-xs font-bold text-slate-450 uppercase block mb-1">Pangkat Belajar</span>
                <span className="text-base font-extrabold text-indigo-600 block">
                  {currentUser.level >= 8 ? "Network Architect" : currentUser.level >= 5 ? "Senior Admin" : "Junior Engineer"}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-1">Level {currentUser.level}</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <span className="text-xs font-bold text-slate-450 uppercase block mb-1">Riwayat Praktik</span>
                <span className="text-2xl font-black text-slate-900 block">{activities.length} Sesi</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-1">Tercatat di database SQLite</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <span className="text-xs font-bold text-slate-450 uppercase block mb-1">Total Poin XP</span>
                <span className="text-2xl font-black text-emerald-600 block">+{totalXpGained} XP</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-1">Hasil latihan & kuis</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <span className="text-xs font-bold text-slate-450 uppercase block mb-1">Akurasi Kemajuan</span>
                <span className="text-2xl font-black text-amber-600 block">
                  {Math.min(100, Math.round((currentUser.level / 10) * 100))}%
                </span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-1">Menuju kelulusan TKJ</span>
              </div>
            </div>

            {/* Activities Category Breakdown */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-black text-slate-900 mb-4 flex items-center space-x-2">
                <span>🎯</span>
                <span>Analisis Kompetensi Praktik</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cabling */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Crimping Kabel LAN</span>
                    <span className="text-xs font-mono font-bold text-indigo-650">{crimpingCount} Misi</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-100">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, crimpingCount * 25)}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-400 block font-semibold">Tantangan Straight & Cross T568A/B</span>
                </div>

                {/* Simulation */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Simulasi Topologi & Routing</span>
                    <span className="text-xs font-mono font-bold text-emerald-650">{simulationCount} Misi</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-100">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, simulationCount * 25)}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-400 block font-semibold">Troubleshooting level mudah/sedang/sulit</span>
                </div>

                {/* Quizzes */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Kuis Evaluasi Teori</span>
                    <span className="text-xs font-mono font-bold text-amber-650">{quizCount} Misi</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-100">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, quizCount * 25)}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-400 block font-semibold">Uji pemahaman IPv4, subnetting, & OSI</span>
                </div>
              </div>
            </div>

            {/* Activity History Timeline logs */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-black text-slate-900 mb-4 flex items-center space-x-2">
                <span>⏳</span>
                <span>Log Riwayat Belajar (SQLite Records)</span>
              </h3>
              
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
                {activities.map((act) => (
                  <div key={act.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50 flex items-center justify-between text-xs font-semibold hover:border-slate-300 transition-colors">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">
                        {act.type === "Crimping" ? "⚡" : act.type === "Simulation" ? "🔌" : "🏆"}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800">{act.activity_name}</p>
                        <div className="flex space-x-2 items-center mt-1">
                          <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded border uppercase ${
                            act.type === "Crimping" 
                              ? "bg-indigo-50 text-indigo-700 border-indigo-150" 
                              : act.type === "Simulation" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-150" 
                                : "bg-amber-50 text-amber-700 border-amber-150"
                          }`}>
                            {act.type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono font-semibold">{act.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-extrabold text-yellow-600 bg-white border border-slate-150 px-3 py-1 rounded-xl shadow-inner">
                      +{act.xp_gained} XP
                    </span>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-8">Belum ada riwayat aktivitas belajar yang tersimpan.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
