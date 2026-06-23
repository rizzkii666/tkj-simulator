import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {

    const user =
      JSON.parse(localStorage.getItem("user"));

    if (
      user &&
      user.email === email &&
      user.password === password
    ) {

      alert("Login berhasil!");

      navigate("/dashboard");

    } else {

      alert("Email atau Password salah!");

    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-[400px]">

        <h1 className="text-3xl font-bold mb-6">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded-lg mb-4"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-lg mb-6"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-3 rounded-lg"
        >
          Masuk
        </button>

        <p className="text-center mt-4">
          Belum punya akun?
          <Link
            to="/register"
            className="text-blue-600 ml-2"
          >
            Daftar
          </Link>
        </p>

      </div>

    </div>
  );
}