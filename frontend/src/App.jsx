import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/DashboardSwitch";
import InteractiveStory from "./pages/InteractiveStory";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/InteractiveStory" element={<InteractiveStory />} />
    </Routes>
  );
}

export default App;