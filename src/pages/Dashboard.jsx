import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {

const navigate = useNavigate();

const user = JSON.parse(
localStorage.getItem("user")
);

function logout() {
navigate("/");
}

return ( <div className="flex">


  <Sidebar />

  <div className="flex-1 bg-slate-100 min-h-screen p-8">

    {/* Header */}

    <div className="flex justify-between items-center">

      <div>

        <h1 className="text-4xl font-bold">
          Selamat Datang, {user?.name} 👋
        </h1>

        <p className="text-slate-500 mt-2">
          Platform Simulasi Jaringan TKJ
        </p>

      </div>

      <button
        onClick={logout}
        className="bg-red-500 text-white px-5 py-3 rounded-xl"
      >
        Logout
      </button>

    </div>

    {/* Statistik */}

    <div className="grid md:grid-cols-3 gap-5 mt-8">

      {/* Progress */}

      <div className="bg-white rounded-2xl p-6 shadow">

        <p className="text-slate-500">
          Progress Belajar
        </p>

        <h2 className="text-4xl font-bold mt-2">
          75%
        </h2>

        <div className="w-full h-3 bg-slate-200 rounded-full mt-4">

          <div className="h-3 bg-blue-600 rounded-full w-3/4"></div>

        </div>

      </div>

      {/* XP */}

      <div className="bg-white rounded-2xl p-6 shadow">

        <p className="text-slate-500">
          XP
        </p>

        <h2 className="text-4xl font-bold mt-2">
          350
        </h2>

      </div>

      {/* Level */}

      <div className="bg-white rounded-2xl p-6 shadow">

        <p className="text-slate-500">
          Level
        </p>

        <h2 className="text-4xl font-bold mt-2">
          3
        </h2>

      </div>

    </div>

    {/* Modul */}

    <h2 className="text-3xl font-bold mt-10 mb-5">
      Modul Pembelajaran
    </h2>

    <div className="grid md:grid-cols-4 gap-5">

      <div
        onClick={() => navigate("/simulation")}
        className="bg-white p-6 rounded-2xl shadow hover:shadow-xl cursor-pointer transition"
      >
        📡 Topologi
      </div>

      <div
        onClick={() => navigate("/simulation")}
        className="bg-white p-6 rounded-2xl shadow hover:shadow-xl cursor-pointer transition"
      >
        🌐 IP Address
      </div>

      <div
        onClick={() => navigate("/simulation")}
        className="bg-white p-6 rounded-2xl shadow hover:shadow-xl cursor-pointer transition"
      >
        🔀 Routing
      </div>

      <div
        onClick={() => navigate("/simulation")}
        className="bg-white p-6 rounded-2xl shadow hover:shadow-xl cursor-pointer transition"
      >
        🛠 Troubleshooting
      </div>

    </div>

  </div>

</div>


);
}
