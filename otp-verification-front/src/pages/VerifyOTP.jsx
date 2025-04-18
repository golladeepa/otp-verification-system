
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VerifyOTP.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/verify-otp', {
        email,
        otp
      });
      localStorage.setItem('token', response.data.token);
      setMessage(response.data.message);
      setMessageType('success');
      navigate('/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.message || 'OTP verification failed');
      setMessageType('error');
    }
  };

  return (
    <div className="verify-otp-page">
      <div className="verify-otp-container">
        <h1 className="verify-otp-title">Verify OTP</h1>
        <p className="verify-otp-info">Enter the OTP sent to {email}</p>
        
        <form className="verify-otp-form" onSubmit={handleSubmit}>
          <div className="otp-input-group">
            <label>OTP Code</label>
            <input
              type="text"
              className="otp-input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="Enter otp code"
              maxLength="8"
            />
          </div>
          
          <button type="submit" className="verify-otp-button">
            Verify OTP
          </button>
        </form>

        {message && (
          <div className={`verify-otp-message ${messageType}`}>
            {message}
          </div>
        )}

        <div className="resend-otp">
          <button type="button">
            Didn't receive code? <span>Resend OTP</span>
          </button>
          <div className="countdown">(00:30)</div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;