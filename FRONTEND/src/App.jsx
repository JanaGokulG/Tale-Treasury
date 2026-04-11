import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/DashboardSwitch";
import InteractiveStory from "./pages/InteractiveStory";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

const PublicRoute = ({ children }) => {
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/login" element={<Login />} /> 
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/InteractiveStory" element={
        <ProtectedRoute>
          <InteractiveStory />
        </ProtectedRoute>
      } />
      
      <Route path="/InteractiveStory/:id" element={
        <ProtectedRoute>
          <InteractiveStory />
        </ProtectedRoute>
      } />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;