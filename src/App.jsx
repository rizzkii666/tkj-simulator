import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Simulation from "./pages/Simulation";
import Materi from "./pages/Materi";
import GameCrimping from "./pages/GameCrimping";
import Quiz from "./pages/Quiz";
import TeacherDashboard from "./pages/TeacherDashboard";
import Forum from "./pages/Forum";
import Stats from "./pages/Stats";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/materi" element={<Materi />} />
        <Route path="/game-crimping" element={<GameCrimping />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
