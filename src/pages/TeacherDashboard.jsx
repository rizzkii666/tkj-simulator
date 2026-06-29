import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { playSound } from "../utils/audio";
import { API_BASE_URL } from "../config";

export default function TeacherDashboard() {
  const [students, setStudents] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Material Form
  const [matCategory, setMatCategory] = useState("topologi");
  const [matTitle, setMatTitle] = useState("");
  const [matDesc, setMatDesc] = useState("");
  const [matContent, setMatContent] = useState("");

  // Quiz Form
  const [quizTitle, setQuizTitle] = useState("");
  const [quizCategory, setQuizCategory] = useState("Umum");
  const [quizQuestions, setQuizQuestions] = useState([]);

  // Question Form
  const [qText, setQText] = useState("");
  const [qOptA, setQOptA] = useState("");
  const [qOptB, setQOptB] = useState("");
  const [qOptC, setQOptC] = useState("");
  const [qOptD, setQOptD] = useState("");
  const [qAnswer, setQAnswer] = useState(0);
  const [qExplanation, setQExplanation] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch students from SQLite
      const res = await axios.get(`${API_BASE_URL}/students`);
      if (res.data.success) {
        setStudents(res.data.students);
      }
    } catch (err) {
      console.error("Gagal sinkronisasi data guru dengan SQLite:", err);
    } finally {
      setLoading(false);
    }
    
    const customMats = JSON.parse(localStorage.getItem("custom_materials")) || [];
    setMaterials(customMats);

    const customQuizzes = JSON.parse(localStorage.getItem("custom_quizzes")) || [];
    setQuizzes(customQuizzes);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUploadMaterial = (e) => {
    e.preventDefault();
    playSound("click");
    if (!matTitle || !matDesc || !matContent) {
      playSound("error");
      alert("Harap lengkapi semua kolom materi!");
      return;
    }

    const newMaterial = {
      id: `mat-${Date.now()}`,
      category: matCategory,
      title: matTitle,
      description: matDesc,
      content: matContent
    };

    const currentMats = JSON.parse(localStorage.getItem("custom_materials")) || [];
    localStorage.setItem("custom_materials", JSON.stringify([...currentMats, newMaterial]));
    
    setMatTitle("");
    setMatDesc("");
    setMatContent("");
    loadData();
    playSound("success");
    alert("Sukses! Materi berhasil diunggah ke kelas siswa.");
  };

  const handleAddQuestion = () => {
    playSound("click");
    if (!qText || !qOptA || !qOptB || !qOptC || !qOptD) {
      playSound("error");
      alert("Harap lengkapi pertanyaan dan semua 4 opsi jawaban!");
      return;
    }

    const newQ = {
      question: qText,
      options: [qOptA, qOptB, qOptC, qOptD],
      answer: Number(qAnswer),
      explanation: qExplanation || "Jawaban yang benar sesuai dengan teori kurikulum TKJ."
    };

    setQuizQuestions([...quizQuestions, newQ]);
    
    setQText("");
    setQOptA("");
    setQOptB("");
    setQOptC("");
    setQOptD("");
    setQAnswer(0);
    setQExplanation("");
    playSound("success");
  };

  const handlePublishQuiz = (e) => {
    e.preventDefault();
    playSound("click");
    if (!quizTitle) {
      playSound("error");
      alert("Harap masukkan Judul Kuis!");
      return;
    }
    if (quizQuestions.length === 0) {
      playSound("error");
      alert("Kuis harus memiliki minimal 1 pertanyaan sebelum diterbitkan!");
      return;
    }

    const newQuiz = {
      id: `custom-${Date.now()}`,
      title: quizTitle,
      category: quizCategory,
      questions: quizQuestions
    };

    const currentQuizzes = JSON.parse(localStorage.getItem("custom_quizzes")) || [];
    localStorage.setItem("custom_quizzes", JSON.stringify([...currentQuizzes, newQuiz]));

    setQuizTitle("");
    setQuizQuestions([]);
    loadData();
    playSound("success");
    alert("Sukses! Kuis interaktif baru telah diterbitkan untuk seluruh siswa.");
  };

  const deleteMaterial = (id) => {
    playSound("error");
    const current = JSON.parse(localStorage.getItem("custom_materials")) || [];
    localStorage.setItem("custom_materials", JSON.stringify(current.filter(m => m.id !== id)));
    loadData();
  };

  const deleteQuiz = (id) => {
    playSound("error");
    const current = JSON.parse(localStorage.getItem("custom_quizzes")) || [];
    localStorage.setItem("custom_quizzes", JSON.stringify(current.filter(q => q.id !== id)));
    loadData();
  };

  const resetStudentProgress = async (email) => {
    playSound("click");
    try {
      const res = await axios.post(`${API_BASE_URL}/reset-student`, { email });
      if (res.data.success) {
        playSound("success");
        alert(`Sukses! Progres belajar siswa ${email} telah direset ke level 1 di SQLite database.`);
        loadData();
        
        // If resetting current student session
        const stored = JSON.parse(localStorage.getItem("user"));
        if (stored && stored.email === email) {
          stored.level = 1;
          stored.xp = 0;
          localStorage.setItem("user", JSON.stringify(stored));
        }
      }
    } catch (err) {
      playSound("error");
      alert("Gagal mereset progress belajar siswa.");
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800">
      <Sidebar />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center space-x-2 text-purple-650 text-sm font-semibold mb-1">
            <span>Portal Guru</span>
            <span>•</span>
            <span>CMS Kelas TKJ (SQLite)</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">
            Dashboard Guru Pengampu
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Pantau performa nilai siswa SMK, kelola unggahan materi ajar, dan publikasikan kuis evaluasi.
          </p>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center space-x-4">
            <span className="text-2xl bg-purple-50 p-3 rounded-2xl">👨‍🎓</span>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Siswa Terdaftar</span>
              <h2 className="text-xl font-black text-slate-900">{students.length} Siswa</h2>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center space-x-4">
            <span className="text-2xl bg-indigo-50 p-3 rounded-2xl">📖</span>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Materi Tambahan</span>
              <h2 className="text-xl font-black text-slate-900">{materials.length} Topik</h2>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center space-x-4">
            <span className="text-2xl bg-rose-50 p-3 rounded-2xl">🏆</span>
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Kuis Diterbitkan</span>
              <h2 className="text-xl font-black text-slate-900">{quizzes.length} Kuis Custom</h2>
            </div>
          </div>
        </div>

        {/* Gradebook Table */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm mb-8">
          <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center space-x-2">
            <span>📊</span>
            <span>Buku Nilai & Progress Siswa (SQLite DB)</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4 font-medium">
            Pantau level keterampilan TKJ dan akumulasi nilai XP siswa kelas Anda secara real-time.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-slate-150 bg-white scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-purple-700 font-bold">
                  <th className="p-3.5 text-center w-12">No</th>
                  <th className="p-3.5">Nama Siswa</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5 text-center">Tingkat / Level</th>
                  <th className="p-3.5 text-right">Nilai XP</th>
                  <th className="p-3.5 text-center">Aksi Guru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-5 text-center text-slate-400 italic">Memuat nilai siswa...</td>
                  </tr>
                ) : (
                  students.map((student, idx) => (
                    <tr key={student.email} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 text-center">{idx + 1}</td>
                      <td className="p-3.5 font-bold text-slate-900">{student.name}</td>
                      <td className="p-3.5 text-slate-500 font-mono">{student.email}</td>
                      <td className="p-3.5 text-center">
                        <span className="bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded font-bold border border-purple-100">
                          Lvl {student.level}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900">{student.xp.toLocaleString()} XP</td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => resetStudentProgress(student.email)}
                          className="text-[10px] bg-red-50 hover:bg-red-100 border border-red-150 text-red-650 font-bold px-2 py-1 rounded transition"
                        >
                          Reset Progress 🔄
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Content Creator forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
          
          {/* Material Form Uploader */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center space-x-2">
              <span>✍️</span>
              <span>Unggah Materi Ajar Baru</span>
            </h3>
            <p className="text-xs text-slate-500 mb-5 font-medium">
              Materi yang diunggah akan otomatis muncul pada tab "Materi Tambahan Guru" di portal siswa.
            </p>

            <form onSubmit={handleUploadMaterial} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Kategori Topik</label>
                <select
                  value={matCategory}
                  onChange={(e) => setMatCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none text-slate-700 focus:bg-white focus:border-purple-500"
                >
                  <option value="topologi">Topologi Jaringan</option>
                  <option value="ipaddress">IP Addressing & Subnetting</option>
                  <option value="routing">Routing & Switching</option>
                  <option value="cabling">Media Transmisi & Kabel</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Judul Materi</label>
                <input
                  type="text"
                  placeholder="e.g. Konfigurasi Dasar VLAN Switch Cisco"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none text-slate-800 focus:bg-white focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Deskripsi Singkat</label>
                <input
                  type="text"
                  placeholder="e.g. Panduan praktis merancang VLAN internal gedung sekolah."
                  value={matDesc}
                  onChange={(e) => setMatDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none text-slate-650 focus:bg-white focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Isi / Konten Pembelajaran</label>
                <textarea
                  rows="6"
                  placeholder="Ketik konten modul pembelajaran di sini..."
                  value={matContent}
                  onChange={(e) => setMatContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none text-slate-750 focus:bg-white focus:border-purple-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-550 text-white font-bold py-3 rounded-xl text-xs transition shadow-sm"
              >
                Publikasikan Materi 🚀
              </button>
            </form>
          </div>

          {/* Quiz Question Creator */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center space-x-2">
              <span>📝</span>
              <span>Buat & Terbitkan Kuis Evaluasi</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Rancang beberapa butir pertanyaan dan terbitkan sebagai kuis kelas.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Judul Kuis</label>
                  <input
                    type="text"
                    placeholder="e.g. Kuis Subnetting"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Kategori Kuis</label>
                  <input
                    type="text"
                    placeholder="e.g. Subnetting / Hardware"
                    value={quizCategory}
                    onChange={(e) => setQuizCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Individual Question Builder Panel */}
              <div className="border border-dashed border-slate-350 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                <span className="text-[10px] font-black text-purple-650 uppercase block mb-1">Penyusun Soal ({quizQuestions.length} Terkumpul)</span>
                
                <div>
                  <span className="text-[9px] text-slate-500 font-bold block mb-0.5">Pertanyaan</span>
                  <input
                    type="text"
                    placeholder="Tulis soal kuis di sini..."
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[8px] text-slate-550 block font-bold">Opsi A</span>
                    <input type="text" placeholder="Opsi A" value={qOptA} onChange={(e)=>setQOptA(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none"/>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-550 block font-bold">Opsi B</span>
                    <input type="text" placeholder="Opsi B" value={qOptB} onChange={(e)=>setQOptB(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none"/>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-550 block font-bold">Opsi C</span>
                    <input type="text" placeholder="Opsi C" value={qOptC} onChange={(e)=>setQOptC(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none"/>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-550 block font-bold">Opsi D</span>
                    <input type="text" placeholder="Opsi D" value={qOptD} onChange={(e)=>setQOptD(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[8px] text-slate-550 block font-bold">Kunci Jawaban</span>
                    <select
                      value={qAnswer}
                      onChange={(e)=>setQAnswer(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none font-bold"
                    >
                      <option value={0}>Opsi A Benar</option>
                      <option value={1}>Opsi B Benar</option>
                      <option value={2}>Opsi C Benar</option>
                      <option value={3}>Opsi D Benar</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-550 block font-bold">Pembahasan Singkat</span>
                    <input
                      type="text"
                      placeholder="Penjelasan/Alasan kunci..."
                      value={qExplanation}
                      onChange={(e)=>setQExplanation(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-655 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-[10px] text-indigo-700 font-bold transition flex items-center justify-center space-x-1"
                >
                  <span>＋ Simpan Soal ke Daftar Kuis</span>
                </button>
              </div>

              <button
                onClick={handlePublishQuiz}
                disabled={quizQuestions.length === 0}
                className={`w-full py-3 rounded-xl font-bold text-xs transition shadow-sm ${
                  quizQuestions.length === 0
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    : "bg-purple-600 hover:bg-purple-550 text-white"
                }`}
              >
                Publikasikan Kuis Baru ({quizQuestions.length} Soal) 📢
              </button>
            </div>
          </div>

        </div>

        {/* Existing Custom Content Manager */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3">Daftar Materi Kustom Anda</h3>
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
              {materials.map((mat) => (
                <div key={mat.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between text-xs font-semibold">
                  <div>
                    <p className="font-bold text-slate-800">{mat.title}</p>
                    <span className="text-[9px] bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded uppercase mt-1 inline-block">
                      {mat.category}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteMaterial(mat.id)}
                    className="text-red-500 font-bold hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition"
                  >
                    Hapus
                  </button>
                </div>
              ))}
              {materials.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-6">Belum ada materi kustom yang Anda unggah.</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3">Daftar Kuis Kustom Anda</h3>
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center justify-between text-xs font-semibold">
                  <div>
                    <p className="font-bold text-slate-800">{quiz.title}</p>
                    <div className="flex space-x-1.5 items-center mt-1">
                      <span className="text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded uppercase">
                        {quiz.category}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">({quiz.questions.length} Soal)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteQuiz(quiz.id)}
                    className="text-red-500 font-bold hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition"
                  >
                    Hapus
                  </button>
                </div>
              ))}
              {quizzes.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-6">Belum ada kuis kustom yang Anda publikasikan.</p>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
