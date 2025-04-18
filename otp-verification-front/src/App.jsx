import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import VerifyOTP from "./pages/VerifyOTP.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;