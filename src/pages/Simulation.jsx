import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { playSound } from "../utils/audio";
import axios from "axios";


const LEVEL_CHALLENGES = [
  {
    id: 1,
    title: "Level 1: Subnet Berbeda (LAN)",
    description: "PC-1 dan PC-2 tersambung ke Switch-1. PC-1 ber-IP 192.168.1.10/24. PC-2 dikonfigurasi salah dengan IP 192.168.2.20/24. Tugas Anda: Perbaiki konfigurasi IP PC-2 agar satu subnet dengan PC-1, lalu lakukan uji ping dari PC-1 ke PC-2.",
    points: 100,
    initialDevices: [
      { id: "pc-1", type: "PC", name: "PC-1", x: 100, y: 200, ip: "192.168.1.10", mask: "255.255.255.0", gateway: "", locked: true },
      { id: "switch-1", type: "Switch", name: "Switch-1", x: 230, y: 200, locked: true },
      { id: "pc-2", type: "PC", name: "PC-2", x: 360, y: 200, ip: "192.168.2.20", mask: "255.255.255.0", gateway: "", locked: false }
    ],
    initialLinks: [
      { id: "link-1", from: "pc-1", to: "switch-1" },
      { id: "link-2", from: "pc-2", to: "switch-1" }
    ],
    checkSuccess: (devices, links, routerConfigs) => {
      const pc2 = devices.find(d => d.id === "pc-2");
      return pc2 && pc2.ip.startsWith("192.168.1.");
    }
  },
  {
    id: 2,
    title: "Level 2: Default Gateway Kosong (Routing)",
    description: "PC-1 ingin mengirim data ke Server-1 di jaringan lain melewati Router-1. Namun PC-1 lupa dikonfigurasi Default Gateway-nya. Konfigurasikan Default Gateway PC-1 dengan IP interface Fa0/0 Router (192.168.1.1) lalu ping Server-1.",
    points: 150,
    initialDevices: [
      { id: "pc-1", type: "PC", name: "PC-1", x: 60, y: 200, ip: "192.168.1.10", mask: "255.255.255.0", gateway: "", locked: false },
      { id: "switch-1", type: "Switch", name: "Switch-1", x: 180, y: 200, locked: true },
      { id: "router-1", type: "Router", name: "Router-1", x: 300, y: 200, locked: true },
      { id: "server-1", type: "Server", name: "Server-1", x: 420, y: 200, ip: "10.0.0.10", mask: "255.0.0.0", gateway: "10.0.0.1", locked: true }
    ],
    initialLinks: [
      { id: "link-1", from: "pc-1", to: "switch-1" },
      { id: "link-2", from: "switch-1", to: "router-1" },
      { id: "link-3", from: "router-1", to: "server-1" }
    ],
    routerSetup: {
      "router-1": {
        fa0: { ip: "192.168.1.1", mask: "255.255.255.0" },
        fa1: { ip: "10.0.0.1", mask: "255.0.0.0" }
      }
    },
    checkSuccess: (devices, links, routerConfigs) => {
      const pc1 = devices.find(d => d.id === "pc-1");
      return pc1 && pc1.gateway === "192.168.1.1";
    }
  },
  {
    id: 3,
    title: "Level 3: Kabel Putus & IP Interface",
    description: "PC-1 (192.168.1.10) ingin terhubung ke PC-2 (192.168.2.10). Namun, kabel antara Router-1 dan Switch-2 terputus. Selain itu, interface Router Fa0/1 belum dikonfigurasi IP Gateway (seharusnya 192.168.2.1). Hubungkan kabel dan atur IP Router Fa0/1!",
    points: 200,
    initialDevices: [
      { id: "pc-1", type: "PC", name: "PC-1", x: 60, y: 120, ip: "192.168.1.10", mask: "255.255.255.0", gateway: "192.168.1.1", locked: true },
      { id: "switch-1", type: "Switch", name: "Switch-1", x: 170, y: 120, locked: true },
      { id: "router-1", type: "Router", name: "Router-1", x: 280, y: 200, locked: false },
      { id: "switch-2", type: "Switch", name: "Switch-2", x: 390, y: 280, locked: true },
      { id: "pc-2", type: "PC", name: "PC-2", x: 500, y: 280, ip: "192.168.2.10", mask: "255.255.255.0", gateway: "192.168.2.1", locked: true }
    ],
    initialLinks: [
      { id: "link-1", from: "pc-1", to: "switch-1" },
      { id: "link-2", from: "switch-1", to: "router-1" },
      { id: "link-3", from: "pc-2", to: "switch-2" }
    ],
    routerSetup: {
      "router-1": {
        fa0: { ip: "192.168.1.1", mask: "255.255.255.0" },
        fa1: { ip: "", mask: "255.255.255.0" }
      }
    },
    checkSuccess: (devices, links, routerConfigs) => {
      const linkExists = links.some(l => 
        (l.from === "router-1" && l.to === "switch-2") || (l.from === "switch-2" && l.to === "router-1")
      );
      const rConf = routerConfigs["router-1"];
      const routerIpCorrect = rConf && rConf.fa1.ip === "192.168.2.1";
      return linkExists && routerIpCorrect;
    }
  }
];

export default function Simulation() {
  const [simMode, setSimMode] = useState("sandbox");
  const [activeChallengeIdx, setActiveChallengeIdx] = useState(0);
  const [challengeStates, setChallengeStates] = useState({ 1: "unlocked", 2: "locked", 3: "locked" });

  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    const tourCompleted = localStorage.getItem("tour_completed");
    if (!tourCompleted) {
      setShowTour(true);
    }
  }, []);


  const [devices, setDevices] = useState([]);
  const [links, setLinks] = useState([]);
  const [routerInterfaces, setRouterInterfaces] = useState({});

  const [toolMode, setToolMode] = useState("select");
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [firstSelectedNode, setFirstSelectedNode] = useState(null);
  
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const [pingPath, setPingPath] = useState(null);
  const [pingStepIdx, setPingStepIdx] = useState(-1);
  const [pingLogs, setPingLogs] = useState([]);
  const [isPinging, setIsPinging] = useState(false);

  const [routerInterfacesTemp, setRouterInterfacesTemp] = useState({});

  const initSandbox = () => {
    playSound("click");
    setDevices([
      { id: "pc-1", type: "PC", name: "PC-1", x: 80, y: 200, ip: "192.168.1.10", mask: "255.255.255.0", gateway: "192.168.1.1" },
      { id: "switch-1", type: "Switch", name: "Switch-1", x: 230, y: 200 },
      { id: "pc-2", type: "PC", name: "PC-2", x: 380, y: 200, ip: "192.168.1.20", mask: "255.255.255.0", gateway: "192.168.1.1" }
    ]);
    setLinks([
      { id: "link-1", from: "pc-1", to: "switch-1" },
      { id: "link-2", from: "pc-2", to: "switch-1" }
    ]);
    setRouterInterfaces({
      "router-1": {
        fa0: { ip: "192.168.1.1", mask: "255.255.255.0" },
        fa1: { ip: "10.0.0.1", mask: "255.0.0.0" }
      }
    });
    setSelectedDeviceId(null);
    setToolMode("select");
    setPingLogs([]);
    setPingPath(null);
  };

  const loadChallenge = (idx) => {
    playSound("click");
    const challenge = LEVEL_CHALLENGES[idx];
    setDevices(JSON.parse(JSON.stringify(challenge.initialDevices)));
    setLinks(JSON.parse(JSON.stringify(challenge.initialLinks)));
    setRouterInterfaces(JSON.parse(JSON.stringify(challenge.routerSetup || {})));
    setSelectedDeviceId(null);
    setToolMode("select");
    setPingLogs([]);
    setPingPath(null);
    setFirstSelectedNode(null);
  };

  useEffect(() => {
    if (simMode === "sandbox") {
      initSandbox();
    } else {
      loadChallenge(activeChallengeIdx);
    }
  }, [simMode, activeChallengeIdx]);

  const getRouterConfig = (routerId) => {
    return routerInterfaces[routerId] || {
      fa0: { ip: "192.168.1.1", mask: "255.255.255.0" },
      fa1: { ip: "192.168.2.1", mask: "255.255.255.0" }
    };
  };

  const updateRouterConfig = (routerId, key, field, value) => {
    setRouterInterfaces(prev => {
      const current = getRouterConfig(routerId);
      return {
        ...prev,
        [routerId]: {
          ...current,
          [key]: {
            ...current[key],
            [field]: value
          }
        }
      };
    });
  };

  const addDevice = (type) => {
    if (simMode !== "sandbox") return;
    playSound("click");
    const count = devices.filter((d) => d.type === type).length + 1;
    const newId = `${type.toLowerCase()}-${Date.now()}`;
    
    // Position within responsive limits
    const newDevice = {
      id: newId,
      type,
      name: `${type}-${count}`,
      x: 80 + Math.random() * 120,
      y: 120 + Math.random() * 120,
      ...(type === "PC" || type === "Server" ? { ip: "", mask: "255.255.255.0", gateway: "" } : {})
    };
    setDevices([...devices, newDevice]);
    setSelectedDeviceId(newId);
  };

  const deleteDevice = (id) => {
    const dev = devices.find(d => d.id === id);
    if (dev?.locked) {
      playSound("error");
      alert("Perangkat ini dikunci untuk kebutuhan tantangan level!");
      return;
    }
    playSound("error");
    setDevices(devices.filter((d) => d.id !== id));
    setLinks(links.filter((l) => l.from !== id && l.to !== id));
    if (selectedDeviceId === id) setSelectedDeviceId(null);
  };

  const handleNodeClick = (id) => {
    playSound("click");
    if (toolMode === "cabling") {
      if (!firstSelectedNode) {
        setFirstSelectedNode(id);
      } else {
        if (firstSelectedNode === id) {
          setFirstSelectedNode(null);
          return;
        }
        const exists = links.some(
          (l) => (l.from === firstSelectedNode && l.to === id) || (l.from === id && l.to === firstSelectedNode)
        );
        if (!exists) {
          playSound("connect");
          setLinks([...links, { id: `link-${Date.now()}`, from: firstSelectedNode, to: id }]);
        }
        setFirstSelectedNode(null);
        setToolMode("select");
      }
    } else if (toolMode === "ping") {
      if (!firstSelectedNode) {
        const sourceDev = devices.find(d => d.id === id);
        if (sourceDev.type !== "PC") {
          playSound("error");
          alert("Ping harus dimulai dari perangkat PC!");
          return;
        }
        setFirstSelectedNode(id);
      } else {
        if (firstSelectedNode === id) {
          setFirstSelectedNode(null);
          return;
        }
        executePing(firstSelectedNode, id);
        setFirstSelectedNode(null);
        setToolMode("select");
      }
    } else {
      setSelectedDeviceId(id);
    }
  };

  const handleMouseDown = (e, id) => {
    if (toolMode !== "select") return;
    e.stopPropagation();
    const dev = devices.find((d) => d.id === id);
    if (!dev) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    setDraggingId(id);
    
    // Support Touch Events as well
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    setDragOffset({
      x: clientX - canvasRect.left - dev.x,
      y: clientY - canvasRect.top - dev.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingId) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const x = Math.max(10, Math.min(canvasRect.width - 50, clientX - canvasRect.left - dragOffset.x));
    const y = Math.max(10, Math.min(canvasRect.height - 55, clientY - canvasRect.top - dragOffset.y));
    
    setDevices(
      devices.map((d) => (d.id === draggingId ? { ...d, x, y } : d))
    );
  };

  const handleMouseUpOrLeave = () => {
    setDraggingId(null);
  };

  const inSameSubnet = (ip1, ip2, mask) => {
    if (!ip1 || !ip2 || !mask) return false;
    const o1 = ip1.split(".").map(Number);
    const o2 = ip2.split(".").map(Number);
    const m = mask.split(".").map(Number);
    if (o1.length !== 4 || o2.length !== 4 || m.length !== 4) return false;
    for (let i = 0; i < 4; i++) {
      if ((o1[i] & m[i]) !== (o2[i] & m[i])) return false;
    }
    return true;
  };

  const findShortestPath = (start, end) => {
    const adj = {};
    devices.forEach((d) => (adj[d.id] = []));
    links.forEach((l) => {
      if (adj[l.from] && adj[l.to]) {
        adj[l.from].push(l.to);
        adj[l.to].push(l.from);
      }
    });

    const queue = [[start]];
    const visited = new Set([start]);

    while (queue.length > 0) {
      const path = queue.shift();
      const node = path[path.length - 1];

      if (node === end) return path;

      const neighbors = adj[node] || [];
      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push([...path, n]);
        }
      }
    }
    return null;
  };

  const executePing = (srcId, destId) => {
    setIsPinging(true);
    setPingLogs(["Memulai uji ping ICMP...", `Menelusuri jalur fisik dari ${devices.find(d => d.id === srcId).name} ke ${devices.find(d => d.id === destId).name}...`]);

    const path = findShortestPath(srcId, destId);
    if (!path) {
      setTimeout(() => {
        playSound("error");
        setPingLogs(prev => [...prev, "❌ Uji Ping Gagal: Rantai koneksi fisik terputus!", "Gunakan kabel 🔌 untuk menghubungkan antar node terlebih dahulu."]);
        setIsPinging(false);
      }, 1000);
      return;
    }

    setPingPath(path);
    setPingStepIdx(0);

    const srcDev = devices.find(d => d.id === srcId);
    const destDev = devices.find(d => d.id === destId);

    if (!srcDev.ip || !destDev.ip) {
      setTimeout(() => {
        playSound("error");
        setPingLogs(prev => [...prev, "❌ Ping Gagal: Alamat IP PC pengirim/penerima kosong!"]);
        setPingPath(null);
        setIsPinging(false);
      }, 1500);
      return;
    }

    let logs = [...pingLogs];
    let pathDevices = path.map(id => devices.find(d => d.id === id));
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < path.length) {
        playSound("click");
        setPingStepIdx(currentStep);
        const node = pathDevices[currentStep];
        setPingLogs(prev => [...prev, `Paket ditransmisikan ke ${node.name} (${node.type})`]);
      } else {
        clearInterval(interval);
        
        let success = true;
        const sameSubnet = inSameSubnet(srcDev.ip, destDev.ip, srcDev.mask);

        if (sameSubnet) {
          const hasIncorrectRouter = pathDevices.some(d => d.type === "Router");
          if (hasIncorrectRouter) {
            logs.push("⚠️ Catatan: Uji ping lokal melewati router. Router bertugas memecah segmen subnet berbeda.");
          }
          logs.push("✔️ ARP address resolved.");
          logs.push("✔️ Reply from " + destDev.ip + ": bytes=32 time=4ms TTL=64");
          logs.push("✨ PING BERHASIL! (Komunikasi Satu LAN)");
        } else {
          const router = pathDevices.find(d => d.type === "Router");
          if (!router) {
            success = false;
            logs.push("❌ Uji Ping Gagal: Perangkat berbeda subnet dan tidak melewati Router.");
          } else {
            const rConfig = getRouterConfig(router.id);
            const gatewayMatchesFa0 = srcDev.gateway === rConfig.fa0.ip;
            const gatewayMatchesFa1 = srcDev.gateway === rConfig.fa1.ip;

            if (!srcDev.gateway) {
              success = false;
              logs.push(`❌ Ping Gagal: PC pengirim (${srcDev.name}) tidak memiliki Gateway.`);
            } else if (!gatewayMatchesFa0 && !gatewayMatchesFa1) {
              success = false;
              logs.push(`❌ Ping Gagal: Gateway PC (${srcDev.gateway}) tidak terpasang di Router.`);
            } else {
              const destGatewayMatchesFa0 = destDev.gateway === rConfig.fa0.ip;
              const destGatewayMatchesFa1 = destDev.gateway === rConfig.fa1.ip;
              const destInRouterSubnetFa0 = inSameSubnet(destDev.ip, rConfig.fa0.ip, rConfig.fa0.mask);
              const destInRouterSubnetFa1 = inSameSubnet(destDev.ip, rConfig.fa1.ip, rConfig.fa1.mask);

              if (!destDev.gateway) {
                success = false;
                logs.push(`❌ Ping Gagal: PC tujuan (${destDev.name}) tidak memiliki Gateway.`);
              } else if (!destGatewayMatchesFa0 && !destGatewayMatchesFa1) {
                success = false;
                logs.push(`❌ Ping Gagal: Gateway PC tujuan (${destDev.gateway}) salah.`);
              } else if (!destInRouterSubnetFa0 && !destInRouterSubnetFa1) {
                success = false;
                logs.push("❌ Ping Gagal: IP PC tujuan tidak se-subnet dengan port interface router.");
              } else {
                logs.push("✔️ Paket dikirim ke Gateway Router.");
                logs.push("✔️ Router meneruskan paket ke subnet tujuan.");
                logs.push("✔️ Reply from " + destDev.ip + ": bytes=32 time=12ms TTL=63 (Routed)");
                logs.push("✨ PING BERHASIL! (Rute Subnet Terkonfigurasi)");
              }
            }
          }
        }

        if (success) {
          playSound("success");
          if (simMode === "challenges") {
            const currentChallenge = LEVEL_CHALLENGES[activeChallengeIdx];
            const isConditionMet = currentChallenge.checkSuccess(devices, links, routerInterfaces);
            
            if (isConditionMet) {
              logs.push(`🏆 TANTANGAN SUKSES! Anda lulus ${currentChallenge.title}. (+${currentChallenge.points} XP)`);
              
              const user = JSON.parse(localStorage.getItem("user")) || { name: "Siswa TKJ", xp: 150, level: 1, role: "student", email: "demo@tkj.sch.id" };
              if (user.role === "student") {
                let newXp = (user.xp || 0) + currentChallenge.points;
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
                  activity_name: `Berhasil memecahkan Tantangan: ${currentChallenge.title}`,
                  type: "Simulation",
                  xp_gained: currentChallenge.points
                }).catch(err => console.error("Database save failed:", err));
              }

              setChallengeStates(prev => {
                const updated = { ...prev };
                if (currentChallenge.id === 1) updated[2] = "unlocked";
                if (currentChallenge.id === 2) updated[3] = "unlocked";
                return updated;
              });
            } else {
              logs.push("⚠️ Catatan: Ping sukses, namun kondisi penyelesaian level belum dipenuhi. Ikuti petunjuk tugas!");
            }
          } else {
            const user = JSON.parse(localStorage.getItem("user")) || { name: "Siswa TKJ", xp: 150, level: 1, role: "student", email: "demo@tkj.sch.id" };
            if (user.role === "student") {
              let newXp = (user.xp || 0) + 15;
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
                activity_name: `Uji Ping Sukses di Sandbox Jaringan`,
                type: "Simulation",
                xp_gained: 15
              }).catch(err => console.error("Database save failed:", err));
            }
          }
        } else {
          playSound("error");
        }

        setPingLogs(prev => [...prev, ...logs.slice(2)]);
        setIsPinging(false);
      }
    }, 800);
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case "PC":
        return (
          <svg className="w-10 h-10 text-indigo-650" viewBox="0 0 48 48" fill="none">
            <rect x="6" y="8" width="36" height="24" rx="4" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2.5" />
            <rect x="10" y="12" width="28" height="16" rx="1" fill="#1e1b4b" />
            <line x1="14" y1="17" x2="22" y2="17" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="14" y1="21" x2="26" y2="21" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 20 32 L 28 32 L 30 38 L 18 38 Z" fill="#475569" stroke="#334155" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        );
      case "Switch":
        return (
          <svg className="w-11 h-9 text-emerald-650" viewBox="0 0 54 36" fill="none">
            <rect x="2" y="6" width="50" height="24" rx="3" fill="#ecfdf5" stroke="#10b981" strokeWidth="2.5" />
            <rect x="0" y="10" width="2" height="16" fill="#64748b" />
            <rect x="52" y="10" width="2" height="16" fill="#64748b" />
            <rect x="8" y="14" width="6" height="8" rx="1" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
            <rect x="18" y="14" width="6" height="8" rx="1" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
            <rect x="28" y="14" width="6" height="8" rx="1" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
            <rect x="38" y="14" width="6" height="8" rx="1" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
            <circle cx="11" cy="11" r="1.2" fill="#34d399" />
            <circle cx="21" cy="11" r="1.2" fill="#34d399" />
            <circle cx="31" cy="11" r="1.2" fill="#f59e0b" />
            <circle cx="41" cy="11" r="1.2" fill="#34d399" />
          </svg>
        );
      case "Router":
        return (
          <svg className="w-10 h-10 text-sky-650" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2.5" />
            <circle cx="24" cy="24" r="16" fill="none" stroke="#bae6fd" strokeWidth="1" strokeDasharray="3,3" />
            <path d="M 24 10 L 24 38" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
            <path d="M 20 14 L 24 10 L 28 14" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 20 34 L 24 38 L 28 34" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 10 24 L 38 24" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
            <path d="M 14 20 L 10 24 L 14 28" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 34 20 L 38 24 L 34 28" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        );
      case "Server":
        return (
          <svg className="w-9 h-11 text-purple-650" viewBox="0 0 38 48" fill="none">
            <rect x="3" y="2" width="32" height="44" rx="3" fill="#faf5ff" stroke="#7e22ce" strokeWidth="2.5" />
            <rect x="6" y="8" width="26" height="8" rx="1.5" fill="#f3e8ff" stroke="#a855f7" strokeWidth="1.5" />
            <rect x="6" y="20" width="26" height="8" rx="1.5" fill="#f3e8ff" stroke="#a855f7" strokeWidth="1.5" />
            <rect x="6" y="32" width="26" height="8" rx="1.5" fill="#f3e8ff" stroke="#a855f7" strokeWidth="1.5" />
            <circle cx="10" cy="12" r="1" fill="#34d399" />
            <circle cx="14" cy="12" r="1" fill="#818cf8" />
            <line x1="22" y1="12" x2="28" y2="12" stroke="#a855f7" strokeWidth="1" strokeLinecap="round" />
            <circle cx="10" cy="24" r="1" fill="#34d399" />
            <circle cx="14" cy="24" r="1" fill="#34d399" />
            <line x1="22" y1="24" x2="28" y2="24" stroke="#a855f7" strokeWidth="1" strokeLinecap="round" />
            <circle cx="10" cy="36" r="1" fill="#ef4444" />
            <circle cx="14" cy="36" r="1" fill="#818cf8" />
            <line x1="22" y1="36" x2="28" y2="36" stroke="#a855f7" strokeWidth="1" strokeLinecap="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800">
      <Sidebar />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto flex flex-col justify-between">
        
        {/* Header */}
        <header className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-650 text-sm font-semibold mb-1">
              <span>Simulasi Praktik</span>
              <span>•</span>
              <span>Laboratorium Virtual</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">
              Simulator Topologi Jaringan
            </h1>
            <p className="text-slate-500 text-xs mt-0.5 font-medium">
              Rancang topologi, konfigurasikan IP Address, dan simulasikan transfer paket data (Ping).
            </p>
          </div>

          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm font-bold text-xs">
            <button
              onClick={() => setSimMode("sandbox")}
              className={`px-4 py-2 rounded-lg transition ${
                simMode === "sandbox" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Mode Bebas (Sandbox)
            </button>
            <button
              onClick={() => setSimMode("challenges")}
              className={`px-4 py-2 rounded-lg transition ${
                simMode === "challenges" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              🎮 Tantangan Bertingkat
            </button>
          </div>
        </header>

        {/* Challenges Level selector */}
        {simMode === "challenges" && (
          <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-5 mb-6 shadow-sm animate-fade-in">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Tantangan Troubleshooting Jaringan:</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {LEVEL_CHALLENGES.map((lvl, index) => {
                const status = challengeStates[lvl.id];
                const isSelected = activeChallengeIdx === index;
                const isLocked = status === "locked";
                
                return (
                  <button
                    key={lvl.id}
                    disabled={isLocked}
                    onClick={() => setActiveChallengeIdx(index)}
                    className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl border text-center font-bold text-xs transition flex items-center justify-center space-x-1.5 ${
                      isLocked
                        ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                        : isSelected
                          ? "bg-indigo-600 border-indigo-600 text-white shadow"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-350"
                    }`}
                  >
                    <span>{isLocked ? "🔒" : lvl.id === 1 ? " Mudah" : lvl.id === 2 ? " Sedang" : " Sulit"}</span>
                    <span>Lvl {lvl.id}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs text-slate-600 leading-relaxed font-semibold">
              <p className="font-bold text-indigo-600 mb-1">📖 Skenario Tugas:</p>
              <p className="mb-2 text-slate-800">{LEVEL_CHALLENGES[activeChallengeIdx].description}</p>
              <span className="text-[10px] bg-yellow-100 border border-yellow-250 text-yellow-800 px-2 py-0.5 rounded font-extrabold uppercase">
                Hadiah: +{LEVEL_CHALLENGES[activeChallengeIdx].points} XP
              </span>
            </div>
          </div>
        )}

        {/* Main Interface Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
          
          {/* Left Toolbox */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Toolbox</h3>
                <div className="flex space-x-1 bg-slate-100 border border-slate-200 rounded-lg p-0.5">
                  <button onClick={() => { playSound("click"); setToolMode("select"); setFirstSelectedNode(null); }} className={`p-1 rounded transition text-[10px] ${toolMode === "select" ? "bg-white shadow text-indigo-600 font-bold" : "text-slate-500"}`}>🖱️</button>
                  <button onClick={() => { playSound("click"); setToolMode("cabling"); setFirstSelectedNode(null); }} className={`p-1 rounded transition text-[10px] ${toolMode === "cabling" ? "bg-white shadow text-indigo-600 font-bold" : "text-slate-500"}`}>🔌</button>
                  <button onClick={() => { playSound("click"); setToolMode("ping"); setFirstSelectedNode(null); }} className={`p-1 rounded transition text-[10px] ${toolMode === "ping" ? "bg-white shadow text-indigo-600 font-bold" : "text-slate-500"}`}>⚡</button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
                <button
                  onClick={() => addDevice("PC")}
                  disabled={simMode === "challenges"}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center space-x-2.5 border ${
                    simMode === "challenges"
                      ? "bg-slate-50 text-slate-350 cursor-not-allowed border-slate-100"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-inner"
                  }`}
                >
                  <span>💻</span>
                  <span className="hidden lg:inline">PC</span>
                </button>
                <button
                  onClick={() => addDevice("Switch")}
                  disabled={simMode === "challenges"}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center space-x-2.5 border ${
                    simMode === "challenges"
                      ? "bg-slate-50 text-slate-350 cursor-not-allowed border-slate-100"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-inner"
                  }`}
                >
                  <span>📡</span>
                  <span className="hidden lg:inline">Switch</span>
                </button>
                <button
                  onClick={() => addDevice("Router")}
                  disabled={simMode === "challenges"}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center space-x-2.5 border ${
                    simMode === "challenges"
                      ? "bg-slate-50 text-slate-350 cursor-not-allowed border-slate-100"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 shadow-inner"
                  }`}
                >
                  <span>🌐</span>
                  <span className="hidden lg:inline">Router</span>
                </button>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3 text-[11px] text-indigo-750 mt-4 lg:mt-6 font-semibold hidden lg:block">
              <strong>💡 Mode Sambung:</strong> Klik tombol 🔌 di atas, klik node pertama lalu klik node kedua untuk menghubungkannya.
            </div>
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-7 flex flex-col gap-4 overflow-hidden">
            {/* Scroll wrapper for mobile touch scroll */}
            <div className="w-full overflow-x-auto rounded-3xl border border-slate-200 shadow-sm bg-white scrollbar-thin">
              <div
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUpOrLeave}
                className="w-[640px] md:w-full min-h-[460px] relative overflow-hidden select-none cursor-crosshair rounded-3xl border border-slate-200/80 shadow-inner bg-slate-50/50"
                style={{
                  backgroundColor: "#fafbfd",
                  backgroundImage: "radial-gradient(#cbd5e1 1.2px, transparent 1.2px), linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)",
                  backgroundSize: "20px 20px, 40px 40px, 40px 40px"
                }}
              >
                {/* SVG link lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  {links.map((link) => {
                    const fromNode = devices.find((d) => d.id === link.from);
                    const toNode = devices.find((d) => d.id === link.to);
                    if (!fromNode || !toNode) return null;

                    const isLinkActiveInPing = pingPath && pingPath.includes(link.from) && pingPath.includes(link.to);

                    return (
                      <g key={link.id}>
                        {/* Outer Sheath */}
                        <line
                          x1={fromNode.x + 40}
                          y1={fromNode.y + 40}
                          x2={toNode.x + 40}
                          y2={toNode.y + 40}
                          stroke="#334155"
                          strokeWidth="4.5"
                          strokeLinecap="round"
                        />
                        {/* Inner Copper core */}
                        <line
                          x1={fromNode.x + 40}
                          y1={fromNode.y + 40}
                          x2={toNode.x + 40}
                          y2={toNode.y + 40}
                          stroke={isLinkActiveInPing ? "#34d399" : "#94a3b8"}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </g>
                    );
                  })}

                  {/* Packet visual envelope */}
                  {pingPath && pingStepIdx !== -1 && pingStepIdx < pingPath.length - 1 && (
                    (() => {
                      const fromNode = devices.find((d) => d.id === pingPath[pingStepIdx]);
                      const toNode = devices.find((d) => d.id === pingPath[pingStepIdx + 1]);
                      if (!fromNode || !toNode) return null;
                      return (
                        <g key={`ping-pkg-${pingStepIdx}`}>
                          {/* Pulsating glow */}
                          <circle
                            cx={fromNode.x + 40}
                            cy={fromNode.y + 40}
                            r="12"
                            fill="#818cf8"
                            opacity="0.6"
                          >
                            <animate attributeName="cx" from={fromNode.x + 40} to={toNode.x + 40} dur="0.8s" repeatCount="indefinite" />
                            <animate attributeName="cy" from={fromNode.y + 40} to={toNode.y + 40} dur="0.8s" repeatCount="indefinite" />
                            <animate attributeName="r" values="8;14;8" dur="0.8s" repeatCount="indefinite" />
                          </circle>
                          {/* Packet envelope box */}
                          <rect
                            x={fromNode.x + 40 - 9}
                            y={fromNode.y + 40 - 6}
                            width="18"
                            height="12"
                            rx="2"
                            fill="#4f46e5"
                            stroke="#ffffff"
                            strokeWidth="1.2"
                          >
                            <animate attributeName="x" from={fromNode.x + 40 - 9} to={toNode.x + 40 - 9} dur="0.8s" repeatCount="indefinite" />
                            <animate attributeName="y" from={fromNode.y + 40 - 6} to={toNode.y + 40 - 6} dur="0.8s" repeatCount="indefinite" />
                          </rect>
                          {/* Packet letter fold lines */}
                          <path
                            d={`M ${fromNode.x + 40 - 9} ${fromNode.y + 40 - 6} L ${fromNode.x + 40} ${fromNode.y + 40} L ${fromNode.x + 40 + 9} ${fromNode.y + 40 - 6}`}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="1"
                          >
                            <animate attributeName="d" 
                              from={`M ${fromNode.x + 40 - 9} ${fromNode.y + 40 - 6} L ${fromNode.x + 40} ${fromNode.y + 40} L ${fromNode.x + 40 + 9} ${fromNode.y + 40 - 6}`}
                              to={`M ${toNode.x + 40 - 9} ${toNode.y + 40 - 6} L ${toNode.x + 40} ${toNode.y + 40} L ${toNode.x + 40 + 9} ${toNode.y + 40 - 6}`}
                              dur="0.8s" repeatCount="indefinite" />
                          </path>
                        </g>
                      );
                    })()
                  )}
                </svg>

                {/* Nodes rendering */}
                {devices.map((device) => {
                  const isSelected = selectedDeviceId === device.id;
                  const isFirstPingNode = firstSelectedNode === device.id;
                  
                  return (
                    <div
                      key={device.id}
                      onMouseDown={(e) => handleMouseDown(e, device.id)}
                      onTouchStart={(e) => handleMouseDown(e, device.id)}
                      onClick={(e) => { e.stopPropagation(); handleNodeClick(device.id); }}
                      style={{ left: device.x, top: device.y }}
                      className={`absolute w-[80px] h-[80px] rounded-3xl flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-all duration-200 z-10 border ${
                        isSelected
                          ? "bg-white border-indigo-500 shadow-lg shadow-indigo-100/50 scale-[1.08] ring-4 ring-indigo-500/10"
                          : isFirstPingNode
                            ? "bg-white border-emerald-500 shadow-lg shadow-emerald-100/50 animate-pulse scale-[1.08] ring-4 ring-emerald-500/10"
                            : "bg-white hover:bg-slate-50 border-slate-200/80 shadow-sm hover:shadow"
                      }`}
                    >
                      {getDeviceIcon(device.type)}
                      
                      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[110px] text-center pointer-events-none">
                        <p className="text-[10px] font-bold text-slate-800 truncate">{device.name}</p>
                        {(device.type === "PC" || device.type === "Server") && device.ip && (
                          <p className="text-[8.5px] font-mono text-slate-500 font-semibold truncate mt-0.5">{device.ip}</p>
                        )}
                        {device.type === "Router" && (
                          <p className="text-[7.5px] font-mono text-slate-500 font-semibold truncate mt-0.5">Fa0: {getRouterConfig(device.id).fa0.ip}</p>
                        )}
                      </div>

                      {isSelected && !device.locked && (
                        <button
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); deleteDevice(device.id); }}
                          className="absolute -top-2.5 -right-2.5 bg-red-600 hover:bg-red-500 border border-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}

                {devices.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <span className="text-4xl mb-2">📁</span>
                    <p className="text-sm font-semibold">Kanvas Kosong</p>
                  </div>
                )}
              </div>
            </div>

            {/* Live Terminal logs */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 font-mono text-[11px] leading-relaxed shadow-md">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2 mb-2">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Ping CLI Output</span>
                {pingLogs.length > 0 && (
                  <button 
                    onClick={() => { playSound("click"); setPingLogs([]); setPingPath(null); }} 
                    className="text-[9px] text-slate-500 hover:text-slate-350"
                  >
                    Clear Console
                  </button>
                )}
              </div>
              <div className="max-h-[110px] overflow-y-auto space-y-1 scrollbar-thin">
                {pingLogs.length === 0 ? (
                  <span className="text-slate-600 font-medium">Gunakan tombol ⚡ (Uji Ping) di atas untuk menguji konektivitas PC.</span>
                ) : (
                  pingLogs.map((log, idx) => (
                    <div key={idx} className={log.startsWith("❌") ? "text-red-400 font-bold" : log.startsWith("✨") || log.startsWith("✔️") || log.includes("SUKSES") ? "text-emerald-400 font-bold" : "text-slate-300 font-semibold"}>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Configuration Panel */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-5 flex flex-col shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-100">
              Konfigurasi Device
            </h3>

            {selectedDevice ? (
              <div className="space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Nama Device</label>
                    <input
                      type="text"
                      disabled={selectedDevice.locked}
                      value={selectedDevice.name}
                      onChange={(e) => {
                        setDevices(devices.map(d => d.id === selectedDeviceId ? { ...d, name: e.target.value } : d));
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>

                  {(selectedDevice.type === "PC" || selectedDevice.type === "Server") && (
                    <>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">IP Address (IPv4)</label>
                        <input
                          type="text"
                          value={selectedDevice.ip || ""}
                          placeholder="e.g. 192.168.1.10"
                          onChange={(e) => {
                            setDevices(devices.map(d => d.id === selectedDeviceId ? { ...d, ip: e.target.value } : d));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-indigo-700 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Subnet Mask</label>
                        <input
                          type="text"
                          value={selectedDevice.mask || ""}
                          placeholder="e.g. 255.255.255.0"
                          onChange={(e) => {
                            setDevices(devices.map(d => d.id === selectedDeviceId ? { ...d, mask: e.target.value } : d));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-700 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Default Gateway</label>
                        <input
                          type="text"
                          value={selectedDevice.gateway || ""}
                          placeholder="e.g. 192.168.1.1"
                          onChange={(e) => {
                            setDevices(devices.map(d => d.id === selectedDeviceId ? { ...d, gateway: e.target.value } : d));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </>
                  )}

                  {selectedDevice.type === "Switch" && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[11px] text-slate-500 space-y-2 font-semibold">
                      <p className="font-bold text-emerald-600 text-xs">Switch Ethernet Layer 2</p>
                      <p>Meneruskan ethernet frame secara transparan berdasarkan MAC Address table.</p>
                    </div>
                  )}

                  {selectedDevice.type === "Router" && (
                    <div className="space-y-4">
                      <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block mb-2">Interface FastEthernet 0/0</span>
                        <div className="space-y-2">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block mb-0.5">IP Address</span>
                            <input
                              type="text"
                              value={getRouterConfig(selectedDevice.id).fa0.ip}
                              onChange={(e) => updateRouterConfig(selectedDevice.id, "fa0", "ip", e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-sky-700 focus:outline-none"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block mb-0.5">Subnet Mask</span>
                            <input
                              type="text"
                              value={getRouterConfig(selectedDevice.id).fa0.mask}
                              onChange={(e) => updateRouterConfig(selectedDevice.id, "fa0", "mask", e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-semibold text-slate-600 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block mb-2">Interface FastEthernet 0/1</span>
                        <div className="space-y-2">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block mb-0.5">IP Address</span>
                            <input
                              type="text"
                              value={getRouterConfig(selectedDevice.id).fa1.ip}
                              onChange={(e) => updateRouterConfig(selectedDevice.id, "fa1", "ip", e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-sky-700 focus:outline-none"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block mb-0.5">Subnet Mask</span>
                            <input
                              type="text"
                              value={getRouterConfig(selectedDevice.id).fa1.mask}
                              onChange={(e) => updateRouterConfig(selectedDevice.id, "fa1", "mask", e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono font-semibold text-slate-600 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {!selectedDevice.locked && (
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => deleteDevice(selectedDevice.id)}
                      className="w-full bg-red-650 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-sm"
                    >
                      Hapus Device 🗑️
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="my-auto text-center py-10 text-xs text-slate-400 font-bold border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                Klik salah satu device di kanvas untuk membuka setelan konfigurasi.
              </div>
            )}
          </div>

        </div>

        {showTour && (
          <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-[10px] uppercase font-black text-indigo-650 tracking-wider">Tutorial Virtual Lab ({tourStep + 1}/5)</span>
                <button 
                  onClick={() => { playSound("click"); setShowTour(false); localStorage.setItem("tour_completed", "true"); }}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Lewati ✕
                </button>
              </div>
              
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-1">{
                  tourStep === 0 ? "Selamat Datang di Lab Jaringan SIM-TKJ! 🔌" :
                  tourStep === 1 ? "Pilih Mode Praktik 🎯" :
                  tourStep === 2 ? "Toolbox Perangkat 🖥️" :
                  tourStep === 3 ? "Kanvas Jaringan 🖱️" :
                  "Console & Uji Ping ⚡"
                }</h4>
                <p className="text-xs text-slate-505 font-semibold leading-relaxed">{
                  tourStep === 0 ? "Di sini Anda bisa merakit dan melakukan troubleshooting jaringan komputer secara virtual. Mari ikuti tur singkat untuk mengenal fiturnya." :
                  tourStep === 1 ? "Gunakan pilihan di header untuk berpindah antara Mode Bebas (Sandbox) untuk merakit tanpa batas, atau Mode Tantangan Level untuk memecahkan ujian kurikulum TKJ." :
                  tourStep === 2 ? "Gunakan toolbox di sebelah kiri untuk menambahkan PC, Switch, Router, atau Server ke lembar kerja Anda." :
                  tourStep === 3 ? "Klik Pointer 🖱️ untuk menggeser komputer. Gunakan Kabel 🔌 untuk menyambungkan port antardevice. Gunakan Gunting ✂️ untuk melepas sambungan." :
                  "Klik Uji Ping ⚡ lalu klik PC asal dan PC tujuan. Jalur packet ping dan kegagalannya akan dianalisis langsung di konsol log CLI bagian bawah!"
                }</p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  disabled={tourStep === 0}
                  onClick={() => { playSound("click"); setTourStep(prev => prev - 1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    tourStep === 0 
                      ? "bg-slate-50 text-slate-350 cursor-not-allowed border-slate-100" 
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  ← Kembali
                </button>

                {tourStep < 4 ? (
                  <button
                    onClick={() => { playSound("click"); setTourStep(prev => prev + 1); }}
                    className="bg-indigo-600 hover:bg-indigo-550 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    Lanjut →
                  </button>
                ) : (
                  <button
                    onClick={() => { playSound("click"); setShowTour(false); localStorage.setItem("tour_completed", "true"); }}
                    className="bg-emerald-600 hover:bg-emerald-550 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                  >
                    Mulai Praktik! 🎉
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}