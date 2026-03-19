import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

function Home() {
  return (
    <div style={{textAlign:"center", marginTop:"100px"}}>
      <h1>Welcome Home</h1>
    </div>
  );
}

function Signup() {
  return (
    <div style={{textAlign:"center", marginTop:"100px"}}>
      <h1>Signup Page</h1>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;
