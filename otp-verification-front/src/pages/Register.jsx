
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [otpDigits, setOtpDigits] = useState(6); // Default to 6-digit OTP
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/register', {
        email,
        mobile,
        password,
        otpDigits, // send otpDigits to backend
      });

      setMessage(response.data.message);
      navigate('/login');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Create an Account</h2>
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Mobile:</label>
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            pattern="[0-9]{10,15}"
            title="Enter a valid mobile number"
          />
        </div>
        <div className="input-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>OTP Length:</label>
          <select value={otpDigits} onChange={(e) => setOtpDigits(parseInt(e.target.value))}>
            <option value={4}>4 Digits</option>
            <option value={6}>6 Digits</option>
            <option value={8}>8 Digits</option>
          </select>
        </div>

        <button type="submit" className="register-button">Register</button>
      </form>
      {message && <p className="register-message">{message}</p>}
      <p className="register-footer">
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default Register;