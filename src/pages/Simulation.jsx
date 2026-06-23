import { useState } from "react";

export default function Simulation() {

  const [devices, setDevices] = useState([]);

  function addDevice(type) {

    const count =
      devices.filter(
        (device) => device.type === type
      ).length + 1;

    const newDevice = {
      id: Date.now(),
      type,
      name: `${type}${count}`,
    };

    setDevices([...devices, newDevice]);
  }

  function deleteDevice(id) {

    setDevices(
      devices.filter(
        (device) => device.id !== id
      )
    );

  }

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

            <button
              onClick={() => addDevice("PC")}
              className="w-full bg-slate-100 p-4 rounded-xl text-left hover:bg-slate-200"
            >
              🖥️ PC
            </button>

            <button
              onClick={() => addDevice("Switch")}
              className="w-full bg-slate-100 p-4 rounded-xl text-left hover:bg-slate-200"
            >
              📡 Switch
            </button>

            <button
              onClick={() => addDevice("Router")}
              className="w-full bg-slate-100 p-4 rounded-xl text-left hover:bg-slate-200"
            >
              🌐 Router
            </button>

          </div>

        </div>

        {/* Canvas */}

        <div className="col-span-3 bg-white rounded-2xl shadow p-5">

          <h2 className="font-bold mb-5">
            Area Simulasi
          </h2>

          <div className="border-2 border-dashed border-slate-300 rounded-2xl min-h-[500px] p-5">

            {devices.length === 0 ? (

              <div className="h-[450px] flex items-center justify-center text-slate-400">
                Tambahkan Device Dari Toolbox
              </div>

            ) : (

              <div className="grid md:grid-cols-4 gap-4">

                {devices.map((device) => (

                  <div
                    key={device.id}
                    className="bg-blue-50 border border-blue-200 rounded-xl p-4 relative"
                  >

                    <button
                      onClick={() => deleteDevice(device.id)}
                      className="absolute top-2 right-2 text-red-500"
                    >
                      ✖
                    </button>

                    <div className="text-3xl mb-2">

                      {device.type === "PC" && "🖥️"}

                      {device.type === "Switch" && "📡"}

                      {device.type === "Router" && "🌐"}

                    </div>

                    <p className="font-semibold">
                      {device.name}
                    </p>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      </div>

    </div>

  );
}