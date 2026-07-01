import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { playSound } from "../utils/audio";

const getEmbedUrl = (url) => {
  if (!url) return null;
  if (url.includes("/embed/")) return url;
  
  let videoId = "";
  try {
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split(/[?#]/)[0];
    } else if (url.includes("youtube.com/shorts/") || url.includes("/shorts/")) {
      videoId = url.split("/shorts/")[1]?.split(/[?#]/)[0];
    } else if (url.includes("youtube.com/watch")) {
      const parts = url.split("?");
      if (parts.length > 1) {
        const urlParams = new URLSearchParams(parts[1]);
        videoId = urlParams.get("v");
      }
    } else if (url.includes("youtube.com/v/")) {
      videoId = url.split("youtube.com/v/")[1]?.split(/[?#]/)[0];
    } else {
      videoId = url.trim();
    }
  } catch (e) {
    console.error("Error parsing youtube url", e);
  }
  
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

export default function Materi() {
  const [activeTab, setActiveTab] = useState("topologi");
  const [customMaterials, setCustomMaterials] = useState([]);
  
  // Interactive Diagram State
  const [selectedDiagNode, setSelectedDiagNode] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");

  // IP Calculator State
  const [ipInput, setIpInput] = useState("192.168.1.10");
  const [cidrInput, setCldrInput] = useState(24);
  const [calcResult, setCalcResult] = useState(null);

  useEffect(() => {
    const custom = JSON.parse(localStorage.getItem("custom_materials")) || [];
    setCustomMaterials(custom);
  }, []);

  const changeTab = (tab) => {
    playSound("click");
    setActiveTab(tab);
    setSearchQuery(""); // Clear search on tab switch
  };

  const calculateSubnet = () => {
    playSound("click");
    const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ipInput)) {
      playSound("error");
      alert("Format IP Address tidak valid! Contoh: 192.168.1.1");
      return;
    }

    const octets = ipInput.split(".").map(Number);
    const prefix = Number(cidrInput);

    let ipClass = "C";
    if (octets[0] >= 1 && octets[0] <= 126) ipClass = "A";
    else if (octets[0] >= 128 && octets[0] <= 191) ipClass = "B";
    else if (octets[0] >= 192 && octets[0] <= 223) ipClass = "C";
    else if (octets[0] >= 224 && octets[0] <= 239) ipClass = "D (Multicast)";
    else if (octets[0] >= 240) ipClass = "E (Eksperimental)";

    const ipInt = ((octets[0] << 24) >>> 0) + ((octets[1] << 16) >>> 0) + ((octets[2] << 8) >>> 0) + octets[3];

    let maskInt = 0;
    if (prefix > 0) {
      maskInt = (0xffffffff << (32 - prefix)) >>> 0;
    }

    const netInt = (ipInt & maskInt) >>> 0;
    const broadInt = (netInt | ~maskInt) >>> 0;

    const intToIp = (val) => {
      return [
        (val >>> 24) & 255,
        (val >>> 16) & 255,
        (val >>> 8) & 255,
        val & 255
      ].join(".");
    };

    const subnetMask = intToIp(maskInt);
    const networkAddress = intToIp(netInt);
    const broadcastAddress = intToIp(broadInt);
    
    let firstUsable = "N/A";
    let lastUsable = "N/A";
    let totalHosts = 0;

    if (prefix < 31) {
      firstUsable = intToIp(netInt + 1);
      lastUsable = intToIp(broadInt - 1);
      totalHosts = Math.pow(2, 32 - prefix) - 2;
    } else if (prefix === 31) {
      firstUsable = intToIp(netInt);
      lastUsable = intToIp(broadInt);
      totalHosts = 2;
    } else if (prefix === 32) {
      firstUsable = intToIp(netInt);
      lastUsable = intToIp(broadInt);
      totalHosts = 1;
    }

    playSound("success");
    setCalcResult({
      ipClass,
      subnetMask,
      networkAddress,
      broadcastAddress,
      firstUsable,
      lastUsable,
      totalHosts
    });
  };

  const topologies = [
    {
      name: "Topologi Star (Bintang)",
      icon: "⭐",
      description: "Setiap perangkat klien terhubung langsung ke satu hub atau switch pusat menggunakan kabel UTP. Transmisi terpusat.",
      pros: ["Kerusakan satu kabel tidak mengganggu node lain", "Mudah menambah/mengurangi komputer", "Kemudahan deteksi kerusakan perangkat"],
      cons: ["Jika Switch/Hub pusat mati, seluruh jaringan lumpuh", "Butuh kabel lebih banyak dibanding Bus"],
      wiring: "Kabel Straight-Through (UTP Cat5e/6) menghubungkan PC ke Switch."
    },
    {
      name: "Topologi Bus",
      icon: "🚌",
      description: "Semua komputer terhubung pada satu media transmisi utama (kabel backbone tunggal). Ujung kabel ditutup terminator.",
      pros: ["Hemat kabel dan biaya sangat murah", "Instalasi sangat sederhana untuk skala kecil"],
      cons: ["Jika kabel utama (backbone) putus, seluruh jaringan mati", "Kepadatan lalu lintas tinggi (sering tabrakan data / collision)"],
      wiring: "Menggunakan kabel Koaksial dengan T-Connector dan terminator di ujung."
    },
    {
      name: "Topologi Ring (Cincin)",
      icon: "⭕",
      description: "Menghubungkan satu node ke node berikutnya hingga membentuk loop melingkar tertutup. Token passing.",
      pros: ["Aliran data mengalir satu arah, meminimalisir tabrakan (collision)", "Performa stabil meskipun beban data berat"],
      cons: ["Jika satu komputer mengalami gangguan, transmisi data terhenti", "Troubleshooting relatif lebih sulit dibanding Star"],
      wiring: "Kabel STP atau UTP melingkar dari card out ke card in node tetangga."
    },
    {
      name: "Topologi Mesh (Jala)",
      icon: "🕸️",
      description: "Setiap node saling terhubung satu sama lain secara langsung (point-to-point) memberikan toleransi kesalahan tinggi.",
      pros: ["Redundansi tinggi; link putus tidak mempengaruhi link lain", "Kerahasiaan dan keamanan data terjamin"],
      cons: ["Boros kabel dan port I/O pada perangkat", "Instalasi dan konfigurasi sangat rumit"],
      wiring: "Membutuhkan banyak NIC/port RJ-45 pada setiap PC."
    },
    {
      name: "Topologi Tree (Pohon)",
      icon: "🌳",
      description: "Kombinasi karakteristik antara topologi Star dan Bus, bercabang bertingkat layaknya pohon. Hub pusat bercabang ke hub sekunder.",
      pros: ["Mudah didekonstruksi untuk perluasan jaringan", "Manajemen jaringan terpusat per sub-tingkat"],
      cons: ["Kabel backbone utama rusak, seluruh jaringan cabang mati", "Konfigurasi rumit"],
      wiring: "Hub pusat bercabang ke switch lokal menggunakan kabel UTP backbone Gigabit."
    }
  ];

  // Filtering Logic based on Search Query
  const filteredTopologies = topologies.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.wiring.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomMaterials = customMaterials.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800">
      <Sidebar />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-6xl mx-auto">
        <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-650 text-sm font-semibold mb-1">
              <span>Kurikulum Lengkap TKJ</span>
              <span>•</span>
              <span>Bahan Ajar Utama</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">
              Dasar Teori Jaringan TKJ
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Materi terlengkap untuk persiapan Ujian Kompetensi Keahlian (UKK) TKJ SMK.
            </p>
          </div>

          {/* Search bar widget */}
          <div className="w-full md:w-72 relative">
            <input
              type="text"
              placeholder="Cari materi... (e.g. VLAN, WiFi, /26)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500 font-bold"
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
          </div>
        </header>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 space-x-4 md:space-x-6 mb-6 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => changeTab("topologi")}
            className={`pb-3 font-bold text-xs md:text-sm transition relative whitespace-nowrap ${
              activeTab === "topologi" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            📡 Topologi Jaringan
          </button>
          <button
            onClick={() => changeTab("ipaddress")}
            className={`pb-3 font-bold text-xs md:text-sm transition relative whitespace-nowrap ${
              activeTab === "ipaddress" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🌐 IP & Subnetting
          </button>
          <button
            onClick={() => changeTab("routing")}
            className={`pb-3 font-bold text-xs md:text-sm transition relative whitespace-nowrap ${
              activeTab === "routing" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🔀 Routing, Switching & VLAN
          </button>
          <button
            onClick={() => changeTab("cabling")}
            className={`pb-3 font-bold text-xs md:text-sm transition relative whitespace-nowrap ${
              activeTab === "cabling" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🔌 Media Transmisi & Kabel UTP/Fiber
          </button>
          {customMaterials.length > 0 && (
            <button
              onClick={() => changeTab("guru")}
              className={`pb-3 font-bold text-xs md:text-sm transition relative whitespace-nowrap ${
                activeTab === "guru" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              🎓 Materi Tambahan Guru
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === "topologi" && (
          <div className="space-y-6 animate-fade-in">
            {/* Interactive SVG Diagram Showcase */}
            {searchQuery === "" && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-2">Diagram Interaktif Topologi Jaringan</h3>
                <p className="text-xs text-slate-500 mb-4 font-semibold">Klik pada perangkat (komputer/switch) di dalam diagram untuk melihat perannya!</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="border border-slate-200 bg-slate-50 rounded-2xl p-4 flex flex-col items-center">
                    <span className="text-xs font-bold text-indigo-650 uppercase tracking-wider mb-2">Desain Star</span>
                    <svg className="w-48 h-40" viewBox="0 0 200 160">
                      <line x1="100" y1="80" x2="30" y2="40" stroke="#cbd5e1" strokeWidth="3" />
                      <line x1="100" y1="80" x2="170" y2="40" stroke="#cbd5e1" strokeWidth="3" />
                      <line x1="100" y1="80" x2="30" y2="120" stroke="#cbd5e1" strokeWidth="3" />
                      <line x1="100" y1="80" x2="170" y2="120" stroke="#cbd5e1" strokeWidth="3" />
                      <circle cx="100" cy="80" r="18" fill="#10b981" className="cursor-pointer" onClick={() => { playSound("click"); setSelectedDiagNode("Switch pusat (Hub): Berfungsi meneruskan paket ke PC tujuan."); }} />
                      <text x="100" y="84" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle" pointerEvents="none">SW</text>
                      <circle cx="30" cy="40" r="14" fill="#6366f1" className="cursor-pointer" onClick={() => { playSound("click"); setSelectedDiagNode("PC-1: Klien yang terhubung langsung ke Switch pusat."); }} />
                      <circle cx="170" cy="40" r="14" fill="#6366f1" className="cursor-pointer" onClick={() => { playSound("click"); setSelectedDiagNode("PC-2: Komputer dalam satu LAN."); }} />
                      <circle cx="30" cy="120" r="14" fill="#6366f1" className="cursor-pointer" onClick={() => { playSound("click"); setSelectedDiagNode("PC-3: Node klien Star."); }} />
                      <circle cx="170" cy="120" r="14" fill="#6366f1" className="cursor-pointer" onClick={() => { playSound("click"); setSelectedDiagNode("PC-4: Node klien Star."); }} />
                    </svg>
                  </div>

                  <div className="border border-slate-200 bg-slate-50 rounded-2xl p-4 flex flex-col items-center">
                    <span className="text-xs font-bold text-indigo-650 uppercase tracking-wider mb-2">Desain Bus</span>
                    <svg className="w-48 h-40" viewBox="0 0 200 160">
                      <line x1="20" y1="80" x2="180" y2="80" stroke="#475569" strokeWidth="5" />
                      <line x1="50" y1="80" x2="50" y2="40" stroke="#cbd5e1" strokeWidth="3" />
                      <line x1="150" y1="80" x2="150" y2="40" stroke="#cbd5e1" strokeWidth="3" />
                      <line x1="100" y1="80" x2="100" y2="120" stroke="#cbd5e1" strokeWidth="3" />
                      <circle cx="50" cy="40" r="14" fill="#6366f1" className="cursor-pointer" onClick={() => { playSound("click"); setSelectedDiagNode("PC-A: Mengirim data ke kabel backbone utama."); }} />
                      <circle cx="150" cy="40" r="14" fill="#6366f1" className="cursor-pointer" onClick={() => { playSound("click"); setSelectedDiagNode("PC-B: Terhubung ke T-connector backbone."); }} />
                      <circle cx="100" cy="120" r="14" fill="#6366f1" className="cursor-pointer" onClick={() => { playSound("click"); setSelectedDiagNode("PC-C: Mendengar traffic di jalur backbone utama."); }} />
                      <rect x="15" y="72" width="6" height="16" fill="#ef4444" />
                      <rect x="179" y="72" width="6" height="16" fill="#ef4444" />
                    </svg>
                  </div>

                  <div className="border border-slate-200 bg-slate-50 rounded-2xl p-4 flex flex-col items-center">
                    <span className="text-xs font-bold text-indigo-650 uppercase tracking-wider mb-2">Desain Ring</span>
                    <svg className="w-48 h-40" viewBox="0 0 200 160">
                      <path d="M 100 20 A 60 60 0 1 1 99.9 20" fill="none" stroke="#cbd5e1" strokeWidth="3" />
                      <circle cx="100" cy="20" r="14" fill="#6366f1" className="cursor-pointer" onClick={() => { playSound("click"); setSelectedDiagNode("PC-1: Token dioper secara sekuensial."); }} />
                      <circle cx="160" cy="80" r="14" fill="#6366f1" className="cursor-pointer" onClick={() => { playSound("click"); setSelectedDiagNode("PC-2: Meneruskan data ke PC berikutnya."); }} />
                      <circle cx="100" cy="140" r="14" fill="#6366f1" className="cursor-pointer" onClick={() => { playSound("click"); setSelectedDiagNode("PC-3: Loop tertutup searah jarum jam."); }} />
                      <circle cx="40" cy="80" r="14" fill="#6366f1" className="cursor-pointer" onClick={() => { playSound("click"); setSelectedDiagNode("PC-4: Node dalam ring."); }} />
                    </svg>
                  </div>
                </div>

                {selectedDiagNode && (
                  <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl text-xs font-semibold animate-fade-in">
                    ℹ️ {selectedDiagNode}
                  </div>
                )}
              </div>
            )}

            {/* Comparison Table */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm overflow-x-auto scrollbar-thin">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Tabel Perbandingan Karakteristik Topologi</h3>
              <table className="w-full text-left text-xs border-collapse font-semibold">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-indigo-700">
                    <th className="p-3">Kriteria</th>
                    <th className="p-3">Star (Bintang)</th>
                    <th className="p-3">Bus</th>
                    <th className="p-3">Ring (Cincin)</th>
                    <th className="p-3">Mesh (Jala)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Biaya Kabel</td>
                    <td className="p-3">Sedang</td>
                    <td className="p-3 text-emerald-650">Sangat Murah</td>
                    <td className="p-3">Murah</td>
                    <td className="p-3 text-red-650">Sangat Mahal</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Tingkat Redundansi</td>
                    <td className="p-3">Rendah</td>
                    <td className="p-3">Tidak Ada</td>
                    <td className="p-3">Rendah</td>
                    <td className="p-3 text-emerald-650">Sangat Tinggi</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Kemudahan Troubleshoot</td>
                    <td className="p-3 text-emerald-650">Sangat Mudah</td>
                    <td className="p-3">Sulit</td>
                    <td className="p-3">Sedang</td>
                    <td className="p-3">Sangat Sulit</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Risiko Collision</td>
                    <td className="p-3">Tidak Ada (Switch)</td>
                    <td className="p-3 text-red-650">Tinggi</td>
                    <td className="p-3">Sangat Rendah</td>
                    <td className="p-3">Tidak Ada</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Topologies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTopologies.map((top, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-3xl mb-3 block">{top.icon}</span>
                    <h3 className="text-base font-bold mb-2 text-slate-900">{top.name}</h3>
                    <p className="text-xs text-slate-500 mb-4 font-semibold">{top.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Kelebihan:</span>
                        <ul className="text-xs text-slate-600 list-disc list-inside mt-1 space-y-1 font-semibold">
                          {top.pros.map((pro, pIdx) => (
                            <li key={pIdx}>{pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-red-650 tracking-wider">Kekurangan:</span>
                        <ul className="text-xs text-slate-600 list-disc list-inside mt-1 space-y-1 font-semibold">
                          {top.cons.map((con, cIdx) => (
                            <li key={cIdx}>{con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-indigo-750 bg-indigo-50/50 rounded-xl p-2.5 border border-indigo-100 font-bold">
                    <strong>Kabel:</strong> {top.wiring}
                  </div>
                </div>
              ))}
              {filteredTopologies.length === 0 && (
                <div className="col-span-3 text-center py-8 text-slate-450 font-bold italic">
                  {"Tidak ditemukan hasil untuk \"" + searchQuery + "\" pada kategori ini."}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "ipaddress" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
            <div className="lg:col-span-7 space-y-6">
              {/* YouTube Video Embed */}
              {searchQuery === "" && (
                <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-1.5">
                    <span>📺</span>
                    <span>Video Tutorial: Konsep IP & Subnetting</span>
                  </h3>
                  <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 aspect-video">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={getEmbedUrl("https://www.youtube.com/watch?v=L8y-zL9hSbM")}
                      title="IPv4 | Belajar Subnetting | Indonesia Belajar"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Text Module content */}
              {("IP Address Subnetting Publik Privat Kelas IPv4 IPv6 CIDR").toLowerCase().includes(searchQuery.toLowerCase()) ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-3 text-slate-900">Alamat IP (Internet Protocol)</h2>
                    <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                      IP Address adalah label numerik unik yang disematkan pada setiap perangkat dalam jaringan TCP/IP. Terbagi atas dua standar utama: **IPv4** (32-bit, ditulis dalam desimal seperti `192.168.1.1`) dan **IPv6** (128-bit, ditulis dalam heksadesimal dipisahkan titik dua seperti `2001:db8::ff00:42`).
                    </p>
                  </div>

                  {/* IPv4 Class Table */}
                  <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50 p-4">
                    <h4 className="text-xs font-bold text-indigo-750 uppercase tracking-wider mb-2">Kelas Alamat IPv4 Unicast</h4>
                    <table className="w-full text-left text-[11px] font-semibold">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-200">
                          <th className="pb-1.5">Kelas</th>
                          <th className="pb-1.5">Rentang Oktet Pertama</th>
                          <th className="pb-1.5">Subnet Mask Default</th>
                          <th className="pb-1.5 text-right">Host Valid per Subnet</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700">
                        <tr className="border-b border-slate-100">
                          <td className="py-1">Kelas A</td>
                          <td className="py-1">1 – 126</td>
                          <td className="py-1">255.0.0.0 (/8)</td>
                          <td className="py-1 text-right">16,777,214</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-1">Kelas B</td>
                          <td className="py-1">128 – 191</td>
                          <td className="py-1">255.255.0.0 (/16)</td>
                          <td className="py-1 text-right">65,534</td>
                        </tr>
                        <tr>
                          <td className="py-1">Kelas C</td>
                          <td className="py-1">192 – 223</td>
                          <td className="py-1">255.255.255.0 (/24)</td>
                          <td className="py-1 text-right">254</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* CIDR Prefix Quick Lookup Table */}
                  <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50 p-4">
                    <h4 className="text-xs font-bold text-indigo-750 uppercase tracking-wider mb-2">Lookup Subnetting Kelas C</h4>
                    <table className="w-full text-left text-[11px] font-semibold">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-200">
                          <th className="pb-1.5">Prefix</th>
                          <th className="pb-1.5">Subnet Mask</th>
                          <th className="pb-1.5 text-center">Jumlah Subnet</th>
                          <th className="pb-1.5 text-right">Host Valid</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700">
                        <tr className="border-b border-slate-100">
                          <td className="py-1">/25</td>
                          <td className="py-1">255.255.255.128</td>
                          <td className="py-1 text-center">2</td>
                          <td className="py-1 text-right">126</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-1">/26</td>
                          <td className="py-1">255.255.255.192</td>
                          <td className="py-1 text-center">4</td>
                          <td className="py-1 text-right">62</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-1">/27</td>
                          <td className="py-1">255.255.255.224</td>
                          <td className="py-1 text-center">8</td>
                          <td className="py-1 text-right">30</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-1">/28</td>
                          <td className="py-1">255.255.255.240</td>
                          <td className="py-1 text-center">16</td>
                          <td className="py-1 text-right">14</td>
                        </tr>
                        <tr className="border-b border-slate-100">
                          <td className="py-1">/29</td>
                          <td className="py-1">255.255.255.248</td>
                          <td className="py-1 text-center">32</td>
                          <td className="py-1 text-right">6</td>
                        </tr>
                        <tr>
                          <td className="py-1">/30</td>
                          <td className="py-1">255.255.255.252</td>
                          <td className="py-1 text-center">64</td>
                          <td className="py-1 text-right">2</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">RFC 1918 (Pembagian IP Privat):</h3>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                      IP Privat adalah alamat yang dialokasikan khusus untuk jaringan lokal di dalam rumah, sekolah, atau kantor. IP Privat tidak dapat merutekan data langsung di internet global tanpa proses **NAT (Network Address Translation)** di Router.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-450 font-bold italic bg-white border border-slate-200 rounded-3xl">
                  {"Tidak ditemukan hasil untuk \"" + searchQuery + "\" pada deskripsi IP."}
                </div>
              )}
            </div>

            {/* Subnet Calculator Interactive Widget */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-xl">🧮</span>
                <h3 className="font-bold text-slate-900 text-base">Kalkulator Subnetting IP</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">IP Address (IPv4)</label>
                  <input
                    type="text"
                    value={ipInput}
                    onChange={(e) => setIpInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 font-semibold font-mono"
                    placeholder="192.168.1.1"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Prefix / CIDR</label>
                  <select
                    value={cidrInput}
                    onChange={(e) => setCldrInput(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 font-semibold font-mono"
                  >
                    {Array.from({ length: 25 }, (_, i) => i + 8).map((p) => (
                      <option key={p} value={p}>
                        /{p} ({p >= 24 ? "Kelas C" : p >= 16 ? "Kelas B" : "Kelas A"})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={calculateSubnet}
                  className="w-full bg-indigo-600 hover:bg-indigo-550 text-white font-bold py-3 rounded-xl transition text-xs md:text-sm shadow-md"
                >
                  Hitung Subnet
                </button>

                {calcResult && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono space-y-2.5 animate-fade-in mt-4 font-semibold">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-400">Kelas IP</span>
                      <span className="text-indigo-600 font-bold">{calcResult.ipClass}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-400">Subnet Mask</span>
                      <span className="text-slate-700">{calcResult.subnetMask}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-400">Network ID</span>
                      <span className="text-emerald-600 font-bold">{calcResult.networkAddress}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-400">IP Host Pertama</span>
                      <span className="text-slate-700">{calcResult.firstUsable}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-400">IP Host Terakhir</span>
                      <span className="text-slate-700">{calcResult.lastUsable}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-400">Broadcast ID</span>
                      <span className="text-red-500 font-bold">{calcResult.broadcastAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Host Valid</span>
                      <span className="text-yellow-600 font-bold">{calcResult.totalHosts.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "routing" && (
          <div className="space-y-6 animate-fade-in">
            {/* YouTube Video Embed */}
            {searchQuery === "" && (
              <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-1.5">
                  <span>📺</span>
                  <span>Video Tutorial: Bagaimana Routing Paket Data Bekerja?</span>
                </h3>
                <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 aspect-video">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={getEmbedUrl("https://youtu.be/ttdkh0YxgUw?si=9KQ5SVnyKOCxYvbk")}
                    title="Konsep Dasar Routing Bahasa Indonesia"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {("Routing Switching VLAN Access Trunk RIP OSPF EIGRP BGP Cisco command").toLowerCase().includes(searchQuery.toLowerCase()) ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-3 text-slate-900">Switching, VLAN, dan Routing</h2>
                  <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                    *   **Switching**: Proses pengiriman data di dalam LAN lokal berdasarkan **MAC Address** (Layer 2).
                    *   **VLAN (Virtual LAN)**: Teknologi membagi satu fisik Switch ke dalam beberapa subnet broadcast logika terpisah.
                    *   **Routing**: Proses meneruskan paket data antar-jaringan yang berbeda subnet menggunakan **Alamat IP** (Layer 3).
                  </p>
                </div>

                {searchQuery === "" && (
                  <div className="border border-slate-200 bg-slate-50 rounded-2xl p-4 flex flex-col items-center my-4">
                    <span className="text-xs font-bold text-indigo-650 uppercase tracking-wider mb-3">Diagram Skematik Routing</span>
                    <svg className="w-full max-w-lg h-36" viewBox="0 0 500 120">
                      <line x1="80" y1="60" x2="200" y2="60" stroke="#cbd5e1" strokeWidth="3" />
                      <line x1="300" y1="60" x2="420" y2="60" stroke="#cbd5e1" strokeWidth="3" />
                      <rect x="20" y="35" width="60" height="50" rx="8" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" />
                      <text x="50" y="60" fill="#4f46e5" fontSize="10" fontWeight="bold" textAnchor="middle">LAN A</text>
                      <text x="50" y="74" fill="#64748b" fontSize="8" textAnchor="middle">192.168.1.0/24</text>
                      <circle cx="250" cy="60" r="24" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
                      <text x="250" y="64" fill="#b45309" fontSize="11" fontWeight="bold" textAnchor="middle">ROUTER</text>
                      <rect x="420" y="35" width="60" height="50" rx="8" fill="#d1fae5" stroke="#10b981" strokeWidth="2" />
                      <text x="450" y="60" fill="#059669" fontSize="10" fontWeight="bold" textAnchor="middle">LAN B</text>
                      <text x="450" y="74" fill="#64748b" fontSize="8" textAnchor="middle">10.0.0.0/8</text>
                      <path d="M 120 40 Q 250 10 380 40" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5" />
                    </svg>
                  </div>
                )}

                {/* VLAN Commands Block */}
                <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 font-mono text-[11px] leading-relaxed">
                  <p className="text-indigo-400 font-bold mb-2">⚡ Contoh Perintah Konfigurasi VLAN (Cisco iOS):</p>
                  <p>Switch# <span className="text-yellow-400">configure terminal</span></p>
                  <p>Switch(config)# <span className="text-yellow-400">vlan 10</span></p>
                  <p>Switch(config-vlan)# <span className="text-yellow-400">name SISWA_TKJ</span></p>
                  <p>Switch(config-vlan)# <span className="text-yellow-400">exit</span></p>
                  <p>Switch(config)# <span className="text-yellow-400">interface fastEthernet 0/5</span></p>
                  <p>Switch(config-if)# <span className="text-yellow-400">switchport mode access</span></p>
                  <p>Switch(config-if)# <span className="text-yellow-400">switchport access vlan 10</span></p>
                  <p className="text-slate-500 mt-2"># Menghubungkan switch ke router via trunk link:</p>
                  <p>Switch(config)# <span className="text-yellow-400">interface gigabitEthernet 0/1</span></p>
                  <p>Switch(config-if)# <span className="text-yellow-400">switchport mode trunk</span></p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <h3 className="font-bold text-indigo-600 text-xs uppercase tracking-wider mb-2">Perbandingan VLAN Access Port vs Trunk Port</h3>
                    <ul className="text-xs text-slate-500 space-y-1.5 font-semibold list-disc list-inside">
                      <li><strong>Access Port</strong>: Hanya membawa traffic untuk 1 VLAN saja. Biasanya dihubungkan langsung ke komputer end-user (PC/Laptop).</li>
                      <li><strong>Trunk Port</strong>: Membawa traffic untuk beberapa VLAN secara bersamaan. Dilengkapi dengan tagging IEEE 802.1Q. Dihubungkan antar-switch atau switch-ke-router.</li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <h3 className="font-bold text-indigo-600 text-xs uppercase tracking-wider mb-2">Protokol Routing Dinamis</h3>
                    <ul className="text-xs text-slate-500 space-y-1.5 font-semibold list-disc list-inside font-semibold">
                      <li><strong>RIP (Routing Information Protocol)</strong>: Menggunakan metrik Hop Count (maks 15 hop). Cocok untuk jaringan skala kecil.</li>
                      <li><strong>OSPF (Open Shortest Path First)</strong>: Menggunakan link-state metric, membagi jaringan berdasarkan Area. Sangat cepat konvergensinya.</li>
                      <li><strong>BGP (Border Gateway Protocol)</strong>: Path Vector routing. Protokol inti yang menghubungkan antar-ISP di internet global.</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-450 font-bold italic bg-white border border-slate-200 rounded-3xl">
                {"Tidak ditemukan hasil untuk \"" + searchQuery + "\" pada materi routing."}
              </div>
            )}
          </div>
        )}

        {activeTab === "cabling" && (
          <div className="space-y-6 animate-fade-in">
            {/* YouTube Video Embed */}
            {searchQuery === "" && (
              <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-1.5">
                  <span>📺</span>
                  <span>Video Tutorial: Cara Krimp Kabel UTP RJ45 (Straight & Cross)</span>
                </h3>
                <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 aspect-video">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={getEmbedUrl("https://youtu.be/JDiybTG9dGY?si=GuaoJH5mRtPZVYKM")}
                    title="Tutorial Crimping Kabel UTP Bahasa Indonesia"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {("Kabel UTP Fiber Optic Nirkabel Wifi Single Multi Cat5e Cat6 T568A T568B UTP STP FTP").toLowerCase().includes(searchQuery.toLowerCase()) ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4 text-slate-900">Media Transmisi Fisik Jaringan</h2>
                  <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                    Media transmisi menghubungkan pengirim dan penerima data secara fisik. Terbagi atas kabel tembaga (copper), serat optik (light), dan gelombang udara (nirkabel/wireless).
                  </p>
                </div>

                {/* UTP Color Standards Table */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <h3 className="font-bold text-indigo-750 text-xs uppercase tracking-wider mb-3">Tabel Urutan Pin Standar T568A vs T568B</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="bg-white border border-slate-150 rounded-xl p-3">
                      <p className="font-extrabold text-slate-900 border-b pb-1.5 mb-1.5">Standard T568B (Straight/Umum)</p>
                      <ol className="list-decimal list-inside space-y-1 font-mono text-[11px] text-slate-600">
                        <li>Putih-Oranye</li>
                        <li>Oranye</li>
                        <li>Putih-Hijau</li>
                        <li>Biru</li>
                        <li>Putih-Biru</li>
                        <li>Hijau</li>
                        <li>Putih-Cokelat</li>
                        <li>Cokelat</li>
                      </ol>
                    </div>
                    <div className="bg-white border border-slate-150 rounded-xl p-3">
                      <p className="font-extrabold text-slate-900 border-b pb-1.5 mb-1.5">Standard T568A (Crossover End)</p>
                      <ol className="list-decimal list-inside space-y-1 font-mono text-[11px] text-slate-600">
                        <li>Putih-Hijau</li>
                        <li>Hijau</li>
                        <li>Putih-Oranye</li>
                        <li>Biru</li>
                        <li>Putih-Biru</li>
                        <li>Oranye</li>
                        <li>Putih-Cokelat</li>
                        <li>Cokelat</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* UTP */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <span className="text-2xl mb-2 block">🔌</span>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Tipe Kabel Pelindung</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      *   **UTP (Unshielded)**: Kabel pilin tanpa pelindung aluminium foil. Rentan interferensi.
                      *   **STP (Shielded)**: Dilapisi pelindung anyaman logam untuk proteksi ekstra.
                      *   **FTP (Foiled)**: Kabel luar dilapisi foil pelindung tunggal.
                    </p>
                  </div>

                  {/* Fiber Optic */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <span className="text-2xl mb-2 block">⚡</span>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Karakteristik Fiber Optic</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold font-semibold">
                      *   **Single-mode (SM)**: Core kaca tipis (~9μm). Menggunakan sinar Laser. Jarak jangkau puluhan kilometer tanpa repeater.
                      *   **Multi-mode (MM)**: Core kaca tebal (~50-62.5μm). Menggunakan LED. Jarak jangkau pendek (dalam gedung).
                    </p>
                  </div>

                  {/* Wireless */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <span className="text-2xl mb-2 block">📡</span>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Standar Wi-Fi & Frekuensi</h4>
                    <ul className="text-[10px] text-slate-550 font-bold space-y-1 mt-1 font-semibold">
                      <li>• Wi-Fi 4 (802.11n): Frekuensi 2.4/5 GHz</li>
                      <li>• Wi-Fi 5 (802.11ac): Frekuensi khusus 5 GHz</li>
                      <li>• Wi-Fi 6 (802.11ax): 2.4/5/6 GHz, efisien tinggi.</li>
                      <li>• Wi-Fi 7 (802.11be): Bandwidth lebar s/d 320 MHz.</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-450 font-bold italic bg-white border border-slate-200 rounded-3xl">
                {"Tidak ditemukan hasil untuk \"" + searchQuery + "\" pada media cabling."}
              </div>
            )}
          </div>
        )}

        {/* Custom Teacher-Uploaded Materials */}
        {activeTab === "guru" && (
          <div className="space-y-6 animate-fade-in">
            {filteredCustomMaterials.map((mat, idx) => {
              const embedUrl = getEmbedUrl(mat.youtube);
              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                      {mat.category || "Umum"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold font-mono">Diupload oleh Guru</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">{mat.title}</h3>
                  <p className="text-sm text-slate-500 font-semibold mb-4 italic">{mat.description}</p>
                  
                  {embedUrl && (
                    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 aspect-video mb-4">
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={embedUrl}
                        title={mat.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  )}

                  <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-2xl border border-slate-200/60 font-medium">
                    {mat.content}
                  </div>
                </div>
              );
            })}
            {filteredCustomMaterials.length === 0 && (
              <div className="text-center py-8 text-slate-450 font-bold italic bg-white border border-slate-200 rounded-3xl">
                {"Tidak ditemukan materi guru kustom yang cocok dengan kata kunci \"" + searchQuery + "\"."}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
