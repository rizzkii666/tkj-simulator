import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { playSound } from "../utils/audio";

export default function Forum() {
  const [currentUser, setCurrentUser] = useState({ name: "Siswa TKJ", role: "student" });
  const [discussions, setDiscussions] = useState([]);
  
  // Active Thread view
  const [activeThreadId, setActiveThreadId] = useState(null);

  // New Thread Form
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Umum");
  const [newContent, setNewContent] = useState("");

  // Reply Form
  const [replyText, setReplyText] = useState("");

  const loadDiscussions = () => {
    const user = JSON.parse(localStorage.getItem("user")) || { name: "Siswa TKJ", role: "student" };
    setCurrentUser(user);

    const defaultDiscussions = [
      {
        id: "d1",
        title: "Tanya Cara Menghitung Host Valid Prefix /27",
        category: "Subnetting",
        author: "Ahmad Dani",
        role: "student",
        content: "Halo pak Budi dan teman-teman, saya masih bingung cara cepat menghitung jumlah host valid untuk prefix /27. Ada yang bisa bantu jelaskan rumusnya?",
        timestamp: "2026-06-29 09:30",
        replies: [
          {
            id: "r1",
            author: "Pak Budi (Guru)",
            role: "teacher",
            content: "Halo Dani! Untuk /27, rumusnya adalah 2^(32-prefix) - 2. Berarti 2^(32-27) - 2 = 2^5 - 2 = 32 - 2 = 30 host valid per subnet. Semoga membantu ya!",
            timestamp: "2026-06-29 10:15"
          },
          {
            id: "r2",
            author: "Rina Amelia",
            role: "student",
            content: "Betul kata pak Budi, tinggal dikurangi 32 saja untuk pangkat duanya. Jadi gampang diingat!",
            timestamp: "2026-06-29 10:30"
          }
        ]
      },
      {
        id: "d2",
        title: "Kabel Crossover vs Straight untuk PC ke Router",
        category: "Cabling",
        author: "Siti Rahma",
        role: "student",
        content: "Mau tanya, kalau menghubungkan PC langsung ke port FastEthernet Router tanpa lewat Switch, kita pakai kabel tipe Straight atau Cross ya? Di buku nilai kok beda-beda penjelasannya.",
        timestamp: "2026-06-28 14:20",
        replies: [
          {
            id: "r3",
            author: "Pak Budi (Guru)",
            role: "teacher",
            content: "Pertanyaan bagus Siti. PC dan Router dianggap sebagai perangkat yang 'sejenis' karena keduanya beroperasi sebagai terminal layer atas. Jadi, untuk PC langsung ke Router, gunakan kabel **Crossover**. Gunakan Straight hanya jika dihubungkan melalui Switch/Hub.",
            timestamp: "2026-06-28 15:00"
          }
        ]
      }
    ];

    const stored = JSON.parse(localStorage.getItem("forum_discussions"));
    if (stored) {
      setDiscussions(stored);
    } else {
      localStorage.setItem("forum_discussions", JSON.stringify(defaultDiscussions));
      setDiscussions(defaultDiscussions);
    }
  };

  useEffect(() => {
    loadDiscussions();
  }, []);

  const handleCreateThread = (e) => {
    e.preventDefault();
    playSound("click");
    if (!newTitle || !newContent) {
      playSound("error");
      alert("Harap isi Judul dan Konten diskusi!");
      return;
    }

    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

    const newThread = {
      id: `thread-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      author: currentUser.name,
      role: currentUser.role,
      content: newContent,
      timestamp: formattedDate,
      replies: []
    };

    const updated = [newThread, ...discussions];
    localStorage.setItem("forum_discussions", JSON.stringify(updated));
    setDiscussions(updated);
    
    setNewTitle("");
    setNewContent("");
    playSound("success");
  };

  const handleCreateReply = (e) => {
    e.preventDefault();
    playSound("click");
    if (!replyText) {
      playSound("error");
      return;
    }

    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

    const newReply = {
      id: `reply-${Date.now()}`,
      author: currentUser.name,
      role: currentUser.role,
      content: replyText,
      timestamp: formattedDate
    };

    const updated = discussions.map(thread => {
      if (thread.id === activeThreadId) {
        return {
          ...thread,
          replies: [...thread.replies, newReply]
        };
      }
      return thread;
    });

    localStorage.setItem("forum_discussions", JSON.stringify(updated));
    setDiscussions(updated);
    setReplyText("");
    playSound("success");
  };

  const activeThread = discussions.find(t => t.id === activeThreadId);

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800">
      <Sidebar />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
        
        {/* Discussion threads list / details panel */}
        <div className="flex-1 space-y-6">
          <header className="mb-4">
            <div className="flex items-center space-x-2 text-indigo-650 text-sm font-semibold mb-1">
              <span>Kolaborasi</span>
              <span>•</span>
              <span>Tanya Jawab</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">
              Forum Diskusi Kelas TKJ
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Ruang tanya jawab interaktif antara guru dan siswa seputar materi dan kendala simulasi praktikum.
            </p>
          </header>

          {!activeThreadId ? (
            /* Threads list */
            <div className="space-y-4 animate-fade-in">
              {discussions.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => { playSound("click"); setActiveThreadId(thread.id); }}
                  className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-indigo-400 hover:shadow-sm cursor-pointer transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-3">
                      <span className="text-[9px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {thread.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-semibold">{thread.timestamp}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-3 mb-2 hover:text-indigo-600 transition-colors">
                      {thread.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-semibold">
                      {thread.content}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    {/* Author profile badge */}
                    <div className="flex items-center space-x-2">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs text-white ${
                        thread.role === "teacher" ? "bg-purple-600" : "bg-indigo-600"
                      }`}>
                        {thread.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 mr-1.5">{thread.author}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          thread.role === "teacher" 
                            ? "bg-purple-100 text-purple-700 border border-purple-200" 
                            : "bg-indigo-50 text-indigo-700 border border-indigo-150"
                        }`}>
                          {thread.role === "teacher" ? "🎓 Guru" : "👨‍🎓 Siswa"}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-xl">
                      💬 {thread.replies.length} Balasan
                    </span>
                  </div>
                </div>
              ))}
              {discussions.length === 0 && (
                <div className="text-center py-10 bg-white border border-slate-200 rounded-3xl text-slate-400 italic">
                  Belum ada diskusi kelas. Jadilah yang pertama bertanya!
                </div>
              )}
            </div>
          ) : (
            /* Selected thread expanded view */
            <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm animate-fade-in space-y-6">
              {/* Back action */}
              <button
                onClick={() => { playSound("click"); setActiveThreadId(null); }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1.5"
              >
                <span>← Kembali Ke Forum</span>
              </button>

              {/* Main question thread card */}
              <div className="border-b border-slate-100 pb-5">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-[9px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {activeThread.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-semibold">{activeThread.timestamp}</span>
                </div>
                
                <h2 className="text-lg md:text-xl font-black text-slate-900 mt-4 mb-3">
                  {activeThread.title}
                </h2>
                
                <p className="text-xs md:text-sm text-slate-650 leading-relaxed font-semibold mb-5 whitespace-pre-wrap">
                  {activeThread.content}
                </p>

                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white ${
                    activeThread.role === "teacher" ? "bg-purple-600" : "bg-indigo-600"
                  }`}>
                    {activeThread.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 mr-1.5">{activeThread.author}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      activeThread.role === "teacher" 
                        ? "bg-purple-100 text-purple-700 border border-purple-200" 
                        : "bg-indigo-50 text-indigo-700 border border-indigo-150"
                    }`}>
                      {activeThread.role === "teacher" ? "🎓 Guru" : "👨‍🎓 Siswa"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Replies Thread list */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase font-black tracking-wider text-slate-400">
                  Tanggapan Diskusi ({activeThread.replies.length})
                </h3>
                
                {activeThread.replies.map((rep) => (
                  <div key={rep.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-semibold">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] text-white ${
                          rep.role === "teacher" ? "bg-purple-600" : "bg-indigo-600"
                        }`}>
                          {rep.author.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-800">{rep.author}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                          rep.role === "teacher" ? "bg-purple-100 text-purple-600" : "bg-indigo-150 text-indigo-700"
                        }`}>
                          {rep.role === "teacher" ? "Guru" : "Siswa"}
                        </span>
                      </div>
                      <span>{rep.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold pl-8">
                      {rep.content}
                    </p>
                  </div>
                ))}

                {activeThread.replies.length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-4">Belum ada tanggapan. Jadilah yang pertama menanggapi!</p>
                )}
              </div>

              {/* Add Reply Form */}
              <form onSubmit={handleCreateReply} className="pt-4 border-t border-slate-100 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tulis Balasan Tanggapan</span>
                <textarea
                  rows="3"
                  placeholder="Ketik jawaban atau saran Anda di sini..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 font-semibold transition"
                  required
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-550 text-white font-bold px-5 py-2 rounded-xl text-xs transition shadow-sm"
                >
                  Kirim Balasan 💬
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Sidebar New Thread Creator (Visible only when not viewing single thread) */}
        {!activeThreadId && (
          <div className="w-full md:w-80 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm self-start animate-fade-in">
            <h3 className="text-base font-black text-slate-900 mb-1 flex items-center space-x-2">
              <span>❓</span>
              <span>Buat Diskusi Baru</span>
            </h3>
            <p className="text-xs text-slate-400 mb-5 font-medium">Ajukan kendala teknis atau pertanyaan materi.</p>
            
            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Judul Diskusi</label>
                <input
                  type="text"
                  placeholder="e.g. Masalah Ping fa0/1 Router"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Kategori Bahasan</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500"
                >
                  <option value="Umum">Umum / Diskusi Bebas</option>
                  <option value="Subnetting">IP Subnetting</option>
                  <option value="Topologi">Topologi & Desain</option>
                  <option value="Cabling">Crimping & Kabel</option>
                  <option value="Routing">Routing & Switching</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Pertanyaan Detail</label>
                <textarea
                  rows="5"
                  placeholder="Jelaskan pertanyaan atau kendala praktikum Anda secara mendalam..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-550 text-white font-bold py-3 rounded-xl text-xs transition shadow-sm"
              >
                Ajukan Diskusi Kelas 📢
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
