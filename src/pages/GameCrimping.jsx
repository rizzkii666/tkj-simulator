import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { playSound } from "../utils/audio";
import axios from "axios";
import { API_BASE_URL } from "../config";


const WIRE_TYPES = [
  { id: "ow", name: "Putih-Oranye", color: "bg-orange-100 border-orange-400 text-orange-850", stripe: "orange" },
  { id: "o", name: "Oranye", color: "bg-orange-500 border-orange-650 text-white", stripe: "none" },
  { id: "gw", name: "Putih-Hijau", color: "bg-emerald-100 border-emerald-400 text-emerald-850", stripe: "emerald" },
  { id: "b", name: "Biru", color: "bg-blue-600 border-blue-800 text-white", stripe: "none" },
  { id: "bw", name: "Putih-Biru", color: "bg-blue-100 border-blue-400 text-blue-850", stripe: "blue" },
  { id: "g", name: "Hijau", color: "bg-emerald-600 border-emerald-850 text-white", stripe: "none" },
  { id: "brw", name: "Putih-Cokelat", color: "bg-amber-100 border-amber-500 text-amber-900", stripe: "amber" },
  { id: "br", name: "Cokelat", color: "bg-amber-800 border-amber-950 text-white", stripe: "none" },
];

const STANDARDS = {
  T568B: ["ow", "o", "gw", "b", "bw", "g", "brw", "br"],
  T568A: ["gw", "g", "ow", "b", "bw", "o", "brw", "br"],
};

export default function GameCrimping() {
  const [selectedStandard, setSelectedStandard] = useState("T568B");
  const [availableWires, setAvailableWires] = useState([]);
  const [slots, setSlots] = useState(Array(8).fill(null));
  const [selectedWire, setSelectedWire] = useState(null);
  const [gameState, setGameState] = useState("idle");
  const [crimpingAnimation, setCrimpingAnimation] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [currentTestStep, setCurrentTestStep] = useState(-1);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const initGame = () => {
    playSound("click");
    const shuffled = [...WIRE_TYPES].sort(() => Math.random() - 0.5);
    setAvailableWires(shuffled);
    setSlots(Array(8).fill(null));
    setSelectedWire(null);
    setGameState("idle");
    setCrimpingAnimation(false);
    setTestResults([]);
    setCurrentTestStep(-1);
    setFeedbackMsg("");
  };

  useEffect(() => {
    initGame();
  }, [selectedStandard]);

  const selectWire = (wire) => {
    if (gameState !== "idle") return;
    playSound("click");
    setSelectedWire(wire);
  };

  const placeWire = (slotIndex) => {
    if (gameState !== "idle" || !selectedWire) return;
    playSound("click");
    
    const newSlots = [...slots];
    const existingWire = newSlots[slotIndex];
    if (existingWire) {
      setAvailableWires(prev => [...prev, existingWire]);
    }

    newSlots[slotIndex] = selectedWire;
    setSlots(newSlots);
    
    setAvailableWires(prev => prev.filter(w => w.id !== selectedWire.id));
    setSelectedWire(null);
  };

  const removeWire = (slotIndex) => {
    if (gameState !== "idle") return;
    playSound("click");
    const wireToRemove = slots[slotIndex];
    if (!wireToRemove) return;

    const newSlots = [...slots];
    newSlots[slotIndex] = null;
    setSlots(newSlots);
    setAvailableWires(prev => [...prev, wireToRemove]);
  };

  const handleCrimp = () => {
    if (slots.includes(null)) {
      playSound("error");
      alert("Harap masukkan semua 8 kabel ke dalam slot RJ-45 terlebih dahulu!");
      return;
    }

    playSound("crimp");
    setCrimpingAnimation(true);
    setGameState("crimping");

    setTimeout(() => {
      setCrimpingAnimation(false);
      runTester();
    }, 2000);
  };

  const runTester = () => {
    setGameState("testing");
    const targetOrder = STANDARDS[selectedStandard];
    const results = slots.map((wire, idx) => {
      const isCorrect = wire.id === targetOrder[idx];
      return {
        slot: idx + 1,
        wireName: wire.name,
        expected: WIRE_TYPES.find(w => w.id === targetOrder[idx]).name,
        correct: isCorrect
      };
    });
    setTestResults(results);

    let step = 0;
    const interval = setInterval(() => {
      playSound("click");
      setCurrentTestStep(step);
      step++;
      if (step >= 8) {
        clearInterval(interval);
        
        const allCorrect = results.every(r => r.correct);
        setTimeout(() => {
          if (allCorrect) {
            playSound("success");
            setGameState("success");
            setFeedbackMsg(`Selamat! Crimping kabel standar ${selectedStandard} BERHASIL. Hubungan pin 1-8 berfungsi dengan sempurna.`);
            
            const user = JSON.parse(localStorage.getItem("user")) || { name: "Siswa TKJ", xp: 150, level: 1, role: "student", email: "demo@tkj.sch.id" };
            if (user.role === "student") {
              let newXp = (user.xp || 0) + 100;
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
              axios.post(`${API_BASE_URL}/update-progress`, {
                email: user.email,
                xp: newXp,
                level: newLevel,
                activity_name: `Berhasil Crimping Kabel LAN standar ${selectedStandard}`,
                type: "Crimping",
                xp_gained: 100
              }).catch(err => console.error("Database save failed:", err));
            }
          } else {
            playSound("error");
            setGameState("error");
            const wrongPins = results.filter(r => !r.correct).map(r => r.slot).join(", ");
            setFeedbackMsg(`Gagal! Terdapat kesalahan susunan kabel pada Pin: ${wrongPins}. Silakan reset dan coba lagi.`);
          }
        }, 800);
      }
    }, 400);
  };

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800">
      <Sidebar />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-6xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center space-x-2 text-indigo-650 text-sm font-semibold mb-1">
            <span>Interaktif</span>
            <span>•</span>
            <span>Game Praktik</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">
            RJ-45 Crimping Simulator
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Simulasikan pengurutan kabel UTP pada pin konektor RJ-45 untuk membuat kabel Straight / Crossover.
          </p>
        </header>

        {/* Info & Standar selection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-4 md:p-5 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Pilih Standar Pengkabelan</h3>
            <div className="flex space-x-3 mb-4">
              <button
                onClick={() => setSelectedStandard("T568B")}
                className={`flex-1 py-2.5 rounded-xl border text-center font-bold text-xs transition ${
                  selectedStandard === "T568B"
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-350"
                }`}
              >
                T568B (Straight)
              </button>
              <button
                onClick={() => setSelectedStandard("T568A")}
                className={`flex-1 py-2.5 rounded-xl border text-center font-bold text-xs transition ${
                  selectedStandard === "T568A"
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-350"
                }`}
              >
                T568A (Cross A)
              </button>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-[11px] text-slate-600 font-semibold leading-relaxed">
              <p className="font-bold text-indigo-600 mb-0.5">💡 Tips TKJ:</p>
              {selectedStandard === "T568B" ? (
                <p>
                  Urutan <strong>T568B</strong> adalah standar industri terpopuler. Urutan: 
                  Oranye-Putih, Oranye, Hijau-Putih, Biru, Biru-Putih, Hijau, Cokelat-Putih, Cokelat.
                </p>
              ) : (
                <p>
                  Urutan <strong>T568A</strong> dikombinasikan dengan T568B untuk membuat kabel <em>Crossover</em> (PC ke PC). Urutan: 
                  Hijau-Putih, Hijau, Oranye-Putih, Biru, Biru-Putih, Oranye, Cokelat-Putih, Cokelat.
                </p>
              )}
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center space-x-2 text-indigo-900 font-bold mb-2">
                <span>🏆 Tantangan Praktik</span>
              </div>
              <p className="text-xs text-indigo-950 font-semibold leading-relaxed">
                Susun kabel UTP sesuai urutan standar {selectedStandard} di bawah konektor RJ-45 secara berurutan dari kiri (Pin 1) ke kanan (Pin 8).
              </p>
            </div>
            <div className="text-xs text-indigo-700 bg-white border border-indigo-100 rounded-xl p-2.5 mt-3 flex items-center justify-between font-bold">
              <span>Hadiah Sukses:</span>
              <span className="text-yellow-600 font-extrabold">+100 XP</span>
            </div>
          </div>
        </div>

        {/* Simulation Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Connector Canvas Area */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-4 md:p-6 flex flex-col justify-between relative overflow-hidden shadow-sm">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex justify-between items-center mb-6 z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Area Crimping RJ-45</span>
              <button 
                onClick={initGame} 
                className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 transition font-bold"
              >
                Reset Susunan
              </button>
            </div>

            {/* RJ45 Connector Visualization - Mobile Scaling */}
            <div className="my-4 flex flex-col items-center z-10 transform scale-75 sm:scale-95 md:scale-100 origin-center">
              
              {/* Connector Body */}
              <div className="w-[320px] md:w-[340px] bg-slate-800 border border-slate-700 rounded-2xl relative shadow-xl p-3 md:p-4 pt-10 pb-4">
                
                <div className="absolute top-2 left-4 right-4 flex justify-between px-2 text-[10px] text-slate-400 font-bold">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                    <span key={p} className="w-5 md:w-6 text-center">Pin {p}</span>
                  ))}
                </div>

                <div className="flex justify-between px-2 mb-4 border-b border-slate-700/60 pb-2">
                  {Array(8).fill("").map((_, i) => (
                    <div key={i} className={`w-5 md:w-6 h-3 rounded-sm shadow-inner transition-colors duration-300 ${
                      gameState === "testing" && currentTestStep === i 
                        ? (testResults[i]?.correct ? "bg-emerald-400 shadow-emerald-400/50" : "bg-red-500 shadow-red-500/50")
                        : "bg-yellow-600"
                    }`} />
                  ))}
                </div>

                {/* Wire Slots */}
                <div className="bg-slate-950 border border-slate-900 rounded-xl p-2 flex justify-between h-44 relative">
                  {slots.map((wire, idx) => (
                    <div
                      key={idx}
                      onClick={() => wire ? removeWire(idx) : placeWire(idx)}
                      className={`w-[26px] md:w-[30px] h-full rounded-md border flex flex-col items-center justify-between py-2 cursor-pointer transition-all relative ${
                        wire 
                          ? `${wire.color} shadow-md scale-[1.02] font-bold` 
                          : selectedWire 
                            ? "border-dashed border-indigo-500/50 hover:bg-indigo-500/10" 
                            : "border-slate-800 bg-slate-900/30"
                      }`}
                    >
                      {wire ? (
                        <>
                          {wire.stripe !== "none" && (
                            <div className="absolute inset-y-0 left-1/3 right-1/3 bg-white opacity-95 pointer-events-none" />
                          )}
                          <span className="text-[8px] font-extrabold rotate-90 my-auto uppercase whitespace-nowrap tracking-tighter">
                            {wire.id.toUpperCase()}
                          </span>
                          <span className="text-[9px] absolute bottom-1 text-slate-400">✖</span>
                        </>
                      ) : (
                        <div className="my-auto flex flex-col items-center">
                          <span className="text-[9px] font-bold text-slate-600">{idx + 1}</span>
                          <span className="text-[10px] text-slate-550">+</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="w-16 h-10 bg-slate-700 border-x border-b border-slate-600 rounded-b-lg mx-auto flex items-center justify-center">
                  <div className="w-10 h-6 bg-slate-900 rounded" />
                </div>
              </div>

              {/* Cable Outer Jacket */}
              <div className="w-[110px] md:w-[120px] h-16 bg-indigo-600 border-x-2 border-indigo-500/80 flex flex-col items-center justify-start rounded-b-xl relative -mt-3 shadow-inner">
                <span className="text-[9px] font-mono text-indigo-200 font-bold uppercase mt-3">UTP Cat5e</span>
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="text-center text-xs md:text-sm font-bold text-slate-600 z-10 mt-2">
              {gameState === "idle" && (
                selectedWire 
                  ? "Pilih nomor Pin (1 - 8) untuk meletakkan kabel" 
                  : "Klik salah satu kabel di bawah, lalu pasang ke salah satu Pin konektor"
              )}
              {gameState === "crimping" && "Crimping... Mengepres konektor dengan Tang Krimp..."}
              {gameState === "testing" && "Menjalankan LAN Cable Tester..."}
              {gameState === "success" && "Koneksi Bagus! Uji transmisi data 1 Gbps sukses."}
              {gameState === "error" && "Koneksi Gagal. Beberapa pin tidak tersambung ke kabel yang tepat."}
            </div>

            {/* Crimping Animation Overlay */}
            {crimpingAnimation && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-25 animate-fade-in">
                <div className="text-6xl mb-4 animate-bounce">🛠️</div>
                <div className="text-xl font-extrabold text-slate-900 mb-2">PROSES CRIMPING</div>
                <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300/60">
                  <div className="h-full bg-indigo-600 rounded-full animate-[loading_2s_ease-in-out_infinite]" />
                </div>
                <p className="text-slate-500 text-xs mt-3 font-semibold">Tang Krimp sedang mengepres RJ-45...</p>
              </div>
            )}
          </div>

          {/* Wire Palette & Control Area */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Wires Picker */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-5 flex-1 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Pilihan Warna Kabel UTP</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {availableWires.map((wire) => {
                    const isSelected = selectedWire?.id === wire.id;
                    return (
                      <button
                        key={wire.id}
                        onClick={() => selectWire(wire)}
                        disabled={gameState !== "idle"}
                        className={`p-3 rounded-xl border text-left font-bold text-xs transition relative overflow-hidden flex flex-col justify-between min-h-[70px] ${
                          isSelected
                            ? "border-indigo-600 ring-2 ring-indigo-500/10 bg-indigo-50/50 text-indigo-900 shadow-sm"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-350"
                        }`}
                      >
                        {wire.stripe !== "none" && (
                          <div className="absolute inset-y-0 left-0 w-3 bg-white border-r border-slate-200/50 pointer-events-none" />
                        )}
                        <span>{wire.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono mt-1 block uppercase">{wire.id}</span>
                      </button>
                    );
                  })}
                  {availableWires.length === 0 && gameState === "idle" && (
                    <div className="col-span-2 text-center py-6 text-xs text-slate-400 font-bold border border-dashed border-slate-200 bg-slate-50 rounded-xl">
                      Semua kabel sudah terpasang!
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                {gameState === "idle" ? (
                  <button
                    onClick={handleCrimp}
                    disabled={slots.includes(null)}
                    className={`w-full py-3.5 rounded-xl font-bold transition flex items-center justify-center space-x-2 text-sm ${
                      slots.includes(null)
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                        : "bg-indigo-600 hover:bg-indigo-550 text-white shadow-md shadow-indigo-600/15"
                    }`}
                  >
                    <span>Crimp & Tes Koneksi ⚡</span>
                  </button>
                ) : (
                  <button
                    onClick={initGame}
                    className="w-full py-3.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-550 text-white transition shadow-md shadow-indigo-600/10 text-sm"
                  >
                    Main Lagi / Reset 🔄
                  </button>
                )}
              </div>
            </div>

            {/* Cable Tester Visual Panel */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">LAN Cable Tester</h3>
              
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Side (TX) */}
                  <div className="border-r border-slate-800 pr-2">
                    <p className="text-[9px] font-bold text-center text-indigo-400 uppercase mb-2">Transmitter (TX)</p>
                    <div className="space-y-1">
                      {Array(8).fill("").map((_, i) => (
                        <div key={i} className="flex items-center space-x-2 text-xs">
                          <span className="w-3 text-slate-500 font-bold">{i+1}</span>
                          <div className={`w-3.5 h-3.5 rounded-full transition-colors duration-300 ${
                            (gameState === "testing" && currentTestStep === i) || gameState === "success"
                              ? "bg-emerald-400 shadow-md shadow-emerald-400/50"
                              : "bg-slate-800"
                          }`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Side (RX) */}
                  <div className="pl-2">
                    <p className="text-[9px] font-bold text-center text-indigo-400 uppercase mb-2">Receiver (RX)</p>
                    <div className="space-y-1">
                      {Array(8).fill("").map((_, i) => {
                        const isTestingCurrent = gameState === "testing" && currentTestStep === i;
                        const isCorrect = testResults[i]?.correct;
                        return (
                          <div key={i} className="flex items-center space-x-2 text-xs">
                            <div className={`w-3.5 h-3.5 rounded-full transition-colors duration-300 ${
                              isTestingCurrent 
                                ? (isCorrect ? "bg-emerald-400 shadow-md" : "bg-red-500 shadow-md") 
                                : gameState === "success" 
                                  ? "bg-emerald-400 shadow-md" 
                                  : gameState === "error" && !testResults[i]?.correct
                                    ? "bg-red-500 shadow-md"
                                    : "bg-slate-800"
                            }`} />
                            <span className="w-3 text-slate-500 font-bold">{i+1}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Game Results Alert */}
        {(gameState === "success" || gameState === "error") && (
          <div className={`mt-6 p-6 rounded-2xl border animate-fade-in ${
            gameState === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-950 font-semibold" 
              : "bg-red-50 border-red-200 text-red-950 font-semibold"
          }`}>
            <div className="flex items-start space-x-3">
              <span className="text-3xl">
                {gameState === "success" ? "🎉" : "❌"}
              </span>
              <div>
                <h4 className="font-extrabold text-lg">
                  {gameState === "success" ? "Crimping Sukses!" : "Koneksi Bermasalah"}
                </h4>
                <p className="text-sm mt-1 opacity-90">{feedbackMsg}</p>
                
                {gameState === "error" && (
                  <div className="mt-4 bg-white border border-slate-200 rounded-xl p-3 max-h-[200px] overflow-y-auto scrollbar-thin">
                    <p className="text-xs font-bold text-indigo-600 mb-2">Analisis Sambungan Pin:</p>
                    <table className="w-full text-[11px] font-mono text-left text-slate-700">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400">
                          <th className="pb-1 font-bold">Pin</th>
                          <th className="pb-1 font-bold">Kabel Anda</th>
                          <th className="pb-1 font-bold">Target</th>
                          <th className="pb-1 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testResults.map((res, i) => (
                          <tr key={i} className="border-b border-slate-100">
                            <td className="py-1">{res.slot}</td>
                            <td className="py-1 text-slate-600 font-semibold">{res.wireName}</td>
                            <td className="py-1 text-slate-500">{res.expected}</td>
                            <td className={`py-1 font-bold ${res.correct ? "text-emerald-600" : "text-red-650"}`}>
                              {res.correct ? "OK" : "SALAH"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
