import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { playSound } from "../utils/audio";
import axios from "axios";


const DEFAULT_QUIZZES = [
  {
    id: "q1",
    title: "Dasar Jaringan & Topologi",
    category: "Dasar",
    questions: [
      {
        question: "Topologi jaringan yang setiap node-nya terhubung ke satu hub atau switch pusat adalah...",
        options: ["Topologi Bus", "Topologi Star", "Topologi Ring", "Topologi Mesh"],
        answer: 1,
        explanation: "Topologi Star menggunakan perangkat pusat (switch/hub) sebagai titik konsentrasi di mana semua komputer klien terhubung secara langsung.",
      },
      {
        question: "Jika salah satu kabel pada topologi Ring terputus, apa yang terjadi pada jaringan?",
        options: [
          "Seluruh jaringan akan mati",
          "Hanya komputer yang terputus yang mati",
          "Jaringan tetap berjalan lancar",
          "Kecepatan jaringan meningkat",
        ],
        answer: 0,
        explanation: "Karena topologi Ring membentuk lingkaran tertutup searah (atau dua arah), putusnya kabel di satu tempat akan memutus sirkulasi data dan melumpuhkan seluruh jaringan.",
      },
      {
        question: "Perangkat jaringan yang berfungsi menghubungkan beberapa jaringan berbeda subnetwork atau segmen IP adalah...",
        options: ["Switch", "Hub", "Router", "Access Point"],
        answer: 2,
        explanation: "Router beroperasi di Layer 3 (Network Layer) dan bertugas merutekan paket data antar-jaringan atau subnetwork yang berbeda.",
      },
    ],
  },
  {
    id: "q2",
    title: "IP Addressing & Subnetting",
    category: "Subnetting",
    questions: [
      {
        question: "Berapa bit panjang dari alamat IPv4?",
        options: ["16 bit", "32 bit", "64 bit", "128 bit"],
        answer: 1,
        explanation: "IPv4 memiliki panjang 32 bit yang dibagi menjadi 4 oktet (masing-masing 8 bit) dipisahkan oleh titik.",
      },
      {
        question: "Subnet mask default untuk IP kelas C dengan prefix /24 adalah...",
        options: ["255.0.0.0", "255.255.0.0", "255.255.255.0", "255.255.255.240"],
        answer: 2,
        explanation: "Prefix /24 berarti 24 bit bernilai 1 (255.255.255), menyisakan 8 bit untuk host (0). Maka subnet mask-nya 255.255.255.0.",
      },
      {
        question: "IP Address 192.168.1.0/24. Manakah IP Broadcast dari subnet tersebut?",
        options: ["192.168.1.1", "192.168.1.254", "192.168.1.255", "192.168.1.0"],
        answer: 2,
        explanation: "IP Broadcast adalah IP terakhir dalam subnet. Untuk 192.168.1.0/24, IP pertama adalah Network ID (.0), usable IP (.1 s/d .254), dan broadcast IP (.255).",
      },
    ],
  },
  {
    id: "q3",
    title: "Perangkat Keras & Kabel UTP",
    category: "Hardware",
    questions: [
      {
        question: "Susunan kabel UTP standar T568B dimulai dengan warna...",
        options: ["Putih-Oranye", "Putih-Hijau", "Putih-Biru", "Putih-Cokelat"],
        answer: 0,
        explanation: "Standar T568B dimulai dengan Putih-Oranye, Oranye, Putih-Hijau, Biru, Putih-Biru, Hijau, Putih-Cokelat, Cokelat.",
      },
      {
        question: "Kabel Straight-Through digunakan untuk menghubungkan...",
        options: [
          "Switch ke Switch",
          "PC ke PC",
          "PC ke Switch atau Router ke Switch",
          "Router ke Router",
        ],
        answer: 2,
        explanation: "Kabel Straight digunakan untuk menghubungkan dua perangkat yang BERBEDA jenis (PC ke Switch, Router ke Switch). Perangkat sejenis menggunakan Cross.",
      },
      {
        question: "Konektor standar yang digunakan untuk kabel UTP kategori 5e atau 6 adalah...",
        options: ["RJ-11", "RJ-45", "BNC", "FC Connector"],
        answer: 1,
        explanation: "RJ-45 (Registered Jack 45) adalah konektor 8-pin standar yang digunakan untuk kabel ethernet UTP/STP.",
      },
    ],
  },
];

export default function Quiz() {
  const [activeQuizIndex, setActiveQuizIndex] = useState(-1);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizzesList, setQuizzesList] = useState(DEFAULT_QUIZZES);

  useEffect(() => {
    const custom = JSON.parse(localStorage.getItem("custom_quizzes")) || [];
    if (custom.length > 0) {
      setQuizzesList([...DEFAULT_QUIZZES, ...custom]);
    }
  }, []);

  const startQuiz = (index) => {
    playSound("click");
    setActiveQuizIndex(index);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setUserAnswers([]);
  };

  const handleOptionClick = (optIdx) => {
    if (isAnswered) return;
    playSound("click");
    setSelectedOption(optIdx);
  };

  const submitAnswer = () => {
    if (selectedOption === null || isAnswered) return;
    
    const quiz = quizzesList[activeQuizIndex];
    const currentQ = quiz.questions[currentQuestionIdx];
    const isCorrect = selectedOption === currentQ.answer;

    if (isCorrect) {
      playSound("success");
      setScore(prev => prev + 1);
    } else {
      playSound("error");
    }

    setUserAnswers(prev => [...prev, {
      question: currentQ.question,
      selected: currentQ.options[selectedOption],
      correctAnswer: currentQ.options[currentQ.answer],
      isCorrect,
      explanation: currentQ.explanation
    }]);

    setIsAnswered(true);
  };

  const nextQuestion = () => {
    playSound("click");
    const quiz = quizzesList[activeQuizIndex];
    if (currentQuestionIdx + 1 < quiz.questions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    playSound("success");
    setQuizFinished(true);
    
    const xpGained = score * 30 + (score === quizzesList[activeQuizIndex].questions.length ? 50 : 0);
    
    const user = JSON.parse(localStorage.getItem("user")) || { name: "Siswa TKJ", xp: 150, level: 1, role: "student", email: "demo@tkj.sch.id" };
    if (user.role === "student") {
      let newXp = (user.xp || 0) + xpGained;
      let newLevel = user.level || 1;
      if (newXp >= newLevel * 200) {
        newXp = newXp - newLevel * 200;
        newLevel += 1;
      }
      user.xp = newXp;
      user.level = newLevel;
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("storage"));

      // SQLite Save
      axios.post("http://localhost:5000/update-progress", {
        email: user.email,
        xp: newXp,
        level: newLevel,
        activity_name: `Menyelesaikan Kuis: ${quizzesList[activeQuizIndex].title} (${score}/${quizzesList[activeQuizIndex].questions.length} benar)`,
        type: "Quiz",
        xp_gained: xpGained
      }).catch(err => console.error("Database save failed:", err));
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800">
      <Sidebar />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-5xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center space-x-2 text-indigo-650 text-sm font-semibold mb-1">
            <span>Pembelajaran</span>
            <span>•</span>
            <span>Evaluasi Siswa</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">
            Kuis Interaktif TKJ
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Uji pemahaman teoritis Anda tentang materi komputer dan jaringan SMK. Dapatkan bonus XP untuk menaikkan level profil Anda!
          </p>
        </header>

        {activeQuizIndex === -1 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {quizzesList.map((quiz, idx) => (
              <div
                key={quiz.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-indigo-500/50 hover:shadow-lg transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {quiz.category}
                    </span>
                    {quiz.id.startsWith("custom-") && (
                      <span className="text-[8px] bg-purple-50 text-purple-600 font-bold px-2 py-0.5 rounded border border-purple-100 uppercase">
                        Guru
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold mt-4 mb-2 text-slate-900">{quiz.title}</h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Kuis berisi {quiz.questions.length} pertanyaan interaktif beserta pembahasan mendalam di akhir kuis.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">Hadiah: +30 XP / Soal</span>
                  <button
                    onClick={() => startQuiz(idx)}
                    className="bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm shadow-indigo-600/10"
                  >
                    Mulai Kuis
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-8 shadow-sm max-w-3xl mx-auto animate-fade-in">
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {quizzesList[activeQuizIndex].title}
              </span>
              <button
                onClick={() => { playSound("click"); setActiveQuizIndex(-1); }}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold flex items-center space-x-1"
              >
                <span>✕ Keluar Kuis</span>
              </button>
            </div>

            {!quizFinished ? (
              <div>
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-bold">
                    <span>Soal {currentQuestionIdx + 1} dari {quizzesList[activeQuizIndex].questions.length}</span>
                    <span>Progres: {Math.round(((currentQuestionIdx) / quizzesList[activeQuizIndex].questions.length) * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIdx) / quizzesList[activeQuizIndex].questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <h2 className="text-base md:text-lg font-bold mb-6 text-slate-900 leading-snug">
                  {quizzesList[activeQuizIndex].questions[currentQuestionIdx].question}
                </h2>

                <div className="space-y-3 mb-6">
                  {quizzesList[activeQuizIndex].questions[currentQuestionIdx].options.map((opt, optIdx) => {
                    let btnStyle = "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-350 hover:bg-slate-100/50 font-medium";
                    
                    if (selectedOption === optIdx) {
                      btnStyle = "border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-600/10 font-bold";
                    }

                    if (isAnswered) {
                      const isCorrectAnswer = optIdx === quizzesList[activeQuizIndex].questions[currentQuestionIdx].answer;
                      const isUserSelection = optIdx === selectedOption;
                      
                      if (isCorrectAnswer) {
                        btnStyle = "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/10 font-bold";
                      } else if (isUserSelection) {
                        btnStyle = "border-red-650 bg-red-50 text-red-950 ring-2 ring-red-650/10 font-bold";
                      } else {
                        btnStyle = "border-slate-150 bg-white text-slate-400 cursor-not-allowed font-medium";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleOptionClick(optIdx)}
                        disabled={isAnswered}
                        className={`w-full text-left p-3.5 rounded-2xl border transition duration-150 flex items-center justify-between text-xs md:text-sm ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswered && optIdx === quizzesList[activeQuizIndex].questions[currentQuestionIdx].answer && (
                          <span className="text-emerald-600 font-bold text-xs">✔ Benar</span>
                        )}
                        {isAnswered && optIdx === selectedOption && optIdx !== quizzesList[activeQuizIndex].questions[currentQuestionIdx].answer && (
                          <span className="text-red-650 font-bold text-xs">✕ Salah</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className="bg-slate-50 border border-slate-250/70 rounded-2xl p-4 mb-6 animate-fade-in text-[11px] md:text-xs text-slate-600 leading-relaxed font-semibold">
                    <p className="font-bold text-indigo-600 mb-1">📖 Pembahasan:</p>
                    {quizzesList[activeQuizIndex].questions[currentQuestionIdx].explanation}
                  </div>
                )}

                <div className="flex justify-end">
                  {!isAnswered ? (
                    <button
                      onClick={submitAnswer}
                      disabled={selectedOption === null}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs transition ${
                        selectedOption === null
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
                          : "bg-indigo-600 hover:bg-indigo-550 text-white shadow-md shadow-indigo-600/10"
                      }`}
                    >
                      Kirim Jawaban
                    </button>
                  ) : (
                    <button
                      onClick={nextQuestion}
                      className="bg-indigo-600 hover:bg-indigo-550 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-md shadow-indigo-600/10"
                    >
                      {currentQuestionIdx + 1 === quizzesList[activeQuizIndex].questions.length ? "Lihat Hasil Kuis" : "Soal Berikutnya →"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Kuis Selesai!</h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto mb-6 font-medium">
                  Anda menjawab dengan benar <strong className="text-indigo-600 font-bold">{score}</strong> dari <strong className="text-slate-900 font-bold">{quizzesList[activeQuizIndex].questions.length}</strong> pertanyaan.
                </p>

                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 max-w-sm mx-auto mb-8 flex justify-between items-center text-sm font-bold">
                  <span className="text-indigo-900">XP Diperoleh:</span>
                  <span className="text-indigo-600">+{score * 30 + (score === quizzesList[activeQuizIndex].questions.length ? 50 : 0)} XP</span>
                </div>

                <div className="text-left border-t border-slate-100 pt-6 max-h-[250px] overflow-y-auto pr-2 space-y-4 mb-6 scrollbar-thin">
                  <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2">Lembar Hasil & Pembahasan:</h3>
                  {userAnswers.map((ans, i) => (
                    <div key={i} className="border border-slate-200 rounded-2xl p-4 bg-slate-50 text-xs font-semibold">
                      <div className="flex justify-between font-bold mb-1">
                        <span className="text-slate-800">Pertanyaan {i+1}</span>
                        <span className={ans.isCorrect ? "text-emerald-650" : "text-red-650"}>
                          {ans.isCorrect ? "Benar" : "Salah"}
                        </span>
                      </div>
                      <p className="text-slate-800 mb-2 font-bold">{ans.question}</p>
                      <p className="text-slate-500">Pilihan Anda: <span className={ans.isCorrect ? "text-emerald-650 font-bold" : "text-red-650 font-bold"}>{ans.selected}</span></p>
                      {!ans.isCorrect && (
                        <p className="text-slate-500 mt-0.5">Kunci: <span className="text-emerald-650 font-bold">{ans.correctAnswer}</span></p>
                      )}
                      <p className="text-[11px] text-indigo-700 mt-2 border-t border-slate-200/60 pt-2"><span className="font-bold text-indigo-900">Pembahasan:</span> {ans.explanation}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => startQuiz(activeQuizIndex)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-xs transition"
                  >
                    Ulangi Kuis
                  </button>
                  <button
                    onClick={() => setActiveQuizIndex(-1)}
                    className="bg-indigo-600 hover:bg-indigo-550 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-md shadow-indigo-600/10"
                  >
                    Kembali Ke Menu
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
