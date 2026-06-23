export default function Simulation() {

  return (

    <div className="min-h-screen bg-slate-100 p-8">

      <h1 className="text-4xl font-bold mb-8">
        Simulator Topologi
      </h1>

      <div className="grid grid-cols-4 gap-5">

        {/* Toolbox */}

        <div className="bg-white rounded-2xl shadow p-5">

          <h2 className="font-bold mb-5">
            Toolbox
          </h2>

          <div className="space-y-3">

            <div className="bg-slate-100 p-4 rounded-xl">
              🖥️ PC
            </div>

            <div className="bg-slate-100 p-4 rounded-xl">
              📡 Switch
            </div>

            <div className="bg-slate-100 p-4 rounded-xl">
              🌐 Router
            </div>

          </div>

        </div>

        {/* Canvas */}

        <div className="col-span-3 bg-white rounded-2xl shadow p-5">

          <h2 className="font-bold mb-5">
            Area Simulasi
          </h2>

          <div className="border-2 border-dashed border-slate-300 rounded-2xl h-[500px] flex items-center justify-center">

            Drag Device Here

          </div>

        </div>

      </div>

    </div>
  );
}