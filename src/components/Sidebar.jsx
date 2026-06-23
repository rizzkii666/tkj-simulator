export default function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-6">

      <h2 className="text-2xl font-bold mb-8">
        NetLearn
      </h2>

      <div className="space-y-4">

        <button className="block w-full text-left hover:text-blue-400">
          Dashboard
        </button>

        <button className="block w-full text-left hover:text-blue-400">
          Modul
        </button>

        <button className="block w-full text-left hover:text-blue-400">
          Simulasi
        </button>

        <button className="block w-full text-left hover:text-blue-400">
          Quiz
        </button>

        <button className="block w-full text-left hover:text-blue-400">
          Profil
        </button>

      </div>

    </div>
  );
}