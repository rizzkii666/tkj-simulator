import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleRegister() {

    const user = {
      name,
      email,
      password,
    };

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    alert("Pendaftaran berhasil!");

    navigate("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-[400px]">

        <h1 className="text-3xl font-bold mb-6">
          Register
        </h1>

        <input
          placeholder="Nama"
          className="w-full border p-3 rounded-lg mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          className="w-full border p-3 rounded-lg mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-lg mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          className="w-full bg-blue-600 text-white py-3 rounded-lg"
        >
          Daftar
        </button>

        <p className="text-center mt-4">
        Sudah punya akun?
            <Link
            to="/"
            className="text-blue-600 ml-2"
            >
        Login
  </Link>
</p>

      </div>

    </div>
  );
}