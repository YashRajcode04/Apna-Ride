import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import SocialLoginButtons from '../components/SocialLoginButtons';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sanitizedEmail = formData.email.trim().toLowerCase();

    if (!sanitizedEmail || !formData.password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await login(sanitizedEmail, formData.password);
      toast.success('Login successful. Welcome back.');
      const role = response?.data?.user?.role || 'user';
      navigate(role === 'admin' ? '/dashboard' : '/');
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      
      // Handle specific errors
      if (error.response?.status === 423) {
        toast.error('Account locked due to multiple failed attempts', { autoClose: 5000 });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Welcome Back</h1>
        <p className="subtitle">Login to access your account</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="form-options">
            <span className="login-tip">Use your registered email and password</span>
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading || authLoading || !formData.email.trim() || !formData.password}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <SocialLoginButtons />

        <div className="auth-footer">
          <p className="auth-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
          <p className="auth-link">
            <Link to="/login-otp">Login with Phone/OTP →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
