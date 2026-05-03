import { useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useContext(AuthContext);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      toast.success('Password reset successful! Please login with your new password.');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast.error(message);
      
      if (message.includes('expired') || message.includes('invalid')) {
        setTimeout(() => navigate('/forgot-password'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Reset Password</h1>
        <p className="subtitle">Enter your new password below</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>New Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              minLength="6"
            />
          </div>

          <label className="checkbox-label" style={{ marginBottom: '20px' }}>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            <span>Show password</span>
          </label>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="auth-link" style={{ marginTop: '30px' }}>
          <Link to="/login">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
