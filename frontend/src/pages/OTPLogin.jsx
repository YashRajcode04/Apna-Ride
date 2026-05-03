import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';
import './OTPLogin.css';

const OTPLogin = () => {
  const navigate = useNavigate();
  const { requestOTP, verifyOTP } = useContext(AuthContext);
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: phone input, 2: OTP input
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [method, setMethod] = useState('sms'); // 'sms' or 'email'

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await requestOTP(phone, method);
      toast.success(`OTP sent via ${method === 'sms' ? 'SMS' : 'Email'}! Check your ${method === 'sms' ? 'phone' : 'inbox'}.`);
      setStep(2);
      setCountdown(60); // 60 seconds cooldown
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await verifyOTP(phone, otp);
      toast.success('OTP verified. Login successful.');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid OTP';
      toast.error(message);
      
      const attemptsRemaining = error.response?.data?.attemptsRemaining;
      if (attemptsRemaining !== undefined) {
        toast.warning(`${attemptsRemaining} attempts remaining`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      await requestOTP(phone, method);
      toast.success('New OTP sent!');
      setCountdown(60);
      setOtp('');
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setOtp('');
    setCountdown(0);
  };

  return (
    <div className="auth-page">
      <div className="auth-container otp-container">
        <h1>{step === 1 ? 'Login with Phone' : 'Verify OTP'}</h1>
        <p className="subtitle">
          {step === 1
            ? 'Enter your phone number to receive a verification code'
            : `We've sent a 6-digit code to ${phone}`}
        </p>

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="auth-form">
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                pattern="^\+?[1-9]\d{1,14}$"
                title="Enter phone with country code (e.g., +1234567890)"
              />
              <small className="form-hint">Include country code (e.g., +1 for US)</small>
            </div>

            <div className="form-group">
              <label>Delivery Method</label>
              <div className="method-selector">
                <label className={`method-option ${method === 'sms' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="method"
                    value="sms"
                    checked={method === 'sms'}
                    onChange={(e) => setMethod(e.target.value)}
                  />
                  <span>SMS</span>
                </label>
                <label className={`method-option ${method === 'email' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="method"
                    value="email"
                    checked={method === 'email'}
                    onChange={(e) => setMethod(e.target.value)}
                  />
                  <span>Email</span>
                </label>
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            <div className="form-group">
              <label>Enter 6-Digit Code</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="otp-input"
                maxLength="6"
                pattern="\d{6}"
              />
              <small className="form-hint">Code expires in 10 minutes</small>
            </div>

            <button type="submit" className="auth-btn" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <div className="otp-actions">
              <button
                type="button"
                className="resend-btn"
                onClick={handleResendOTP}
                disabled={countdown > 0 || loading}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </button>
              <button type="button" className="back-btn" onClick={handleBack}>
                ← Change Number
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          <p className="auth-link">
            <Link to="/login">← Back to Email Login</Link>
          </p>
          <p className="auth-link">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPLogin;
