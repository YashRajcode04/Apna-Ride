import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const ForgotPassword = () => {
  const { forgotPassword } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      setEmailSent(true);
      toast.success('Password reset link sent! Check your email.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="success-message">
            <div className="success-icon">OK</div>
            <h1>Check Your Email</h1>
            <p className="subtitle">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setEmailSent(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#000',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                try again
              </button>
            </p>
            <Link to="/login" className="auth-btn" style={{ marginTop: '30px', display: 'inline-block' }}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Forgot Password?</h1>
        <p className="subtitle">
          Enter your email address and we'll send you a link to reset your password
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="auth-link" style={{ marginTop: '30px' }}>
          <Link to="/login">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
